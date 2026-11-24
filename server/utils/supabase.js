const { createClient } = require('@supabase/supabase-js');

const BUCKET_NAME = 'product-images';
const getSupabase = (requireServiceRole = false) => {
  const url = process.env.SUPABASE_URL;
  const key = requireServiceRole
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (!url || !key) {
    const message = requireServiceRole
      ? 'Image deletion requires SUPABASE_SERVICE_ROLE_KEY on the server'
      : 'Image storage is not configured: set SUPABASE_URL and SUPABASE_KEY';
    throw new Error(message);
  }
  return createClient(url, key);
};

/**
 * Upload a file buffer to Supabase Storage
 */
const uploadToSupabase = async (fileBuffer, filename, mimetype) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, fileBuffer, {
        contentType: mimetype,
        upsert: true
      });

    if (error) throw error;

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filename);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Supabase upload error:', error);
    throw error;
  }
};

const listStoredProductImages = async () => {
  const supabase = getSupabase();
  const bucket = supabase.storage.from(BUCKET_NAME);
  const images = [];
  const maxImages = 500;

  const visitFolder = async (folder = '', depth = 0) => {
    if (depth > 4 || images.length >= maxImages || folder === 'paste-buy') return;
    let offset = 0;

    while (images.length < maxImages) {
      const { data, error } = await bucket.list(folder, {
        limit: 100,
        offset,
        sortBy: { column: 'name', order: 'asc' }
      });
      if (error) throw error;

      for (const entry of data || []) {
        const path = folder ? `${folder}/${entry.name}` : entry.name;
        if (entry.id === null) {
          if (path !== 'paste-buy') await visitFolder(path, depth + 1);
          continue;
        }

        if (/\.(jpe?g|png|webp|gif|avif)$/i.test(entry.name) && !/storage-check/i.test(path)) {
          const { data: publicData } = bucket.getPublicUrl(path);
          images.push({ path, url: publicData.publicUrl, createdAt: entry.created_at || null });
          if (images.length >= maxImages) break;
        }
      }

      if (!data || data.length < 100) break;
      offset += data.length;
    }
  };

  await visitFolder();
  return images;
};

const getStoragePath = (imageUrl) => {
  if (!imageUrl || !process.env.SUPABASE_URL) return null;
  try {
    const parsed = new URL(imageUrl);
    const configured = new URL(process.env.SUPABASE_URL);
    if (parsed.origin !== configured.origin) return null;
    const match = parsed.pathname.match(/^\/storage\/v1\/object\/(?:public|sign|authenticated)\/product-images\/(.+)$/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
};

const deleteStoredImage = async (imageUrl) => {
  const deleted = await deleteStoredImages([imageUrl]);
  return deleted.length > 0;
};

const deleteStoredImages = async (imageUrls = []) => {
  const paths = [...new Set(imageUrls.map(getStoragePath).filter(Boolean))];
  if (!paths.length) return [];
  const supabase = getSupabase(true);
  const { data, error } = await supabase.storage.from(BUCKET_NAME).remove(paths);
  if (error) throw error;
  if (!Array.isArray(data) || data.length !== paths.length) {
    throw new Error('Supabase did not remove all requested images. Check SUPABASE_SERVICE_ROLE_KEY and product-images bucket permissions.');
  }
  return paths;
};

module.exports = {
  uploadToSupabase,
  listStoredProductImages,
  deleteStoredImage,
  deleteStoredImages,
  getStoragePath
};
