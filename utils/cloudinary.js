const cloudinary = require('cloudinary').v2;
const { config } = require('../config/environment');

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
  secure: config.cloudinary.secure,
});

/**
 * Uploads a file to Cloudinary
 * @param {string|Buffer} file - File path or buffer to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result with URL
 */
const uploadToCloud = async (file, options = {}) => {
  try {
    if (!file) {
      throw new Error('File is required for upload');
    }

    const uploadOptions = {
      resource_type: 'auto',
      transformation: {
        fetch_format: 'auto',
        quality: 'auto',
        width: 1200,
        height: 1200,
        crop: 'fill',
      },
      ...options,
    };

    let result;

    if (Buffer.isBuffer(file)) {
      // Handle buffer upload
      result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file);
      });
    } else {
      // Handle file path upload
      result = await cloudinary.uploader.upload(file, uploadOptions);
    }

    if (!result || !result.secure_url) {
      throw new Error('Upload failed - no URL returned');
    }

    console.log('File uploaded successfully to Cloudinary:', {
      publicId: result.public_id,
      url: result.secure_url,
      size: result.bytes,
      format: result.format,
      timestamp: new Date().toISOString(),
    });

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload failed:', {
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Deletes a file from Cloudinary
 * @param {string} publicId - Public ID of the file to delete
 * @param {string} resourceType - Resource type (image, video, raw)
 * @returns {Promise<Object>} Deletion result
 */
const deleteFromCloud = async (publicId, resourceType = 'image') => {
  try {
    if (!publicId) {
      throw new Error('Public ID is required for deletion');
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (result.result === 'ok') {
      console.log('File deleted successfully from Cloudinary:', {
        publicId,
        resourceType,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        message: 'File deleted successfully',
        publicId,
      };
    } else {
      throw new Error(`Deletion failed: ${result.result}`);
    }
  } catch (error) {
    console.error('Cloudinary deletion failed:', {
      error: error.message,
      publicId,
      resourceType,
      timestamp: new Date().toISOString(),
    });

    throw new Error(`Cloudinary deletion failed: ${error.message}`);
  }
};

/**
 * Generates a Cloudinary URL with transformations
 * @param {string} publicId - Public ID of the file
 * @param {Object} options - Transformation options
 * @returns {string} Transformed URL
 */
const generateUrl = (publicId, options = {}) => {
  try {
    if (!publicId) {
      throw new Error('Public ID is required for URL generation');
    }

    const defaultOptions = {
      fetch_format: 'auto',
      quality: 'auto',
      width: 1200,
      height: 1200,
      crop: 'fill',
    };

    const transformationOptions = { ...defaultOptions, ...options };

    return cloudinary.url(publicId, {
      transformation: transformationOptions,
    });
  } catch (error) {
    console.error('URL generation failed:', {
      error: error.message,
      publicId,
      timestamp: new Date().toISOString(),
    });

    throw new Error(`URL generation failed: ${error.message}`);
  }
};

module.exports = {
  uploadToCloud,
  deleteFromCloud,
  generateUrl,
  cloudinary,
};
