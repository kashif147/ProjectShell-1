# Socket.IO WebSocket 401 Fix – Gateway Configuration

## Problem

WebSocket upgrade requests to `/notification-service/api/socket.io/` fail with **401 Unauthorized** because:

1. Browsers **cannot send custom headers** (e.g. `Authorization: Bearer <token>`) on the `new WebSocket(url)` handshake.
2. `verify_jwt.lua` only reads the token from the `Authorization` header.
3. The WebSocket upgrade request reaches the gateway without a header-based token, so verification fails and returns 401.

---

## Solution Overview

Make `verify_jwt.lua` accept the JWT from the `token` query parameter when the `Authorization` header is missing. Socket.IO client already sends `?token=xxx` in the URL (see `NotificationContext.js` `query: { token }`).

---

## Required Changes

### 1. Update `verify_jwt.lua`

Add support for reading the token from the query string as a fallback when the header is absent.

**Current pattern (typical):**
```lua
local auth_header = ngx.req.get_headers()["authorization"]
local token = auth_header and string.match(auth_header, "^[Bb]earer%s+(.+)$") or nil
if not token then
    ngx.status = ngx.HTTP_UNAUTHORIZED
    ngx.say('{"error":"Missing token"}')
    return ngx.exit(ngx.HTTP_UNAUTHORIZED)
end
```

**Updated pattern:**
```lua
local auth_header = ngx.req.get_headers()["authorization"]
local token = auth_header and string.match(auth_header, "^[Bb]earer%s+(.+)$") or nil

-- Fallback: token in query string (for WebSocket upgrade where browser can't set headers)
if not token then
    local args = ngx.req.get_uri_args()
    token = args and args["token"] or nil
end

if not token then
    ngx.status = ngx.HTTP_UNAUTHORIZED
    ngx.say('{"error":"Missing token"}')
    return ngx.exit(ngx.HTTP_UNAUTHORIZED)
end
```

Place this logic early in the script, before JWT verification. Ensure the rest of the script (parse, verify, set headers) stays the same.

### 2. Ensure WebSocket Upgrade Headers

The existing `notification-service` location in `default.conf` should proxy WebSocket upgrades. Add these headers if not already present:

```nginx
location ^~ /notification-service/api/ {
    limit_req zone=api_rate burst=10 nodelay;
    access_by_lua_file /etc/nginx/lua/verify_jwt.lua;

    rewrite ^/notification-service/(.*)$ /$1 break;
    proxy_pass http://notification-service:4010/;  # verify backend port
    proxy_http_version 1.1;

    # Required for WebSocket
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;

    # Existing JWT-derived headers
    proxy_set_header x-jwt-verified $http_x_jwt_verified;
    # ... etc
}
```

`Upgrade` and `Connection "upgrade"` are required so WebSocket connections are handled correctly.

---

## Security Considerations

1. **Query vs header:** Tokens in query strings can end up in logs, browser history, and Referer. For Socket.IO this is acceptable because the WebSocket API cannot send headers.
2. **HTTPS:** Ensure the site uses HTTPS so tokens are not sent in clear text.
3. **Short-lived tokens:** Prefer shorter-lived JWTs to limit exposure.
4. **Scoped change:** Only use query fallback for the notification-service path if you prefer; the Lua change applies wherever the script is used.

---

## Verification

1. Deploy the updated `verify_jwt.lua` and reload nginx/openresty.
2. Confirm the frontend uses `query: { token }` in `NotificationContext.js`.
3. Test Socket.IO connection – the WebSocket should connect without 401.
4. Test REST `/notifications` with `Authorization: Bearer <token>` – it should still work.

---

## File Locations (Typical)

| File                | Path (on gateway server)     |
|---------------------|-----------------------------|
| verify_jwt.lua      | `/etc/nginx/lua/verify_jwt.lua` |
| nginx config        | `/etc/nginx/conf.d/default.conf` or similar |

The `default.conf` in this repo is a reference; the actual gateway config may live in a separate infrastructure/gateway repo.
