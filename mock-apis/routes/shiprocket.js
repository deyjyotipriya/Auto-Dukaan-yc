const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { generateId, generateTrackingStatus, logRequest } = require('../utils/helpers');
const { generateToken, verifyToken, findUserByCredentials } = require('../utils/auth');

/**
 * Authentication
 * POST /shiprocket/auth/login
 */
router.post('/auth/login', (req, res) => {
  logRequest(req);
  
  const { email, password } = req.body;
  
  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      status: 400,
      error: 'Missing required fields: email and password are required'
    });
  }
  
  // Find user by credentials
  const user = findUserByCredentials(email, password);
  
  if (!user) {
    return res.status(401).json({
      status: 401,
      error: 'Invalid credentials'
    });
  }
  
  // Generate token
  const token = generateToken(user);
  
  // Return response
  return res.json({
    token,
    user_id: 'mock_user_123',
    first_name: 'Demo',
    last_name: 'User',
    email: email,
    company_id: 'mock_company_456',
    created_at: new Date().toISOString(),
    status: 'SUCCESS'
  });
});

/**
 * Create Order
 * POST /shiprocket/orders/create/adhoc
 */
router.post('/orders/create/adhoc', verifyToken, (req, res) => {
  logRequest(req);
  
  const {
    order_id,
    order_date,
    pickup_location,
    billing_customer_name,
    billing_address,
    billing_city,
    billing_pincode,
    billing_state,
    billing_country,
    billing_email,
    billing_phone,
    shipping_is_billing,
    order_items
  } = req.body;
  
  // Validate required fields
  if (!order_id || !billing_customer_name || !billing_address || !billing_phone) {
    return res.status(400).json({
      status: 400,
      error: 'Missing required fields'
    });
  }
  
  // Generate shipment ID and AWB number
  const shipment_id = parseInt('99' + Math.floor(Math.random() * 1000000));
  const awb_code = '99' + Math.floor(Math.random() * 10000000000);
  
  // Create order object
  const orderData = {
    id: generateId('shiprocket_order_'),
    order_id: order_id || `MOCK-ORDER-${Date.now()}`,
    shipment_id,
    awb_code,
    order_date: order_date || new Date().toISOString(),
    pickup_location: pickup_location || 'Primary',
    channel_id: 'mock_channel_123',
    comment: 'Mock Order',
    billing_customer_name,
    billing_address,
    billing_city,
    billing_pincode,
    billing_state,
    billing_country,
    billing_email,
    billing_phone,
    shipping_is_billing: shipping_is_billing !== false, // Default to true
    shipping_customer_name: shipping_is_billing !== false ? billing_customer_name : (req.body.shipping_customer_name || ''),
    shipping_address: shipping_is_billing !== false ? billing_address : (req.body.shipping_address || ''),
    shipping_city: shipping_is_billing !== false ? billing_city : (req.body.shipping_city || ''),
    shipping_pincode: shipping_is_billing !== false ? billing_pincode : (req.body.shipping_pincode || ''),
    shipping_state: shipping_is_billing !== false ? billing_state : (req.body.shipping_state || ''),
    shipping_country: shipping_is_billing !== false ? billing_country : (req.body.shipping_country || ''),
    shipping_email: shipping_is_billing !== false ? billing_email : (req.body.shipping_email || ''),
    shipping_phone: shipping_is_billing !== false ? billing_phone : (req.body.shipping_phone || ''),
    order_items: order_items || [],
    payment_method: req.body.payment_method || 'prepaid',
    payment_status: 'PENDING',
    payment_verified: false,
    order_confirmed: false,
    status: 'Order Created',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Save to database
  db.get('shiprocketOrders')
    .push(orderData)
    .write();
  
  // Add a notification in the chat system
  db.get('chatNotifications')
    .push({
      id: generateId('notif_'),
      type: 'ORDER_CREATED',
      orderId: orderData.order_id,
      message: `New order #${orderData.order_id} created for ${billing_customer_name}`,
      timestamp: new Date().toISOString()
    })
    .write();
  
  // Return response
  return res.status(201).json({
    status: 200,
    order_id: orderData.order_id,
    shipment_id,
    awb_code,
    courier_company_id: 'mock_courier_123',
    courier_name: 'Mock Courier Express',
    status: 'Order Created',
    message: 'Order Created Successfully',
    status_code: 1
  });
});

/**
 * Confirm Order
 * POST /shiprocket/orders/confirm
 */
router.post('/orders/confirm', verifyToken, (req, res) => {
  logRequest(req);
  
  const { order_id } = req.body;
  
  // Validate required fields
  if (!order_id) {
    return res.status(400).json({
      status: 400,
      error: 'Missing required field: order_id'
    });
  }
  
  // Find order
  const order = db.get('shiprocketOrders')
    .find({ order_id })
    .value();
  
  if (!order) {
    return res.status(404).json({
      status: 404,
      error: `Order with ID ${order_id} not found`
    });
  }
  
  // Update order status
  db.get('shiprocketOrders')
    .find({ order_id })
    .assign({
      order_confirmed: true,
      status: 'Order Confirmed',
      updated_at: new Date().toISOString()
    })
    .write();
  
  // Add a notification in the chat system
  const confirmationTime = new Date().toISOString();
  db.get('chatNotifications')
    .push({
      id: generateId('notif_'),
      type: 'ORDER_CONFIRMED',
      orderId: order_id,
      message: `Order #${order_id} has been confirmed and is being processed`,
      timestamp: confirmationTime
    })
    .write();
  
  // Add a system message in the chat
  db.get('chatMessages')
    .push({
      id: generateId('msg_'),
      orderId: order_id,
      sender: 'system',
      content: `Your order #${order_id} has been confirmed! We'll notify you when it ships.`,
      timestamp: confirmationTime,
      read: false
    })
    .write();
  
  // Return response
  return res.json({
    status: 200,
    message: 'Order confirmed successfully',
    order_id,
    confirmed_at: confirmationTime
  });
});

/**
 * Update Order Status
 * POST /shiprocket/orders/update-status
 */
router.post('/orders/update-status', verifyToken, (req, res) => {
  logRequest(req);
  
  const { order_id, status, comment } = req.body;
  
  // Validate required fields
  if (!order_id || !status) {
    return res.status(400).json({
      status: 400,
      error: 'Missing required fields: order_id and status are required'
    });
  }
  
  // Validate status
  const validStatuses = [
    'Order Created',
    'Order Confirmed',
    'Order Processing',
    'Pickup Scheduled',
    'Picked Up',
    'In Transit',
    'Out for Delivery',
    'Delivered',
    'Cancelled'
  ];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      status: 400,
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
  }
  
  // Find order
  const order = db.get('shiprocketOrders')
    .find({ order_id })
    .value();
  
  if (!order) {
    return res.status(404).json({
      status: 404,
      error: `Order with ID ${order_id} not found`
    });
  }
  
  const statusUpdateTime = new Date().toISOString();
  
  // Update order status
  db.get('shiprocketOrders')
    .find({ order_id })
    .assign({
      status,
      comment: comment || order.comment,
      updated_at: statusUpdateTime
    })
    .write();
  
  // Add a notification in the chat system
  db.get('chatNotifications')
    .push({
      id: generateId('notif_'),
      type: 'STATUS_UPDATE',
      orderId: order_id,
      status,
      message: `Order #${order_id} status updated to: ${status}`,
      timestamp: statusUpdateTime
    })
    .write();
  
  // Add a system message in the chat for significant status changes
  if (['Picked Up', 'In Transit', 'Out for Delivery', 'Delivered'].includes(status)) {
    let messageContent = '';
    
    if (status === 'Picked Up') {
      messageContent = `Your order #${order_id} has been picked up and is on its way!`;
    } else if (status === 'In Transit') {
      messageContent = `Your order #${order_id} is in transit. You can track it using your tracking number.`;
    } else if (status === 'Out for Delivery') {
      messageContent = `Your order #${order_id} is out for delivery and should arrive today!`;
    } else if (status === 'Delivered') {
      messageContent = `Your order #${order_id} has been delivered. Thank you for shopping with us!`;
    }
    
    db.get('chatMessages')
      .push({
        id: generateId('msg_'),
        orderId: order_id,
        sender: 'system',
        content: messageContent,
        timestamp: statusUpdateTime,
        read: false
      })
      .write();
  }
  
  // Return response
  return res.json({
    status: 200,
    message: 'Order status updated successfully',
    order_id,
    status,
    updated_at: statusUpdateTime
  });
});

/**
 * Track Order
 * GET /shiprocket/orders/track/:shipment_id
 */
router.get('/orders/track/:shipment_id', (req, res) => {
  logRequest(req);
  
  const { shipment_id } = req.params;
  
  // Find order by shipment ID
  const order = db.get('shiprocketOrders')
    .find({ shipment_id: parseInt(shipment_id) })
    .value();
  
  if (!order) {
    return res.status(404).json({
      status: 404,
      error: `Order with shipment ID ${shipment_id} not found`
    });
  }
  
  // Generate tracking status
  const trackingInfo = generateTrackingStatus(shipment_id);
  
  // Return response
  return res.json({
    status: 200,
    tracking_data: {
      shipment_id: parseInt(shipment_id),
      awb_code: order.awb_code,
      order_id: order.order_id,
      current_status: order.status || trackingInfo.status,
      current_status_id: 1,
      delivered_date: order.status === 'Delivered' ? order.updated_at : null,
      eta: trackingInfo.estimated_delivery,
      shipment_track: [
        {
          id: generateId(),
          awb_code: order.awb_code,
          scan_type: 'pickup',
          scan_datetime: new Date(order.created_at).toISOString(),
          location: 'Mumbai',
          status: 'Order Picked Up',
          status_id: 1
        },
        {
          id: generateId(),
          awb_code: order.awb_code,
          scan_type: 'in_transit',
          scan_datetime: trackingInfo.last_update,
          location: 'Delhi',
          status: order.status || trackingInfo.status,
          status_id: 2
        }
      ]
    }
  });
});

/**
 * Get All Orders
 * GET /shiprocket/orders
 */
router.get('/orders', verifyToken, (req, res) => {
  logRequest(req);
  
  const orders = db.get('shiprocketOrders').value();
  
  return res.json({
    status: 200,
    data: orders
  });
});

/**
 * Get Order by ID
 * GET /shiprocket/orders/:order_id
 */
router.get('/orders/:order_id', verifyToken, (req, res) => {
  logRequest(req);
  
  const { order_id } = req.params;
  
  const order = db.get('shiprocketOrders')
    .find({ order_id })
    .value();
  
  if (!order) {
    return res.status(404).json({
      status: 404,
      error: `Order with ID ${order_id} not found`
    });
  }
  
  return res.json({
    status: 200,
    data: order
  });
});

/**
 * Cancel Order
 * POST /shiprocket/orders/cancel
 */
router.post('/orders/cancel', verifyToken, (req, res) => {
  logRequest(req);
  
  const { ids, reason } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      status: 400,
      error: 'Please provide valid order IDs to cancel'
    });
  }
  
  const successfulCancellations = [];
  const failedCancellations = [];
  const cancellationTime = new Date().toISOString();
  
  // Process each order ID
  ids.forEach(id => {
    const order = db.get('shiprocketOrders')
      .find({ order_id: id })
      .value();
    
    if (order) {
      // Update order status
      db.get('shiprocketOrders')
        .find({ order_id: id })
        .assign({ 
          status: 'Cancelled', 
          cancellation_reason: reason || 'No reason provided',
          updated_at: cancellationTime 
        })
        .write();
      
      // Add a notification in the chat system
      db.get('chatNotifications')
        .push({
          id: generateId('notif_'),
          type: 'ORDER_CANCELLED',
          orderId: id,
          message: `Order #${id} has been cancelled${reason ? ': ' + reason : ''}`,
          timestamp: cancellationTime
        })
        .write();
      
      // Add a system message in the chat
      db.get('chatMessages')
        .push({
          id: generateId('msg_'),
          orderId: id,
          sender: 'system',
          content: `Your order #${id} has been cancelled. ${reason ? 'Reason: ' + reason : ''}`,
          timestamp: cancellationTime,
          read: false
        })
        .write();
      
      successfulCancellations.push(id);
    } else {
      failedCancellations.push(id);
    }
  });
  
  return res.json({
    status: 200,
    message: 'Orders cancelled successfully',
    cancelled_orders: successfulCancellations,
    failed_orders: failedCancellations,
    cancelled_at: cancellationTime
  });
});

module.exports = router;