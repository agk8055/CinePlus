// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // Database connection

// Middleware for general authentication (verifying JWT)
exports.authenticateJWT = (req, res, next) => {
    console.log("authenticateJWT middleware called");
    const authHeader = req.headers.authorization;
    console.log("Authorization Header:", authHeader);

    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Bearer <token>

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                console.error("JWT Verification Error:", err);
                return res.status(403).json({ message: 'Forbidden: Invalid token' }); // Send JSON response
            }
            req.user = user;
            console.log("JWT Verified, User:", user);
            // --- ADDED LOGGING ---
            console.log("req.user after JWT verification:", req.user);
            // --- END ADDED LOGGING ---
            next();
        });
    } else {
        console.log("No Authorization Header");
        return res.status(401).json({ message: 'Unauthorized: No token provided' }); // Send JSON response
    }
};


// Middleware for Theatre Admin authorization
exports.authorizeTheatreAdmin = async (req, res, next) => {
    console.log("authorizeTheatreAdmin middleware called");
    if (!req.user) {
        console.log("No req.user object - Authentication failed before Authorization");
        return res.status(401).json({ message: 'Unauthorized: Authentication required' }); // More accurate status
    }

    console.log("req.user for authorization:", req.user); // Log user info for authorization
    console.log("req.user.role for authorization:", req.user.role);


    if (req.user.role !== 'theatre_admin') {
        console.log("Forbidden: Not theatre_admin role");
        return res.status(403).json({ message: 'Forbidden: Theatre Admin role required' }); // More accurate message
    }


    // --- Theater Ownership Check (for routes involving theaterId in params) ---
    const theaterId = req.params.theaterId; // Check for theaterId in route parameters

    if (theaterId) {
        console.log(`Checking authorization for theaterId: ${theaterId} for user:`, req.user);
        try {
            const [theaters] = await pool.execute(
                'SELECT theater_id FROM theaters WHERE theater_id = ? AND user_id = ?',
                [theaterId, req.user.userId]
            );

            if (theaters.length === 0) {
                console.log(`Forbidden: Theatre Admin ${req.user.userId} not associated with theater ${theaterId}`);
                return res.status(403).json({ message: 'Forbidden: Not authorized for this theater' });
            }

            console.log(`Authorization successful for Theatre Admin ${req.user.userId} to access theater ${theaterId}`);
            next(); // Authorized for this theater
        } catch (error) {
            console.error("Database error during theater authorization:", error);
            return res.status(500).json({ message: 'Internal server error during authorization' }); // DB error during auth
        }
    } else {
        console.log("No theaterId in params, proceeding with Theatre Admin role authorization only.");
        next(); // No theaterId, just check for theatre_admin role
    }
};



// Middleware for Admin authorization (general admin role)
exports.authorizeAdmin = (req, res, next) => {
    console.log("authorizeAdmin middleware called");
    if (!req.user) {
        console.log("No req.user object - Authentication failed before Authorization (Admin)");
        return res.status(401).json({ message: 'Unauthorized: Authentication required' }); // More accurate status
    }
    if (req.user.role !== 'admin') {
        console.log("Forbidden: Not general admin role");
        return res.status(403).json({ message: 'Forbidden: Admin role required' }); // More accurate message
    }
    console.log("Authorized: General Admin");
    next(); // Proceed if user is an admin
};