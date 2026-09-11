const cloudinary = require('cloudinary').v2;

const getCloudinaryConfig = () => ({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dapjqwpwi',
  api_key: process.env.CLOUDINARY_API_KEY || '689541285961828',
  api_secret: process.env.CLOUDINARY_API_SECRET || '2dvuO0CFFLqcxMocrnlWAwOYxvQ',
});

const config = getCloudinaryConfig();
const isCloudinaryConfigured = Boolean(config.cloud_name && config.api_key && config.api_secret);

if (isCloudinaryConfigured) {
  cloudinary.config(config);
  console.log(`[Cloudinary] Initialized successfully for cloud: ${config.cloud_name}`);
} else {
  console.warn('[Cloudinary] Warning: Cloudinary credentials missing!');
}

/**
 * Generate responsive image format variants from a Cloudinary secure_url.
 * Variants:
 * - jpg_300: 300x300 fill thumbnail (product cards, grids)
 * - jpg_700: 700px width limit (modals, detail view)
 * - jpg_xl:  1200px width limit (zoom, banner)
 */
const generateImageVariants = (secureUrl) => {
  if (!secureUrl) return {};
  if (typeof secureUrl === 'string' && secureUrl.includes('cloudinary.com') && secureUrl.includes('/upload/')) {
    // Strip existing transformation segment if present
    const cleanUrl = secureUrl.replace(/\/upload\/(?:[a-z]_[^/]+\/)+/, '/upload/');
    return {
      url: cleanUrl,
      jpg_300: cleanUrl.replace('/upload/', '/upload/w_300,h_300,c_fill,q_auto,f_auto/'),
      jpg_700: cleanUrl.replace('/upload/', '/upload/w_700,c_limit,q_auto,f_auto/'),
      jpg_xl: cleanUrl.replace('/upload/', '/upload/w_1200,c_limit,q_auto,f_auto/'),
    };
  }
  return {
    url: secureUrl,
    jpg_300: secureUrl,
    jpg_700: secureUrl,
    jpg_xl: secureUrl,
  };
};

/**
 * Upload a Base64 data URI string directly to Cloudinary (no multer or file buffer needed).
 * @param {string} dataUri - Base64 image data URI (e.g. data:image/png;base64,...)
 * @param {string} folder - Target Cloudinary folder
 * @returns {Promise<{ secure_url: string, public_id: string }>}
 */
const uploadBase64ToCloudinary = (dataUri, folder = 'buykart_inventory') => {
  return new Promise((resolve, reject) => {
    cloudinary.config(getCloudinaryConfig());

    if (!dataUri) {
      return reject(new Error('No image data provided for Cloudinary upload.'));
    }

    console.log(`[Cloudinary] Starting Base64 upload to folder '${folder}' (payload size: ~${Math.round(dataUri.length / 1024)} KB)...`);

    cloudinary.uploader.upload(
      dataUri,
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          console.error('[Cloudinary Upload Error]:', error);
          return reject(error);
        }
        console.log(`[Cloudinary] Upload success! Public ID: ${result.public_id}, URL: ${result.secure_url}`);
        resolve(result);
      }
    );
  });
};

/**
 * Delete an asset from Cloudinary by public ID.
 * @param {string} publicId - Cloudinary asset public ID
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId || typeof publicId !== 'string' || !isCloudinaryConfigured) return;
  try {
    const res = await cloudinary.uploader.destroy(publicId);
    console.log(`[Cloudinary] Asset removed (${publicId}):`, res.result);
    return res;
  } catch (err) {
    console.warn(`[Cloudinary] Failed to remove asset (${publicId}):`, err.message);
  }
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  generateImageVariants,
  uploadBase64ToCloudinary,
  deleteFromCloudinary,
};
