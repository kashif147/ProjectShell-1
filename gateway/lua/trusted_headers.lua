-- trusted_headers.lua
-- The ONE list of identity/internal headers that only the gateway may set. A client must never be
-- able to supply any of them: every externally reachable location clears them before proxying.
--   * locations running verify_jwt.lua: cleared there, then set again from a verified ProjectShell JWT;
--   * every other location (public /user-service/auth/, /user-service/pkce/, webhooks, Socket.IO,
--     n8n, rabbitmq, health): cleared by the server-level access_by_lua_block in default.conf
--     (or an explicit block calling clear()).
-- Functional headers (x-correlation-id, Authorization, X-Real-IP, ...) are NOT in this list.

local M = {}

M.HEADERS = {
  "x-jwt-verified", "x-auth-source", "x-user-id", "x-tenant-id",
  "x-user-email", "x-user-type", "x-user-roles", "x-user-permissions",
  "x-token-expires-at", "x-service-caller",
  "x-gateway-signature", "x-gateway-timestamp",
  "x-service-secret",
  "x-internal-request",
}

-- Phase B / Z1: platform authority comes ONLY from the platform claim inside a ProjectShell JWT that
-- user-service signed. No client may send any x-platform-* header: every one is removed, whatever
-- its name after the prefix (all request headers are inspected - no count limit to hide behind).
M.PREFIXES = { "x-platform-" }

function M.clear()
  for _, h in ipairs(M.HEADERS) do
    ngx.req.clear_header(h)
  end
  local headers = ngx.req.get_headers(0)
  for name, _ in pairs(headers) do
    if type(name) == "string" then
      local lower = name:lower()
      for _, prefix in ipairs(M.PREFIXES) do
        if lower:sub(1, #prefix) == prefix then
          ngx.req.clear_header(name)
        end
      end
    end
  end
end

return M
