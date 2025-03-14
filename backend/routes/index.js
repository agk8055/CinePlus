// backend/routes/index.js
const express = require('express');
const authRoutes = require('./authRoutes');
const movieRoutes = require('./movieRoutes');
const seatRoutes = require('./seatRoutes');
const showtimeRoutes = require('./showtimeRoutes'); 
const theaterRoutes = require('./theaterRoutes');

const router = express.Router();

// Mount route files - use router.use() to mount each route group

// Authentication routes - prefixed with /auth
router.use('/auth', authRoutes);

// Movie routes - prefixed with /movies
router.use('/movies', movieRoutes);

// Seat routes - prefixed with /seats
router.use('/seats', seatRoutes); 

// Showtime routes - prefixed with /showtimes
router.use('/showtimes', showtimeRoutes);  // Mount showtimeRoutes here
router.use('/theaters', theaterRoutes); 


// Example of a direct route definition (you generally should use route files for organization)
// router.get('/api/test', (req, res) => {
//   res.json({ message: 'API test route is working from index.js' });
// });

module.exports = router;