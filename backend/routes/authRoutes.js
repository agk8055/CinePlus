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

// GET /auth/me - Get logged in user's profile
router.get('/me', authMiddleware.authenticateJWT, authController.getMe); // Protected route

// PUT /auth/profile - Update logged in user's profile
router.put('/profile', authMiddleware.authenticateJWT, authController.updateProfile); // Protected route for profile update

// PUT /auth/password - Change user password (NEW ROUTE for password change)
router.put('/password', authMiddleware.authenticateJWT, authController.changePassword); // Protected route for password change

module.exports = router;