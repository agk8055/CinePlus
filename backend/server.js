require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const routes = require('./routes');

const app = express();

// --- Middleware ---

app.use(cors());
app.use(express.json());

// --- Routes ---

app.use('/api/v1', routes);

// --- Error Handling ---

// Centralized error handling middleware (must be after all other routes/middleware)
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the full stack trace

  // Get the environment
  const isProduction = process.env.NODE_ENV === 'production';

  // Customize error response based on environment and error type
  let statusCode = err.statusCode || 500; // Use custom status code if available
  let errorMessage = 'Internal Server Error';
  let errorDetails = {};

  if (!isProduction) {
    // In development, provide more error details
    errorDetails.stack = err.stack;
    errorDetails.originalError = err.message; 
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400; // Bad Request
    errorMessage = 'Validation Error';
    errorDetails.validationErrors = err.errors; 
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401; // Unauthorized
    errorMessage = 'Unauthorized';
  } else if (err.code === 'ER_DUP_ENTRY') {
    statusCode = 409; // Conflict (e.g., duplicate email)
    errorMessage = 'Duplicate entry';
  } else if (err.code === 'ECONNREFUSED') {
    statusCode = 503; // Service Unavailable (database connection error)
    errorMessage = 'Database connection error';
  }
  
  // Send the error response
  res.status(statusCode).json({
    error: errorMessage,
    details: isProduction ? undefined : errorDetails, // Only include details in development
  });
});

// --- Unhandled Rejection Handling ---

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);

  // Optional: Perform cleanup tasks before exiting (e.g., close database connections)

  // Log the error to an error tracking service (if you have one)

  // Exit the process (consider using a process manager in production to restart automatically)
  // For development, exiting might not be ideal
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// --- Start the Server ---

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// --- Graceful Shutdown (Optional) ---

function gracefulShutdown() {
  console.log('Shutting down gracefully...');
  server.close(async () => {
    // Close database connections or perform other cleanup here
    try {
      await db.end(); // Assuming db is your database connection pool
      console.log('Database connections closed.');
    } catch (err) {
      console.error('Error closing database connections:', err);
    }
    console.log('Server closed.');
    process.exit(0); // Exit with success code
  });
}

// Handle SIGINT (Ctrl+C) and SIGTERM signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);