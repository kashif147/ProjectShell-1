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

function M.clear()
  for _, h in ipairs(M.HEADERS) do
    ngx.req.clear_header(h)
  end
end

return M
