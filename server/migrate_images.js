const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const BUCKET_NAME = 'product-images';

const UPLOADS_DIR = '../uploads';
const DB_FILE = './data/earlyclaim.json';

async function uploadToSupabase(fileBuffer, filename, mimetype) {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filename, fileBuffer, {
      contentType: mimetype,
      upsert: true
    });

  if (error) throw error;
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filename);

  return publicUrlData.publicUrl;
}

async function migrateImages() {
  const files = fs.readdirSync(UPLOADS_DIR);
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  const urlMap = {};

  console.log(`Found ${files.length} files to migrate...`);

  for (const file of files) {
    const filePath = path.join(UPLOADS_DIR, file);
    const stats = fs.statSync(filePath);

    if (stats.isFile()) {
      console.log(`Uploading ${file}...`);
      const buffer = fs.readFileSync(filePath);
      const mimetype = file.endsWith('.png') ? 'image/png' : 'image/jpeg';
      try {
        const publicUrl = await uploadToSupabase(buffer, file, mimetype);
        urlMap[`/uploads/${file}`] = publicUrl;
        console.log(`Uploaded to: ${publicUrl}`);
      } catch (err) {
        console.error(`Failed to upload ${file}:`, err);
      }
    }
  }

  // Update banners
  if (db.banners) {
    db.banners.forEach(b => {
      if (urlMap[b.image]) {
        b.image = urlMap[b.image];
      }
    });
  }

  // Update products
  if (db.products) {
    db.products.forEach(p => {
      if (p.images) {
        p.images = p.images.map(img => urlMap[img] || img);
      }
    });
  }

  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  console.log('Migration complete. DB updated.');
}

migrateImages().catch(console.error);
