require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const routes = require('./routes');
const cron = require('node-cron');
const showtimeController = require('./controllers/showtimeController');

const app = express();

let server; // Declare server in the outer scope

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Routes ---
app.use('/api/v1', routes);

// --- 404 Handler ---
app.use((req, res, next) => {
  return res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource could not be found'
  });
});

// --- Error Handling Middleware ---
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the full stack trace

  const isProduction = process.env.NODE_ENV === 'production';

  let statusCode = err.statusCode || 500;
  let errorMessage = 'Internal Server Error';
  let errorDetails = {};

  if (!isProduction) {
    errorDetails.stack = err.stack;
    errorDetails.originalError = err.message;
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorMessage = 'Validation Error';
    errorDetails.validationErrors = err.errors;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorMessage = 'Unauthorized';
  } else if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    errorMessage = 'Duplicate entry';
  } else if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    errorMessage = 'Database connection error';
  }

  res.status(statusCode).json({
    error: errorMessage,
    details: isProduction ? undefined : errorDetails,
  });
});

// --- Unhandled Rejection Handling ---
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// --- Graceful Shutdown ---
function gracefulShutdown() {
  console.log('Shutting down gracefully...');
  server.close(async () => {
    try {
      await db.end();
      console.log('Database connections closed.');
    } catch (err) {
      console.error('Error closing database connections:', err);
    }
    console.log('Server closed.');
    process.exit(0);
  });
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// --- Start the Server ---
const PORT = process.env.PORT || 3000;

// Check database connection before starting the server
db.getConnection()
  .then(connection => {
    connection.release();
    console.log('Database connection successful');
    
    server = app.listen(PORT, () => { // Assign server to the outer scope variable
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // // Schedule the job to run every 5 minutes
    // cron.schedule('*/5 * * * *', async () => {
    //   try {
    //     await showtimeController.deleteExpiredShowtimes();
    //   } catch (error) {
    //     console.error('Error running scheduled job:', error);
    //   }
    // });

    // Export server for testing purposes
    module.exports = server;
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    console.error('Server could not start');
    process.exit(1);
  });