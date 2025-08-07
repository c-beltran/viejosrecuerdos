# AWS S3 Setup Guide for Image Uploads

This guide will help you set up AWS S3 for storing and serving images for your inventory management system.

## Prerequisites

1. AWS Account
2. AWS CLI installed (optional but recommended)
3. Node.js application ready

## Step 1: Create S3 Bucket

### Via AWS Console:

1. **Sign in to AWS Console**
   - Go to [AWS S3 Console](https://console.aws.amazon.com/s3/)
   - Sign in with your AWS account

2. **Create Bucket**
   - Click "Create bucket"
   - Choose a unique bucket name (e.g., `viejosrecuerdos-images`)
   - Select your preferred region (e.g., `us-east-1`)
   - Keep default settings for now

3. **Configure Bucket**
   - Go to your bucket settings
   - Under "Block public access", uncheck "Block all public access"
   - Enable "ACL" (Access Control Lists)
   - Save changes

## Step 2: Create IAM User

### Create User for Application:

1. **Go to IAM Console**
   - Navigate to [IAM Console](https://console.aws.amazon.com/iam/)
   - Click "Users" → "Create user"

2. **User Details**
   - Username: `viejosrecuerdos-app`
   - Select "Programmatic access"

3. **Attach Policies**
   - Click "Attach existing policies directly"
   - Search for and select "AmazonS3FullAccess"
   - Or create a custom policy (see below)

### Custom IAM Policy (Recommended):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:PutObjectAcl",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::your-bucket-name",
                "arn:aws:s3:::your-bucket-name/*"
            ]
        }
    ]
}
```

4. **Create Access Keys**
   - After creating the user, go to "Security credentials"
   - Click "Create access key"
   - Choose "Application running outside AWS"
   - Download the CSV file with your credentials

## Step 3: Configure Environment Variables

Add these to your `.env` file:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket-name
AWS_ENDPOINT=  # Leave empty for default AWS endpoints
```

## Step 4: Configure CORS (Cross-Origin Resource Sharing)

Add this CORS configuration to your S3 bucket:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": [
            "ETag"
        ]
    }
]
```

### To add CORS:

1. Go to your S3 bucket
2. Click "Permissions" tab
3. Scroll down to "Cross-origin resource sharing (CORS)"
4. Click "Edit" and paste the above configuration
5. Save changes

## Step 5: Test the Setup

### Start your server:

```bash
npm start
```

### Test upload via Swagger UI:

1. Go to `http://localhost:8000/api/docs`
2. Find the Images section
3. Try uploading an image to an inventory item

### Test with curl:

```bash
# First, get a JWT token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email","password":"your-password"}'

# Then upload an image
curl -X POST http://localhost:8000/api/images/upload/YOUR_ITEM_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@/path/to/your/image.jpg"
```

## Step 6: Bucket Structure

Your S3 bucket will have this structure:

```
your-bucket-name/
├── inventory/
│   ├── original/
│   │   └── item-id/
│   │       └── timestamp-randomid.jpg
│   ├── medium/
│   │   └── item-id/
│   │       └── timestamp-randomid.jpg
│   └── thumbnail/
│       └── item-id/
│           └── timestamp-randomid.jpg
```

## Step 7: Security Best Practices

### 1. Use IAM Roles (for production):
- Instead of access keys, use IAM roles when deploying to AWS services
- More secure and automatically rotated

### 2. Bucket Policy (optional):
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

### 3. Enable Versioning (optional):
- Go to bucket properties
- Enable versioning for backup purposes

### 4. Set up Lifecycle Rules (optional):
- Automatically delete old versions
- Move to cheaper storage classes

## Troubleshooting

### Common Issues:

1. **"Access Denied" errors:**
   - Check IAM permissions
   - Verify bucket name and region
   - Ensure bucket is not blocking public access

2. **CORS errors:**
   - Verify CORS configuration
   - Check allowed origins

3. **"No such file or directory":**
   - Ensure bucket exists
   - Check bucket name spelling

4. **"Invalid credentials":**
   - Verify access key and secret key
   - Check if keys are active

### Debug Mode:

Enable debug logging by adding to your `.env`:

```env
DEBUG=aws-sdk:*
```

## Cost Optimization

### 1. Use CloudFront CDN:
- Set up CloudFront distribution for faster image delivery
- Reduced S3 costs for frequently accessed images

### 2. Lifecycle Policies:
- Move old images to cheaper storage classes
- Delete unused images automatically

### 3. Monitor Usage:
- Set up CloudWatch alarms
- Monitor S3 costs in AWS Cost Explorer

## Next Steps

1. **Set up CloudFront** for better performance
2. **Implement image optimization** based on device type
3. **Add image backup** to another region
4. **Set up monitoring** and alerting

Your AWS S3 image upload system is now ready! 🚀 