# Dynamic Route Permissions Implementation

## Overview

RoutePermissions now fetches from API instead of using hardcoded constants, with all permission types consolidated into a single API call.

## Key Changes

### 1. AuthorizationAPI.js

- **Added `fetchRoutePermissions(token)`** - Fetches route permissions from `/route-permissions` endpoint
- **Added `fetchAllAuthorizationData(token)`** - Consolidated endpoint `/auth/all-permissions` that returns:
  - User permissions
  - User roles
  - Permission definitions
  - Role definitions
  - Route permissions
  - User data

### 2. AuthorizationContext.js

- **Added route permissions state** - `routePermissions: {}`
- **Added new actions** - `SET_ROUTE_PERMISSIONS`, `SET_ALL_AUTHORIZATION_DATA`
- **Consolidated loading** - Single `loadAllAuthorizationData()` method
- **Added helper methods**:
  - `getRoutePermissions(path)` - Get permissions for specific route
  - `canAccessRoute(path)` - Check if user can access route

### 3. RoutePermissions.js

- **Converted to dynamic** - Now uses API data with fallback to constants
- **Added React hooks**:
  - `useRoutePermissions()` - Get route permissions from context
  - `useRouteAccess()` - Check route access from context
- **Maintained backward compatibility** - Static constants available as fallback

### 4. RoutePermissionWrapper.jsx

- **New component** - Wraps routes with dynamic permission loading
- **Handles loading states** - Shows loading while fetching permissions
- **Provides fallback** - Uses static permissions if API fails

### 5. Entry.js

- **Updated key routes** - Examples using `RoutePermissionWrapper`
- **Added new example route** - `DynamicRoutePermissionsExample`

## API Endpoints

### Consolidated Endpoint (Recommended)

```
GET /auth/all-permissions
Authorization: Bearer <token>

Response:
{
  "permissions": ["user:read", "user:write", ...],
  "roles": ["SU", "GS", "DGS", ...],
  "permissionDefinitions": [...],
  "roleDefinitions": [...],
  "routePermissions": {
    "/UserManagement": {
      "permissions": ["user:read", "user:list"],
      "roles": ["SU", "GS", "DGS"]
    },
    ...
  },
  "user": {...}
}
```

### Individual Endpoints (Fallback)

```
GET /route-permissions
GET /permissions
GET /roles
GET /auth/permissions
```

## Usage Examples

### Using Hooks

```javascript
import {
  useRoutePermissions,
  useRouteAccess,
} from "../constants/RoutePermissions";

const MyComponent = () => {
  const getRoutePermissions = useRoutePermissions();
  const canAccessRoute = useRouteAccess();

  const routeConfig = getRoutePermissions("/UserManagement");
  const canAccess = canAccessRoute("/UserManagement");

  return (
    <div>
      <p>Required permissions: {routeConfig.permissions.join(", ")}</p>
      <p>Can access: {canAccess ? "Yes" : "No"}</p>
    </div>
  );
};
```

### Using Context Directly

```javascript
import { useAuthorization } from "../context/AuthorizationContext";

const MyComponent = () => {
  const { getRoutePermissions, canAccessRoute } = useAuthorization();

  const routeConfig = getRoutePermissions("/UserManagement");
  const canAccess = canAccessRoute("/UserManagement");

  return <div>...</div>;
};
```

### Route Wrapper Pattern

```javascript
<Route
  path="UserManagement"
  element={
    <RoutePermissionWrapper
      path="/UserManagement"
      fallbackPermissions={getRoutePermissions("/UserManagement")}
    >
      <ProtectedRoute {...getRoutePermissions("/UserManagement")}>
        <UserManagement />
      </ProtectedRoute>
    </RoutePermissionWrapper>
  }
/>
```

## Benefits

✅ **Dynamic Configuration** - Route permissions fetched from API  
✅ **Consolidated API Calls** - All permission data in single request  
✅ **Fallback Support** - Static constants if API fails  
✅ **Backward Compatibility** - Existing code continues to work  
✅ **Centralized Management** - Permissions managed server-side  
✅ **Real-time Updates** - Changes reflect without code deployment

## Migration Guide

### For Existing Routes

No changes required - existing routes continue to work with fallback permissions.

### For New Routes

Use `RoutePermissionWrapper` for dynamic permission loading:

```javascript
// Old way (still works)
<ProtectedRoute {...getRoutePermissions("/NewRoute")}>
  <NewComponent />
</ProtectedRoute>

// New way (recommended)
<RoutePermissionWrapper path="/NewRoute">
  <ProtectedRoute {...getRoutePermissions("/NewRoute")}>
    <NewComponent />
  </ProtectedRoute>
</RoutePermissionWrapper>
```

## Testing

Visit `/DynamicRoutePermissionsExample` to see:

- Live route permissions from API
- Route access checking
- API endpoint information
- Implementation benefits

The system gracefully handles API failures by falling back to static configuration, ensuring the application remains functional even if the authorization service is unavailable.
