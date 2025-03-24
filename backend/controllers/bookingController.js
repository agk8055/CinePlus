// backend/controllers/bookingController.js
const db = require('../config/db');

exports.createBooking = async (req, res) => {
    const { showtimeId, seatIds } = req.body;
    const userId = req.user.userId; // Get user_id from authenticated user (set by authMiddleware)

    // --- ADDED LOGGING ---
    console.log("bookingController.createBooking - req.user:", req.user);
    console.log("bookingController.createBooking - Retrieved userId from req.user:", userId);
    console.log("bookingController.createBooking - showtimeId:", showtimeId, "seatIds:", seatIds);
    // --- END ADDED LOGGING ---


    if (!showtimeId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
        return res.status(400).json({ error: 'Missing or invalid booking details.' });
    }

    try {
        // Seat Availability Check
        const seatAvailability = await checkSeatAvailability(showtimeId, seatIds);
        if (!seatAvailability.areAllAvailable) {
            return res.status(400).json({ error: 'Some seats are no longer available.', unavailableSeats: seatAvailability.unavailableSeats });
        }

        // Calculate total amount
        const totalAmount = await calculateTotalAmount(seatIds);

        // Start a transaction
        await db.query('START TRANSACTION');

        // Insert booking
        const [booking] = await db.query(
            'INSERT INTO bookings (user_id, showtime_id, booking_date, total_amount) VALUES (?, ?, NOW(), ?)',
            [userId, showtimeId, totalAmount]
        );
        const bookingId = booking.insertId;

        // Insert booked seats
        for (const seatId of seatIds) {
            await db.query(
                'INSERT INTO booked_seats (booking_id, seat_id) VALUES (?, ?)',
                [bookingId, seatId]
            );
        }

        // --- ADDED LOGGING AROUND PAYMENT INSERTION ---
        console.log("bookingController.createBooking - About to insert payment. bookingId:", bookingId, "totalAmount:", totalAmount);
        try {
            await db.query(
                'INSERT INTO payments (booking_id, booking_amount, payment_status) VALUES (?, ?, ?)', // Corrected column name to booking_amount
                [bookingId, totalAmount, 'Success']
            );
            console.log("bookingController.createBooking - Payment insertion successful. bookingId:", bookingId);
        } catch (paymentError) {
            console.error("bookingController.createBooking - Error inserting payment:", paymentError);
            await db.query('ROLLBACK'); // Rollback transaction if payment fails
            return res.status(500).json({ error: 'Failed to create booking', details: paymentError.message }); // Return error response
        }
        // --- END ADDED LOGGING AROUND PAYMENT INSERTION ---


        // Commit the transaction
        await db.query('COMMIT');

        res.status(201).json({ message: 'Booking successful', bookingId, totalAmount });
    } catch (error) {
        // Rollback the transaction on error (if not already rolled back due to payment error)
        await db.query('ROLLBACK');
        console.error('Error creating booking:', error);
        res.status(500).json({ error: 'Failed to create booking', details: error.message });
    }
};


// Helper function to check seat availability
async function checkSeatAvailability(showtimeId, seatIds) {
    const unavailableSeats = [];
    for (const seatId of seatIds) {
        const [bookedSeat] = await db.query(
            'SELECT 1 FROM booked_seats bs JOIN bookings b ON bs.booking_id = b.booking_id WHERE bs.seat_id = ? AND b.showtime_id = ?',
            [seatId, showtimeId]
        );
        if (bookedSeat.length > 0) {
            unavailableSeats.push(seatId);
        }
    }
    return { areAllAvailable: unavailableSeats.length === 0, unavailableSeats };
}


// Helper function to calculate total amount
async function calculateTotalAmount(seatIds) {
    let totalAmount = 0;
    for (const seatId of seatIds) {
        const [seatPrice] = await db.query(
            'SELECT price FROM seats WHERE seat_id = ?',
            [seatId]
        );
        if (seatPrice.length > 0) {
            totalAmount += parseFloat(seatPrice[0].price); // Parse price as float to avoid string concatenation
        }
    }
    return totalAmount;
}


exports.cancelBooking = async (req, res) => {
    const bookingId = req.params.bookingId;
    const userId = req.user.userId; // Verify user is logged in and get their ID
    let connection; // Declare connection outside try block for finally block scope

    if (!bookingId) {
        return res.status(400).json({ error: 'Booking ID is required.' });
    }

    try {
        connection = await db.getConnection(); // Get a database connection
        await connection.beginTransaction(); // Start a transaction

        // 1. Verify Booking Ownership and Status (Optional but Recommended)
        const [bookingDetails] = await connection.query( // Use connection for queries within transaction
            'SELECT showtime_id, user_id, status FROM bookings WHERE booking_id = ?',
            [bookingId]
        );

        if (bookingDetails.length === 0) {
            await connection.rollback(); // Rollback if booking not found
            return res.status(404).json({ error: 'Booking not found.' });
        }

        const booking = bookingDetails[0];

        if (booking.user_id !== userId) {
            await connection.rollback(); // Rollback if not booking owner
            return res.status(403).json({ error: 'You are not authorized to cancel this booking.' }); // Forbidden - not owner
        }

        if (booking.status === 'cancelled') {
            await connection.rollback(); // Rollback if already cancelled
            return res.status(400).json({ error: 'This booking is already cancelled.' }); // Bad request - already cancelled
        }


        // 2. Check Cancellation Time Window (2 hours before showtime)
        const [showtimeDetails] = await connection.query( // Use connection for queries within transaction
            'SELECT start_time FROM showtimes WHERE showtime_id = ?',
            [booking.showtime_id]
        );

        if (showtimeDetails.length === 0) {
            await connection.rollback(); // Rollback if showtime not found
            return res.status(400).json({ error: 'Showtime for this booking not found.' }); // Should not happen, but handle just in case
        }

        const showtimeStartTime = new Date(showtimeDetails[0].start_time);
        const currentTime = new Date();
        const timeUntilShowtime = showtimeStartTime - currentTime;

        if (timeUntilShowtime <= 2 * 60 * 60 * 1000) { // 2 hours in milliseconds
            await connection.rollback(); // Rollback if outside cancellation window
            return res.status(400).json({ error: 'Cancellation not allowed within 2 hours of showtime.' });
        }


        // 3. Delete Booked Seats - ADDED STEP: Delete from booked_seats table
        await connection.query( // Use connection for queries within transaction
            'DELETE FROM booked_seats WHERE booking_id = ?',
            [bookingId]
        );

        // 4. Update Booking Status to 'cancelled'
        const [updateResult] = await connection.query( // Use connection for queries within transaction
            'UPDATE bookings SET status = ? WHERE booking_id = ?',
            ['cancelled', bookingId]
        );

        if (updateResult.affectedRows === 0) {
            await connection.rollback(); // Rollback if update failed (unlikely, but for robustness)
            return res.status(500).json({ error: 'Failed to cancel booking in database.' }); // Should not happen if booking existed
        }

        await connection.commit(); // Commit transaction only if all steps succeed
        res.json({ message: 'Booking cancelled successfully', bookingId });


    } catch (error) {
        if (connection) { // Check if connection is valid before rollback
            await connection.rollback(); // Rollback transaction on any error
        }
        console.error('Error cancelling booking:', error);
        res.status(500).json({ error: 'Failed to cancel booking', details: error.message });
    } finally {
        if (connection) {
            connection.release(); // Release connection back to pool in finally block
        }
    }
};


exports.getMyBookings = async (req, res) => {
    try {
        const userId = req.user.userId; // Get user ID from JWT

        const [bookings] = await db.query(`
            SELECT
                b.booking_id,
                b.booking_date,
                b.total_amount,
                b.status,
                s.start_time,
                m.title AS movie_title,
                m.poster_url,
                t.name AS theater_name,
                sc.screen_number,  -- ADDED: Select screen_number
                GROUP_CONCAT(CONCAT(seat.row, seat.seat_number) SEPARATOR ', ') AS seat_numbers,
                COUNT(bs.seat_id) AS number_of_seats
            FROM bookings b
            JOIN showtimes s ON b.showtime_id = s.showtime_id
            JOIN movies m ON s.movie_id = m.movie_id
            JOIN screens sc ON s.screen_id = sc.screen_id  -- Use sc alias for screens table
            JOIN theaters t ON sc.theater_id = t.theater_id
            LEFT JOIN booked_seats bs ON b.booking_id = bs.booking_id
            LEFT JOIN seats seat ON bs.seat_id = seat.seat_id
            WHERE b.user_id = ?
            GROUP BY b.booking_id
            ORDER BY b.booking_date DESC  -- UPDATED: Order by booking_date DESC
        `, [userId]);

        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching booking history:', error);
        res.status(500).json({ error: 'Failed to fetch booking history' });
    }
};