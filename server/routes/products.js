const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

// Multer for local disk upload (fallback when no cloud storage configured)
let upload;
try {
  const multer = require('multer');
  const uploadsDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uuidv4()}${ext}`);
    }
  });

  upload = multer({
    storage,
    limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) cb(null, true);
      else cb(new Error('Only image files are allowed'), false);
    }
  });
} catch {
  // multer not installed — image upload endpoints will return a helpful error
  upload = null;
}

const router = express.Router();

function logProductChange(data, productId, adminId, action, changes) {
  if (!data.productAuditLog) data.productAuditLog = [];
  data.productAuditLog.push({
    id: uuidv4(),
    productId,
    adminId,
    action,
    changes,
    timestamp: new Date().toISOString()
  });
}

// Get all products with filters, search, sorting, and ship-from-country filter
router.get('/', (req, res) => {
  try {
    const {
      category, subCategory, brand, gender, tag, search,
      sort, minPrice, maxPrice, limit, page,
      shipFromCountry, visibility
    } = req.query;

    const data = db.read();
    let products = [...data.products];

    // Only show published products to non-admins
    const isAdmin = req.headers['x-admin'] === 'true'; // set by frontend for admin requests
    if (!isAdmin) {
      products = products.filter(p => !p.visibility || p.visibility === 'published');
    } else if (visibility && visibility !== 'all') {
      products = products.filter(p => p.visibility === visibility);
    }

    if (category && category !== 'All' && category !== 'All Categories') {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (subCategory) {
      products = products.filter(p => p.subCategory && p.subCategory.toLowerCase() === subCategory.toLowerCase());
    }
    if (gender) {
      products = products.filter(p => p.gender && p.gender.toLowerCase() === gender.toLowerCase());
    }
    if (brand) {
      products = products.filter(p => p.brand && p.brand.toLowerCase().includes(brand.toLowerCase()));
    }
    if (tag && tag !== 'Picks for You' && tag !== 'All') {
      products = products.filter(p => p.tag === tag || (tag === "Men's Zone" && p.gender === "Men's") || (tag === "Fashion Jewelry" && p.category === "Jewelry"));
    }
    if (shipFromCountry) {
      products = products.filter(p => p.shipFromCountry && p.shipFromCountry.toUpperCase() === shipFromCountry.toUpperCase());
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }
    if (minPrice) products = products.filter(p => p.priceGHS >= parseFloat(minPrice));
    if (maxPrice) products = products.filter(p => p.priceGHS <= parseFloat(maxPrice));

    if (sort === 'price_asc') products.sort((a, b) => a.priceGHS - b.priceGHS);
    else if (sort === 'price_desc') products.sort((a, b) => b.priceGHS - a.priceGHS);
    else if (sort === 'rating') products.sort((a, b) => b.rating - a.rating);
    else products.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

    const totalCount = products.length;
    const pageSize = limit ? parseInt(limit) : 50;
    const currentPage = page ? parseInt(page) : 1;
    const startIndex = (currentPage - 1) * pageSize;
    const paginated = products.slice(startIndex, startIndex + pageSize);

    // Category metadata
    const categoriesMap = {};
    data.products.forEach(p => {
      if (!categoriesMap[p.category]) categoriesMap[p.category] = { count: 0, subCategories: new Set(), brands: new Set() };
      categoriesMap[p.category].count++;
      if (p.subCategory) categoriesMap[p.category].subCategories.add(p.subCategory);
      if (p.brand) categoriesMap[p.category].brands.add(p.brand);
    });
    const categoryList = Object.keys(categoriesMap).map(cat => ({
      name: cat,
      count: categoriesMap[cat].count,
      subCategories: Array.from(categoriesMap[cat].subCategories),
      brands: Array.from(categoriesMap[cat].brands)
    }));

    res.json({
      success: true,
      total: totalCount,
      page: currentPage,
      limit: pageSize,
      products: paginated,
      categories: categoryList
    });
  } catch (err) {
    console.error('Products fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

// Get single product
router.get('/:idOrSlug', (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const data = db.read();
    const product = data.products.find(p => p.id === idOrSlug || p.slug === idOrSlug);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const related = data.products
      .filter(p => p.id !== product.id && p.category === product.category && p.visibility !== 'archived')
      .slice(0, 5);

    res.json({ success: true, product, related });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
});

// Admin: Upload image via base64 data URL
router.post('/upload-image', requireAdmin, (req, res) => {
  try {
    const { dataUrl, filename } = req.body;
    if (!dataUrl) {
      return res.status(400).json({ success: false, message: 'Image data URL is required' });
    }

    const fs = require('fs');
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    // Extract base64 and mime
    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ success: false, message: 'Invalid base64 image data URL' });
    }

    const ext = matches[1].replace('jpeg', 'jpg');
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Limit to 10MB
    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'File size exceeds 10MB limit' });
    }

    const uniqueName = `${uuidv4()}.${ext}`;
    const filePath = path.join(uploadsDir, uniqueName);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${uniqueName}`;
    res.json({
      success: true,
      url: publicUrl,
      message: 'Image uploaded successfully'
    });
  } catch (err) {
    console.error('Base64 upload error:', err);
    res.status(500).json({ success: false, message: 'Failed to save uploaded image' });
  }
});

// Admin: Upload product images
router.post('/:id/images', requireAdmin, (req, res) => {
  if (!upload) {
    return res.status(501).json({
      success: false,
      message: 'Image upload requires multer. Run: cd server && npm install multer'
    });
  }

  upload.array('images', 8)(req, res, err => {
    if (err) return res.status(400).json({ success: false, message: err.message });

    try {
      const { id } = req.params;
      const data = db.read();
      const prod = data.products.find(p => p.id === id);
      if (!prod) return res.status(404).json({ success: false, message: 'Product not found' });

      const urls = req.files.map(f => `/uploads/${path.basename(f.path)}`);
      prod.images = (prod.images || []).concat(urls);
      logProductChange(data, id, req.user.id, 'image_upload', { addedCount: urls.length });
      db.write(data);
      res.json({ success: true, images: prod.images, message: 'Images uploaded' });
    } catch (err2) {
      res.status(500).json({ success: false, message: 'Failed to upload images' });
    }
  });
});

// Admin: Reorder images
router.put('/:id/images/reorder', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { images } = req.body; // new ordered array of image URLs
    if (!Array.isArray(images)) return res.status(400).json({ success: false, message: 'images must be an array' });

    const data = db.read();
    const prod = data.products.find(p => p.id === id);
    if (!prod) return res.status(404).json({ success: false, message: 'Product not found' });

    prod.images = images;
    logProductChange(data, id, req.user.id, 'image_reorder', { count: images.length });
    db.write(data);
    res.json({ success: true, images: prod.images });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reorder images' });
  }
});

// Admin: Delete single image
router.delete('/:id/images/:imageIndex', requireAdmin, (req, res) => {
  try {
    const { id, imageIndex } = req.params;
    const idx = parseInt(imageIndex);
    const data = db.read();
    const prod = data.products.find(p => p.id === id);
    if (!prod) return res.status(404).json({ success: false, message: 'Product not found' });
    if (idx < 0 || idx >= (prod.images || []).length) {
      return res.status(400).json({ success: false, message: 'Invalid image index' });
    }

    prod.images.splice(idx, 1);
    logProductChange(data, id, req.user.id, 'image_delete', { index: idx });
    db.write(data);
    res.json({ success: true, images: prod.images });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete image' });
  }
});

// Admin: Create product
router.post('/', requireAdmin, (req, res) => {
  try {
    const {
      name, category, subCategory, brand, priceGHS, priceUSD,
      depositPercent, estimatedDays, description, images,
      sizes, colors, tag, gender, shipFromCountry, visibility,
      stock
    } = req.body;

    if (!name || !category || !priceGHS) {
      return res.status(400).json({ success: false, message: 'Name, category, and price in GHS are required' });
    }
    if (isNaN(Number(priceGHS)) || Number(priceGHS) <= 0) {
      return res.status(400).json({ success: false, message: 'Price must be a positive number' });
    }

    const data = db.read();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newProduct = {
      id: 'prod-' + uuidv4().slice(0, 8),
      name: name.trim(),
      slug,
      category,
      subCategory: subCategory || 'General',
      gender: gender || "Men's",
      brand: brand || 'Luxury Brand',
      priceGHS: Number(priceGHS),
      priceUSD: priceUSD ? Number(priceUSD) : Math.round(Number(priceGHS) / 15.5),
      depositPercent: depositPercent ? Number(depositPercent) : 50,
      estimatedDays: estimatedDays || '10–18 Days',
      tag: tag || 'New Arrivals',
      isFeatured: true,
      rating: 5.0,
      reviewsCount: 0,
      images: Array.isArray(images) && images.length > 0
        ? images
        : ["https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80"],
      sizes: Array.isArray(sizes) ? sizes : ["Standard One Size"],
      colors: Array.isArray(colors) ? colors : ["Black / White"],
      description: description || 'Authentic designer pre-order handled with EarlyClaim priority.',
      shipFromCountry: shipFromCountry || 'US',
      visibility: visibility || 'published',
      stock: stock !== undefined ? Number(stock) : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.products.unshift(newProduct);
    logProductChange(data, newProduct.id, req.user.id, 'create', { name: newProduct.name, priceGHS: newProduct.priceGHS });
    db.write(data);

    res.status(201).json({ success: true, product: newProduct, message: 'Product created' });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
});

// Admin: Update product
router.put('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const data = db.read();
    const index = data.products.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Product not found' });

    // Sanitize price fields to prevent NaN in DB
    const updates = { ...req.body };
    if (updates.priceGHS !== undefined) updates.priceGHS = Number(updates.priceGHS);
    if (updates.priceUSD !== undefined) updates.priceUSD = Number(updates.priceUSD);
    if (updates.depositPercent !== undefined) updates.depositPercent = Number(updates.depositPercent);
    updates.updatedAt = new Date().toISOString();

    const before = { ...data.products[index] };
    data.products[index] = { ...data.products[index], ...updates };

    // Determine what changed
    const changedFields = Object.keys(updates).filter(k => updates[k] !== before[k] && k !== 'updatedAt');
    logProductChange(data, id, req.user.id, 'update', { changedFields, before: Object.fromEntries(changedFields.map(k => [k, before[k]])), after: Object.fromEntries(changedFields.map(k => [k, updates[k]])) });

    db.write(data);
    res.json({ success: true, product: data.products[index], message: 'Product updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
});

// Admin: Archive product (soft delete — sets visibility to 'archived')
router.put('/:id/archive', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const data = db.read();
    const prod = data.products.find(p => p.id === id);
    if (!prod) return res.status(404).json({ success: false, message: 'Product not found' });
    prod.visibility = 'archived';
    prod.updatedAt = new Date().toISOString();
    logProductChange(data, id, req.user.id, 'archive', {});
    db.write(data);
    res.json({ success: true, message: 'Product archived' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to archive product' });
  }
});

// Admin: Delete product (hard delete)
router.delete('/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const data = db.read();
    const prod = data.products.find(p => p.id === id);
    if (!prod) return res.status(404).json({ success: false, message: 'Product not found' });

    logProductChange(data, id, req.user.id, 'delete', { name: prod.name });
    data.products = data.products.filter(p => p.id !== id);
    db.write(data);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
});

module.exports = router;
