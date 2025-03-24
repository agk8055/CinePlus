// backend/controllers/showtimeController.js
const pool = require('../config/db');

// Get showtimes for a movie in a specific city and on a specific date
exports.getShowtimesByMovie = async (req, res, next) => {
    const { movieId } = req.params;
    const { city, date, language, showTiming, numberOfTickets } = req.query;

    try {
        if (!movieId || !city || !date) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // 1. Fetch Initial Showtimes (same as before filters except numberOfTickets)
        let showtimesQuery = `
            SELECT
                s.showtime_id,
                t.name AS theater_name,
                sc.screen_number,
                sc.screen_id,
                s.start_time,
                m.language AS movie_language,
                t.theater_id  -- ADDED t.theater_id to SELECT clause
            FROM showtimes s
            JOIN screens sc ON s.screen_id = sc.screen_id
            JOIN theaters t ON sc.theater_id = t.theater_id
            JOIN movies m ON s.movie_id = m.movie_id
            WHERE s.movie_id = ? AND t.city = ? AND DATE(s.start_time) = ?
        `;

        const showtimesQueryParams = [movieId, city, date];
        let languageFilter = '';
        let showTimingFilter = '';

        if (language) {
            languageFilter = ` AND m.language = ?`;
            showtimesQueryParams.push(language);
        }

        if (showTiming) {
            // ... (Show timing filter logic - same as before) ...
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth();
            const currentDate = new Date(date).getDate();

            let startTime, endTime;
            switch (showTiming) {
                case 'EarlyMorning':
                    startTime = new Date(currentYear, currentMonth, currentDate, 0, 0, 0);
                    endTime = new Date(currentYear, currentMonth, currentDate, 9, 0, 0);
                    break;
                case 'Morning':
                    startTime = new Date(currentYear, currentMonth, currentDate, 9, 0, 0);
                    endTime = new Date(currentYear, currentMonth, currentDate, 12, 0, 0);
                    break;
                case 'Afternoon':
                    startTime = new Date(currentYear, currentMonth, currentDate, 12, 0, 0);
                    endTime = new Date(currentYear, currentMonth, currentDate, 16, 0, 0);
                    break;
                case 'Evening':
                    startTime = new Date(currentYear, currentMonth, currentDate, 16, 0, 0);
                    endTime = new Date(currentYear, currentMonth, currentDate, 20, 0, 0);
                    break;
                case 'Night':
                    startTime = new Date(currentYear, currentMonth, currentDate, 20, 0, 0);
                    endTime = new Date(currentYear, currentMonth, currentDate, 23, 59, 59);
                    break;
                default:
                    break;
            }

            if (startTime && endTime) {
                showTimingFilter = ` AND s.start_time >= ? AND s.start_time <= ?`;
                showtimesQueryParams.push(startTime);
                showtimesQueryParams.push(endTime);
            }
        }

        showtimesQuery += languageFilter + showTimingFilter;
        let [initialShowtimes] = await pool.query(showtimesQuery, showtimesQueryParams);

        // 2. Fetch Distinct Languages (same as before)
        const [languagesResult] = await pool.query(
            `SELECT DISTINCT m.language FROM showtimes s
             JOIN movies m ON s.movie_id = m.movie_id
             JOIN screens sc ON s.screen_id = sc.screen_id
             JOIN theaters t ON sc.theater_id = t.theater_id
             WHERE s.movie_id = ? AND t.city = ? AND DATE(s.start_time) = ?`,
            [movieId, city, date]
        );
        const availableLanguages = languagesResult.map(item => item.language);


        // 3. Filter Showtimes based on Consecutive Seat Availability (Corrected Logic)
        let filteredShowtimes = [];

        if (numberOfTickets && parseInt(numberOfTickets) > 0) {
            for (const showtime of initialShowtimes) {
                const requiredSeats = parseInt(numberOfTickets);
                const screenId = showtime.screen_id;
                const showtimeId = showtime.showtime_id;

                // Fetch seat layout for the screen (without is_booked column from seats table directly)
                const [seatLayout] = await pool.query(
                    `SELECT seat_id, seat_number, seat_type, \`row\` FROM seats WHERE screen_id = ? ORDER BY \`row\`, seat_number`,
                    [screenId]
                );

                if (seatLayout.length > 0) {
                    const seatsByRow = {};
                    for (const seat of seatLayout) {
                        if (!seatsByRow[seat.row]) {
                            seatsByRow[seat.row] = [];
                        }
                        // Corrected Booked Seat Check using JOIN with bookings table
                        const [bookedSeatResult] = await pool.query(
                            `SELECT 1
                             FROM booked_seats bs
                             JOIN bookings b ON bs.booking_id = b.booking_id
                             WHERE b.showtime_id = ? AND bs.seat_id = ?`,
                            [showtimeId, seat.seat_id]
                        );
                        const isBooked = bookedSeatResult.length > 0; // If a row is returned, seat is booked

                        seatsByRow[seat.row].push({ ...seat, is_booked: isBooked }); // Add is_booked property dynamically
                    }


                    // Check for consecutive available seats in each row (same logic as before)
                    for (const row in seatsByRow) {
                        let consecutiveAvailableSeats = 0;
                        for (const seat of seatsByRow[row]) {
                            if (!seat.is_booked) {
                                consecutiveAvailableSeats++;
                                if (consecutiveAvailableSeats >= requiredSeats) {
                                    filteredShowtimes.push(showtime); // Found consecutive seats, include showtime
                                    break; // No need to check further rows for this showtime
                                }
                            } else {
                                consecutiveAvailableSeats = 0; // Reset consecutive count if seat is booked
                            }
                        }
                        if (filteredShowtimes.includes(showtime)) { // Optimization: if showtime added, break row loop
                            break;
                        }
                    }
                }
                // If no consecutive seats found for this showtime, it will not be added to filteredShowtimes
            }
        } else {
            filteredShowtimes = initialShowtimes; // If no ticket number filter, show all initial showtimes
        }


        res.json({ showtimes: filteredShowtimes, availableLanguages }); // Return filtered showtimes

    } catch (error) {
        console.error('Error fetching showtimes and languages:', error);
        next(error);
    }
};



// --- Theatre Admin Protected Controller Functions ---

exports.createShowtime = async (req, res, next) => {
    console.log("createShowtime controller function called");
    try {
        const { movie_id, screen_id, start_time, language } = req.body; // Expecting start_time as full datetime

        if (!movie_id || !screen_id || !start_time || !language) {
            return res.status(400).json({ error: 'Missing required fields to create showtime.' });
        }

        // SQL INSERT query - inserting directly into start_time column
        const sql = 'INSERT INTO showtimes (movie_id, screen_id, start_time, language) VALUES (?, ?, ?, ?)'; // Removed show_date
        const values = [movie_id, screen_id, start_time, language]; // Removed show_date

        const [result] = await pool.query(sql, values);

        if (result.affectedRows > 0) {
            const newShowtimeId = result.insertId;
            const [newShowtime] = await pool.query('SELECT * FROM showtimes WHERE showtime_id = ?', [newShowtimeId]);
            return res.status(201).json({ message: 'Showtime created successfully', showtime: newShowtime[0] });
        } else {
            return res.status(500).json({ error: 'Failed to create showtime in database.' });
        }

    } catch (error) {
        console.error('Error creating showtime:', error);
        next(error);
    }
};

exports.updateShowtime = async (req, res, next) => {
    console.log("updateShowtime controller function called"); // Placeholder log
    res.send("updateShowtime endpoint - To be implemented"); // Placeholder response
};

exports.deleteShowtime = async (req, res, next) => {
    console.log("deleteShowtime controller function called"); // Placeholder log
    res.send("deleteShowtime endpoint - To be implemented"); // Placeholder response
};

exports.getShowtimesByTheater = async (req, res, next) => {
    const theaterIdFromParams = req.params.theaterId; // Get theaterId from params (if present)
    let theaterId;

    try {
        if (theaterIdFromParams) {
            // Case 1: theaterId is provided in params (e.g., for admin or public access - if needed)
            theaterId = theaterIdFromParams;
        } else if (req.user && req.user.role === 'theatre_admin') {
            // Case 2: No theaterId in params, but user is theatre_admin - Fetch associated theaterId
            const [theaters] = await pool.query('SELECT theater_id FROM theaters WHERE user_id = ?', [req.user.userId]);
            if (theaters.length > 0) {
                theaterId = theaters[0].theater_id; // Get theaterId from associated theater
            } else {
                return res.status(404).json({ message: 'No theater found associated with this Theatre Admin' });
            }
        } else {
            // Case 3: Neither theaterId in params nor theatre_admin -  Decide how to handle (e.g., error, or public listing of all theaters' shows - if that's a use case)
            return res.status(400).json({ message: 'Theater ID is required for this request' }); // Or handle differently based on your app's logic
        }


        // --- Fetch showtimes using the determined theaterId ---
        let query = `
            SELECT
                s.showtime_id,
                m.title AS movie_title,
                sc.screen_number,
                s.start_time,
                s.language
            FROM showtimes s
            JOIN movies m ON s.movie_id = m.movie_id
            JOIN screens sc ON s.screen_id = sc.screen_id
            WHERE sc.theater_id = ?
            ORDER BY s.start_time
        `;
        const queryParams = [theaterId];


        const [showtimes] = await pool.query(query, queryParams);
        res.json(showtimes);


    } catch (error) {
        console.error('Error fetching showtimes by theater:', error);
        next(error);
    }
};


exports.deleteShowtime = async (req, res, next) => {
    const { showtimeId } = req.params;

    if (!showtimeId) {
        return res.status(400).json({ error: 'Showtime ID is required' });
    }

    try {
        const [result] = await pool.query('DELETE FROM showtimes WHERE showtime_id = ?', [showtimeId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Showtime not found' });
        }

        res.json({ message: 'Showtime deleted successfully', deletedShowtimeId: showtimeId });

    } catch (error) {
        console.error('Error deleting showtime:', error);
        res.status(500).json({ error: 'Failed to delete showtime' });
    }
};

exports.getShowtimeDetailsById = async (req, res, next) => {
    const { showtimeId } = req.params;

    if (!showtimeId) {
        return res.status(400).json({ error: 'Showtime ID is required' });
    }

    try {
        const [showtimeDetails] = await pool.query(`
            SELECT 
                st.showtime_id,
                st.start_time,
                st.language AS show_language,
                m.movie_id,
                m.title AS movie_title,
                m.genre AS movie_genre, -- Include genre
                m.language AS movie_language,
                sc.screen_id,
                sc.screen_number,
                th.theater_id,
                th.name AS theater_name,
                th.city AS theater_city, -- Include city
                th.location AS theater_location -- Include location
            FROM showtimes AS st
            JOIN movies AS m ON st.movie_id = m.movie_id
            JOIN screens AS sc ON st.screen_id = sc.screen_id
            JOIN theaters AS th ON sc.theater_id = th.theater_id
            WHERE st.showtime_id = ?
        `, [showtimeId]);

        if (showtimeDetails.length === 0) {
            return res.status(404).json({ message: 'Showtime not found' });
        }

        res.json(showtimeDetails[0]);
    } catch (error) {
        console.error('Error fetching showtime details:', error);
        next(error);
    }
};


exports.getSeatLayout = async (screenId, showtimeId) => {
    try {
        const [seats] = await pool.query(`
            SELECT 
                seat_id, 
                seat_number, 
                seat_type, 
                \`row\`,  -- Include row
                price,
                (SELECT COUNT(*) FROM booked_seats bs JOIN bookings b ON bs.booking_id = b.booking_id WHERE bs.seat_id = seats.seat_id AND b.showtime_id = ?) as isBooked
            FROM seats
            WHERE screen_id = ?
            ORDER BY \`row\`, seat_number
        `, [showtimeId, screenId]);


        const bookedSeatIds = seats.filter(seat => seat.isBooked).map(seat => seat.seat_id);


        return { seats, bookedSeatIds };
    } catch (error) {
        console.error('Error fetching seat layout:', error);
        throw error;
    }
};