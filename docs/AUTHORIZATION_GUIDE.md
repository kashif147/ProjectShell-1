# Authorization System Implementation

This document provides a comprehensive guide to the authorization system implemented in your React application. The system provides role-based and permission-based access control for routes, navigation menus, and UI components.

## 🏗️ Architecture Overview

The authorization system consists of several key components:

1. **AuthorizationContext** - Central state management for user roles and permissions
2. **ProtectedRoute** - Route-level authorization wrapper
3. **AuthorizationWrapper Components** - UI component-level authorization
4. **Route Permissions Configuration** - Centralized route permission mapping
5. **Enhanced Sidebar** - Permission-aware navigation menu

## 📁 File Structure

```
src/
├── context/
│   └── AuthorizationContext.js          # Main authorization context
├── component/common/
│   ├── AuthorizationWrapper.jsx        # Authorization wrapper components
│   └── Sidebar.js                      # Updated sidebar with auth
├── constants/
│   ├── RoutePermissions.js             # Route permission mappings
│   ├── SideNavWithAuth.js              # Enhanced sidebar config
│   ├── Roles.js                        # Role definitions
│   └── Permissions.js                  # Permission definitions
├── Navigation/
│   └── ProtectedRoute.js               # Enhanced protected route component
├── features/
│   └── AuthSlice.js                    # Updated Redux auth slice
└── pages/
    ├── AuthorizationExample.js         # Demo page
    └── auth/Login.js                   # Updated login component
```

## 🚀 Quick Start

### 1. Wrap Your App with AuthorizationProvider

```jsx
// In your main App.js or Entry.js
import { AuthorizationProvider } from "./context/AuthorizationContext";

function App() {
  return (
    <AuthorizationProvider>{/* Your app components */}</AuthorizationProvider>
  );
}
```

### 2. Use Authorization in Components

```jsx
import { useAuthorization } from "../context/AuthorizationContext";
import {
  AuthorizedButton,
  PermissionWrapper,
} from "../component/common/AuthorizationWrapper";

function MyComponent() {
  const { hasPermission, hasRole, permissions, roles } = useAuthorization();

  return (
    <div>
      {/* Permission-based button */}
      <AuthorizedButton
        permission="user:write"
        onClick={() => console.log("Edit user")}
      >
        Edit User
      </AuthorizedButton>

      {/* Permission wrapper */}
      <PermissionWrapper permission="user:delete">
        <Button danger>Delete User</Button>
      </PermissionWrapper>
    </div>
  );
}
```

## 🔧 Core Components

### AuthorizationContext

The central context that manages user authentication and authorization state.

```jsx
const {
  // State
  user, // Current user data
  roles, // User roles array
  permissions, // User permissions array
  isAuthenticated, // Authentication status
  loading, // Loading state

  // Actions
  setUserData, // Set user data and permissions
  clearAuth, // Clear authentication

  // Permission checks
  hasPermission, // Check single permission
  hasAnyPermission, // Check any of multiple permissions
  hasAllPermissions, // Check all of multiple permissions
  hasRole, // Check single role
  hasAnyRole, // Check any of multiple roles
  hasAllRoles, // Check all of multiple roles
  canAccess, // Check resource access
} = useAuthorization();
```

### ProtectedRoute

Enhanced route protection with permission and role checking.

```jsx
<ProtectedRoute
  requiredPermission="user:read"
  requiredRole="MO"
  requiredPermissions={["user:read", "user:write"]}
  requiredRoles={["GS", "DGS"]}
  requireAllPermissions={false}
  requireAllRoles={false}
  redirectTo="/login"
  unauthorizedComponent={<CustomUnauthorizedComponent />}
>
  <MyComponent />
</ProtectedRoute>
```

### Authorization Wrapper Components

#### AuthorizedButton

```jsx
<AuthorizedButton
  permission="user:write"
  permissions={["user:read", "user:write"]}
  role="MO"
  roles={["GS", "DGS"]}
  requireAllPermissions={false}
  requireAllRoles={false}
  disabled={false}
  tooltip="You don't have permission"
  onClick={handleClick}
>
  Edit User
</AuthorizedButton>
```

#### PermissionWrapper

```jsx
<PermissionWrapper
  permission="user:read"
  permissions={["user:read", "user:write"]}
  requireAll={false}
  fallback={<div>Access denied</div>}
>
  <SensitiveData />
</PermissionWrapper>
```

#### RoleWrapper

```jsx
<RoleWrapper
  role="SU"
  roles={["GS", "DGS"]}
  requireAll={false}
  fallback={<div>Admin access required</div>}
>
  <AdminPanel />
</RoleWrapper>
```

## 🛣️ Route Configuration

Routes are configured with required permissions and roles in `RoutePermissions.js`:

```javascript
export const ROUTE_PERMISSIONS = {
  "/UserManagement": {
    permissions: ["user:read", "user:list"],
    roles: ["SU", "GS", "DGS"],
  },
  "/RoleManagement": {
    permissions: ["role:read", "role:list"],
    roles: ["SU", "GS", "DGS"],
  },
  // ... more routes
};
```

### Using Route Permissions

```jsx
import { getRoutePermissions } from "../constants/RoutePermissions";

<Route
  path="/UserManagement"
  element={
    <ProtectedRoute {...getRoutePermissions("/UserManagement")}>
      <UserManagement />
    </ProtectedRoute>
  }
/>;
```

## 🎯 Permission System

### Permission Structure

Permissions follow a hierarchical naming convention:

- `resource:action` (e.g., `user:read`, `user:write`)
- `service:resource:action` (e.g., `crm:member:create`)

### Available Permissions

```javascript
// User Service
user:read, user:write, user:delete, user:create, user:update, user:list

// Role Service
role:read, role:write, role:delete, role:create, role:update, role:list

// CRM Service
crm:member:read, crm:member:write, crm:member:create, crm:member:update

// Account Service
account:read, account:write, account:payment, financial:read

// Portal Service
portal:access, portal:profile:read, portal:dashboard:read
```

## 👥 Role System

### Role Hierarchy

```javascript
// System Roles
SU - Super User (Full access)
AI - AI Agent (Limited access)

// Portal Roles
MEMBER - Member (Portal access)
NON-MEMBER - Non-Member (Limited portal access)

// CRM Management
GS - General Secretary (Highest management)
DGS - Deputy General Secretary
DIR - Director Industrial Relations

// CRM Officers
MO - Membership Officer
AMO - Assistant Membership Officer
AM - Accounts Manager
IRO - Industrial Relations Officer

// CRM Specialized
HLS - Head Library Services
LS - Librarian
CC - Course Coordinator
```

## 🔐 Login Integration

The login process automatically extracts and stores user roles and permissions:

```javascript
// In Login.js
const handleLoginWithCredentional = async (e) => {
  const result = await dispatch(loginUser(credentials));

  if (result.payload && result.payload.accessToken) {
    const userRoles = result.payload.roles || [];
    const userPermissions = result.payload.permissions || [];

    // Set user data in authorization context
    setUserData(result.payload, userRoles, userPermissions);

    navigate("/Summary");
  }
};
```

## 📱 Navigation Menu Authorization

The sidebar automatically filters menu items based on user permissions:

```javascript
// In SideNavWithAuth.js
export const subscriptionItems = [
  createMenuItem(
    "Profiles",
    <FaUserCog />,
    "Profiles",
    ["crm:member:read", "crm:member:list"],
    ["MO", "AMO", "GS", "DGS", "IRO"]
  ),
  // ... more items
];

// In Sidebar.js
const menuItems = useMemo(() => {
  return filterMenuItemsByAuth(baseMenuItems, permissions, roles);
}, [baseMenuItems, permissions, roles]);
```

## 🧪 Testing Authorization

Visit `/AuthorizationExample` to see a comprehensive demo of all authorization features.

## 🔧 Customization

### Adding New Permissions

1. Update `src/constants/Permissions.js`:

```javascript
export const PERMISSIONS = {
  // ... existing permissions
  NEW_SERVICE: {
    READ: "new_service:read",
    WRITE: "new_service:write",
    // ... more actions
  },
};
```

2. Update route permissions in `RoutePermissions.js`:

```javascript
export const ROUTE_PERMISSIONS = {
  "/NewRoute": {
    permissions: ["new_service:read"],
    roles: ["MO", "AMO"],
  },
};
```

### Adding New Roles

1. Update `src/constants/Roles.js`:

```javascript
export const ROLES = {
  NEW_CATEGORY: {
    NEW_ROLE: "NR",
  },
};
```

2. Add role to SAMPLE_ROLES array with permissions:

```javascript
{
  id: "NR",
  name: "New Role",
  description: "Description of new role",
  permissions: ["new_service:read", "new_service:write"],
  // ... other properties
}
```

## 🚨 Error Handling

The system provides graceful error handling:

- **Unauthorized Access**: Shows 403 error page with "Go Back" button
- **Missing Permissions**: Components are hidden or disabled
- **Invalid Tokens**: Redirects to login page
- **Loading States**: Shows spinner while checking permissions

## 🔄 State Management

The authorization state is managed through:

1. **Redux Store** (`AuthSlice.js`) - Server state
2. **React Context** (`AuthorizationContext.js`) - Client state
3. **Local Storage** - Persistence across sessions

## 📊 Performance Considerations

- Permissions are checked client-side for UI responsiveness
- Server-side validation should always be implemented
- Use `useMemo` for expensive permission calculations
- Consider caching permission checks for frequently accessed resources

## 🛡️ Security Best Practices

1. **Never trust client-side authorization alone**
2. **Always validate permissions on the server**
3. **Use HTTPS for all authentication requests**
4. **Implement proper token expiration and refresh**
5. **Log all authorization attempts for audit purposes**
6. **Regularly review and update permission matrices**

## 🐛 Troubleshooting

### Common Issues

1. **Components not showing**: Check if permissions/roles are correctly set
2. **Routes redirecting**: Verify route permissions configuration
3. **Menu items missing**: Check sidebar permission mappings
4. **Login not working**: Ensure backend returns roles and permissions

### Debug Tools

```javascript
// Check current authorization state
const { user, roles, permissions } = useAuthorization();
console.log("User:", user);
console.log("Roles:", roles);
console.log("Permissions:", permissions);

// Test permission checks
console.log("Can read users:", hasPermission("user:read"));
console.log("Is Super User:", hasRole("SU"));
```

## 📚 Additional Resources

- [React Context API Documentation](https://reactjs.org/docs/context.html)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Ant Design Components](https://ant.design/components/overview/)
- [Role-Based Access Control Best Practices](https://en.wikipedia.org/wiki/Role-based_access_control)

---

This authorization system provides a robust, scalable solution for managing user access control in your React application. It's designed to be flexible, maintainable, and secure while providing excellent developer experience.
