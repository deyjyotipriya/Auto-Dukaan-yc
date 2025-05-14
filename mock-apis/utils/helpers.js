// Generate random IDs for various entities
const generateId = (prefix = '') => {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Generate mock UPI deep link
const generateUpiLink = (data) => {
  const { amount, payerName } = data;
  const sanitizedName = payerName.replace(/\s+/g, '').toLowerCase();
  
  return `upi://pay?pa=mockmerchant@ybl&pn=AutoDukaan&am=${amount}&tn=Payment%20for%20${sanitizedName}&cu=INR`;
};

// Generate mock tracking status
const generateTrackingStatus = (shipmentId) => {
  const statuses = [
    'Order Placed',
    'Order Processed',
    'Pickup Scheduled',
    'Picked Up',
    'In Transit',
    'Out for Delivery',
    'Delivered'
  ];
  
  // Use shipment ID to deterministically select a status (for consistency)
  const statusIndex = parseInt(shipmentId.toString().slice(-1)) % statuses.length;
  
  // Create future delivery date (3-5 days from now)
  const deliveryDays = 3 + (parseInt(shipmentId.toString().slice(-2)) % 3);
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);
  
  return {
    status: statuses[statusIndex],
    estimated_delivery: deliveryDate.toISOString().split('T')[0],
    last_update: new Date().toISOString()
  };
};

// Log API request for debugging
const logRequest = (req) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  if (Object.keys(req.body).length > 0) {
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
  }
};

module.exports = {
  generateId,
  generateUpiLink,
  generateTrackingStatus,
  logRequest
};