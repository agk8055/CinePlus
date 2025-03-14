// backend/routes/theaterRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeTheatreAdmin } = require('../middleware/authMiddleware'); // Import middleware

// --- Debugging Section - ADD THIS BLOCK TO THE TOP OF theaterRoutes.js ---
console.log("theaterRoutes.js: Starting to require theaterController...");
try {
    const controllerPath = require.resolve('../controllers/theaterController');
    console.log("theaterRoutes.js: Resolved path for theaterController:", controllerPath); // Log resolved path
} catch (e) {
    console.error("theaterRoutes.js: Error resolving theaterController path:", e); // Log error if path can't be resolved
}

const theaterController = require('../controllers/theaterController');
console.log("theaterRoutes.js: theaterController object after require:", theaterController); // Log the controller object
console.log("theaterRoutes.js: theaterController.getTheaterById:", typeof theaterController.getTheaterById); // Log the type of getTheaterById
// --- End Debugging Section ---

// --- Theater Routes ---

router.get('/', authenticateJWT, authorizeTheatreAdmin, theaterController.getAllTheaters); // Route to get all theaters

// Example: Route to get details of a specific theater (protected for theatre_admins)
router.get('/:theaterId', authenticateJWT, authorizeTheatreAdmin, theaterController.getTheaterById);

// Example: Route to create a screen for a theater (protected for theatre_admins)
router.post('/:theaterId/screens', authenticateJWT, authorizeTheatreAdmin, theaterController.createScreen);

// Route to get screens for a specific theater
router.get('/:theaterId/screens', authenticateJWT, authorizeTheatreAdmin, theaterController.getScreensByTheater);

router.delete('/screens/:screenId', authenticateJWT, authorizeTheatreAdmin, theaterController.deleteScreen);

// ... other theater routes that you want to protect for theatre_admins ...

module.exports = router;