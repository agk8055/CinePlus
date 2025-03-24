// backend/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /bookings - Create a new booking (requires authentication)
router.post('/', authMiddleware.authenticateJWT, bookingController.createBooking);

// GET /bookings/my-bookings - Get booking history for logged-in user
router.get('/my-bookings', authMiddleware.authenticateJWT, bookingController.getMyBookings);

// DELETE /bookings/:bookingId - Cancel a booking (requires authentication) // ADDED ROUTE
router.delete('/:bookingId', authMiddleware.authenticateJWT, bookingController.cancelBooking);


module.exports = router;