# Centralized Policy Client Implementation

This document describes the implementation of the centralized policy client system in the React application.

## Overview

The centralized policy client provides a unified interface for authorization and policy evaluation across the application. It consists of three main components:

1. **Core Policy Client** (`node-policy-client.js`) - Framework-agnostic policy evaluation
2. **React Policy Hooks** (`react-policy-hooks.js`) - React-specific hooks for policy management
3. **React UI Policy Hooks** (`react-ui-policy-hooks.js`) - UI-specific hooks for permission-aware interfaces

## Files Added/Modified

### New Files

- `src/utils/node-policy-client.js` - Core policy client implementation
- `src/utils/react-policy-hooks.js` - React hooks for policy management
- `src/utils/react-ui-policy-hooks.js` - UI-specific policy hooks
- `src/utils/policy-client-utils.js` - Utility functions for easier policy client usage
- `src/pages/PolicyClientExample.js` - Example component demonstrating policy client usage

### Modified Files

- `src/context/AuthorizationContext.js` - Integrated policy client into authorization context
- `src/Entry.js` - Added PolicyClientExample route
- `src/component/common/Sidebar.js` - Added PolicyClientExample navigation
- `src/constants/SideNavWithAuth.js` - Added PolicyClientExample menu item

## Key Features

### 1. Policy Client Core (`node-policy-client.js`)

- **Single Policy Evaluation**: `evaluate(token, resource, action, context)`
- **Batch Evaluation**: `evaluateBatch(requests)`
- **Quick Authorization Check**: `check(token, resource, action, context)`
- **Resource Permissions**: `getPermissions(token, resource)`
- **Express Middleware**: `middleware(resource, action)`
- **Caching**: Built-in caching with configurable timeout
- **Retry Logic**: Automatic retry with exponential backoff
- **Error Handling**: Comprehensive error handling and fallbacks

### 2. React Policy Hooks (`react-policy-hooks.js`)

- **usePolicyClient**: Create and manage policy client instances
- **useAuthorization**: Hook for authorization checks
- **usePermissions**: Hook for getting resource permissions
- **useBatchAuthorization**: Hook for batch authorization checks
- **useQuickCheck**: Hook for quick authorization checks
- **useMultiplePermissions**: Hook for multiple permission checks

### 3. React UI Policy Hooks (`react-ui-policy-hooks.js`)

- **useUIInitialization**: Complete UI initialization with policy client
- **useNavigationMenu**: Generate navigation menu based on permissions
- **useActionButtons**: Generate action buttons based on permissions
- **useFeatureFlags**: Get feature flags based on permissions
- **usePageAccess**: Check page access permissions
- **useDashboardWidgets**: Generate dashboard widgets based on permissions
- **useConditionalRender**: Conditional component rendering based on permissions

### 4. Policy Client Utilities (`policy-client-utils.js`)

- **createPolicyClient**: Create policy client with default configuration
- **getDefaultPolicyClient**: Get default policy client instance
- **evaluatePolicy**: Policy evaluation helper
- **evaluateBatchPolicies**: Batch policy evaluation helper
- **quickCheck**: Quick authorization check helper
- **getResourcePermissions**: Get resource permissions helper
- **useDefaultPolicyClient**: React hook for default policy client
- **PolicyCacheUtils**: Cache management utilities
- **PolicyErrorUtils**: Error handling utilities

## Usage Examples

### Basic Policy Evaluation

```javascript
import { useAuthorization } from "../context/AuthorizationContext";
import { evaluatePolicy } from "../utils/policy-client-utils";

const MyComponent = () => {
  const { policyClient } = useAuthorization();

  const handleAction = async () => {
    const token = localStorage.getItem("token");
    const canAccess = await evaluatePolicy(
      policyClient,
      token,
      "user",
      "write"
    );

    if (canAccess) {
      // Perform action
    } else {
      // Show error message
    }
  };
};
```

### Using React Hooks

```javascript
import { useAuthorization } from "../utils/react-policy-hooks";

const MyComponent = () => {
  const { authorized, loading, error } = useAuthorization(
    policyClient,
    token,
    "user",
    "read"
  );

  if (loading) return <Spin />;
  if (error) return <Alert message={error} type="error" />;

  return authorized ? <AuthorizedContent /> : <UnauthorizedContent />;
};
```

### UI Initialization

```javascript
import { useUIInitialization } from "../utils/react-ui-policy-hooks";

const App = () => {
  const uiState = useUIInitialization(
    PolicyClient,
    "http://localhost:3001",
    token,
    { timeout: 5000 }
  );

  if (!uiState.initialized) return <Spin />;

  return <UIWithPermissions capabilities={uiState.capabilities} />;
};
```

## Configuration

### Environment Variables

- `REACT_APP_BASE_URL_DEV`: Base URL for the policy service (default: "http://localhost:3001")

### Policy Client Options

```javascript
const options = {
  timeout: 5000, // Request timeout in milliseconds
  retries: 3, // Number of retry attempts
  cacheTimeout: 300000, // Cache timeout in milliseconds (5 minutes)
};
```

## Integration Points

### Authorization Context

The policy client is integrated into the existing AuthorizationContext, providing:

- Centralized policy evaluation
- Caching of policy decisions
- Fallback to simple permission checks
- Error handling and recovery

### Navigation System

The sidebar navigation system has been updated to include:

- PolicyClientExample menu item
- Permission-based menu filtering
- Dynamic menu generation based on user permissions

### Route Protection

Routes are protected using the existing ProtectedRoute component, which now uses the centralized policy client for authorization decisions.

## Testing

The PolicyClientExample component provides comprehensive testing of:

- Policy evaluation functionality
- Batch evaluation
- Resource permissions
- Cache management
- Error handling
- UI initialization
- Navigation menu generation
- Action button generation
- Feature flags

## Error Handling

The system includes comprehensive error handling:

- Network error detection and user-friendly messages
- Authorization error handling
- Fallback mechanisms for failed policy evaluations
- Cache error recovery
- Retry logic with exponential backoff

## Performance Considerations

- **Caching**: Policy decisions are cached to reduce API calls
- **Batch Evaluation**: Multiple permissions can be checked in a single request
- **Lazy Loading**: UI components are lazy-loaded to improve initial load time
- **Memoization**: React hooks use memoization to prevent unnecessary re-renders

## Security Considerations

- **Token Management**: JWT tokens are securely stored and managed
- **Permission Validation**: All permissions are validated server-side
- **Fallback Security**: Deny-by-default approach for failed policy evaluations
- **Cache Security**: Cache keys are hashed to prevent token exposure

## Future Enhancements

- **Real-time Updates**: WebSocket integration for real-time permission updates
- **Advanced Caching**: Redis-based caching for distributed systems
- **Policy Templates**: Predefined policy templates for common use cases
- **Audit Logging**: Comprehensive audit logging for policy decisions
- **Performance Metrics**: Detailed performance metrics and monitoring
