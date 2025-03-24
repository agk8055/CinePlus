// backend/routes/theaterRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeTheatreAdmin, authorizeAdmin } = require('../middleware/authMiddleware'); // Import middleware, including authorizeAdmin
const theaterController = require('../controllers/theaterController');

// --- Theater Routes ---

// GET all theaters -  Let's make this publicly accessible or just for logged-in users (remove theatre_admin restriction if needed)
// If you want it public, remove authenticateJWT completely. If for logged-in users, keep authenticateJWT only.
router.get('/', authenticateJWT,  theaterController.getAllTheaters); // Accessible to logged-in users

// GET details of a specific theater -  Let's make this publicly accessible
router.get('/:theaterId/details', theaterController.getTheaterDetails); // Public route to get theater details

// GET showtimes for a specific theater - Let's make this publicly accessible
router.get('/:theaterId/showtimes', theaterController.getShowtimesByTheater); // Public route to get showtimes for a theater

// GET details of a specific theater -  Let's make this publicly accessible or just for logged-in users (remove theatre_admin restriction if needed)
// If you want it public, remove authenticateJWT completely. If for logged-in users, keep authenticateJWT only.
router.get('/:theaterId', authenticateJWT, theaterController.getTheaterById);


// POST route to create a screen for a theater - Protected for theatre_admins
router.post('/:theaterId/screens', authenticateJWT, authorizeTheatreAdmin, theaterController.createScreen);

// GET route to get screens for a specific theater - Let's make this publicly accessible or just for logged-in users
// If you want it public, remove authenticateJWT completely. If for logged-in users, keep authenticateJWT only.
router.get('/:theaterId/screens', authenticateJWT, theaterController.getScreensByTheater);


// DELETE route to delete a screen - Protected for theatre_admins
router.delete('/screens/:screenId', authenticateJWT, authorizeTheatreAdmin, theaterController.deleteScreen);


// --- Add routes for Theater management itself (Create, Update, Delete Theater) - Protected for Admin ---

// POST route to create a new theater - Protected for Admin only
router.post('/', authenticateJWT, authorizeAdmin, theaterController.createTheater);

// PUT route to update an existing theater - Protected for Theatre Admins and Admins (Theatre Admins can manage *their* theaters, Admins can manage all)
router.put('/:theaterId', authenticateJWT, authorizeTheatreAdmin, theaterController.updateTheater); // Theatre admins can update their own theaters

// DELETE route to delete a theater - Protected for Admin only (Careful with deleting theaters!)
router.delete('/:theaterId', authenticateJWT, authorizeAdmin, theaterController.deleteTheater);


module.exports = router;