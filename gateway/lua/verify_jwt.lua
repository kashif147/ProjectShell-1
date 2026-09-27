-- =====================================================================
-- verify_jwt.lua
-- Gateway Authentication Layer
--
-- RS256 (Microsoft/Azure AD) tokens are verified by delegating to
-- user-service's POST /api/internal/verify-ms-token via an nginx `internal;`
-- subrequest, not by hand-rolled JWKS/signature logic in Lua. HS256
-- (ProjectShell-internal) tokens are verified directly here via
-- resty.jwt + JWT_SECRET.
-- =====================================================================

local jwt = require "resty.jwt"
local cjson = require "cjson.safe"

local uri = ngx.var.uri or ""

-----------------------------------------------------------------------
-- 1. CLEAR SPOOFABLE / INTERNAL-ONLY HEADERS (before any bypass decision)
-----------------------------------------------------------------------
local trusted_headers = {
  "x-jwt-verified", "x-auth-source", "x-user-id", "x-tenant-id",
  "x-user-email", "x-user-type", "x-user-roles", "x-user-permissions",
  "x-token-expires-at", "x-service-caller",
  "x-gateway-signature", "x-gateway-timestamp",
  "x-service-secret",
}
for _, h in ipairs(trusted_headers) do
  ngx.req.clear_header(h)
end

-----------------------------------------------------------------------
-- 2. BYPASSES (unauthenticated endpoints only)
-----------------------------------------------------------------------
if uri:match("^/user-service/auth/") then
  return
end

if uri == "/account-service/api/webhook/stripe" then
  return
end

if uri == "/api/profile/validate" and ngx.req.get_method() == "POST" then
  return
end

-----------------------------------------------------------------------
-- 3. CORS PREFLIGHT
-----------------------------------------------------------------------
if ngx.req.get_method() == "OPTIONS" then
  return ngx.exit(204)
end

-----------------------------------------------------------------------
-- 4. READ TOKEN
-----------------------------------------------------------------------
local req_headers = ngx.req.get_headers()
local token = nil

local auth = req_headers["authorization"]
if auth then
  token = auth:match("Bearer%s+(.+)")
end

if not token then
  local upgrade = req_headers["upgrade"]
  if upgrade and upgrade:lower() == "websocket" then
    local args = ngx.req.get_uri_args()
    if args and args["token"] then
      token = args["token"]
    end
  end
end

if not token then
  return ngx.exit(401)
end

-----------------------------------------------------------------------
-- 5. LOAD JWT (structural parse only - not a signature check)
-----------------------------------------------------------------------
local jwt_obj = jwt:load_jwt(token)
if not jwt_obj.valid then
  return ngx.exit(401)
end

local header = jwt_obj.header or {}

-----------------------------------------------------------------------
-- 6. MICROSOFT / AZURE AD TOKEN (RS256) - delegated verification
-----------------------------------------------------------------------
if header.alg == "RS256" then
  local verify_secret = os.getenv("GATEWAY_VERIFY_SECRET")
  if not verify_secret or verify_secret == "" then
    return ngx.exit(401)
  end

  local original_content_type = req_headers["content-type"]
  ngx.req.set_header("Content-Type", "application/json")
  ngx.req.set_header("x-service-secret", verify_secret)

  local ok_capture, res = pcall(ngx.location.capture, "/_internal/verify-ms-token", {
    method = ngx.HTTP_POST,
    body = cjson.encode({ token = token }),
  })

  ngx.req.clear_header("x-service-secret")
  if original_content_type then
    ngx.req.set_header("Content-Type", original_content_type)
  else
    ngx.req.clear_header("Content-Type")
  end

  if not ok_capture or not res or res.status ~= 200 then
    return ngx.exit(401)
  end

  local ok_decode, body = pcall(cjson.decode, res.body)
  if not ok_decode or type(body) ~= "table" then
    return ngx.exit(401)
  end

  if body.verified ~= true then
    return ngx.exit(401)
  end

  if type(body.tid) ~= "string" or body.tid == "" then
    return ngx.exit(401)
  end

  if body.exp ~= nil and type(body.exp) ~= "number" then
    return ngx.exit(401)
  end

  local function is_nonempty_string(v)
    return type(v) == "string" and v ~= ""
  end

  local function has_items(v)
    return type(v) == "table" and #v > 0
  end

  -- Classify strictly from verified claims returned by the Node verifier -
  -- never from clientAppId's mere presence, and never from anything in the
  -- caller's own (unverified-until-now) token.
  local idtyp = body.idtyp
  local has_scp = is_nonempty_string(body.scp)
  local has_roles = has_items(body.roles)

  local is_app_token
  if idtyp == "app" then
    is_app_token = true
  elseif has_scp then
    is_app_token = false
  elseif idtyp == nil and has_roles and not has_scp then
    is_app_token = true
  else
    -- Ambiguous - neither a clear app-only nor a clear delegated user token.
    return ngx.exit(401)
  end

  if is_app_token then
    -- Being a genuine, verifiable app-only token is not by itself
    -- authorization to assume the privileged system:notifier identity -
    -- the specific client application must be explicitly allow-listed.
    local notifier_app_id = os.getenv("NOTIFIER_APP_ID")
    if not notifier_app_id or notifier_app_id == "" then
      return ngx.exit(401)
    end
    if body.clientAppId ~= notifier_app_id then
      return ngx.exit(401)
    end
  else
    -- Delegated user token: must carry a real subject identifier. Never
    -- promote to system:notifier merely because clientAppId (azp) exists.
    if not is_nonempty_string(body.oid) and not is_nonempty_string(body.sub) then
      return ngx.exit(401)
    end
  end

  ngx.req.set_header("x-jwt-verified", "true")
  ngx.req.set_header("x-auth-source", "azuread")
  ngx.req.set_header("x-tenant-id", body.tid)

  if body.exp then
    ngx.req.set_header(
      "x-token-expires-at",
      tostring(body.exp * 1000)
    )
  end

  if is_app_token then
    ngx.req.set_header("x-user-id", "system:notifier")
    ngx.req.set_header("x-user-type", "system")
    ngx.req.set_header("x-service-caller", "n8n")
    ngx.req.set_header("x-user-roles", '["system.notifier"]')
    ngx.req.set_header("x-user-permissions", "[]")
  else
    ngx.req.set_header("x-user-id", body.oid or body.sub)
    ngx.req.set_header("x-user-type", "user")
    ngx.req.set_header("x-user-email", body.preferred_username or "")
    ngx.req.set_header("x-user-roles", cjson.encode(body.roles or {}))
    ngx.req.set_header("x-user-permissions", "[]")
  end

  return
end

-----------------------------------------------------------------------
-- 7. INTERNAL HS256 (ProjectShell-issued tokens)
-----------------------------------------------------------------------
if header.alg ~= "HS256" then
  return ngx.exit(401)
end

local secret = os.getenv("JWT_SECRET")
if not secret or secret == "" then
  return ngx.exit(401)
end

local verified = jwt:verify_jwt_obj(secret, jwt_obj)
if not verified.verified then
  return ngx.exit(401)
end

local payload = verified.payload or {}

if payload.exp and payload.exp < ngx.time() then
  return ngx.exit(401)
end

if payload.nbf and payload.nbf > ngx.time() then
  return ngx.exit(401)
end

if not payload.id or not payload.tenantId then
  return ngx.exit(401)
end

ngx.req.set_header("x-jwt-verified", "true")
ngx.req.set_header("x-auth-source", "gateway")
ngx.req.set_header("x-user-id", payload.id)
ngx.req.set_header("x-tenant-id", payload.tenantId)
ngx.req.set_header("x-user-type", payload.userType or "")
ngx.req.set_header("x-user-email", payload.email or "")
ngx.req.set_header("x-user-roles", cjson.encode(payload.roles or {}))
ngx.req.set_header("x-user-permissions", cjson.encode(payload.permissions or {}))

if payload.exp then
  ngx.req.set_header("x-token-expires-at", tostring(payload.exp * 1000))
end

return
