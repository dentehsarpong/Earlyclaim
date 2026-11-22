const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'earlyclaim_products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

/**
 * Upload a single base64 image string to Cloudinary
 */
const uploadBase64 = async (base64String) => {
  try {
    const result = await cloudinary.uploader.upload(base64String, {
      folder: 'earlyclaim_banners',
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary base64 upload error:', error);
    throw error;
  }
};

/**
 * Delete an image from Cloudinary using its URL
 */
const deleteImage = async (imageUrl) => {
  try {
    if (!imageUrl || !imageUrl.includes('cloudinary')) return;

    // Extract public_id from URL
    // e.g. https://res.cloudinary.com/cloud_name/image/upload/v12345/folder/public_id.jpg
    const parts = imageUrl.split('/');
    const lastPart = parts[parts.length - 1];
    const folderPart = parts[parts.length - 2];
    const publicId = `${folderPart}/${lastPart.split('.')[0]}`;

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

module.exports = {
  cloudinary,
  upload,
  uploadBase64,
  deleteImage
};
