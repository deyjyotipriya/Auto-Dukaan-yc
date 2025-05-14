const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

// Create database instance
const adapter = new FileSync('db.json');
const db = low(adapter);

// Initialize with default data
db.defaults({
  setuUpiLinks: [],
  setuPayouts: [],
  shiprocketOrders: [],
  users: [{ email: 'demo@example.com', password: 'password123' }]
}).write();

module.exports = db;