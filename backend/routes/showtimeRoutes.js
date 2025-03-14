// backend/routes/showtimeRoutes.js
const express = require('express');
const router = express.Router();
const showtimeController = require('../controllers/showtimeController'); // Import your showtime controller
const { authenticateJWT, authorizeTheatreAdmin } = require('../middleware/authMiddleware'); // Import middleware



// Route to get showtimes for a movie by city and date (No authentication needed for public viewing)
router.get('/movies/:movieId', showtimeController.getShowtimesByMovie); // Public route - no middleware

// --- Protected routes for Theatre Admins ---

// Route to create a showtime for a screen (Protected - Theatre Admin role required)
router.post('/screens/:screenId', authenticateJWT, authorizeTheatreAdmin, showtimeController.createShowtime);

// Route to update a showtime (Protected - Theatre Admin role required)
router.put('/:showtimeId', authenticateJWT, authorizeTheatreAdmin, showtimeController.updateShowtime);

// Route to delete a showtime (Protected - Theatre Admin role required)
router.delete('/:showtimeId', authenticateJWT, authorizeTheatreAdmin, showtimeController.deleteShowtime);

// Route to get showtimes for a specific theater (Protected - Theatre Admin role required)
router.get('/theaters/:theaterId', authenticateJWT, authorizeTheatreAdmin, showtimeController.getShowtimesByTheater);

module.exports = router;