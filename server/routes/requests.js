const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { optionalToken, authenticateToken } = require('../middleware/auth');

// Submit "Paste & Buy" Shopping Agent Request
// User pastes an external product link (Taobao, Weidian, Zara, Nike, Amazon, StockX, etc.)
router.post('/', optionalToken, (req, res) => {
  try {
    const {
      url,
      productName,
      category,
      size,
      color,
      targetPriceUSD,
      notes,
      customerName,
      customerPhone,
      customerEmail
    } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, message: 'Product URL is required' });
    }

    const data = db.read();
    const requestNumber = 'PB-' + Math.floor(10000 + Math.random() * 90000);

    // Auto calculate initial cost estimate
    const estPriceUSD = targetPriceUSD ? parseFloat(targetPriceUSD) : 120;
    const rate = data.currencyRate?.USD_TO_GHS || 15.50;
    const estPriceGHS = Math.round(estPriceUSD * rate);
    const estDepositGHS = Math.round(estPriceGHS * 0.50);

    const newRequest = {
      id: 'req-' + uuidv4().slice(0, 8),
      requestNumber,
      userId: req.user ? req.user.id : null,
      customerName: customerName || (req.user ? req.user.name : 'Valued Customer'),
      customerEmail: customerEmail || (req.user ? req.user.email : 'customer@earlyclaim.com'),
      customerPhone: customerPhone || (req.user ? req.user.phone : '0530279271'),
      url: url.trim(),
      productName: productName || 'Custom Shopping Agent Request',
      category: category || 'Designer Brands',
      size: size || 'Standard',
      color: color || 'As Shown in Link',
      targetPriceUSD: estPriceUSD,
      quotedPriceGHS: estPriceGHS,
      quotedPriceUSD: estPriceUSD,
      depositRequiredGHS: estDepositGHS,
      status: 'Pending Review', // Pending Review -> Quoted -> Approved -> Paid
      notes: notes || '',
      createdAt: new Date().toISOString()
    };

    data.customRequests.unshift(newRequest);
    db.write(data);

    res.status(201).json({
      success: true,
      request: newRequest,
      message: 'Custom pre-order request submitted! Our procurement agent is inspecting the link and preparing your quote.'
    });
  } catch (err) {
    console.error('Paste & Buy error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit request' });
  }
});

// Get user's Paste & Buy requests
router.get('/my-requests', authenticateToken, (req, res) => {
  try {
    const data = db.read();
    const list = data.customRequests.filter(r => r.userId === req.user.id || (req.user.email && r.customerEmail.toLowerCase() === req.user.email.toLowerCase()));
    res.json({ success: true, requests: list });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve requests' });
  }
});

module.exports = router;
