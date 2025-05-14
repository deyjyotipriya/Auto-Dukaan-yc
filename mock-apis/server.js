require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

// Setup database
const adapter = new FileSync('db.json');
const db = low(adapter);

// Set default db values
db.defaults({
  setuUpiLinks: [],
  setuPayouts: [],
  shiprocketOrders: [],
  chatNotifications: [],
  chatMessages: [],
  buyerProfiles: [],
  users: [{ email: 'demo@example.com', password: 'password123' }]
}).write();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Log requests

// Import routes
const setuRoutes = require('./routes/setu');
const shiprocketRoutes = require('./routes/shiprocket');
const chatRoutes = require('./routes/chat');
const buyerRoutes = require('./routes/buyer');

// Use routes
app.use('/setu', setuRoutes);
app.use('/shiprocket', shiprocketRoutes);
app.use('/chat', chatRoutes);
app.use('/buyer', buyerRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Mock API Server for Setu and Shiprocket',
    version: '1.0.0',
    endpoints: {
      setu: [
        'POST /setu/upi-links',
        'POST /setu/payouts',
        'POST /setu/verify-payment',
        'GET /setu/upi-links',
        'GET /setu/payouts',
        'GET /setu/payment-status/:orderId'
      ],
      shiprocket: [
        'POST /shiprocket/auth/login',
        'POST /shiprocket/orders/create/adhoc',
        'POST /shiprocket/orders/confirm',
        'POST /shiprocket/orders/update-status',
        'GET /shiprocket/orders/track/:shipment_id',
        'GET /shiprocket/orders'
      ],
      chat: [
        'POST /chat/messages',
        'GET /chat/messages/:orderId',
        'GET /chat/notifications',
        'POST /chat/mark-read'
      ],
      buyer: [
        'POST /buyer/register',
        'GET /buyer/profile/:id',
        'POST /buyer/place-order',
        'GET /buyer/orders/:id'
      ]
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock API server running on port ${PORT}`);
});

module.exports = { app, db };