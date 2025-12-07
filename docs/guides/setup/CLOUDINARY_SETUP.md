# Cloudinary Setup Guide

## Problem
Image and video uploads are failing because Cloudinary credentials are not configured. The server logs show:
```
[Cloudinary] Initialized with cloud_name: NOT SET
[Cloudinary] Has API key: false
[Cloudinary] Has API secret: false
```

## Solution

### Step 1: Get Cloudinary Credentials

1. Go to https://cloudinary.com
2. Sign up for a free account (or log in if you have one)
3. Go to your **Dashboard**
4. You'll see your **Cloud Name** displayed prominently
5. Under **API Keys** section, you'll find:
   - Cloud Name
   - API Key
   - API Secret

### Step 2: Create .env File

Create a `.env` file in the `server` directory (`server/.env`):

```env
# Cloudinary Configuration (Option 1: Using individual variables)
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# OR Option 2: Using CLOUDINARY_URL (replaces the above three)
# CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name

# Other Required Variables
DATABASE_URL=your_database_url
CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
RESEND_API_KEY=your_resend_key
```

### Step 3: Restart Server

After adding the `.env` file, restart the server:

```bash
# If server is running, stop it (Ctrl+C) and run:
cd server
npm run dev
```

Check the logs - you should see:
```
[Cloudinary] Initialized with cloud_name: YOUR_CLOUD_NAME
[Cloudinary] Has API key: true
[Cloudinary] Has API secret: true
```

## Current Status

### What Works WITHOUT Cloudinary:
✅ URL input (paste image/video URLs)
✅ File upload endpoint (returns proper response structure)

### What Needs Cloudinary:
❌ Local file uploads to Cloudinary storage
❌ Image transformations and optimization
❌ Cloudinary URL generation

## Testing

### Test URL Upload (Works Now):
```bash
curl -X POST http://localhost:3001/api/upload/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/image.jpg"}'
```

### Test File Upload (Needs Cloudinary):
```bash
curl -X POST http://localhost:3001/api/upload/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

## Troubleshooting

**Issue**: Still getting 503 error after setting env vars
- **Solution**: Make sure you restarted the server after creating `.env`
- **Solution**: Check that the `.env` file is in the `server` directory, not the root

**Issue**: Cloudinary credentials not working
- **Solution**: Verify credentials on https://cloudinary.com/console
- **Solution**: Make sure there are no typos in API Key or Secret
- **Solution**: Check that Cloud Name is exactly as shown in dashboard

**Issue**: Can't find Cloudinary credentials
- **Solution**: They're in the **API Keys** section of your Cloudinary dashboard
- **Solution**: Not in "Settings" or "Account" - specifically **API Keys**

## Production Deployment

For production, use environment variables provided by your hosting platform:
- **Render**: Environment variables in Dashboard
- **Vercel**: Environment variables in Project Settings
- **Heroku**: Config Vars in Settings

Do NOT commit `.env` to Git. Add to `.gitignore`:
```
.env
.env.local
.env.*.local
```

## References

- Cloudinary Dashboard: https://cloudinary.com/console
- API Documentation: https://cloudinary.com/documentation/node_integration
- Node.js SDK: https://github.com/cloudinary/cloudinary_npm
