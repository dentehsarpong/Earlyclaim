/**
 * Central notification service.
 * All order status changes and new-order admin alerts go through here.
 *
 * Usage:
 *   const { notifyOrderStatusChange, notifyAdminNewOrder } = require('./notification');
 *   const { error } = await notifyOrderStatusChange(order, 'Shipped', { adminId, note, db: data });
 */

const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { sendEmail, sendSms } = require('./email');

// Forward-only status sequence
const STATUS_ORDER = ['Pre-ordered', 'Purchased', 'Shipped', 'In Transit', 'Arrived', 'Delivered'];

/**
 * Returns the buyer-facing message for a status change.
 * Message adapts to shippingMethod ('air' | 'sea').
 */
function statusMessage(status, order) {
  const isAir = !order.shippingMethod || order.shippingMethod === 'air';
  const transport = isAir ? 'flight' : 'vessel';

  switch (status) {
    case 'Purchased':
      return 'Your items have been purchased and inspected by our agent.';
    case 'Shipped':
      return isAir
        ? 'Your order has been packed and booked for air shipment.'
        : 'Your order has been packed and booked on a shipping vessel.';
    case 'In Transit':
      return isAir
        ? 'Your shipment is on its way to Ghana by air cargo.'
        : 'Your shipment is on its way to Ghana by sea freight.';
    case 'Arrived':
      return `Your ${transport} shipment has arrived and cleared customs in Accra.`;
    case 'Delivered':
      return 'Doorstep dispatch complete. Thank you for ordering with EarlyClaim.';
    default:
      return `Your order status has been updated to: ${status}.`;
  }
}

/**
 * Build the HTML body for buyer status-change emails.
 */
function buildBuyerEmailHtml(order, status, message) {
  const trackUrl = `${process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173'}/tracking?query=${order.orderNumber}`;
  const itemRows = (order.items || [])
    .map(it => `<tr>
      <td style="padding:6px 0;border-bottom:1px solid #f0f0f0">${it.name}</td>
      <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;text-align:right">${it.size} · Qty ${it.quantity}</td>
      <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;text-align:right">GH₵${(it.priceGHS * it.quantity).toLocaleString()}</td>
    </tr>`).join('');

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#fafafa;font-family:sans-serif">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;margin:40px auto;background:#fff;border:1px solid #e5e5e5;border-radius:12px;overflow:hidden">
      <tr><td style="background:#000;padding:24px 32px">
        <span style="color:#fff;font-size:20px;font-weight:900;letter-spacing:-0.5px">EARLY<span style="color:#a1a1aa;font-weight:300">CLAIM</span></span>
      </td></tr>
      <tr><td style="padding:32px">
        <p style="margin:0 0 8px;font-size:12px;color:#71717a;text-transform:uppercase;letter-spacing:0.08em">Order ${order.orderNumber}</p>
        <h1 style="margin:0 0 20px;font-size:22px;font-weight:900;color:#000">${status}</h1>
        <p style="color:#3f3f46;font-size:14px;line-height:1.6">Hi ${order.customerName || 'Customer'},</p>
        <p style="color:#3f3f46;font-size:14px;line-height:1.6">${message}</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;font-size:13px;color:#3f3f46">
          ${itemRows}
        </table>
        <p style="margin:0 0 4px;font-size:12px;color:#71717a">Total Order Value</p>
        <p style="margin:0 0 20px;font-size:18px;font-weight:900;color:#000">GH₵${(order.totalGHS || 0).toLocaleString()}</p>
        <a href="${trackUrl}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;border-radius:9999px;font-size:12px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:0.08em">Track Your Order</a>
      </td></tr>
      <tr><td style="padding:16px 32px;background:#fafafa;border-top:1px solid #e5e5e5">
        <p style="margin:0;font-size:11px;color:#a1a1aa">© 2026 TECH ON DEMAND · EarlyClaim · <a href="https://wa.me/233530279271" style="color:#a1a1aa">WhatsApp Support</a></p>
      </td></tr>
    </table>
  </body></html>`;
}

/**
 * Build the HTML body for admin new-order alert emails.
 */
function buildAdminOrderEmailHtml(order) {
  const adminUrl = `${process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173'}/admin`;
  const shippingLabel = order.shippingMethod === 'sea' ? 'Sea Freight (~6–8 weeks)' : 'Air Freight (~2–3 weeks)';
  const itemRows = (order.items || [])
    .map(it => `<tr>
      <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:13px">${it.name}</td>
      <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:13px">${it.size} · ${it.color}</td>
      <td style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:13px;text-align:right">GH₵${(it.priceGHS * it.quantity).toLocaleString()}</td>
    </tr>`).join('');

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#fafafa;font-family:sans-serif">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;margin:40px auto;background:#fff;border:1px solid #e5e5e5;border-radius:12px;overflow:hidden">
      <tr><td style="background:#000;padding:24px 32px">
        <span style="color:#fff;font-size:20px;font-weight:900">EARLYCLAIM</span>
        <span style="color:#a1a1aa;font-size:12px;margin-left:12px">New Order Alert</span>
      </td></tr>
      <tr><td style="padding:32px">
        <h1 style="margin:0 0 4px;font-size:22px;font-weight:900;color:#000">New Pre-Order: ${order.orderNumber}</h1>
        <p style="margin:0 0 20px;font-size:13px;color:#71717a">Placed ${new Date(order.createdAt).toLocaleString('en-GB')}</p>
        <table width="100%" style="font-size:13px;color:#3f3f46;margin-bottom:20px" cellpadding="4">
          <tr><td style="color:#71717a;width:140px">Customer</td><td><strong>${order.customerName}</strong></td></tr>
          <tr><td style="color:#71717a">Email</td><td>${order.customerEmail}</td></tr>
          <tr><td style="color:#71717a">Phone</td><td>${order.customerPhone}</td></tr>
          <tr><td style="color:#71717a">Shipping</td><td>${shippingLabel}</td></tr>
          <tr><td style="color:#71717a">Payment</td><td>${order.paymentMethod} (${order.paymentStatus})</td></tr>
          <tr><td style="color:#71717a">Deposit Paid</td><td>GH₵${(order.depositPaidGHS || 0).toLocaleString()}</td></tr>
          <tr><td style="color:#71717a">Total Value</td><td><strong>GH₵${(order.totalGHS || 0).toLocaleString()}</strong></td></tr>
        </table>
        <h3 style="font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#71717a;margin:0 0 8px">Items Ordered</h3>
        <table width="100%" cellpadding="0" cellspacing="0">${itemRows}</table>
        <div style="margin-top:24px">
          <a href="${adminUrl}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;border-radius:9999px;font-size:12px;font-weight:700;text-decoration:none;text-transform:uppercase;letter-spacing:0.08em">View in Admin Dashboard</a>
        </div>
      </td></tr>
      <tr><td style="padding:16px 32px;background:#fafafa;border-top:1px solid #e5e5e5">
        <p style="margin:0;font-size:11px;color:#a1a1aa">© 2026 TECH ON DEMAND · EarlyClaim Admin System</p>
      </td></tr>
    </table>
  </body></html>`;
}

/**
 * Notify admin(s) when a new order is placed.
 * Creates an adminNotification and sends an email.
 * @param {object} order - newly created order
 */
async function notifyAdminNewOrder(order) {
  const data = db.read();

  const notif = {
    id: uuidv4(),
    type: 'new_order',
    orderId: order.id,
    orderNumber: order.orderNumber,
    title: `New Pre-Order: ${order.orderNumber}`,
    message: `${order.customerName} placed a new order for ${(order.items || []).length} item(s). Total: GH₵${(order.totalGHS || 0).toLocaleString()}.`,
    read: false,
    createdAt: new Date().toISOString()
  };

  if (!data.adminNotifications) data.adminNotifications = [];
  data.adminNotifications.unshift(notif);
  db.write(data);

  // Email to configured admin
  const adminEmail = process.env.ADMIN_ALERT_EMAIL || process.env.SUPPORT_EMAIL || 'dentehsarpong87@gmail.com';
  const shippingLabel = order.shippingMethod === 'sea' ? 'Sea Freight' : 'Air Freight';

  const sent = await sendEmail({
    to: adminEmail,
    subject: `[EarlyClaim] New Pre-Order ${order.orderNumber} — ${order.customerName}`,
    html: buildAdminOrderEmailHtml(order)
  });

  // Log
  const logData = db.read();
  if (!logData.notificationLogs) logData.notificationLogs = [];
  logData.notificationLogs.push({
    id: uuidv4(),
    type: 'admin_new_order',
    orderId: order.id,
    sentAt: new Date().toISOString(),
    success: sent,
    via: sent ? ['email'] : [],
    error: sent ? null : 'Email not configured or failed'
  });
  db.write(logData);

  if (process.env.ENABLE_SMS === 'true') {
    await sendSms(
      process.env.SUPPORT_PHONE || '0530279271',
      `EarlyClaim: New order ${order.orderNumber} from ${order.customerName}. GH₵${order.totalGHS}.`
    );
  }
}

/**
 * Update order status and send all notifications.
 * This is the single code path for every status transition.
 *
 * @param {object} order - mutable order object from DB
 * @param {string} newStatus - target status
 * @param {object} opts
 *   adminId       - ID of admin making the change
 *   adminOverride - bypass forward-only constraint
 *   note          - optional custom note for timeline
 *   paymentStatus - optional payment status update
 * @returns {Promise<{error?: string}>}
 */
async function notifyOrderStatusChange(order, newStatus, opts = {}) {
  const { adminId = null, adminOverride = false, note, paymentStatus } = opts;

  const currentIdx = STATUS_ORDER.indexOf(order.status);
  const newIdx = STATUS_ORDER.indexOf(newStatus);

  if (newIdx === -1) {
    return { error: `Invalid status: "${newStatus}"` };
  }

  if (!adminOverride && newIdx <= currentIdx) {
    return { error: 'Status must move forward unless adminOverride is set.' };
  }

  // Idempotency: skip if status hasn't changed and no override
  if (!adminOverride && order.status === newStatus) {
    return { error: 'Order is already at this status.' };
  }

  const message = statusMessage(newStatus, order);
  const now = new Date();
  const dateStr = now.toISOString().replace('T', ' ').slice(0, 16);

  // Update order
  order.status = newStatus;
  order.timeline = order.timeline || [];
  order.timeline.push({
    title: newStatus,
    date: dateStr,
    note: note || message,
    adminId,
    timestamp: now.toISOString()
  });

  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
  }

  // Persist the order mutation (caller is responsible for saving data to DB)

  // Create buyer in-app notification
  const data = db.read();
  if (!data.notifications) data.notifications = [];

  // Idempotency: check for existing unread notification with same order+status
  const alreadyNotified = data.notifications.some(
    n => n.orderId === order.id && n.status === newStatus
  );

  const notif = {
    id: uuidv4(),
    userId: order.userId,
    orderId: order.id,
    orderNumber: order.orderNumber,
    status: newStatus,
    title: `Order ${order.orderNumber} — ${newStatus}`,
    message,
    read: false,
    createdAt: now.toISOString()
  };

  if (!alreadyNotified) {
    data.notifications.unshift(notif);
  }

  // Admin notification about the status change (for SSE feed)
  if (!data.adminNotifications) data.adminNotifications = [];
  data.adminNotifications.unshift({
    id: uuidv4(),
    type: 'status_change',
    orderId: order.id,
    orderNumber: order.orderNumber,
    title: `Order ${order.orderNumber} updated to ${newStatus}`,
    message: `Status changed by admin for ${order.customerName}.`,
    read: false,
    createdAt: now.toISOString()
  });

  if (!data.notificationLogs) data.notificationLogs = [];

  db.write(data);

  // Send buyer email
  let emailSent = false;
  if (order.customerEmail && order.customerEmail !== 'guest@earlyclaim.com') {
    emailSent = await sendEmail({
      to: order.customerEmail,
      subject: `EarlyClaim — Order ${order.orderNumber}: ${newStatus}`,
      html: buildBuyerEmailHtml(order, newStatus, message)
    });
  }

  // Log
  const logData = db.read();
  if (!logData.notificationLogs) logData.notificationLogs = [];
  logData.notificationLogs.push({
    id: uuidv4(),
    type: 'buyer_status_change',
    orderId: order.id,
    status: newStatus,
    sentAt: now.toISOString(),
    success: emailSent,
    via: emailSent ? ['inApp', 'email'] : ['inApp'],
    error: emailSent ? null : 'Email not configured or failed'
  });
  db.write(logData);

  // Optional SMS/WhatsApp
  if (process.env.ENABLE_SMS === 'true' && order.customerPhone) {
    await sendSms(order.customerPhone, `EarlyClaim: ${order.orderNumber} — ${message}`);
  }

  return {};
}

module.exports = { notifyOrderStatusChange, notifyAdminNewOrder, STATUS_ORDER };
