// backend/routes/seatRoutes.js
const express = require('express');
const seatController = require('../controllers/seatController');
const router = express.Router();

router.get('/screens/:screenId/showtimes/:showtimeId/seats', seatController.getSeatLayout);

module.exports = router;