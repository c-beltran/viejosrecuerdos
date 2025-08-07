const AWS = require('aws-sdk');
const config = require('../config/config');

// Configure AWS
AWS.config.update({
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  region: config.AWS_REGION
});

const s3 = new AWS.S3();

class S3Service {
  constructor() {
    this.bucketName = config.AWS_BUCKET;
  }

  /**
   * Upload a file to S3
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} fileName - Name of the file
   * @param {string} contentType - MIME type of the file
   * @param {string} folder - Folder path in S3 (e.g., 'inventory', 'thumbnails')
   * @returns {Promise<Object>} - Upload result with URL
   */
  async uploadFile(fileBuffer, fileName, contentType, folder = 'inventory') {
    try {
      const key = `${folder}/${Date.now()}-${fileName}`;
      
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        ACL: 'public-read', // Make files publicly accessible
        CacheControl: 'max-age=31536000' // Cache for 1 year
      };

      const result = await s3.upload(params).promise();
      
      return {
        success: true,
        url: result.Location,
        key: result.Key,
        bucket: result.Bucket
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  /**
   * Upload multiple files to S3
   * @param {Array} files - Array of file objects with buffer, name, and type
   * @param {string} folder - Folder path in S3
   * @returns {Promise<Array>} - Array of upload results
   */
  async uploadMultipleFiles(files, folder = 'inventory') {
    try {
      const uploadPromises = files.map(file => 
        this.uploadFile(file.buffer, file.name, file.mimetype, folder)
      );
      
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('S3 multiple upload error:', error);
      throw new Error(`Failed to upload multiple files: ${error.message}`);
    }
  }

  /**
   * Delete a file from S3
   * @param {string} key - S3 object key
   * @returns {Promise<Object>} - Delete result
   */
  async deleteFile(key) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key
      };

      await s3.deleteObject(params).promise();
      
      return {
        success: true,
        message: 'File deleted successfully'
      };
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  /**
   * Delete multiple files from S3
   * @param {Array} keys - Array of S3 object keys
   * @returns {Promise<Object>} - Delete result
   */
  async deleteMultipleFiles(keys) {
    try {
      if (!keys || keys.length === 0) {
        return { success: true, message: 'No files to delete' };
      }

      const params = {
        Bucket: this.bucketName,
        Delete: {
          Objects: keys.map(key => ({ Key: key })),
          Quiet: false
        }
      };

      const result = await s3.deleteObjects(params).promise();
      
      return {
        success: true,
        deleted: result.Deleted,
        errors: result.Errors || []
      };
    } catch (error) {
      console.error('S3 multiple delete error:', error);
      throw new Error(`Failed to delete multiple files: ${error.message}`);
    }
  }

  /**
   * Get a signed URL for temporary access to a private file
   * @param {string} key - S3 object key
   * @param {number} expiresIn - Expiration time in seconds (default: 3600)
   * @returns {Promise<string>} - Signed URL
   */
  async getSignedUrl(key, expiresIn = 3600) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Expires: expiresIn
      };

      const signedUrl = await s3.getSignedUrlPromise('getObject', params);
      return signedUrl;
    } catch (error) {
      console.error('S3 signed URL error:', error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Check if a file exists in S3
   * @param {string} key - S3 object key
   * @returns {Promise<boolean>} - Whether file exists
   */
  async fileExists(key) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key
      };

      await s3.headObject(params).promise();
      return true;
    } catch (error) {
      if (error.code === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get file metadata from S3
   * @param {string} key - S3 object key
   * @returns {Promise<Object>} - File metadata
   */
  async getFileMetadata(key) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key
      };

      const result = await s3.headObject(params).promise();
      
      return {
        success: true,
        metadata: {
          contentType: result.ContentType,
          contentLength: result.ContentLength,
          lastModified: result.LastModified,
          etag: result.ETag
        }
      };
    } catch (error) {
      console.error('S3 metadata error:', error);
      throw new Error(`Failed to get file metadata: ${error.message}`);
    }
  }
}

module.exports = new S3Service(); 
