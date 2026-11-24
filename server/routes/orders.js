const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { optionalToken, authenticateToken } = require('../middleware/auth');
const { notifyAdminNewOrder } = require('../utils/notification');

// Shipping method rates (public endpoint for checkout)
router.get('/shipping-rates', (req, res) => {
  try {
    const data = db.read();
    res.json({ success: true, rates: data.shippingRates || {} });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch rates' });
  }
});

// Create pre-order (supports both guests and logged-in users)
router.post('/checkout', optionalToken, async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      depositType,
      paymentMethod,
      notes,
      shippingMethod, // 'air' | 'sea'
      manualTransactionId
    } = req.body;

    // Server-side validation
    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }
    if (!customerName || !customerName.trim()) {
      return res.status(400).json({ success: false, message: 'Customer name is required' });
    }
    if (!customerPhone || !customerPhone.trim()) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    if (!shippingAddress || !shippingAddress.street) {
      return res.status(400).json({ success: false, message: 'Delivery address is required' });
    }

    const data = db.read();
    const rates = data.shippingRates || {};

    const unavailableItem = items.find(item => {
      const product = data.products.find(p => p.id === item.productId);
      if (!product) return false;
      if (product.stock !== null && product.stock !== undefined && Number(product.stock) <= 0) return true;
      if (!Array.isArray(product.unavailableVariants)) return false;
      const key = JSON.stringify([
        String(item.size || 'Standard').trim().toLowerCase(),
        String(item.color || 'Default').trim().toLowerCase()
      ]);
      return product.unavailableVariants.includes(key);
    });
    if (unavailableItem) {
      return res.status(409).json({
        success: false,
        message: `Sorry, ${unavailableItem.name || 'this product'} is unavailable in the selected size and color. Please choose another option.`
      });
    }

    // Server-side price calculation — never trust client totals
    let totalGHS = 0;
    let totalUSD = 0;
    const resolvedItems = items.map(item => {
      const product = data.products.find(p => p.id === item.productId);
      const priceGHS = product ? product.priceGHS : (item.priceGHS || 0);
      const priceUSD = product ? product.priceUSD : (item.priceUSD || 0);
      const qty = Math.max(1, Math.floor(item.quantity || 1));
      totalGHS += priceGHS * qty;
      totalUSD += priceUSD * qty;
      return {
        productId: item.productId,
        name: item.name || product?.name || 'Item',
        image: item.image || product?.images?.[0] || '',
        size: item.size || 'Standard',
        color: item.color || 'Default',
        priceGHS,
        priceUSD,
        quantity: qty
      };
    });

    // Shipping cost calculation
    const method = shippingMethod === 'sea' ? 'sea' : 'air';
    const rateConfig = rates[method] || {};
    const shippingCostGHS = rateConfig.minimumGHS || 0; // base minimum; full weight calc needs weight data

    let depositMultiplier = 1;
    if (depositType === 'deposit_50') depositMultiplier = 0.50;
    else if (depositType === 'deposit_70') depositMultiplier = 0.70;

    const amountDueGHS = Math.round((totalGHS + shippingCostGHS) * depositMultiplier);
    const remainingBalanceGHS = (totalGHS + shippingCostGHS) - amountDueGHS;

    const orderNumber = 'EC-' + Math.floor(10000 + Math.random() * 90000);
    const transactionReference = 'PSTK_' + Math.random().toString(36).substring(2, 10).toUpperCase();

    const isManualPayment = paymentMethod === 'manual_momo' || paymentMethod === 'manual_bank';
    const paymentStatus = isManualPayment ? 'pending_confirmation' : 'paid';

    const shippingLabel = method === 'sea' ? 'Sea Freight (~6–8 weeks)' : 'Air Freight (~2–3 weeks)';
    const estimatedDelivery = method === 'sea' ? '6–8 weeks' : '2–3 weeks';

    const newOrder = {
      id: 'ord-' + uuidv4().slice(0, 8),
      orderNumber,
      userId: req.user ? req.user.id : null,
      customerName: customerName.trim(),
      customerEmail: customerEmail ? customerEmail.trim() : 'guest@earlyclaim.com',
      customerPhone: customerPhone.trim(),
      items: resolvedItems,
      totalGHS,
      totalUSD,
      shippingCostGHS,
      shippingMethod: method,
      shippingLabel,
      estimatedDelivery,
      depositType: depositType || 'full',
      amountDueGHS,
      depositPaidGHS: amountDueGHS,
      remainingBalanceGHS,
      paymentMethod,
      paymentStatus,
      transactionReference,
      status: 'Pre-ordered',
      adminViewed: false,
      adminNotes: '',
      notes: notes || '',
      timeline: [
        {
          title: 'Pre-ordered',
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          note: isManualPayment
            ? 'Order placed. Awaiting manual payment confirmation.'
            : `Pre-order confirmed. ${shippingLabel} selected.`,
          adminId: null,
          timestamp: new Date().toISOString()
        }
      ],
      shippingAddress: {
        fullName: shippingAddress.fullName || customerName,
        phone: shippingAddress.phone || customerPhone,
        region: shippingAddress.region || 'Greater Accra',
        city: shippingAddress.city || 'Accra',
        street: shippingAddress.street || '',
        gpsAddress: shippingAddress.gpsAddress || ''
      },
      createdAt: new Date().toISOString()
    };

    // Handle manual payment details
    if (isManualPayment && manualTransactionId) {
      newOrder.manualPaymentDetails = {
        transactionId: manualTransactionId,
        senderPhone: customerPhone,
        senderName: customerName,
        submittedAt: new Date().toISOString()
      };
    }

    data.orders.unshift(newOrder);
    db.write(data);

    // Notify admin of new order (async, don't block response)
    notifyAdminNewOrder(newOrder).catch(err => console.error('Admin notify error:', err));

    res.status(201).json({
      success: true,
      order: newOrder,
      message: 'Pre-order created successfully!',
      paystackSimulation: {
        reference: transactionReference,
        amount: amountDueGHS,
        currency: 'GHS',
        accessCode: 'sim_' + uuidv4().slice(0, 10)
      }
    });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
});

// Track order
router.get('/track/:query', (req, res) => {
  try {
    const cleanQuery = req.params.query.trim().toUpperCase();
    const data = db.read();

    const order = data.orders.find(o =>
      o.orderNumber.toUpperCase() === cleanQuery ||
      o.id.toUpperCase() === cleanQuery ||
      (o.transactionReference && o.transactionReference.toUpperCase() === cleanQuery)
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `No pre-order found matching "${req.params.query}". Please check your order code (e.g. EC-94821).`
      });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Tracking lookup failed' });
  }
});

// Get user orders
router.get('/my-orders', authenticateToken, (req, res) => {
  try {
    const data = db.read();
    const userOrders = data.orders.filter(o =>
      o.userId === req.user.id ||
      (req.user.email && o.customerEmail.toLowerCase() === req.user.email.toLowerCase())
    );
    res.json({ success: true, orders: userOrders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve orders' });
  }
});

// Submit manual MoMo / Bank payment proof
router.post('/submit-manual-proof', (req, res) => {
  try {
    const { orderNumber, transactionId, senderPhone, senderName } = req.body;
    if (!orderNumber || !transactionId) {
      return res.status(400).json({ success: false, message: 'Order number and transaction ID are required' });
    }

    const data = db.read();
    const orderIndex = data.orders.findIndex(o => o.orderNumber.toUpperCase() === orderNumber.trim().toUpperCase());
    if (orderIndex === -1) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = data.orders[orderIndex];
    order.manualPaymentDetails = {
      transactionId,
      senderPhone: senderPhone || order.customerPhone,
      senderName: senderName || order.customerName,
      submittedAt: new Date().toISOString()
    };
    order.paymentStatus = 'pending_confirmation';
    order.timeline.push({
      title: 'Manual Proof Submitted',
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      note: `MoMo / Bank Transaction ID submitted: ${transactionId}. Staff will verify shortly.`,
      adminId: null,
      timestamp: new Date().toISOString()
    });

    db.write(data);

    res.json({
      success: true,
      message: 'Payment verification details received. Our staff will verify within 15–30 minutes.',
      order
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to submit proof' });
  }
});

module.exports = router;
