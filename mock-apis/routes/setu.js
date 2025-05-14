const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { generateId, generateUpiLink, logRequest } = require('../utils/helpers');

/**
 * Create UPI Deep Link
 * POST /setu/upi-links
 */
router.post('/upi-links', (req, res) => {
  logRequest(req);
  
  const { amount, payerName, payerPhone, expiry, orderId } = req.body;
  
  // Validate required fields
  if (!amount || !payerName) {
    return res.status(400).json({
      status: 'ERROR',
      error: {
        code: 'invalid_request',
        message: 'Missing required fields: amount and payerName are required'
      }
    });
  }
  
  // Generate UPI link and ID
  const upiLinkId = generateId('setu_upi_');
  const upiLink = generateUpiLink(req.body);
  
  // Default expiry is 24 hours if not specified
  const expiryTime = expiry || 24 * 60; // in minutes
  const expiryDate = new Date();
  expiryDate.setMinutes(expiryDate.getMinutes() + expiryTime);
  
  // Create UPI link object
  const upiLinkData = {
    id: upiLinkId,
    upiLink,
    amount,
    payerName,
    payerPhone: payerPhone || '',
    orderId: orderId || null, // Associate with order if orderId is provided
    status: 'CREATED',
    createdAt: new Date().toISOString(),
    expiresAt: expiryDate.toISOString()
  };
  
  // Save to database
  db.get('setuUpiLinks')
    .push(upiLinkData)
    .write();
  
  // Return response
  return res.status(201).json({
    status: 'SUCCESS',
    data: {
      upiLinkId,
      upiLink,
      status: 'CREATED',
      expiresAt: expiryDate.toISOString()
    }
  });
});

/**
 * Verify Payment
 * POST /setu/verify-payment
 */
router.post('/verify-payment', (req, res) => {
  logRequest(req);
  
  const { upiLinkId, orderId, transactionId } = req.body;
  
  // Validate required fields
  if (!upiLinkId) {
    return res.status(400).json({
      status: 'ERROR',
      error: {
        code: 'invalid_request',
        message: 'Missing required field: upiLinkId is required'
      }
    });
  }
  
  // Find UPI link
  const upiLink = db.get('setuUpiLinks')
    .find({ id: upiLinkId })
    .value();
  
  if (!upiLink) {
    return res.status(404).json({
      status: 'ERROR',
      error: {
        code: 'resource_not_found',
        message: `UPI link with ID ${upiLinkId} not found`
      }
    });
  }
  
  // If payment already completed
  if (upiLink.status === 'PAID') {
    return res.json({
      status: 'SUCCESS',
      data: {
        upiLinkId,
        status: 'PAID',
        transactionId: upiLink.transactionId,
        paidAt: upiLink.paidAt
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
      paidAt: paymentTime,
      orderId: orderId || upiLink.orderId
    })
    .write();
  
  // If orderId provided, update the order status if exists in the Shiprocket orders
  if (orderId || upiLink.orderId) {
    const orderIdToUpdate = orderId || upiLink.orderId;
    const order = db.get('shiprocketOrders')
      .find({ order_id: orderIdToUpdate })
      .value();
    
    if (order) {
      // Update order payment status
      db.get('shiprocketOrders')
        .find({ order_id: orderIdToUpdate })
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
      
      // Add a notification for this payment in the chat system
      db.get('chatNotifications')
        .push({
          id: generateId('notif_'),
          type: 'PAYMENT_VERIFIED',
          orderId: orderIdToUpdate,
          message: `Payment of ₹${upiLink.amount} received for order #${orderIdToUpdate}`,
          transactionId: txnId,
          timestamp: paymentTime
        })
        .write();
    }
  }
  
  // Return response
  return res.json({
    status: 'SUCCESS',
    data: {
      upiLinkId,
      status: 'PAID',
      transactionId: txnId,
      paidAt: paymentTime,
      message: 'Payment verified successfully'
    }
  });
});

/**
 * Get All UPI Links
 * GET /setu/upi-links
 */
router.get('/upi-links', (req, res) => {
  logRequest(req);
  
  const upiLinks = db.get('setuUpiLinks').value();
  
  return res.json({
    status: 'SUCCESS',
    data: upiLinks
  });
});

/**
 * Get UPI Link by ID
 * GET /setu/upi-links/:id
 */
router.get('/upi-links/:id', (req, res) => {
  logRequest(req);
  
  const { id } = req.params;
  
  const upiLink = db.get('setuUpiLinks')
    .find({ id })
    .value();
  
  if (!upiLink) {
    return res.status(404).json({
      status: 'ERROR',
      error: {
        code: 'resource_not_found',
        message: `UPI link with ID ${id} not found`
      }
    });
  }
  
  return res.json({
    status: 'SUCCESS',
    data: upiLink
  });
});

/**
 * Get Payment Status by Order ID
 * GET /setu/payment-status/:orderId
 */
router.get('/payment-status/:orderId', (req, res) => {
  logRequest(req);
  
  const { orderId } = req.params;
  
  // Find UPI link for this order
  const upiLink = db.get('setuUpiLinks')
    .find({ orderId })
    .value();
  
  if (!upiLink) {
    return res.status(404).json({
      status: 'ERROR',
      error: {
        code: 'resource_not_found',
        message: `No payment found for order ID ${orderId}`
      }
    });
  }
  
  return res.json({
    status: 'SUCCESS',
    data: {
      orderId,
      paymentStatus: upiLink.status,
      amount: upiLink.amount,
      upiLinkId: upiLink.id,
      transactionId: upiLink.transactionId || null,
      paidAt: upiLink.paidAt || null
    }
  });
});

/**
 * Create Payout
 * POST /setu/payouts
 */
router.post('/payouts', (req, res) => {
  logRequest(req);
  
  const { name, amount, accountNumber, ifsc } = req.body;
  
  // Validate required fields
  if (!name || !amount || !accountNumber || !ifsc) {
    return res.status(400).json({
      status: 'ERROR',
      error: {
        code: 'invalid_request',
        message: 'Missing required fields: name, amount, accountNumber, and ifsc are required'
      }
    });
  }
  
  // Generate payout ID
  const payoutId = generateId('setu_payout_');
  
  // Create payout object
  const payoutData = {
    id: payoutId,
    name,
    amount,
    accountNumber,
    ifsc,
    status: 'INITIATED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Save to database
  db.get('setuPayouts')
    .push(payoutData)
    .write();
  
  // Return response
  return res.status(201).json({
    status: 'SUCCESS',
    data: {
      payoutId,
      status: 'INITIATED',
      message: 'Payout initiated successfully'
    }
  });
});

/**
 * Get All Payouts
 * GET /setu/payouts
 */
router.get('/payouts', (req, res) => {
  logRequest(req);
  
  const payouts = db.get('setuPayouts').value();
  
  return res.json({
    status: 'SUCCESS',
    data: payouts
  });
});

/**
 * Get Payout by ID
 * GET /setu/payouts/:id
 */
router.get('/payouts/:id', (req, res) => {
  logRequest(req);
  
  const { id } = req.params;
  
  const payout = db.get('setuPayouts')
    .find({ id })
    .value();
  
  if (!payout) {
    return res.status(404).json({
      status: 'ERROR',
      error: {
        code: 'resource_not_found',
        message: `Payout with ID ${id} not found`
      }
    });
  }
  
  return res.json({
    status: 'SUCCESS',
    data: payout
  });
});

module.exports = router;