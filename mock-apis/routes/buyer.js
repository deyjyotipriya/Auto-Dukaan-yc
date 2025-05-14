const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { generateId, logRequest } = require('../utils/helpers');

/**
 * Register a buyer
 * POST /buyer/register
 */
router.post('/register', (req, res) => {
  logRequest(req);
  
  const { name, phone, email, address, pincode, city, state, country } = req.body;
  
  // Validate required fields
  if (!name || !phone) {
    return res.status(400).json({
      status: 'ERROR',
      error: {
        code: 'invalid_request',
        message: 'Missing required fields: name and phone are required'
      }
    });
  }
  
  // Check if buyer already exists
  const existingBuyer = db.get('buyerProfiles')
    .find({ phone })
    .value();
  
  if (existingBuyer) {
    return res.status(409).json({
      status: 'ERROR',
      error: {
        code: 'duplicate_buyer',
        message: `Buyer with phone ${phone} already exists`
      }
    });
  }
  
  // Generate buyer ID
  const buyerId = generateId('buyer_');
  
  // Create buyer object
  const buyerData = {
    id: buyerId,
    name,
    phone,
    email: email || '',
    address: address || '',
    pincode: pincode || '',
    city: city || '',
    state: state || '',
    country: country || 'India',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastActive: new Date().toISOString()
  };
  
  // Save to database
  db.get('buyerProfiles')
    .push(buyerData)
    .write();
  
  // Return response
  return res.status(201).json({
    status: 'SUCCESS',
    data: buyerData
  });
});

/**
 * Get buyer profile
 * GET /buyer/profile/:id
 */
router.get('/profile/:id', (req, res) => {
  logRequest(req);
  
  const { id } = req.params;
  
  // Find buyer
  const buyer = db.get('buyerProfiles')
    .find({ id })
    .value();
  
  if (!buyer) {
    return res.status(404).json({
      status: 'ERROR',
      error: {
        code: 'buyer_not_found',
        message: `Buyer with ID ${id} not found`
      }
    });
  }
  
  // Update last active time
  db.get('buyerProfiles')
    .find({ id })
    .assign({ lastActive: new Date().toISOString() })
    .write();
  
  // Return response
  return res.json({
    status: 'SUCCESS',
    data: buyer
  });
});

/**
 * Get buyer by phone number
 * GET /buyer/by-phone/:phone
 */
router.get('/by-phone/:phone', (req, res) => {
  logRequest(req);
  
  const { phone } = req.params;
  
  // Find buyer
  const buyer = db.get('buyerProfiles')
    .find({ phone })
    .value();
  
  if (!buyer) {
    return res.status(404).json({
      status: 'ERROR',
      error: {
        code: 'buyer_not_found',
        message: `Buyer with phone ${phone} not found`
      }
    });
  }
  
  // Update last active time
  db.get('buyerProfiles')
    .find({ id: buyer.id })
    .assign({ lastActive: new Date().toISOString() })
    .write();
  
  // Return response
  return res.json({
    status: 'SUCCESS',
    data: buyer
  });
});

/**
 * Update buyer profile
 * PUT /buyer/profile/:id
 */
router.put('/profile/:id', (req, res) => {
  logRequest(req);
  
  const { id } = req.params;
  const { name, phone, email, address, pincode, city, state, country } = req.body;
  
  // Find buyer
  const buyer = db.get('buyerProfiles')
    .find({ id })
    .value();
  
  if (!buyer) {
    return res.status(404).json({
      status: 'ERROR',
      error: {
        code: 'buyer_not_found',
        message: `Buyer with ID ${id} not found`
      }
    });
  }
  
  // Update buyer
  db.get('buyerProfiles')
    .find({ id })
    .assign({
      name: name || buyer.name,
      phone: phone || buyer.phone,
      email: email || buyer.email,
      address: address || buyer.address,
      pincode: pincode || buyer.pincode,
      city: city || buyer.city,
      state: state || buyer.state,
      country: country || buyer.country,
      updatedAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    })
    .write();
  
  // Get updated buyer
  const updatedBuyer = db.get('buyerProfiles')
    .find({ id })
    .value();
  
  // Return response
  return res.json({
    status: 'SUCCESS',
    data: updatedBuyer
  });
});

/**
 * Place an order
 * POST /buyer/place-order
 */
router.post('/place-order', (req, res) => {
  logRequest(req);
  
  const {
    buyerId,
    products,
    shippingAddress,
    billingAddress,
    paymentMethod
  } = req.body;
  
  // Validate required fields
  if (!buyerId || !products || !products.length) {
    return res.status(400).json({
      status: 'ERROR',
      error: {
        code: 'invalid_request',
        message: 'Missing required fields: buyerId and products are required'
      }
    });
  }
  
  // Find buyer
  const buyer = db.get('buyerProfiles')
    .find({ id: buyerId })
    .value();
  
  if (!buyer) {
    return res.status(404).json({
      status: 'ERROR',
      error: {
        code: 'buyer_not_found',
        message: `Buyer with ID ${buyerId} not found`
      }
    });
  }
  
  // Generate order ID
  const timestamp = new Date().getTime();
  const randomPart = Math.floor(Math.random() * 1000);
  const orderId = `ORDER-${timestamp}-${randomPart}`;
  
  // Calculate total amount
  const totalAmount = products.reduce((sum, product) => {
    return sum + (product.price * (product.quantity || 1));
  }, 0);
  
  // Default shipping address to buyer profile if not provided
  const shipping = shippingAddress || {
    name: buyer.name,
    address: buyer.address,
    city: buyer.city,
    state: buyer.state,
    pincode: buyer.pincode,
    country: buyer.country,
    phone: buyer.phone
  };
  
  // Default billing address to shipping address if not provided
  const billing = billingAddress || shipping;
  
  // Create order object for Shiprocket
  const orderData = {
    order_id: orderId,
    order_date: new Date().toISOString(),
    pickup_location: 'Primary',
    billing_customer_name: billing.name,
    billing_address: billing.address,
    billing_city: billing.city,
    billing_pincode: billing.pincode,
    billing_state: billing.state,
    billing_country: billing.country || 'India',
    billing_email: buyer.email || '',
    billing_phone: billing.phone,
    shipping_is_billing: !shippingAddress,
    shipping_customer_name: shipping.name,
    shipping_address: shipping.address,
    shipping_city: shipping.city,
    shipping_pincode: shipping.pincode,
    shipping_state: shipping.state,
    shipping_country: shipping.country || 'India',
    shipping_email: buyer.email || '',
    shipping_phone: shipping.phone,
    order_items: products.map(product => ({
      name: product.name,
      sku: product.sku || product.id || 'PRODUCT-' + Math.floor(Math.random() * 10000),
      units: product.quantity || 1,
      selling_price: product.price,
      discount: product.discount || 0
    })),
    payment_method: paymentMethod || 'prepaid',
    sub_total: totalAmount,
    total_discount: products.reduce((sum, product) => sum + ((product.discount || 0) * (product.quantity || 1)), 0),
    shipping_charges: 0,
    total: totalAmount,
    buyer_id: buyerId
  };
  
  // Create Shiprocket order
  const shipment_id = parseInt('99' + Math.floor(Math.random() * 1000000));
  const awb_code = '99' + Math.floor(Math.random() * 10000000000);
  
  const shiprocketOrder = {
    id: generateId('shiprocket_order_'),
    order_id: orderId,
    shipment_id,
    awb_code,
    order_date: new Date().toISOString(),
    pickup_location: 'Primary',
    channel_id: 'mock_channel_123',
    comment: 'Order placed through buyer API',
    billing_customer_name: billing.name,
    billing_address: billing.address,
    billing_city: billing.city,
    billing_pincode: billing.pincode,
    billing_state: billing.state,
    billing_country: billing.country || 'India',
    billing_email: buyer.email || '',
    billing_phone: billing.phone,
    shipping_is_billing: !shippingAddress,
    shipping_customer_name: shipping.name,
    shipping_address: shipping.address,
    shipping_city: shipping.city,
    shipping_pincode: shipping.pincode,
    shipping_state: shipping.state,
    shipping_country: shipping.country || 'India',
    shipping_email: buyer.email || '',
    shipping_phone: shipping.phone,
    order_items: orderData.order_items,
    payment_method: paymentMethod || 'prepaid',
    payment_status: 'PENDING',
    payment_verified: false,
    order_confirmed: false,
    sub_total: totalAmount,
    shipping_charges: 0,
    total: totalAmount,
    status: 'Order Created',
    buyer_id: buyerId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Save to database
  db.get('shiprocketOrders')
    .push(shiprocketOrder)
    .write();
  
  // Create UPI payment link if payment method is prepaid
  let paymentLink = null;
  let upiLinkId = null;
  
  if (paymentMethod === 'prepaid' || paymentMethod === 'upi') {
    upiLinkId = generateId('setu_upi_');
    const upiLink = `upi://pay?pa=mockmerchant@ybl&pn=AutoDukaan&am=${totalAmount}&tn=Payment%20for%20order%20${orderId}&cu=INR`;
    
    // Save UPI link
    const upiLinkData = {
      id: upiLinkId,
      upiLink,
      amount: totalAmount,
      payerName: buyer.name,
      payerPhone: buyer.phone,
      orderId,
      status: 'CREATED',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours expiry
    };
    
    db.get('setuUpiLinks')
      .push(upiLinkData)
      .write();
    
    paymentLink = {
      upiLinkId,
      upiLink,
      amount: totalAmount,
      status: 'CREATED',
      expiresAt: upiLinkData.expiresAt
    };
  }
  
  // Add a notification in the chat system
  db.get('chatNotifications')
    .push({
      id: generateId('notif_'),
      type: 'ORDER_CREATED',
      orderId,
      buyerId,
      message: `New order #${orderId} created for ${buyer.name}`,
      timestamp: new Date().toISOString()
    })
    .write();
  
  // Add a welcome message in the chat
  db.get('chatMessages')
    .push({
      id: generateId('msg_'),
      orderId,
      sender: 'system',
      senderType: 'system',
      content: `Thank you for your order #${orderId}! We've received it and will process it soon. You can chat with us here if you have any questions.`,
      timestamp: new Date().toISOString(),
      read: false
    })
    .write();
  
  // Update buyer's last active time
  db.get('buyerProfiles')
    .find({ id: buyerId })
    .assign({ lastActive: new Date().toISOString() })
    .write();
  
  // Return response
  return res.status(201).json({
    status: 'SUCCESS',
    data: {
      order_id: orderId,
      shipment_id,
      awb_code,
      total_amount: totalAmount,
      payment_method: paymentMethod || 'prepaid',
      payment_link: paymentLink,
      status: 'Order Created',
      created_at: new Date().toISOString()
    }
  });
});

/**
 * Get buyer orders
 * GET /buyer/orders/:id
 */
router.get('/orders/:id', (req, res) => {
  logRequest(req);
  
  const { id } = req.params;
  
  // Find buyer
  const buyer = db.get('buyerProfiles')
    .find({ id })
    .value();
  
  if (!buyer) {
    return res.status(404).json({
      status: 'ERROR',
      error: {
        code: 'buyer_not_found',
        message: `Buyer with ID ${id} not found`
      }
    });
  }
  
  // Get all orders for the buyer
  const orders = db.get('shiprocketOrders')
    .filter({ buyer_id: id })
    .value()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  // Update buyer's last active time
  db.get('buyerProfiles')
    .find({ id })
    .assign({ lastActive: new Date().toISOString() })
    .write();
  
  // Return response
  return res.json({
    status: 'SUCCESS',
    data: orders
  });
});

/**
 * Get order details
 * GET /buyer/order/:orderId
 */
router.get('/order/:orderId', (req, res) => {
  logRequest(req);
  
  const { orderId } = req.params;
  
  // Find order
  const order = db.get('shiprocketOrders')
    .find({ order_id: orderId })
    .value();
  
  if (!order) {
    return res.status(404).json({
      status: 'ERROR',
      error: {
        code: 'order_not_found',
        message: `Order with ID ${orderId} not found`
      }
    });
  }
  
  // Get payment details if available
  const payment = db.get('setuUpiLinks')
    .find({ orderId })
    .value();
  
  // Get tracking information
  const trackingInfo = {
    shipment_id: order.shipment_id,
    awb_code: order.awb_code,
    current_status: order.status,
    delivery_date: order.status === 'Delivered' ? order.updated_at : null,
    eta: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
  };
  
  // Combine order with payment and tracking info
  const orderDetails = {
    ...order,
    payment: payment || null,
    tracking: trackingInfo
  };
  
  // Return response
  return res.json({
    status: 'SUCCESS',
    data: orderDetails
  });
});

/**
 * Verify payment for an order
 * POST /buyer/verify-payment
 */
router.post('/verify-payment', (req, res) => {
  logRequest(req);
  
  const { orderId, upiLinkId, transactionId } = req.body;
  
  // Validate required fields
  if (!orderId || !upiLinkId) {
    return res.status(400).json({
      status: 'ERROR',
      error: {
        code: 'invalid_request',
        message: 'Missing required fields: orderId and upiLinkId are required'
      }
    });
  }
  
  // Find order
  const order = db.get('shiprocketOrders')
    .find({ order_id: orderId })
    .value();
  
  if (!order) {
    return res.status(404).json({
      status: 'ERROR',
      error: {
        code: 'order_not_found',
        message: `Order with ID ${orderId} not found`
      }
    });
  }
  
  // Find UPI link
  const upiLink = db.get('setuUpiLinks')
    .find({ id: upiLinkId, orderId })
    .value();
  
  if (!upiLink) {
    return res.status(404).json({
      status: 'ERROR',
      error: {
        code: 'payment_not_found',
        message: `Payment with ID ${upiLinkId} for order ${orderId} not found`
      }
    });
  }
  
  // If payment already verified
  if (upiLink.status === 'PAID') {
    return res.json({
      status: 'SUCCESS',
      data: {
        orderId,
        upiLinkId,
        status: 'PAID',
        transactionId: upiLink.transactionId,
        paidAt: upiLink.paidAt,
        message: 'Payment already verified'
      }
    });
  }
  
  // Generate transaction ID if not provided
  const txnId = transactionId || generateId('txn_');
  const paymentTime = new Date().toISOString();
  
  // Update UPI link status
  db.get('setuUpiLinks')
    .find({ id: upiLinkId })
    .assign({
      status: 'PAID',
      transactionId: txnId,
      paidAt: paymentTime
    })
    .write();
  
  // Update order payment status
  db.get('shiprocketOrders')
    .find({ order_id: orderId })
    .assign({
      payment_status: 'PAID',
      payment_verified: true,
      payment_details: {
        transactionId: txnId,
        paidAt: paymentTime,
        amount: upiLink.amount
      }
    })
    .write();
  
  // Add a notification in the chat system
  db.get('chatNotifications')
    .push({
      id: generateId('notif_'),
      type: 'PAYMENT_VERIFIED',
      orderId,
      message: `Payment of ₹${upiLink.amount} received for order #${orderId}`,
      transactionId: txnId,
      timestamp: paymentTime
    })
    .write();
  
  // Add a system message in the chat
  db.get('chatMessages')
    .push({
      id: generateId('msg_'),
      orderId,
      sender: 'system',
      senderType: 'system',
      content: `Your payment of ₹${upiLink.amount} for order #${orderId} has been received. Thank you!`,
      timestamp: paymentTime,
      read: false,
      metadata: {
        transactionId: txnId,
        amount: upiLink.amount
      }
    })
    .write();
  
  // Return response
  return res.json({
    status: 'SUCCESS',
    data: {
      orderId,
      upiLinkId,
      status: 'PAID',
      transactionId: txnId,
      paidAt: paymentTime,
      message: 'Payment verified successfully'
    }
  });
});

/**
 * Cancel order
 * POST /buyer/cancel-order
 */
router.post('/cancel-order', (req, res) => {
  logRequest(req);
  
  const { orderId, reason } = req.body;
  
  // Validate required fields
  if (!orderId) {
    return res.status(400).json({
      status: 'ERROR',
      error: {
        code: 'invalid_request',
        message: 'Missing required field: orderId is required'
      }
    });
  }
  
  // Find order
  const order = db.get('shiprocketOrders')
    .find({ order_id: orderId })
    .value();
  
  if (!order) {
    return res.status(404).json({
      status: 'ERROR',
      error: {
        code: 'order_not_found',
        message: `Order with ID ${orderId} not found`
      }
    });
  }
  
  // Check if order is in a status that can be cancelled
  const cancelableStatuses = ['Order Created', 'Order Confirmed', 'Order Processing'];
  if (!cancelableStatuses.includes(order.status)) {
    return res.status(400).json({
      status: 'ERROR',
      error: {
        code: 'invalid_status',
        message: `Order cannot be cancelled because it is in ${order.status} status`
      }
    });
  }
  
  const cancellationTime = new Date().toISOString();
  const cancellationReason = reason || 'Cancelled by buyer';
  
  // Update order status
  db.get('shiprocketOrders')
    .find({ order_id: orderId })
    .assign({
      status: 'Cancelled',
      cancellation_reason: cancellationReason,
      updated_at: cancellationTime
    })
    .write();
  
  // Add a notification in the chat system
  db.get('chatNotifications')
    .push({
      id: generateId('notif_'),
      type: 'ORDER_CANCELLED',
      orderId,
      message: `Order #${orderId} has been cancelled: ${cancellationReason}`,
      timestamp: cancellationTime
    })
    .write();
  
  // Add a system message in the chat
  db.get('chatMessages')
    .push({
      id: generateId('msg_'),
      orderId,
      sender: 'system',
      senderType: 'system',
      content: `Your order #${orderId} has been cancelled. Reason: ${cancellationReason}`,
      timestamp: cancellationTime,
      read: false
    })
    .write();
  
  // Return response
  return res.json({
    status: 'SUCCESS',
    data: {
      orderId,
      status: 'Cancelled',
      cancellation_reason: cancellationReason,
      cancelled_at: cancellationTime
    }
  });
});

module.exports = router;