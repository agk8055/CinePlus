// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // Database connection

// Middleware for general authentication (verifying JWT)
exports.authenticateJWT = (req, res, next) => {
    console.log("authenticateJWT middleware called"); // Log entry
    const authHeader = req.headers.authorization;
    console.log("Authorization Header:", authHeader); // Log auth header

    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Bearer <token>

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                console.log("JWT Verification Error:", err); // Log JWT verification error
                return res.sendStatus(403); // Forbidden - invalid token
            }
            req.user = user; // Attach user payload to request object
            console.log("JWT Verified, User:", user); // Log verified user
            next(); // Proceed to the next middleware/route handler
        });
    } else {
        console.log("No Authorization Header"); // Log missing auth header
        res.sendStatus(401); // Unauthorized - no token provided
    }
};


// Middleware for Theatre Admin authorization
exports.authorizeTheatreAdmin = async (req, res, next) => {
    console.log("authorizeTheatreAdmin middleware called"); // Log entry
    if (!req.user) {
        console.log("No req.user object"); // Log missing req.user
    } else {
        console.log("req.user:", req.user); // Log req.user
        console.log("req.user.role:", req.user.role); // Log user role
    }

    if (!req.user || req.user.role !== 'theatre_admin') {
        console.log("Unauthorized: Not theatre_admin"); // Log role check failure
        return res.status(403).json({ message: 'Unauthorized: Admin role required' }); // Forbidden - not a theatre_admin
    }

    // If it's a request related to a specific theater (e.g., managing screens, showtimes),
    // you might want to verify if the theatre_admin is authorized for that theater.
    // Example: Assuming theater ID is passed in request parameters or body as 'theaterId'
    const theaterId = req.params.theaterId || req.body.theaterId;

    if (theaterId) {
        try {
            const [theaters] = await pool.execute(
                'SELECT theater_id FROM theaters WHERE theater_id = ? AND user_id = ?', // Assuming user_id in theaters table
                [theaterId, req.user.userId] // Verify theater belongs to logged-in theatre_admin
            );

            if (theaters.length === 0) {
                console.log("Unauthorized: Not authorized for this theater"); // Log theater authorization failure
                return res.status(403).json({ message: 'Unauthorized: Not authorized for this theater' }); // Forbidden - theatre_admin doesn't own this theater
            }
            // If authorized for the theater, proceed
            next();
        } catch (error) {
            console.error("Database error in authorizeTheatreAdmin:", error);
            return res.status(500).json({ message: 'Internal server error' }); // Database error
        }
    } else {
        // If no theaterId is in the request, and it's a theatre_admin, proceed (e.g., for routes that don't require a specific theater context)
        next();
    }
};


// Middleware for Admin authorization (for general admins, if you have such a role)
exports.authorizeAdmin = (req, res, next) => {
    console.log("authorizeAdmin middleware called"); // Log entry
    if (!req.user || req.user.role !== 'admin') {
        console.log("Unauthorized: Not general admin"); // Log general admin role check failure
        return res.status(403).json({ message: 'Unauthorized: Admin role required' }); // Forbidden - not an admin
    }
    next(); // Proceed if user is an admin
};