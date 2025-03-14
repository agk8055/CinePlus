const db = require('../config/db');

exports.createBooking = async (req, res) => {
  const { userId, showtimeId, seatIds, totalAmount } = req.body;
  try {
    // Start a transaction
    await db.query('START TRANSACTION');

    // Insert booking
    const [booking] = await db.query(
      'INSERT INTO bookings (user_id, showtime_id, total_amount) VALUES (?, ?, ?)',
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

    // Insert payment
    await db.query(
      'INSERT INTO payments (booking_id, amount, payment_status) VALUES (?, ?, ?)',
      [bookingId, totalAmount, 'Success']
    );

    // Commit the transaction
    await db.query('COMMIT');

    res.json({ message: 'Booking successful', bookingId });
  } catch (error) {
    // Rollback the transaction on error
    await db.query('ROLLBACK');
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};