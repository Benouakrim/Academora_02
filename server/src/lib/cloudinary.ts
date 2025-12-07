import { v2 as cloudinary } from 'cloudinary';

// Support both CLOUDINARY_URL format and individual env variables
if (process.env.CLOUDINARY_URL) {
  // Parse CLOUDINARY_URL format: cloudinary://api_key:api_secret@cloud_name
  const url = process.env.CLOUDINARY_URL;
  try {
    // Remove 'cloudinary://' prefix
    const parts = url.replace('cloudinary://', '');
    // Split by '@' to get credentials and cloud_name
    const [credentials, cloudName] = parts.split('@');
    // Split credentials by ':' to get api_key and api_secret
    const [apiKey, apiSecret] = credentials.split(':');
    
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  } catch (err) {
    console.error('[Cloudinary] Failed to parse CLOUDINARY_URL:', err);
  }
} else {
  // Fall back to individual environment variables
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const config = cloudinary.config();
console.log('[Cloudinary] Initialized with cloud_name:', config.cloud_name || 'NOT SET');
console.log('[Cloudinary] Has API key:', !!config.api_key);
console.log('[Cloudinary] Has API secret:', !!config.api_secret);

export default cloudinary;
