const jwt = require('jsonwebtoken');
const db = require('./db');

// Generate JWT token for Shiprocket auth
const generateToken = (user) => {
  return jwt.sign(
    { email: user.email, id: user.id || 'mock_user_id' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  
  if (!bearerHeader) {
    return res.status(403).json({ error: 'Token required for authentication' });
  }
  
  const token = bearerHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log('Token verification error:', error.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Find user by credentials
const findUserByCredentials = (email, password) => {
  return db.get('users')
    .find({ email, password })
    .value();
};

module.exports = {
  generateToken,
  verifyToken,
  findUserByCredentials
};