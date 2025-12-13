# Authentication Debugging Guide

This guide helps you diagnose and fix authentication issues in the Academora application.

## Quick Diagnostic Steps

### Step 1: Check Browser Console
Open your browser's developer console (F12) and look for these log messages:

#### ✅ Successful Authentication Flow:
```
[API Interceptor] Requesting token for: /user/profile
[API Interceptor] ✅ Token retrieved successfully: eyJhbGciOiJSUzI1NiIs...
[UserStore] 🔄 Fetching user profile...
[UserStore] Making API request to /user/profile
[UserStore] ✅ Profile fetched successfully: {id: "...", email: "..."}
[ProtectedRoute] Profile fetched successfully
```

#### ❌ Failed Authentication (No Token):
```
[API Interceptor] ⚠️ No token returned from Clerk. User might not be authenticated.
[ProtectedRoute] No token available from Clerk
```

#### ❌ Failed Authentication (401 Unauthorized):
```
[API Response] ❌ 401 Unauthorized: {url: "/user/profile", message: "unauthenticated"}
[UserStore] ❌ Failed to fetch profile: {status: 401, message: "unauthenticated"}
```

### Step 2: Check Server Console
Look at your server terminal for these messages:

#### ✅ Successful Server Authentication:
```
[requireAuth] Authentication check: {userId: "user_2xxxxx", hasAuthHeader: true}
[requireAuth] ✅ Authentication successful for user: user_2xxxxx
```

#### ❌ Failed Server Authentication:
```
[requireAuth] ❌ Authentication failed: {url: "/user/profile", reason: "No userId in auth"}
```

### Step 3: Test the Diagnostic Endpoint

Open this URL in your browser while logged in:
```
http://localhost:3001/api/user/auth/status
```

**Expected Response (Authenticated):**
```json
{
  "authenticated": true,
  "userId": "user_2xxxxx",
  "hasAuthObject": true,
  "hasAuthHeader": true,
  "clerkConfigured": true,
  "timestamp": "2025-12-12T..."
}
```

**Problem Response (Not Authenticated):**
```json
{
  "authenticated": false,
  "userId": null,
  "hasAuthObject": false,
  "hasAuthHeader": false,
  "clerkConfigured": true,
  "timestamp": "2025-12-12T..."
}
```

## Common Issues and Fixes

### Issue 1: No Token from Clerk (Client)
**Symptoms:**
- Console shows: `⚠️ No token returned from Clerk`
- User is logged in to Clerk but no token

**Causes:**
1. Clerk session not properly initialized
2. Clerk publishable key mismatch
3. Browser storage cleared but session not re-established

**Fixes:**
```bash
# 1. Verify environment variables
# Check client/.env.local has:
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# 2. Clear all browser data
# - Clear cookies, localStorage, sessionStorage
# - Hard refresh (Ctrl+Shift+R)

# 3. Sign out and sign back in
# - Go to /sign-in
# - Sign out completely
# - Sign in again
```

### Issue 2: 401 Unauthorized from Server
**Symptoms:**
- Token exists on client
- Server rejects with 401
- Console shows: `❌ Authentication failed: {reason: "No userId in auth"}`

**Causes:**
1. Clerk secret key mismatch
2. Token format incorrect
3. CORS issues preventing headers

**Fixes:**
```bash
# 1. Verify server environment variables
# Check server/.env has:
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...

# 2. Restart the server
cd server
npm run dev

# 3. Check CORS configuration
# Ensure server allows your client origin
```

### Issue 3: User in Clerk but not in Database
**Symptoms:**
- Authentication works
- Profile fetch returns 404
- Console shows: `User not found`

**Causes:**
1. Webhook not configured
2. User creation race condition
3. Database sync failed

**Fixes:**
```bash
# 1. Check if user exists in database
# Use Prisma Studio:
cd server
npm run db:studio

# 2. Manually trigger user creation
# The server will auto-create user on first profile request

# 3. Configure Clerk webhook (if not set up)
# Clerk Dashboard → Webhooks → Add Endpoint
# URL: https://your-domain.com/api/webhooks/clerk
# Events: user.created, user.updated, user.deleted
```

### Issue 4: CORS Errors
**Symptoms:**
- Console shows: `CORS policy: No 'Access-Control-Allow-Origin'`
- Network tab shows OPTIONS requests failing

**Fixes:**
```typescript
// In server/src/index.ts, verify CORS config includes your origin:
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

### Issue 5: Infinite Loading Loop
**Symptoms:**
- Page keeps spinning
- Multiple profile fetch attempts
- Console shows retry messages

**Cause:**
- ProtectedRoute trying to fetch profile repeatedly due to auth failure

**Fix:**
This is now handled automatically! The new ProtectedRoute will:
1. Try up to 3 times
2. Show detailed error message
3. Provide action buttons (Sign Out, Retry, Go Home)

## Environment Variables Checklist

### Client (.env.local)
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
VITE_API_URL=http://localhost:3001/api
```

### Server (.env)
```bash
PORT=3001
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_HERE
CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
CLERK_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

## Testing the Fix

### Test 1: Fresh Login
1. Clear browser cache completely
2. Navigate to `http://localhost:5173/sign-in`
3. Sign in with your credentials
4. You should be redirected to `/dashboard`
5. Check console for success messages

### Test 2: Protected Routes
1. Ensure you're logged in
2. Navigate to `http://localhost:5173/articles/new`
3. Page should load (not infinite spin)
4. If error, you should see a helpful error message with buttons

### Test 3: Token Verification
1. Open DevTools → Network tab
2. Navigate to `/dashboard`
3. Find the `/user/profile` request
4. Check Headers → Authorization should show `Bearer eyJ...`
5. Check Response → Should return your user data

### Test 4: Server Logs
1. Watch server terminal while navigating
2. Should see:
   ```
   [requireAuth] ✅ Authentication successful for user: user_xxx
   ```
3. Should NOT see:
   ```
   [requireAuth] ❌ Authentication failed
   ```

## Still Having Issues?

### Enable Maximum Debug Logging

**Client (browser console):**
```javascript
// Run in console to enable detailed Clerk logging
window.__clerk_debug = true
```

**Server (add to index.ts):**
```typescript
// Add before routes
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`, {
    headers: req.headers,
    query: req.query
  });
  next();
});
```

### Get Help
1. Copy all console logs (both browser and server)
2. Note the exact URL you're trying to access
3. Check the diagnostic endpoint response
4. Share these details with your development team

## Error Message Reference

| Error Type | User Sees | Action Button | Cause |
|-----------|-----------|---------------|-------|
| `unauthorized` | "Authentication Required" | Sign In | User not logged in or session expired |
| `token` | "Authentication Token Issue" | Sign Out & Sign In | Token sync problem between Clerk and server |
| `network` | "Connection Error" | Retry | Server unreachable or internet down |
| `server` | "Server Error" | Go Home | Backend error (500) |
| `unknown` | "Something Went Wrong" | Try Again | Unexpected error |

## Changes Made

### Client Changes:
1. ✅ Enhanced API interceptor with detailed logging
2. ✅ Added response interceptor for 401/403/network errors
3. ✅ Improved UserStore with comprehensive error logging
4. ✅ Created AuthError component with actionable buttons
5. ✅ Updated ProtectedRoute with retry logic and error handling

### Server Changes:
1. ✅ Enhanced requireAuth middleware with detailed logging
2. ✅ Improved CORS configuration with origin logging
3. ✅ Added diagnostic endpoint `/user/auth/status`
4. ✅ Better error messages in responses

All changes are backward compatible and won't break existing functionality!
