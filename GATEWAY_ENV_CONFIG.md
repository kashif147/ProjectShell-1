# Gateway Environment Configuration

## Gateway DNS
`projectshell-vm.northeurope.cloudapp.azure.com`

## Required .env Variables

Create or update your `.env` file in the project root with the following variables:

```env
# Gateway Base URL
REACT_APP_GATEWAY_URL=http://projectshell-vm.northeurope.cloudapp.azure.com

# User Service (Auth - No JWT)
REACT_APP_BASE_URL_DEV=http://projectshell-vm.northeurope.cloudapp.azure.com/user-service

# User Service API (With JWT)
REACT_APP_POLICY_SERVICE_URL=http://projectshell-vm.northeurope.cloudapp.azure.com/user-service/api

# Profile Service
REACT_APP_PROFILE_SERVICE_URL=http://projectshell-vm.northeurope.cloudapp.azure.com/profile-service/api

# Subscription Service
REACT_APP_SUBSCRIPTION=http://projectshell-vm.northeurope.cloudapp.azure.com/subscription-service/api

# Communication Service
REACT_APP_CUMM=http://projectshell-vm.northeurope.cloudapp.azure.com/communication-service/api

# Portal Service (if used)
REACT_APP_PORTAL_SERVICE_URL=http://projectshell-vm.northeurope.cloudapp.azure.com/portal-service/api

# Account Service (if used)
REACT_APP_ACCOUNT_SERVICE_URL=http://projectshell-vm.northeurope.cloudapp.azure.com/account-service/api

# Reporting Service (if used)
REACT_APP_REPORTING_SERVICE_URL=http://projectshell-vm.northeurope.cloudapp.azure.com/reporting-service/api

# Notification Service (if used)
REACT_APP_NOTIFICATION_SERVICE_URL=http://projectshell-vm.northeurope.cloudapp.azure.com/notification-service/api
```

## Gateway Route Mappings

Based on `default.conf`, the gateway routes are:

| Service | Gateway Route | Environment Variable |
|---------|--------------|---------------------|
| User Service Auth | `/user-service/auth/` | `REACT_APP_BASE_URL_DEV` |
| User Service API | `/user-service/api/` | `REACT_APP_POLICY_SERVICE_URL` |
| Portal Service | `/portal-service/api/` | `REACT_APP_PORTAL_SERVICE_URL` |
| Subscription Service | `/subscription-service/api/` | `REACT_APP_SUBSCRIPTION` |
| Profile Service | `/profile-service/api/` | `REACT_APP_PROFILE_SERVICE_URL` |
| Account Service | `/account-service/api/` | `REACT_APP_ACCOUNT_SERVICE_URL` |
| Communication Service | `/communication-service/api/` | `REACT_APP_CUMM` |
| Reporting Service | `/reporting-service/api/` | `REACT_APP_REPORTING_SERVICE_URL` |
| Notification Service | `/notification-service/api/` | `REACT_APP_NOTIFICATION_SERVICE_URL` |

## Important Notes

1. **No trailing slashes**: Do not add trailing slashes to the environment variables. The code already appends paths like `/auth`, `/api/contacts`, etc.

2. **HTTPS**: If your gateway uses HTTPS, change `http://` to `https://` in all URLs.

3. **JWT Authentication**: All API routes (except `/user-service/auth/`) require JWT authentication. The gateway will handle JWT verification via `verify_jwt.lua`.

4. **CORS**: The gateway is configured with CORS headers, so no additional CORS configuration is needed in the frontend.

5. **Rate Limiting**: API routes have rate limiting (`burst=10 nodelay`), so be aware of request limits.

## Code Changes Required

**CRITICAL**: Auth endpoints (`/auth/*`) must use `REACT_APP_BASE_URL_DEV` (routes to `/user-service/auth/` - no JWT required), NOT `REACT_APP_POLICY_SERVICE_URL` (routes to `/user-service/api/` - JWT required).

The following files have been updated to use the correct environment variables:

- ✅ `src/features/AuthSlice.js` - Uses `REACT_APP_BASE_URL_DEV` for auth
- ✅ `src/pages/auth/Login.js` - Fixed to use `REACT_APP_BASE_URL_DEV` for `/auth/azure-crm`
- ✅ `src/component/common/Header.jsx` - Fixed to use `REACT_APP_BASE_URL_DEV` for `/auth/logout`
- `src/utils/Utilities.js` - Uses `REACT_APP_POLICY_SERVICE_URL` as baseURL
- `src/services/AuthorizationAPI.js` - Uses `REACT_APP_BASE_URL_DEV` for policy endpoints
- `src/features/profiles/*` - Uses `REACT_APP_PROFILE_SERVICE_URL`
- `src/features/subscription/*` - Uses `REACT_APP_SUBSCRIPTION`
- `src/features/templete/*` - Uses `REACT_APP_CUMM`
- `src/features/shared/services/reportService.js` - Uses `REACT_APP_POLICY_SERVICE_URL` for reporting

## Testing

After updating `.env`, restart your development server:

```bash
npm start
```

Verify that API calls are going through the gateway by checking:
1. Network tab in browser DevTools
2. Gateway logs
3. CORS headers in responses

