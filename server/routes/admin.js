const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');
const { notifyOrderStatusChange } = require('../utils/notification');

// Dashboard Overview Analytics
router.get('/stats', requireAdmin, (req, res) => {
  try {
    const data = db.read();
    const orders = data.orders || [];
    const products = data.products || [];
    const requests = data.customRequests || [];
    const users = data.users || [];

    const totalRevenueGHS = orders.reduce((sum, o) => sum + (o.depositPaidGHS || 0), 0);
    const pendingOrdersCount = orders.filter(o => o.status !== 'Delivered').length;
    const pendingPaymentsCount = orders.filter(o => o.paymentStatus === 'pending_confirmation').length;
    const pendingRequestsCount = requests.filter(r => r.status === 'Pending Review').length;
    const newOrdersCount = orders.filter(o => !o.adminViewed).length;

    const categoryCounts = {};
    products.forEach(p => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });

    res.json({
      success: true,
      stats: {
        totalRevenueGHS,
        totalOrders: orders.length,
        pendingOrders: pendingOrdersCount,
        pendingPayments: pendingPaymentsCount,
        totalProducts: products.length,
        totalCustomers: users.length,
        pendingCustomRequests: pendingRequestsCount,
        newOrders: newOrdersCount,
        categoryCounts
      }
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ success: false, message: 'Failed to get admin stats' });
  }
});

// Get all orders for admin
router.get('/orders', requireAdmin, (req, res) => {
  try {
    const data = db.read();
    res.json({ success: true, orders: data.orders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

// Mark orders as viewed (clears "New" badge)
router.put('/orders/mark-viewed', requireAdmin, (req, res) => {
  try {
    const { orderIds } = req.body;
    const data = db.read();
    data.orders.forEach(o => {
      if (!orderIds || orderIds.includes(o.id)) {
        o.adminViewed = true;
      }
    });
    db.write(data);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to mark orders viewed' });
  }
});

// Update order status — goes through notifyOrderStatusChange for all notifications
router.put('/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, paymentStatus, adminOverride = false } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'status is required' });
    }

    const data = db.read();
    const orderIndex = data.orders.findIndex(o => o.id === id || o.orderNumber === id);
    if (orderIndex === -1) return res.status(404).json({ success: false, message: 'Order not found' });

    const order = data.orders[orderIndex];

    const result = await notifyOrderStatusChange(order, status, {
      adminId: req.user.id,
      adminOverride,
      note,
      paymentStatus
    });

    if (result.error) {
      return res.status(400).json({ success: false, message: result.error });
    }

    // notifyOrderStatusChange mutates `order` in-place and already writes notifications.
    // We still need to persist the order itself.
    const freshData = db.read();
    const freshIdx = freshData.orders.findIndex(o => o.id === id || o.orderNumber === id);
    if (freshIdx !== -1) {
      freshData.orders[freshIdx] = order;
    }
    db.write(freshData);

    // Push SSE to buyer
    try {
      const notifRoute = require('./notifications');
      if (order.userId) {
        notifRoute.pushToUser(order.userId, 'notification', {
          title: `Order ${order.orderNumber} — ${status}`,
          orderId: order.id
        });
      }
      notifRoute.pushToAdmins('admin_notification', { type: 'status_change', orderId: order.id });
    } catch {}

    res.json({ success: true, order, message: 'Order status updated' });
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});

// Update order details (admin notes, tracking number, shipping method)
router.put('/orders/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes, trackingNumber, shippingMethod } = req.body;

    const data = db.read();
    const orderIndex = data.orders.findIndex(o => o.id === id || o.orderNumber === id);
    if (orderIndex === -1) return res.status(404).json({ success: false, message: 'Order not found' });

    const order = data.orders[orderIndex];
    if (adminNotes !== undefined) order.adminNotes = adminNotes;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (shippingMethod !== undefined) order.shippingMethod = shippingMethod;

    db.write(data);
    res.json({ success: true, order, message: 'Order updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update order' });
  }
});

// Confirm manual MoMo/Bank payment
router.put('/orders/:id/confirm-payment', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const data = db.read();
    const orderIndex = data.orders.findIndex(o => o.id === id || o.orderNumber === id);
    if (orderIndex === -1) return res.status(404).json({ success: false, message: 'Order not found' });

    const order = data.orders[orderIndex];
    order.paymentStatus = 'paid';
    order.timeline.push({
      title: 'Payment Confirmed',
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      note: 'MoMo / Bank payment verified by EarlyClaim Accounts Department.',
      adminId: req.user.id,
      timestamp: new Date().toISOString()
    });

    db.write(data);
    res.json({ success: true, order, message: 'Payment confirmed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to confirm payment' });
  }
});

// Get all custom "Paste & Buy" requests
router.get('/requests', requireAdmin, (req, res) => {
  try {
    const data = db.read();
    res.json({ success: true, requests: data.customRequests || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch requests' });
  }
});

// Update custom request quote / status
router.put('/requests/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { quotedPriceGHS, quotedPriceUSD, depositRequiredGHS, status, adminNotes } = req.body;

    const data = db.read();
    const index = data.customRequests.findIndex(r => r.id === id || r.requestNumber === id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Request not found' });

    const reqItem = data.customRequests[index];
    if (quotedPriceGHS !== undefined) reqItem.quotedPriceGHS = Number(quotedPriceGHS);
    if (quotedPriceUSD !== undefined) reqItem.quotedPriceUSD = Number(quotedPriceUSD);
    if (depositRequiredGHS !== undefined) reqItem.depositRequiredGHS = Number(depositRequiredGHS);
    if (status) reqItem.status = status;
    if (adminNotes !== undefined) reqItem.adminNotes = adminNotes;

    db.write(data);
    res.json({ success: true, request: reqItem, message: 'Request updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update request' });
  }
});

// Get all customers
router.get('/customers', requireAdmin, (req, res) => {
  try {
    const data = db.read();
    const safeUsers = data.users.map(u => {
      const copy = { ...u };
      delete copy.password;
      return copy;
    });
    res.json({ success: true, customers: safeUsers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch customers' });
  }
});

// --- Categories ---
router.get('/categories', requireAdmin, (req, res) => {
  try {
    const data = db.read();
    res.json({ success: true, categories: data.categories || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

router.post('/categories', requireAdmin, (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    const data = db.read();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCat = { id: 'cat-' + uuidv4().slice(0, 6), name: name.trim(), slug, active: true };
    data.categories = data.categories || [];
    data.categories.push(newCat);
    db.write(data);
    res.status(201).json({ success: true, category: newCat });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
});

router.put('/categories/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name, active } = req.body;
    const data = db.read();
    const idx = (data.categories || []).findIndex(c => c.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Category not found' });
    if (name) data.categories[idx].name = name;
    if (active !== undefined) data.categories[idx].active = active;
    db.write(data);
    res.json({ success: true, category: data.categories[idx] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update category' });
  }
});

router.delete('/categories/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const data = db.read();
    data.categories = (data.categories || []).filter(c => c.id !== id);
    db.write(data);
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
});

// --- Banners ---
router.get('/banners', (req, res) => {
  try {
    const data = db.read();
    res.json({ success: true, banners: (data.banners || []).filter(b => b.active) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch banners' });
  }
});

router.get('/banners/all', requireAdmin, (req, res) => {
  try {
    const data = db.read();
    res.json({ success: true, banners: data.banners || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch banners' });
  }
});

router.post('/banners', requireAdmin, (req, res) => {
  try {
    const { title, subtitle, ctaText, ctaUrl, image } = req.body;
    if (!title || !image) return res.status(400).json({ success: false, message: 'Title and image are required' });

    const data = db.read();
    const banner = {
      id: 'banner-' + uuidv4().slice(0, 6),
      title: title.trim(),
      subtitle: subtitle || '',
      ctaText: ctaText || 'Shop Now',
      ctaUrl: ctaUrl || '/',
      image,
      active: true,
      order: (data.banners || []).length
    };
    data.banners = data.banners || [];
    data.banners.push(banner);
    db.write(data);
    res.status(201).json({ success: true, banner });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create banner' });
  }
});

router.put('/banners/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const data = db.read();
    const idx = (data.banners || []).findIndex(b => b.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Banner not found' });
    data.banners[idx] = { ...data.banners[idx], ...req.body };
    db.write(data);
    res.json({ success: true, banner: data.banners[idx] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update banner' });
  }
});

router.delete('/banners/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const data = db.read();
    data.banners = (data.banners || []).filter(b => b.id !== id);
    db.write(data);
    res.json({ success: true, message: 'Banner deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete banner' });
  }
});

// --- Shipping Rates ---
router.get('/shipping-rates', requireAdmin, (req, res) => {
  try {
    const data = db.read();
    res.json({ success: true, rates: data.shippingRates || {} });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch rates' });
  }
});

router.put('/shipping-rates', requireAdmin, (req, res) => {
  try {
    const { air, sea } = req.body;
    const data = db.read();
    if (!data.shippingRates) data.shippingRates = {};
    if (air) data.shippingRates.air = { ...data.shippingRates.air, ...air };
    if (sea) data.shippingRates.sea = { ...data.shippingRates.sea, ...sea };
    db.write(data);
    res.json({ success: true, rates: data.shippingRates });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update rates' });
  }
});

// --- Product Audit Log ---
router.get('/audit-log', requireAdmin, (req, res) => {
  try {
    const data = db.read();
    const logs = (data.productAuditLog || [])
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 200);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch audit log' });
  }
});

// --- Notification Logs ---
router.get('/notification-logs', requireAdmin, (req, res) => {
  try {
    const data = db.read();
    const logs = (data.notificationLogs || [])
      .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
      .slice(0, 200);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch notification logs' });
  }
});

module.exports = router;
