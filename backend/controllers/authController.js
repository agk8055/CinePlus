const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const validator = require('validator'); // Example validation library

// Signup Function
exports.signup = async (req, res) => {
    let connection;
    try {
        const { name, email, password, phone_number } = req.body;

        // 1. Input Validation (Improved)
        if (!name || !email || !password || !phone_number) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        if (!validator.isStrongPassword(password, { /* your desired password options */ })) {
            return res.status(400).json({ error: 'Password does not meet complexity requirements' });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction(); // Start a transaction

        // 2. Check if User Exists (no changes here)
        const [existingUser] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // 3. Hash the Password (no changes here)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Insert User into Database (with potential role assignment)
        const [result] = await connection.execute(
            'INSERT INTO users (name, email, password, phone_number, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone_number, 'user'] // Assuming a default 'user' role for new signups
        );

        await connection.commit(); // Commit the transaction

        res.status(201).json({ message: 'User created successfully', userId: result.insertId });
    } catch (error) {
        if (connection) await connection.rollback(); // Rollback the transaction on error
        console.error('Signup Error:', error);

        // Handle specific errors if possible (e.g., database errors)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
        }

        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (connection) connection.release();
    }
};

// Admin Signup Function
exports.adminsignup = async (req, res) => {
    let connection;
    try {
        const { name, email, password, phone_number } = req.body;

        // 1. Input Validation (Improved - You can reuse the same validation logic)
        if (!name || !email || !password || !phone_number) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        if (!validator.isStrongPassword(password, { /* your desired password options */ })) {
            return res.status(400).json({ error: 'Password does not meet complexity requirements' });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction(); // Start a transaction

        // 2. Check if User Exists
        const [existingUser] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // 3. Hash the Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Insert Admin User into Database (Role is set to 'admin')
        const [result] = await connection.execute(
            'INSERT INTO users (name, email, password, phone_number, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone_number, 'admin'] // Role is explicitly set to 'admin'
        );

        await connection.commit(); // Commit the transaction

        res.status(201).json({ message: 'Admin user created successfully', userId: result.insertId });
    } catch (error) {
        if (connection) await connection.rollback(); // Rollback the transaction on error
        console.error('Admin Signup Error:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
        }

        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (connection) connection.release();
    }
};

// Theatre Admin Signup Function (NEW FUNCTION)
exports.theatreAdminSignup = async (req, res) => {
    let connection;
    try {
        const { name, email, password, phone_number, theater_name, theater_location, theater_city, theater_capacity } = req.body;

        // 1. Input Validation
        if (!name || !email || !password || !phone_number || !theater_name || !theater_location || !theater_city || !theater_capacity) {
            return res.status(400).json({ error: 'All fields are required for Theatre Admin Signup' });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        if (!validator.isStrongPassword(password, { /* your desired password options */ })) {
            return res.status(400).json({ error: 'Password does not meet complexity requirements' });
        }

        if (!validator.isInt(String(theater_capacity), { min: 1 })) { // Ensure capacity is a positive integer
            return res.status(400).json({ error: 'Theater capacity must be a positive integer' });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction(); // Start Transaction

        // 2. Check if User Email Exists
        const [existingUser] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // 3. Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Insert Theatre Admin User
        const [userResult] = await connection.execute(
            'INSERT INTO users (name, email, password, phone_number, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone_number, 'theatre_admin'] // Role is set to 'theatre_admin'
        );
        const theatreAdminUserId = userResult.insertId;

        // 5. Insert Theater Details - **CORRECTED INSERT STATEMENT**
        const [theaterResult] = await connection.execute(
            'INSERT INTO theaters (name, location, city, capacity, user_id) VALUES (?, ?, ?, ?, ?)',
            [theater_name, theater_location, theater_city, theater_capacity, theatreAdminUserId] // Added user_id and theatreAdminUserId
        );
        const theaterId = theaterResult.insertId;

        await connection.commit(); // Commit Transaction

        res.status(201).json({
            message: 'Theatre Admin and Theater created successfully',
            userId: theatreAdminUserId,
            theaterId: theaterId,
        });

    } catch (error) {
        if (connection) await connection.rollback(); // Rollback Transaction on error
        console.error('Theatre Admin Signup Error:', error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already exists' });
        }
        // Handle other potential errors (e.g., database connection errors, validation errors)
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (connection) connection.release();
    }
};

// GET /auth/me - Get logged in user's profile
exports.getMe = async (req, res) => {
    try {
        const userId = req.user.userId; // User ID is already attached to req.user by authenticateJWT middleware

        const [users] = await pool.execute(
            'SELECT user_id, name, email, role, phone_number FROM users WHERE user_id = ?', // Select name, email, role, and phone_number - MODIFIED QUERY
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' }); // Should not happen if JWT is valid, but handle just in case
        }

        const user = users[0];
        res.status(200).json({
            userId: user.user_id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone_number: user.phone_number, // Include phone_number in the response - ADDED phone_number to response
            // Add any other user details you want to send to the frontend
        });

    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
};


// Login Function (minor improvements)
exports.login = async (req, res) => {
   let connection;
    try {
        const { email, password } = req.body;

        // 1. Input Validation (Basic)
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        connection = await pool.getConnection();

        // 2. Find User in Database (SELECT role as well)
        const [users] = await connection.execute(
            'SELECT user_id, password, role, name FROM users WHERE email = ?', // Select role and name here
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];

        // 3. Compare Passwords
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // 4. Generate JWT Token (Include user ID and Role in the token payload)
        const token = jwt.sign(
            { userId: user.user_id, role: user.role }, // Include role in payload
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login successful', token, role: user.role, userName: user.name }); // Send role and userName in response
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (connection) connection.release();
    }
};

// PUT /auth/profile - Update logged in user's profile
exports.updateProfile = async (req, res) => {
    let connection;
    try {
        const userId = req.user.userId; // Get user ID from JWT
        const { name, email, phone_number } = req.body; // Get fields to update from request body

        // Input Validation (Optional, but recommended - validate fields being updated)
        if (name && typeof name !== 'string') {
            return res.status(400).json({ error: 'Invalid name format' });
        }
        if (email && !validator.isEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        if (phone_number && typeof phone_number !== 'string') { // Basic phone number validation can be added
            return res.status(400).json({ error: 'Invalid phone number format' });
        }


        connection = await pool.getConnection();

        // 1. Check if user exists (optional, authenticateJWT should handle this, but good to double-check)
        const [users] = await connection.execute(
            'SELECT user_id FROM users WHERE user_id = ?',
            [userId]
        );
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' }); // User should exist if JWT is valid
        }

        // 2. Update user data in the database
        const updateFields = [];
        const updateValues = [];

        if (name !== undefined) { // Check if name is provided in the request body
            updateFields.push('name = ?');
            updateValues.push(name);
        }
        if (email !== undefined) {
            updateFields.push('email = ?');
            updateValues.push(email);
        }
        if (phone_number !== undefined) {
            updateFields.push('phone_number = ?');
            updateValues.push(phone_number);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No fields to update provided' }); // If no fields to update in request
        }


        const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`;
        updateValues.push(userId); // Add userId at the end for WHERE clause

        await connection.execute(updateQuery, updateValues);

        // 3. Fetch the updated user profile to send back (optional, but good practice)
        const [updatedUsers] = await connection.execute(
            'SELECT user_id, name, email, phone_number, role FROM users WHERE user_id = ?', // Select all fields to return updated profile
            [userId]
        );
        const updatedUser = updatedUsers[0];


        res.status(200).json({ message: 'Profile updated successfully', user: updatedUser }); // Send success response with updated user data

    } catch (error) {
        console.error('Profile Update Error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    } finally {
        if (connection) connection.release();
    }
};

// PUT /auth/password - Change user password (NEW FUNCTION for password change)
exports.changePassword = async (req, res) => {
    let connection;
    try {
        const userId = req.user.userId; // Get user ID from JWT
        const { currentPassword, newPassword, confirmNewPassword } = req.body;

        // 1. Input Validation
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ error: 'All password fields are required' });
        }
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ error: 'New password and confirm password do not match' });
        }
        if (!validator.isStrongPassword(newPassword, { /* your password options */ })) {
            return res.status(400).json({ error: 'New password does not meet complexity requirements' });
        }


        connection = await pool.getConnection();

        // 2. Get user's current password from database
        const [users] = await connection.execute(
            'SELECT password FROM users WHERE user_id = ?',
            [userId]
        );
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' }); // Should not happen
        }
        const user = users[0];
        const storedHashedPassword = user.password;

        // 3. Verify current password
        const passwordMatch = await bcrypt.compare(currentPassword, storedHashedPassword);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Incorrect current password' }); // 401 Unauthorized for wrong password
        }

        // 4. Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // 5. Update password in database
        await connection.execute(
            'UPDATE users SET password = ? WHERE user_id = ?',
            [hashedNewPassword, userId]
        );

        res.status(200).json({ message: 'Password changed successfully' }); // Success message

    } catch (error) {
        console.error('Password Change Error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    } finally {
        if (connection) connection.release();
    }
};