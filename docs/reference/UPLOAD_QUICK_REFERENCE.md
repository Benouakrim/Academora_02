# Quick Implementation Reference - Media Upload Fix

## What Was Fixed

### Problem
Image/video uploads weren't working across articles, profiles, universities, and landing pages. Users couldn't upload local files OR use URLs.

### Solution
Unified media upload system with support for:
- ✅ Local file uploads via Cloudinary
- ✅ External URL inputs (no server storage needed)
- ✅ Proper error handling and validation
- ✅ Real-time preview and feedback

---

## Key Changes at a Glance

### Backend
```
✅ uploadController.ts - Now accepts both files (FormData) and URLs (JSON)
✅ upload.ts routes  - Enhanced with unified handlers
```

### Frontend
```
✅ ImageUpload.tsx          - Universal component for images/videos
✅ ArticleEditorLayout.tsx  - OG image now uses ImageUpload
✅ ProfileForm.tsx          - Avatar now uses ImageUpload
✅ UniversityForm.tsx       - Already using ImageUpload (verified)
✅ AdminMediaPage.tsx       - Already complete (verified)
✅ VideoCarousel.tsx        - Already handles both types (verified)
```

---

## How to Use

### For Users: Upload an Image/Video

**Option 1: Local File**
1. Click "Browse" or drag file into upload area
2. Select image/video from computer
3. Wait for upload confirmation
4. Image/video will display

**Option 2: External URL**
1. Click "Or use image/video URL"
2. Paste URL from web
3. Click "Add URL"
4. Image/video will display

### For Developers: Implement Upload

**Basic Usage:**
```tsx
import ImageUpload from '@/components/common/ImageUpload'

// In your component
const [imageUrl, setImageUrl] = useState('')

<ImageUpload 
  value={imageUrl}
  onChange={setImageUrl}
  type="image"           // or 'video'
  allowUrl={true}        // Allow URL input
  maxSizeMB={5}          // Max file size
/>
```

**With React Hook Form:**
```tsx
<Controller
  control={form.control}
  name="featuredImage"
  render={({ field }) => (
    <ImageUpload
      value={field.value}
      onChange={field.onChange}
      type="image"
    />
  )}
/>
```

---

## API Endpoints

### Upload Image
```
POST /api/upload/image
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- file: File object (for local upload)

OR

POST /api/upload/image
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
  "url": "https://example.com/image.jpg"
}
```

### Upload Video
```
POST /api/upload/video
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- file: File object (for local upload)

OR

POST /api/upload/video
Content-Type: application/json
Authorization: Bearer {token}

Body:
{
  "url": "https://youtube.com/watch?v=..."
}
```

### Response
```json
{
  "success": true,
  "imageUrl": "https://...",
  "publicId": "academora/...",  // null for external URLs
  "isExternal": false            // true for URLs
}
```

---

## Features by Feature

### Articles
- ✅ Featured Image: Upload or URL
- ✅ OG Image: Upload or URL (NEW)
- ✅ Content Images: Via editor toolbar

### Universities
- ✅ Logo: Upload or URL
- ✅ Hero Image: Upload or URL

### User Profile
- ✅ Avatar: Upload or URL (NEW)

### Landing Page
- ✅ Videos: Upload or YouTube/Vimeo URL
- ✅ Images: Upload or URL

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Upload button doesn't work | Check authentication token |
| File size error | Increase maxSizeMB or compress file |
| Invalid URL error | Ensure URL is complete and accessible |
| Image not showing | Check network tab for upload errors |
| Cloudinary error | Verify env variables are set |

---

## File Reference

### Modified Files
- `server/src/controllers/uploadController.ts` - Upload handlers
- `server/src/routes/upload.ts` - Route configuration
- `client/src/components/common/ImageUpload.tsx` - Upload component
- `client/src/pages/articles/ArticleEditorLayout.tsx` - Article editor
- `client/src/pages/dashboard/profile/ProfileForm.tsx` - Profile form

### Key Component Props
```typescript
// ImageUpload props
value?: string | null
onChange: (url: string, publicId?: string) => void
type?: 'image' | 'video'
allowUrl?: boolean              // default: true
maxSizeMB?: number             // default: 5
className?: string
```

---

## Environment Setup

Ensure `.env` has:
```
CLOUDINARY_URL=cloudinary://KEY:SECRET@NAME
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
```

---

## Next Steps

1. ✅ Test all upload features
2. ✅ Verify images render correctly
3. ✅ Check error handling
4. ✅ Monitor Cloudinary usage
5. ✅ Update user documentation

---

## Support

For issues or questions:
1. Check error messages in browser console
2. Verify Cloudinary credentials
3. Test with curl commands above
4. Review UPLOAD_IMPLEMENTATION_FIX.md for detailed docs
