const express = require('express');
const router = express.Router();
const db = require('../db');

// Get currency rates
router.get('/', (req, res) => {
  const data = db.read();
  const rate = data.currencyRate?.USD_TO_GHS || 15.50;
  res.json({
    success: true,
    base: 'GHS',
    rates: {
      GHS: 1.0,
      USD: 1 / rate
    },
    USD_TO_GHS: rate,
    lastUpdated: data.currencyRate?.lastUpdated || new Date().toISOString()
  });
});

module.exports = router;
