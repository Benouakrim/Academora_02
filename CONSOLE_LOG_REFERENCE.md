# Console Log Quick Reference

## How to Use This Guide
When debugging authentication issues, search for these exact prefixes in your console to track the flow.

---

## ✅ SUCCESSFUL AUTHENTICATION FLOW

### Browser Console (Client)
```
1. [API Interceptor] Requesting token for: /user/profile
2. [API Interceptor] ✅ Token retrieved successfully: eyJhbGciOiJSUzI1NiIs...
3. [UserStore] 🔄 Fetching user profile...
4. [UserStore] Making API request to /user/profile
5. [UserStore] ✅ Profile fetched successfully: {id: "xxx", email: "xxx@example.com"}
6. [ProtectedRoute] Profile fetched successfully
```

### Server Console
```
1. [CORS] ✅ Allowing origin: http://localhost:5173
2. [requireAuth] Authentication check: {userId: "user_2xxxxx", hasAuthHeader: true}
3. [requireAuth] ✅ Authentication successful for user: user_2xxxxx
```

---

## ❌ FAILED AUTHENTICATION FLOWS

### Scenario 1: No Token from Clerk

**Browser Console:**
```
[API Interceptor] ⚠️ No token returned from Clerk. User might not be authenticated.
[ProtectedRoute] No token available from Clerk
```

**What It Means:** Clerk isn't providing a token despite user being logged in.

**What to Check:**
- Clerk publishable key in `.env.local`
- Browser localStorage/cookies
- Clerk session status

**Fix:** Sign out and sign back in.

---

### Scenario 2: 401 Unauthorized from Server

**Browser Console:**
```
[API Interceptor] ✅ Token retrieved successfully: eyJhbGci...
[API Response] ❌ 401 Unauthorized: {url: "/user/profile", message: "unauthenticated", hasToken: true}
[UserStore] ❌ Failed to fetch profile: {status: 401, message: "unauthenticated"}
```

**Server Console:**
```
[requireAuth] Authentication check: {url: "/user/profile", hasAuth: false, userId: "none"}
[requireAuth] ❌ Authentication failed: {reason: "No userId in auth"}
```

**What It Means:** Token exists on client but server can't validate it.

**What to Check:**
- Server's Clerk secret key in `.env`
- CORS configuration
- Token format

**Fix:** 
1. Verify `CLERK_SECRET_KEY` matches your Clerk dashboard
2. Restart server
3. Check CORS logs

---

### Scenario 3: Network Error

**Browser Console:**
```
[API Response] ❌ Network Error - Server might be down: {url: "/user/profile", baseURL: "http://localhost:3001/api"}
```

**What It Means:** Can't reach the server.

**What to Check:**
- Is server running?
- Correct API URL in `.env.local`?
- Network connectivity?

**Fix:**
1. Start server: `cd server && npm run dev`
2. Verify `VITE_API_URL=http://localhost:3001/api`

---

### Scenario 4: User Not in Database

**Browser Console:**
```
[API Response] ❌ 404: {url: "/user/profile", message: "User not found"}
```

**Server Console:**
```
GET /api/user/profile 404
```

**What It Means:** User exists in Clerk but not in local database.

**What to Check:**
- Webhook configuration
- Database connection

**Fix:**
1. Check Prisma Studio for user
2. Server will auto-create user on retry
3. Configure Clerk webhook if not set up

---

### Scenario 5: CORS Blocked

**Browser Console:**
```
Access to XMLHttpRequest at 'http://localhost:3001/api/user/profile' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Server Console:**
```
[CORS] ⚠️ Origin not in allowlist: http://localhost:5174
```

**What It Means:** Server is rejecting requests from your origin.

**Fix:** Add your origin to server's CORS allowlist in `server/src/index.ts`

---

## 🔍 DIAGNOSTIC COMMANDS

### Check Auth Status
```bash
# While logged in, visit:
curl http://localhost:3001/api/user/auth/status

# Or in browser:
http://localhost:3001/api/user/auth/status
```

**Good Response:**
```json
{
  "authenticated": true,
  "userId": "user_2xxxxx",
  "hasAuthObject": true,
  "hasAuthHeader": true,
  "clerkConfigured": true
}
```

**Bad Response:**
```json
{
  "authenticated": false,
  "userId": null,
  "hasAuthObject": false,
  "hasAuthHeader": false,
  "clerkConfigured": true
}
```

---

## 🎯 QUICK DEBUGGING WORKFLOW

1. **Check if logged in to Clerk**
   - Look for Clerk user icon in navbar
   - Check `/sign-in` redirects to dashboard

2. **Open Browser Console (F12)**
   - Look for `[API Interceptor]` logs
   - Check if token is retrieved

3. **Check Server Terminal**
   - Look for `[requireAuth]` logs
   - Verify authentication success

4. **Test Diagnostic Endpoint**
   ```
   http://localhost:3001/api/user/auth/status
   ```

5. **If Still Failing**
   - Copy ALL logs (browser + server)
   - Check `AUTH_DEBUGGING_GUIDE.md`
   - Review environment variables

---

## 📊 LOG PREFIX REFERENCE

| Prefix | Where | Purpose |
|--------|-------|---------|
| `[API Interceptor]` | Browser | Token retrieval & HTTP requests |
| `[API Response]` | Browser | HTTP response errors |
| `[UserStore]` | Browser | User profile fetch operations |
| `[ProtectedRoute]` | Browser | Route protection logic |
| `[CORS]` | Server | CORS policy checks |
| `[requireAuth]` | Server | Authentication middleware |
| `[requireAdmin]` | Server | Admin role checks |
| `[Auth Status]` | Server | Diagnostic endpoint |

---

## 🚨 ERROR MESSAGES USER SEES

| Error Type | Title | Main Action |
|-----------|-------|-------------|
| `unauthorized` | "Authentication Required" | Sign In |
| `token` | "Authentication Token Issue" | Sign Out & Sign In Again |
| `network` | "Connection Error" | Retry Connection |
| `server` | "Server Error" | Go Home |
| `unknown` | "Something Went Wrong" | Try Again |

---

## 💡 PRO TIPS

### Enable Clerk Debug Mode
```javascript
// Run in browser console
window.__clerk_debug = true
```

### Monitor All Requests
```javascript
// Add to client/src/main.tsx temporarily
console.log = (...args) => {
  window.originalLog(...args);
  // Your custom logging
};
```

### Filter Console Logs
In DevTools console, use filter:
- `/API/` - See only API-related logs
- `/requireAuth/` - See only auth checks
- `❌` - See only errors
- `✅` - See only successes

### Watch Server Logs in Real-Time
```bash
# In server directory
npm run dev | grep "requireAuth"
```

---

## 📝 COMMON FIX CHECKLIST

- [ ] Server is running (`npm run dev` in server/)
- [ ] Client is running (`npm run dev` in client/)
- [ ] Environment variables are set correctly
- [ ] Clerk keys match dashboard
- [ ] Browser cache cleared
- [ ] Signed out and signed back in
- [ ] Diagnostic endpoint returns authenticated=true
- [ ] No CORS errors in console
- [ ] User exists in database (Prisma Studio)

---

**Last Updated:** December 12, 2025  
**Related Files:**
- `AUTH_DEBUGGING_GUIDE.md` - Full troubleshooting guide
- `AUTH_FIX_SUMMARY.md` - Implementation details
