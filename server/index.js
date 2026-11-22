const fs = require('fs');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve uploaded images
const uploadsDir = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Ensure database is initialized
db.ensureDb();

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/rates', require('./routes/rates'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'EARLYCLAIM Pre-Order API',
    version: '2.0.0',
    features: ['notifications', 'shipping-method', 'product-management', 'admin-alerts'],
    timestamp: new Date().toISOString()
  });
});

// Serve frontend in production
// Adjust path to ensure it looks one level up from server, then into client/dist
const clientDist = path.join(__dirname, '..', 'client', 'dist');
console.log('Attempting to serve frontend from:', clientDist);

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // SPA Fallback
  app.get(/^(?!\/api|\/uploads).+$/, (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  console.error('Frontend build folder NOT FOUND at:', clientDist);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`EARLYCLAIM Backend running on http://0.0.0.0:${PORT}`);
  console.log(`Email notifications: ${process.env.EMAIL_HOST ? 'configured' : 'not configured (console only)'}`);
  console.log(`SMS/WhatsApp: ${process.env.ENABLE_SMS === 'true' ? 'enabled' : 'disabled'}`);
});
