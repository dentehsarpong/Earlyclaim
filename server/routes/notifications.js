const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { optionalToken, authenticateToken } = require('../middleware/auth');
const { notifyAdminNewOrder, notifyOrderStatusChange } = require('../utils/notification');

// Server-Sent Events clients registry
const sseClients = new Map(); // userId -> Set of res objects

/**
 * SSE endpoint — admin and buyers subscribe here for real-time push.
 * GET /api/notifications/stream
 */
router.get('/stream', authenticateToken, (req, res) => {
  const userId = req.user.id;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Keep-alive heartbeat every 25 s
  const heartbeat = setInterval(() => {
    res.write(':ping\n\n');
  }, 25000);

  if (!sseClients.has(userId)) sseClients.set(userId, new Set());
  sseClients.get(userId).add(res);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.get(userId)?.delete(res);
  });
});

/**
 * Push an SSE event to a specific user.
 * Called internally after DB writes.
 */
function pushToUser(userId, eventType, payload) {
  const clients = sseClients.get(userId);
  if (!clients || clients.size === 0) return;
  const data = JSON.stringify(payload);
  clients.forEach(res => {
    res.write(`event: ${eventType}\ndata: ${data}\n\n`);
  });
}

/**
 * Push to all admin users currently connected.
 */
function pushToAdmins(eventType, payload) {
  const data = db.read();
  const adminIds = (data.users || [])
    .filter(u => u.role === 'admin')
    .map(u => u.id);
  adminIds.forEach(id => pushToUser(id, eventType, payload));
}

// Export so other routes can call them
router.pushToUser = pushToUser;
router.pushToAdmins = pushToAdmins;

// --- REST endpoints ---

/**
 * GET /api/notifications/my  — buyer's own notifications
 */
router.get('/my', authenticateToken, (req, res) => {
  try {
    const data = db.read();
    const mine = (data.notifications || [])
      .filter(n => n.userId === req.user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const unread = mine.filter(n => !n.read).length;
    res.json({ success: true, notifications: mine, unread });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

/**
 * PUT /api/notifications/my/:id/read — mark one read
 */
router.put('/my/:id/read', authenticateToken, (req, res) => {
  try {
    const data = db.read();
    const notif = (data.notifications || []).find(n => n.id === req.params.id && n.userId === req.user.id);
    if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });
    notif.read = true;
    db.write(data);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to mark read' });
  }
});

/**
 * PUT /api/notifications/my/read-all — mark all buyer notifications read
 */
router.put('/my/read-all', authenticateToken, (req, res) => {
  try {
    const data = db.read();
    (data.notifications || [])
      .filter(n => n.userId === req.user.id)
      .forEach(n => { n.read = true; });
    db.write(data);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to mark all read' });
  }
});

/**
 * GET /api/notifications/admin — admin notifications
 */
router.get('/admin', (req, res) => {
  // Inline admin check (requireAdmin is in middleware, but we import it here for convenience)
  const { requireAdmin } = require('../middleware/auth');
  requireAdmin(req, res, () => {
    try {
      const data = db.read();
      const list = (data.adminNotifications || [])
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const unread = list.filter(n => !n.read).length;
      res.json({ success: true, notifications: list, unread });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to fetch admin notifications' });
    }
  });
});

/**
 * PUT /api/notifications/admin/:id/read
 */
router.put('/admin/:id/read', (req, res) => {
  const { requireAdmin } = require('../middleware/auth');
  requireAdmin(req, res, () => {
    try {
      const data = db.read();
      const notif = (data.adminNotifications || []).find(n => n.id === req.params.id);
      if (!notif) return res.status(404).json({ success: false, message: 'Notification not found' });
      notif.read = true;
      db.write(data);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to mark read' });
    }
  });
});

/**
 * PUT /api/notifications/admin/read-all
 */
router.put('/admin/read-all', (req, res) => {
  const { requireAdmin } = require('../middleware/auth');
  requireAdmin(req, res, () => {
    try {
      const data = db.read();
      (data.adminNotifications || []).forEach(n => { n.read = true; });
      db.write(data);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to mark all read' });
    }
  });
});

module.exports = router;
module.exports.pushToUser = pushToUser;
module.exports.pushToAdmins = pushToAdmins;
