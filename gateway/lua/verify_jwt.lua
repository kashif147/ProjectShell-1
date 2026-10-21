-- =====================================================================
-- verify_jwt.lua
-- Gateway Authentication Layer
--
-- Only ProjectShell-issued HS256 JWTs authenticate at the gateway (verified
-- here via resty.jwt + JWT_SECRET). The ProjectShell tenant boundary
-- (x-tenant-id) comes ONLY from that token's internal tenantId.
--
-- Microsoft / Azure AD RS256 tokens are NOT accepted here (retired): a
-- Microsoft directory id (tid) is not a ProjectShell tenant, and Entra app
-- roles are not ProjectShell roles. Users sign in with Microsoft through
-- /user-service/auth/azure-* and then use the ProjectShell JWT it issues.
-- =====================================================================

local jwt = require "resty.jwt"
local cjson = require "cjson.safe"
local trusted_headers = require "trusted_headers"

local uri = ngx.var.uri or ""

-----------------------------------------------------------------------
-- 1. CLEAR SPOOFABLE / INTERNAL-ONLY HEADERS (before any bypass decision)
-----------------------------------------------------------------------
trusted_headers.clear()

-----------------------------------------------------------------------
-- 2. BYPASSES (unauthenticated endpoints only)
--    /user-service/auth/* is NOT bypassed here: its public endpoints run
--    in a location without this script, and the one protected auth
--    endpoint (/user-service/auth/logout) runs this script on purpose.
-----------------------------------------------------------------------
if uri == "/account-service/api/webhook/stripe" then
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
-- 6. ONLY PROJECTSHELL HS256 TOKENS
--    Every other algorithm - including Microsoft RS256 delegated-user and
--    app-only tokens - is rejected before any verification or header is set.
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

-- The tenant boundary must be an internal ProjectShell tenant id: exactly 24 lowercase hex
-- characters (a MongoDB ObjectId string, as user-service issues it). Anything else is refused -
-- never forwarded, never normalised, never replaced by a client-supplied value.
local tenant_id = payload.tenantId
if type(tenant_id) ~= "string" or #tenant_id ~= 24 or not tenant_id:match("^[0-9a-f]+$") then
  return ngx.exit(401)
end

ngx.req.set_header("x-jwt-verified", "true")
ngx.req.set_header("x-auth-source", "gateway")
ngx.req.set_header("x-user-id", payload.id)
ngx.req.set_header("x-tenant-id", tenant_id)
ngx.req.set_header("x-user-type", payload.userType or "")
ngx.req.set_header("x-user-email", payload.email or "")
ngx.req.set_header("x-user-roles", cjson.encode(payload.roles or {}))
ngx.req.set_header("x-user-permissions", cjson.encode(payload.permissions or {}))

if payload.exp then
  ngx.req.set_header("x-token-expires-at", tostring(payload.exp * 1000))
end

return
