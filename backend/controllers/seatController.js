// backend/controllers/seatController.js
const db = require('../config/db');

const getSeatLayout = async (req, res) => {
    const { screenId, showtimeId } = req.params;

    if (!screenId || !showtimeId) {
        return res.status(400).json({ message: "Screen ID and Showtime ID are required." });
    }

    try {
        // 1. Fetch seat details and screen's total seats from Seats and Screens tables
        const [seatDetailsResult] = await db.query(
            `SELECT
                s.seat_id,
                s.seat_number,
                s.row,
                s.seat_type,
                s.price,
                sc.total_seats
            FROM Seats s
            JOIN Screens sc ON s.screen_id = sc.screen_id
            WHERE s.screen_id = ?` // Removed ORDER BY clause
            ,
            [screenId]
        );

        if (!seatDetailsResult || seatDetailsResult.length === 0) {
            return res.status(404).json({ message: "No seats found for this screen." });
        }

        const totalSeats = seatDetailsResult[0].total_seats; // Assuming all rows have same total_seats, or fetch separately if needed.

        // 2. Fetch booked seat IDs for the given showtime
        const [bookedSeatsResult] = await db.query(
            `SELECT bs.seat_id
             FROM Booked_Seats bs
             JOIN Bookings b ON bs.booking_id = b.booking_id
             WHERE b.showtime_id = ?`,
            [showtimeId]
        );

        const bookedSeatIds = bookedSeatsResult.map(row => row.seat_id);

        // 3. Structure the seat data for the frontend (optional, you can adjust as needed)
        const seats = seatDetailsResult.map(seat => ({
            seat_id: seat.seat_id,
            seat_number: seat.seat_number,
            row: seat.row,
            seat_type: seat.seat_type,
            price: seat.price,
            isBooked: bookedSeatIds.includes(seat.seat_id), // Determine if seat is booked
        }));

        res.status(200).json({
            totalSeats: totalSeats, // Still sending totalSeats if needed on frontend
            bookedSeatIds: bookedSeatIds, // Keeping bookedSeatIds for now, might not be needed with structured 'seats' data
            seats: seats, // Sending detailed seat information
        });

    } catch (error) {
        console.error("Error fetching seat layout:", error);
        res.status(500).json({ message: "Error fetching seat layout", error: error });
    }
};

module.exports = { getSeatLayout };