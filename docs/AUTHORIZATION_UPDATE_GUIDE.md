# Updated Authorization System

## Overview

The authorization system has been updated to use existing JWT token information and policy evaluation endpoints instead of the previously requested auth endpoints. This approach leverages the sophisticated policy evaluation system already in place.

## Key Changes

### 1. Updated AuthorizationAPI.js

The `AuthorizationAPI.js` service has been completely refactored to:

- **Extract data from JWT tokens** instead of making API calls to non-existent endpoints
- **Use existing policy endpoints** (`/policy/permissions/:resource`, `/policy/check/:resource/:action`, `/policy/evaluate`)
- **Provide fallback mechanisms** when policy endpoints are unavailable

#### New Methods:

```javascript
// Extract user data directly from JWT token
static extractUserData(token)

// Use policy endpoint for permission checks
static async checkPermission(token, permission)

// Use policy endpoint for role checks (from JWT)
static async checkRole(token, role)

// Policy evaluation using existing endpoint
static async evaluatePolicy(token, resource, action, context)
```

### 2. Enhanced AuthorizationContext

Added new method for policy-based authorization:

```javascript
// Policy-based authorization check
const canAccessWithPolicy = async(resource, (action = "read"), (context = {}));
```

## JWT Token Structure

The system expects JWT tokens with the following payload structure:

```json
{
  "sub": "user_id",
  "id": "user_id",
  "email": "user@example.com",
  "userType": "user_type",
  "tenantId": "tenant_id",
  "roles": [
    {
      "id": "role_id",
      "code": "ADMIN",
      "name": "Administrator"
    }
  ],
  "permissions": ["users:read", "users:write", "reports:view"]
}
```

## Available Endpoints

### Policy Endpoints (Existing)

- `GET /policy/permissions/:resource` - Get effective permissions for a resource
- `GET /policy/check/:resource/:action` - Quick authorization check
- `POST /policy/evaluate` - Single policy evaluation

### Updated API Methods

| Method                        | Description                    | Uses                   |
| ----------------------------- | ------------------------------ | ---------------------- |
| `fetchUserPermissions()`      | Get user permissions and roles | JWT token extraction   |
| `checkPermission()`           | Check specific permission      | Policy endpoint        |
| `checkRole()`                 | Check specific role            | JWT token extraction   |
| `evaluatePolicy()`            | Policy evaluation              | Policy endpoint        |
| `fetchAllAuthorizationData()` | Get all auth data              | JWT + Policy endpoints |

## Usage Examples

### 1. Simple Permission Check

```javascript
import { useAuthorization } from "../context/AuthorizationContext";

const MyComponent = () => {
  const { hasPermission, hasRole } = useAuthorization();

  return (
    <div>
      {hasPermission("users:read") && <UserList />}
      {hasRole("admin") && <AdminPanel />}
    </div>
  );
};
```

### 2. Policy-Based Authorization

```javascript
import { useAuthorization } from "../context/AuthorizationContext";

const MyComponent = () => {
  const { canAccessWithPolicy } = useAuthorization();
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const result = await canAccessWithPolicy("users", "write", {
        tenantId: "123",
        userId: "456",
      });
      setCanAccess(result);
    };

    checkAccess();
  }, []);

  return <div>{canAccess && <UserEditForm />}</div>;
};
```

### 3. Direct API Usage

```javascript
import AuthorizationAPI from "../services/AuthorizationAPI";

const MyComponent = () => {
  const handleCheckPermission = async () => {
    const token = localStorage.getItem("token");

    // Check specific permission
    const hasAccess = await AuthorizationAPI.checkPermission(
      token,
      "users:write"
    );

    // Policy evaluation
    const result = await AuthorizationAPI.evaluatePolicy(
      token,
      "users",
      "read",
      {
        tenantId: "123",
      }
    );

    console.log("Has access:", hasAccess);
    console.log("Policy result:", result);
  };

  return <button onClick={handleCheckPermission}>Check Permission</button>;
};
```

## Migration Guide

### Before (Non-existent endpoints)

```javascript
// These endpoints don't exist
GET / api / permissions;
GET / api / roles;
GET / api / auth / permissions;
POST / api / auth / check - permission;
POST / api / auth / check - role;
```

### After (Using existing JWT and policy endpoints)

```javascript
// Extract from JWT token
const userData = AuthorizationAPI.extractUserData(token);

// Use policy endpoints
const hasAccess = await AuthorizationAPI.checkPermission(token, "users:read");
const result = await AuthorizationAPI.evaluatePolicy(token, "users", "write");
```

## Benefits

1. **No Backend Changes Required** - Uses existing JWT structure and policy endpoints
2. **Better Performance** - Extracts data from JWT instead of making API calls
3. **Sophisticated Authorization** - Leverages existing policy evaluation system
4. **Fallback Mechanisms** - Graceful degradation when policy endpoints fail
5. **Consistent API** - Maintains the same interface for components

## Error Handling

The system includes comprehensive error handling:

- **JWT Decoding Errors** - Returns empty arrays/objects
- **Policy Endpoint Failures** - Falls back to simple permission checks
- **Network Errors** - Returns false for authorization checks
- **Missing Tokens** - Handles gracefully with appropriate defaults

## Testing

Use the `AuthorizationExample` component to test the updated system:

```javascript
import AuthorizationExample from "../component/common/AuthorizationExample";

// Add to your app for testing
<AuthorizationExample />;
```

This component demonstrates:

- JWT token data extraction
- Simple permission/role checks
- Policy-based authorization
- Direct API usage examples
