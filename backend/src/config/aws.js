const AWS = require('aws-sdk');
const config = require('./config');

// AWS S3 Configuration
const s3Config = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || config.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || config.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || config.AWS_REGION,
  bucketName: process.env.AWS_BUCKET || config.AWS_BUCKET,
  endpoint: process.env.AWS_ENDPOINT // Optional: for custom endpoints
};

// Initialize S3 client
const s3 = new AWS.S3({
  accessKeyId: s3Config.accessKeyId,
  secretAccessKey: s3Config.secretAccessKey,
  region: s3Config.region,
  ...(s3Config.endpoint && { endpoint: s3Config.endpoint })
});

// Image processing configuration
const imageConfig = {
  // Thumbnail dimensions
  thumbnail: {
    width: 300,
    height: 300,
    quality: 80,
    format: 'jpeg'
  },
  // Medium size for web display
  medium: {
    width: 800,
    height: 800,
    quality: 85,
    format: 'jpeg'
  },
  // Original size (optimized)
  original: {
    quality: 90,
    format: 'jpeg'
  },
  // Allowed file types
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  // Maximum file size (5MB)
  maxFileSize: 5 * 1024 * 1024,
  // Upload folder structure
  folders: {
    original: 'inventory/original',
    medium: 'inventory/medium',
    thumbnail: 'inventory/thumbnail'
  }
};

// Generate S3 URL for a file
const getS3Url = (key) => {
  return `https://${s3Config.bucketName}.s3.${s3Config.region}.amazonaws.com/${key}`;
};

// Generate unique filename
const generateFileName = (originalName, folder = '') => {
  const timestamp = Date.now();
  const randomId = require('uuid').v4().split('-')[0];
  const extension = originalName.split('.').pop().toLowerCase();
  const fileName = `${timestamp}-${randomId}.${extension}`;
  
  return folder ? `${folder}/${fileName}` : fileName;
};

// Upload file to S3
const uploadToS3 = async (fileBuffer, key, contentType) => {
  const params = {
    Bucket: s3Config.bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    ACL: 'public-read', // Make files publicly accessible
    CacheControl: 'max-age=31536000' // Cache for 1 year
  };

  try {
    const result = await s3.upload(params).promise();
    return {
      success: true,
      url: result.Location,
      key: result.Key,
      bucket: result.Bucket
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete file from S3
const deleteFromS3 = async (key) => {
  const params = {
    Bucket: s3Config.bucketName,
    Key: key
  };

  try {
    await s3.deleteObject(params).promise();
    return { success: true };
  } catch (error) {
    console.error('S3 delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Check if S3 is properly configured
const isS3Configured = () => {
  return !!(s3Config.accessKeyId && s3Config.secretAccessKey && s3Config.bucketName);
};

module.exports = {
  s3,
  s3Config,
  imageConfig,
  getS3Url,
  generateFileName,
  uploadToS3,
  deleteFromS3,
  isS3Configured
}; 