const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { generateId, logRequest } = require('../utils/helpers');
const { verifyToken } = require('../utils/auth');

/**
 * Send a chat message
 * POST /chat/messages
 */
router.post('/messages', (req, res) => {
  logRequest(req);
  
  const { orderId, sender, content, senderType, metadata } = req.body;
  
  // Validate required fields
  if (!orderId || !content || !sender) {
    return res.status(400).json({
      status: 400,
      error: 'Missing required fields: orderId, sender, and content are required'
    });
  }
  
  // Validate that the order exists
  const order = db.get('shiprocketOrders')
    .find({ order_id: orderId })
    .value();
  
  if (!order) {
    return res.status(404).json({
      status: 404,
      error: `Order with ID ${orderId} not found`
    });
  }
  
  // Create message object
  const messageTime = new Date().toISOString();
  const message = {
    id: generateId('msg_'),
    orderId,
    sender,
    senderType: senderType || (sender === 'system' ? 'system' : 'user'),
    content,
    timestamp: messageTime,
    metadata: metadata || {},
    read: false
  };
  
  // Save to database
  db.get('chatMessages')
    .push(message)
    .write();
  
  // Add notification for any non-system message
  if (sender !== 'system') {
    db.get('chatNotifications')
      .push({
        id: generateId('notif_'),
        type: 'NEW_MESSAGE',
        orderId,
        sender,
        message: `New message from ${sender} for order #${orderId}`,
        timestamp: messageTime
      })
      .write();
  }
  
  // Return response
  return res.status(201).json({
    status: 'SUCCESS',
    data: message
  });
});

/**
 * Get chat messages for an order
 * GET /chat/messages/:orderId
 */
router.get('/messages/:orderId', (req, res) => {
  logRequest(req);
  
  const { orderId } = req.params;
  
  // Validate that the order exists
  const order = db.get('shiprocketOrders')
    .find({ order_id: orderId })
    .value();
  
  if (!order) {
    return res.status(404).json({
      status: 404,
      error: `Order with ID ${orderId} not found`
    });
  }
  
  // Get messages for the order, sorted by timestamp
  const messages = db.get('chatMessages')
    .filter({ orderId })
    .value()
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  // Return response
  return res.json({
    status: 'SUCCESS',
    data: messages
  });
});

/**
 * Get all notifications (optionally filtered by orderId or type)
 * GET /chat/notifications
 */
router.get('/notifications', (req, res) => {
  logRequest(req);
  
  const { orderId, type, limit = 50 } = req.query;
  
  // Filter notifications
  let notifications = db.get('chatNotifications');
  
  if (orderId) {
    notifications = notifications.filter({ orderId });
  }
  
  if (type) {
    notifications = notifications.filter({ type });
  }
  
  // Get limit and sort by timestamp (newest first)
  notifications = notifications.value()
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, parseInt(limit));
  
  // Return response
  return res.json({
    status: 'SUCCESS',
    data: notifications
  });
});

/**
 * Mark messages as read
 * POST /chat/mark-read
 */
router.post('/mark-read', (req, res) => {
  logRequest(req);
  
  const { messageIds, orderId } = req.body;
  
  // Validate required fields
  if ((!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) && !orderId) {
    return res.status(400).json({
      status: 400,
      error: 'Please provide either messageIds array or orderId to mark messages as read'
    });
  }
  
  // Mark specific messages as read
  if (messageIds && messageIds.length > 0) {
    messageIds.forEach(id => {
      db.get('chatMessages')
        .find({ id })
        .assign({ read: true })
        .write();
    });
  }
  
  // Mark all messages for an order as read
  if (orderId) {
    db.get('chatMessages')
      .filter({ orderId })
      .forEach(message => {
        message.read = true;
      })
      .write();
  }
  
  // Return response
  return res.json({
    status: 'SUCCESS',
    message: 'Messages marked as read successfully'
  });
});

/**
 * Get unread message count (optionally filtered by orderId)
 * GET /chat/unread-count
 */
router.get('/unread-count', (req, res) => {
  logRequest(req);
  
  const { orderId } = req.query;
  
  // Filter messages
  let messages = db.get('chatMessages').filter({ read: false });
  
  if (orderId) {
    messages = messages.filter({ orderId });
  }
  
  // Count unread messages
  const unreadCount = messages.size().value();
  
  // Return response
  return res.json({
    status: 'SUCCESS',
    data: {
      unreadCount
    }
  });
});

/**
 * Send automatic order status notifications
 * POST /chat/order-status-notification
 */
router.post('/order-status-notification', verifyToken, (req, res) => {
  logRequest(req);
  
  const { orderId, status, additionalMessage } = req.body;
  
  // Validate required fields
  if (!orderId || !status) {
    return res.status(400).json({
      status: 400,
      error: 'Missing required fields: orderId and status are required'
    });
  }
  
  // Validate that the order exists
  const order = db.get('shiprocketOrders')
    .find({ order_id: orderId })
    .value();
  
  if (!order) {
    return res.status(404).json({
      status: 404,
      error: `Order with ID ${orderId} not found`
    });
  }
  
  // Generate status message
  let statusMessage = '';
  switch (status) {
    case 'Order Created':
      statusMessage = `Your order #${orderId} has been created! We'll process it shortly.`;
      break;
    case 'Order Confirmed':
      statusMessage = `Your order #${orderId} has been confirmed! We'll notify you when it ships.`;
      break;
    case 'Order Processing':
      statusMessage = `Your order #${orderId} is now being processed.`;
      break;
    case 'Pickup Scheduled':
      statusMessage = `Pickup for your order #${orderId} has been scheduled.`;
      break;
    case 'Picked Up':
      statusMessage = `Your order #${orderId} has been picked up and is on its way!`;
      break;
    case 'In Transit':
      statusMessage = `Your order #${orderId} is in transit. You can track it using your tracking number.`;
      break;
    case 'Out for Delivery':
      statusMessage = `Your order #${orderId} is out for delivery and should arrive today!`;
      break;
    case 'Delivered':
      statusMessage = `Your order #${orderId} has been delivered. Thank you for shopping with us!`;
      break;
    case 'Cancelled':
      statusMessage = `Your order #${orderId} has been cancelled.`;
      break;
    default:
      statusMessage = `Your order #${orderId} status has been updated to: ${status}`;
  }
  
  // Add additional message if provided
  if (additionalMessage) {
    statusMessage += ` ${additionalMessage}`;
  }
  
  const messageTime = new Date().toISOString();
  
  // Create system message
  const message = {
    id: generateId('msg_'),
    orderId,
    sender: 'system',
    senderType: 'system',
    content: statusMessage,
    timestamp: messageTime,
    metadata: { orderStatus: status },
    read: false
  };
  
  // Save to database
  db.get('chatMessages')
    .push(message)
    .write();
  
  // Create notification
  db.get('chatNotifications')
    .push({
      id: generateId('notif_'),
      type: 'STATUS_UPDATE',
      orderId,
      status,
      message: `Order #${orderId} status updated to: ${status}`,
      timestamp: messageTime
    })
    .write();
  
  // Return response
  return res.status(201).json({
    status: 'SUCCESS',
    data: message
  });
});

/**
 * Send automatic payment notification
 * POST /chat/payment-notification
 */
router.post('/payment-notification', verifyToken, (req, res) => {
  logRequest(req);
  
  const { orderId, amount, transactionId } = req.body;
  
  // Validate required fields
  if (!orderId || !amount) {
    return res.status(400).json({
      status: 400,
      error: 'Missing required fields: orderId and amount are required'
    });
  }
  
  // Validate that the order exists
  const order = db.get('shiprocketOrders')
    .find({ order_id: orderId })
    .value();
  
  if (!order) {
    return res.status(404).json({
      status: 404,
      error: `Order with ID ${orderId} not found`
    });
  }
  
  const messageTime = new Date().toISOString();
  const paymentMessage = `Payment of ₹${amount} received for your order #${orderId}${transactionId ? '. Transaction ID: ' + transactionId : ''}. Thank you!`;
  
  // Create system message
  const message = {
    id: generateId('msg_'),
    orderId,
    sender: 'system',
    senderType: 'system',
    content: paymentMessage,
    timestamp: messageTime,
    metadata: { 
      paymentAmount: amount,
      transactionId: transactionId || null
    },
    read: false
  };
  
  // Save to database
  db.get('chatMessages')
    .push(message)
    .write();
  
  // Create notification
  db.get('chatNotifications')
    .push({
      id: generateId('notif_'),
      type: 'PAYMENT_VERIFIED',
      orderId,
      message: `Payment of ₹${amount} received for order #${orderId}`,
      transactionId: transactionId || null,
      timestamp: messageTime
    })
    .write();
  
  // Return response
  return res.status(201).json({
    status: 'SUCCESS',
    data: message
  });
});

module.exports = router;