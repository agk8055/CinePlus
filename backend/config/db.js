
const mysql = require('mysql2/promise');

// Create the connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD, // No need for a default here, it's in .env
  database: process.env.DB_DATABASE || 'cineplus', // Use DB_DATABASE
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;