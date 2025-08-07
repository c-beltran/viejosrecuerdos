# Image Upload System Documentation

## Overview

The Viejos Recuerdos application includes a comprehensive image upload system that allows you to upload, process, and manage images for inventory items. The system uses AWS S3 for storage and Sharp for image processing.

## Features

✅ **Multiple Image Sizes**
- Original (optimized)
- Medium (800x800px)
- Thumbnail (300x300px)

✅ **Image Processing**
- Automatic optimization
- Format conversion to JPEG
- Quality control
- Metadata extraction

✅ **AWS S3 Integration**
- Secure cloud storage
- Public access for images
- Automatic file organization
- Cost-effective storage

✅ **File Management**
- Upload multiple images
- Delete individual images
- Reorder images
- Image metadata tracking

## API Endpoints

### Image Upload

#### Upload Single Image for Inventory Item
```
POST /api/images/upload/{itemId}
```

**Request:**
- Content-Type: `multipart/form-data`
- Body: `image` file

**Response:**
```json
{
  "success": true,
  "data": {
    "image": {
      "original": "https://bucket.s3.region.amazonaws.com/inventory/original/item-id/filename.jpg",
      "medium": "https://bucket.s3.region.amazonaws.com/inventory/medium/item-id/filename.jpg",
      "thumbnail": "https://bucket.s3.region.amazonaws.com/inventory/thumbnail/item-id/filename.jpg",
      "fileName": "timestamp-randomid.jpg",
      "metadata": {
        "width": 1920,
        "height": 1080,
        "format": "jpeg",
        "size": 245760
      }
    },
    "item": {
      // Updated inventory item with new imageUrls
    }
  }
}
```

#### Upload Multiple Images for Inventory Item
```
POST /api/images/upload-multiple/{itemId}
```

**Request:**
- Content-Type: `multipart/form-data`
- Body: `images` files (max 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "images": [
      {
        "original": "https://...",
        "medium": "https://...",
        "thumbnail": "https://...",
        "fileName": "timestamp-randomid.jpg"
      }
    ],
    "item": {
      // Updated inventory item with new imageUrls
    }
  }
}
```

### Image Management

#### Delete Image from Inventory Item
```
DELETE /api/images/delete/{itemId}/{imageIndex}
```

**Parameters:**
- `itemId`: Inventory item ID
- `imageIndex`: Index of image to delete (0-based)

**Response:**
```json
{
  "success": true,
  "message": "Image deleted successfully",
  "data": {
    "item": {
      // Updated inventory item
    }
  }
}
```

#### Reorder Images for Inventory Item
```
PUT /api/images/reorder/{itemId}
```

**Request Body:**
```json
{
  "imageOrder": [2, 0, 1, 3]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "item": {
      // Updated inventory item with reordered images
    }
  }
}
```

## File Structure

### S3 Bucket Organization
```
your-bucket-name/
├── inventory/
│   ├── original/
│   │   └── {itemId}/
│   │       └── {timestamp}-{randomId}.jpg
│   ├── medium/
│   │   └── {itemId}/
│   │       └── {timestamp}-{randomId}.jpg
│   └── thumbnail/
│       └── {itemId}/
│           └── {timestamp}-{randomId}.jpg
```

### Database Storage
Images are stored in the `inventory` table in the `imageUrls` field as a JSONB array:

```json
[
  {
    "original": "https://bucket.s3.region.amazonaws.com/inventory/original/item-id/filename.jpg",
    "medium": "https://bucket.s3.region.amazonaws.com/inventory/medium/item-id/filename.jpg",
    "thumbnail": "https://bucket.s3.region.amazonaws.com/inventory/thumbnail/item-id/filename.jpg",
    "fileName": "timestamp-randomid.jpg",
    "metadata": {
      "width": 1920,
      "height": 1080,
      "format": "jpeg",
      "size": 245760
    }
  }
]
```

## Configuration

### Environment Variables
```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket-name
```

### Image Processing Settings
```javascript
// Located in backend/src/config/aws.js
const imageConfig = {
  thumbnail: {
    width: 300,
    height: 300,
    quality: 80,
    format: 'jpeg'
  },
  medium: {
    width: 800,
    height: 800,
    quality: 85,
    format: 'jpeg'
  },
  original: {
    quality: 90,
    format: 'jpeg'
  },
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxFileSize: 5 * 1024 * 1024, // 5MB
  folders: {
    original: 'inventory/original',
    medium: 'inventory/medium',
    thumbnail: 'inventory/thumbnail'
  }
};
```

## Usage Examples

### Frontend Integration

#### Upload Single Image
```javascript
const uploadImage = async (itemId, file) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`/api/images/upload/${itemId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const result = await response.json();
  return result;
};
```

#### Upload Multiple Images
```javascript
const uploadMultipleImages = async (itemId, files) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });

  const response = await fetch(`/api/images/upload-multiple/${itemId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const result = await response.json();
  return result;
};
```

#### Delete Image
```javascript
const deleteImage = async (itemId, imageIndex) => {
  const response = await fetch(`/api/images/delete/${itemId}/${imageIndex}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const result = await response.json();
  return result;
};
```

#### Reorder Images
```javascript
const reorderImages = async (itemId, newOrder) => {
  const response = await fetch(`/api/images/reorder/${itemId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ imageOrder: newOrder })
  });

  const result = await response.json();
  return result;
};
```

### Display Images

#### Show Thumbnail
```html
<img src="https://bucket.s3.region.amazonaws.com/inventory/thumbnail/item-id/filename.jpg" 
     alt="Item thumbnail" 
     class="thumbnail" />
```

#### Show Medium Size
```html
<img src="https://bucket.s3.region.amazonaws.com/inventory/medium/item-id/filename.jpg" 
     alt="Item image" 
     class="medium-image" />
```

#### Show Original Size
```html
<img src="https://bucket.s3.region.amazonaws.com/inventory/original/item-id/filename.jpg" 
     alt="Item original" 
     class="original-image" />
```

## Security

### Authentication
- All image upload endpoints require authentication
- JWT token must be included in Authorization header

### File Validation
- File type validation (JPEG, PNG, WebP)
- File size limit (5MB)
- Maximum 10 files per upload

### S3 Security
- Public read access for images
- Private write access
- CORS configured for web access

## Performance Optimization

### Image Optimization
- Automatic JPEG compression
- Quality settings optimized for web
- Multiple sizes for responsive design

### Caching
- S3 objects cached for 1 year
- CDN-ready URLs
- Browser-friendly cache headers

### Storage Efficiency
- Automatic cleanup on deletion
- Organized folder structure
- Cost-effective storage classes

## Error Handling

### Common Errors
```json
{
  "success": false,
  "error": "File type not allowed. Allowed types: image/jpeg, image/jpg, image/png, image/webp"
}
```

```json
{
  "success": false,
  "error": "File too large. Maximum size: 5MB"
}
```

```json
{
  "success": false,
  "error": "AWS S3 is not configured. Please check your environment variables."
}
```

## Testing

### Using Swagger UI
1. Go to `http://localhost:8000/api/docs`
2. Find the Images section
3. Test upload endpoints with sample images

### Using curl
```bash
# Upload single image
curl -X POST http://localhost:8000/api/images/upload/{itemId} \
  -H "Authorization: Bearer {token}" \
  -F "image=@/path/to/image.jpg"

# Upload multiple images
curl -X POST http://localhost:8000/api/images/upload-multiple/{itemId} \
  -H "Authorization: Bearer {token}" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

## Monitoring

### S3 Metrics
- Monitor storage usage
- Track request counts
- Monitor costs

### Application Metrics
- Upload success/failure rates
- Processing times
- Error rates

## Troubleshooting

### Common Issues

1. **"Access Denied" errors**
   - Check AWS credentials
   - Verify bucket permissions
   - Ensure bucket exists

2. **"File too large" errors**
   - Check file size limit (5MB)
   - Compress images before upload

3. **"Invalid file type" errors**
   - Ensure file is JPEG, PNG, or WebP
   - Check file extension

4. **"S3 not configured" errors**
   - Verify environment variables
   - Check AWS credentials

### Debug Mode
Enable debug logging:
```env
DEBUG=aws-sdk:*
```

## Next Steps

1. **Set up CloudFront CDN** for better performance
2. **Implement image backup** to another region
3. **Add image analytics** (views, downloads)
4. **Implement image search** by content
5. **Add watermarking** for brand protection

Your image upload system is ready to use! 🚀 