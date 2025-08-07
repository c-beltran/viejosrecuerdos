const sharp = require('sharp');

class ImageProcessingService {
  constructor() {
    this.supportedFormats = ['jpeg', 'jpg', 'png', 'webp', 'gif'];
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
  }

  /**
   * Validate if the file is a supported image
   * @param {Object} file - File object from multer
   * @returns {boolean} - Whether file is valid
   */
  validateImage(file) {
    if (!file) return false;
    
    const isValidSize = file.size <= this.maxFileSize;
    const isValidFormat = this.supportedFormats.some(format => 
      file.mimetype.includes(format) || file.originalname.toLowerCase().endsWith(format)
    );
    
    return isValidSize && isValidFormat;
  }

  /**
   * Process and optimize an image
   * @param {Buffer} imageBuffer - Original image buffer
   * @param {Object} options - Processing options
   * @returns {Promise<Buffer>} - Processed image buffer
   */
  async processImage(imageBuffer, options = {}) {
    const {
      width = 1200,
      height = null,
      quality = 85,
      format = 'jpeg',
      fit = 'inside'
    } = options;

    try {
      let processedImage = sharp(imageBuffer);

      // Resize image
      if (width || height) {
        processedImage = processedImage.resize(width, height, {
          fit: fit,
          withoutEnlargement: true
        });
      }

      // Convert format and set quality
      switch (format.toLowerCase()) {
        case 'jpeg':
        case 'jpg':
          processedImage = processedImage.jpeg({ quality });
          break;
        case 'png':
          processedImage = processedImage.png({ quality });
          break;
        case 'webp':
          processedImage = processedImage.webp({ quality });
          break;
        default:
          processedImage = processedImage.jpeg({ quality });
      }

      return await processedImage.toBuffer();
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error(`Failed to process image: ${error.message}`);
    }
  }

  /**
   * Generate a thumbnail from an image
   * @param {Buffer} imageBuffer - Original image buffer
   * @param {Object} options - Thumbnail options
   * @returns {Promise<Buffer>} - Thumbnail buffer
   */
  async generateThumbnail(imageBuffer, options = {}) {
    const {
      width = 300,
      height = 300,
      quality = 80,
      format = 'jpeg',
      fit = 'cover'
    } = options;

    try {
      const thumbnail = await sharp(imageBuffer)
        .resize(width, height, {
          fit: fit,
          position: 'center'
        })
        .jpeg({ quality })
        .toBuffer();

      return thumbnail;
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      throw new Error(`Failed to generate thumbnail: ${error.message}`);
    }
  }

  /**
   * Generate multiple sizes of an image
   * @param {Buffer} imageBuffer - Original image buffer
   * @param {Array} sizes - Array of size configurations
   * @returns {Promise<Array>} - Array of processed images
   */
  async generateMultipleSizes(imageBuffer, sizes = []) {
    try {
      const processedImages = [];

      for (const size of sizes) {
        const processed = await this.processImage(imageBuffer, size);
        processedImages.push({
          ...size,
          buffer: processed
        });
      }

      return processedImages;
    } catch (error) {
      console.error('Multiple sizes generation error:', error);
      throw new Error(`Failed to generate multiple sizes: ${error.message}`);
    }
  }

  /**
   * Get image metadata
   * @param {Buffer} imageBuffer - Image buffer
   * @returns {Promise<Object>} - Image metadata
   */
  async getImageMetadata(imageBuffer) {
    try {
      const metadata = await sharp(imageBuffer).metadata();
      
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size,
        hasAlpha: metadata.hasAlpha,
        hasProfile: metadata.hasProfile,
        isOpaque: metadata.isOpaque,
        orientation: metadata.orientation
      };
    } catch (error) {
      console.error('Metadata extraction error:', error);
      throw new Error(`Failed to extract image metadata: ${error.message}`);
    }
  }

  /**
   * Convert image to different formats
   * @param {Buffer} imageBuffer - Original image buffer
   * @param {Array} formats - Array of formats to convert to
   * @returns {Promise<Object>} - Object with format as key and buffer as value
   */
  async convertFormats(imageBuffer, formats = ['jpeg', 'webp']) {
    try {
      const converted = {};

      for (const format of formats) {
        let convertedImage = sharp(imageBuffer);

        switch (format.toLowerCase()) {
          case 'jpeg':
          case 'jpg':
            convertedImage = convertedImage.jpeg({ quality: 85 });
            break;
          case 'png':
            convertedImage = convertedImage.png({ quality: 85 });
            break;
          case 'webp':
            convertedImage = convertedImage.webp({ quality: 85 });
            break;
          default:
            continue;
        }

        converted[format] = await convertedImage.toBuffer();
      }

      return converted;
    } catch (error) {
      console.error('Format conversion error:', error);
      throw new Error(`Failed to convert image formats: ${error.message}`);
    }
  }

  /**
   * Process multiple images with the same settings
   * @param {Array} imageBuffers - Array of image buffers
   * @param {Object} options - Processing options
   * @returns {Promise<Array>} - Array of processed image buffers
   */
  async processMultipleImages(imageBuffers, options = {}) {
    try {
      const processedImages = [];

      for (const buffer of imageBuffers) {
        const processed = await this.processImage(buffer, options);
        processedImages.push(processed);
      }

      return processedImages;
    } catch (error) {
      console.error('Multiple images processing error:', error);
      throw new Error(`Failed to process multiple images: ${error.message}`);
    }
  }

  /**
   * Create a collage from multiple images
   * @param {Array} imageBuffers - Array of image buffers
   * @param {Object} options - Collage options
   * @returns {Promise<Buffer>} - Collage image buffer
   */
  async createCollage(imageBuffers, options = {}) {
    const {
      width = 800,
      height = 600,
      columns = 2,
      rows = 2,
      spacing = 10,
      background = { r: 255, g: 255, b: 255, alpha: 1 }
    } = options;

    try {
      const cellWidth = (width - (spacing * (columns - 1))) / columns;
      const cellHeight = (height - (spacing * (rows - 1))) / rows;

      const composite = [];

      for (let i = 0; i < Math.min(imageBuffers.length, columns * rows); i++) {
        const row = Math.floor(i / columns);
        const col = i % columns;
        
        const x = col * (cellWidth + spacing);
        const y = row * (cellHeight + spacing);

        const resizedImage = await sharp(imageBuffers[i])
          .resize(cellWidth, cellHeight, { fit: 'cover' })
          .toBuffer();

        composite.push({
          input: resizedImage,
          top: y,
          left: x
        });
      }

      const collage = await sharp({
        create: {
          width,
          height,
          channels: 4,
          background
        }
      })
      .composite(composite)
      .jpeg({ quality: 85 })
      .toBuffer();

      return collage;
    } catch (error) {
      console.error('Collage creation error:', error);
      throw new Error(`Failed to create collage: ${error.message}`);
    }
  }
}

module.exports = new ImageProcessingService(); 