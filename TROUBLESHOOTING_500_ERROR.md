# Troubleshooting 500 Internal Server Error

## Issue
Getting 500 Internal Server Error when calling:
```
POST http://projectshell-vm.northeurope.cloudapp.azure.com/user-service/auth/azure-crm
```

## Gateway Routing Analysis

The nginx gateway configuration routes the request as follows:

1. **Request received**: `/user-service/auth/azure-crm`
2. **Rewrite rule applied**: `rewrite ^/user-service/(.*)$ /$1 break;`
   - Captures: `auth/azure-crm`
   - Rewrites to: `/auth/azure-crm`
3. **Proxy pass**: `http://user-service:5001/` + `/auth/azure-crm`
   - **Final backend URL**: `http://user-service:5001/auth/azure-crm`

## Possible Causes

### 1. Backend Service Not Running
- Check if `user-service` container is running
- Verify the service is listening on port 5001
- Check backend service logs

### 2. Backend Path Mismatch
The backend might expect a different path. Verify:
- Does the backend expect `/auth/azure-crm` or `/api/auth/azure-crm`?
- Check backend route definitions

### 3. Missing Environment Variables
Backend service might be missing required environment variables:
- Azure AD client ID/secret
- Database connection strings
- Other service URLs

### 4. Database/External Service Connection Issues
- Database connection failures
- External API timeouts
- Redis connection issues

### 5. Request Body/Headers Issues
- Verify the request body format matches backend expectations
- Check if backend requires additional headers

## Debugging Steps

### 1. Check Backend Logs
```bash
# If using Docker
docker logs user-service

# Or check application logs
```

### 2. Test Backend Directly (Bypass Gateway)
Try calling the backend service directly:
```bash
curl -X POST http://<backend-ip>:5001/auth/azure-crm \
  -H "Content-Type: application/json" \
  -d '{"code":"test","codeVerifier":"test","redirectUri":"test"}'
```

### 3. Check Nginx Gateway Logs
```bash
# Check nginx error logs
docker logs <nginx-container> 2>&1 | grep -i error

# Or check nginx access logs
tail -f /var/log/nginx/error.log
```

### 4. Verify Request in Browser DevTools
- Open Network tab
- Check the actual request being sent
- Verify request headers and body
- Check the response body for error details (now improved in code)

### 5. Test with Improved Error Handling
The code now captures and displays backend error messages. Check the browser console and any alert messages for the actual error details.

## Nginx Configuration Check

The current nginx config for auth routes:
```nginx
location ^~ /user-service/auth/ {
    rewrite ^/user-service/(.*)$ /$1 break;
    proxy_pass http://user-service:5001/;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
}
```

**Potential Issue**: The rewrite might need adjustment if the backend expects a different path structure.

## Solution Options

### Option 1: Fix Backend Path (if backend expects different path)
If backend expects `/api/auth/azure-crm`, update nginx:
```nginx
location ^~ /user-service/auth/ {
    rewrite ^/user-service/auth/(.*)$ /api/auth/$1 break;
    proxy_pass http://user-service:5001/;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
}
```

### Option 2: Add Proxy Headers (if backend needs them)
```nginx
location ^~ /user-service/auth/ {
    rewrite ^/user-service/(.*)$ /$1 break;
    proxy_pass http://user-service:5001/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Connection "";
}
```

### Option 3: Check Backend Service Health
Verify the backend service is healthy:
```bash
# Health check endpoint (if available)
curl http://user-service:5001/health
```

## Next Steps

1. **Check backend logs** - This will show the actual error
2. **Verify backend route** - Confirm the expected path
3. **Test backend directly** - Bypass gateway to isolate issue
4. **Review improved error messages** - The frontend now shows backend error details

The improved error handling in `Login.js` will now display the actual backend error message, which should help identify the root cause.

