const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // Import authMiddleware

// POST /auth/signup - User registration
router.post('/signup', authController.signup);

// POST /auth/adminsignup - Admin registration
router.post('/adminsignup', authController.adminsignup);

// POST /auth/theatreadminsignup - Theatre Admin registration
router.post('/theatreadminsignup', authController.theatreAdminSignup);

// POST /auth/login - User login
router.post('/login', authController.login);

// GET /auth/me - Get logged in user's profile (NEW ROUTE)
router.get('/me', authMiddleware.authenticateJWT, authController.getMe); // Protected route

module.exports = router;