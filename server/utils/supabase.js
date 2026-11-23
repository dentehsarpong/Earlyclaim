const { createClient } = require('@supabase/supabase-js');

const BUCKET_NAME = 'product-images';
const getSupabase = () => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) {
    throw new Error('Image storage is not configured: set SUPABASE_URL and SUPABASE_KEY');
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

/**
 * Delete a file from Supabase Storage using its filename
 */
const deleteFromSupabase = async (filename) => {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filename]);

    if (error) throw error;
  } catch (error) {
    console.error('Supabase delete error:', error);
  }
};

module.exports = {
  uploadToSupabase,
  deleteFromSupabase
};
