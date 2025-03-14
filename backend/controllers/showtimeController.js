// backend/controllers/showtimeController.js
const db = require('../config/db');

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
                m.language AS movie_language
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
        let [initialShowtimes] = await db.query(showtimesQuery, showtimesQueryParams);

        // 2. Fetch Distinct Languages (same as before)
        const [languagesResult] = await db.query(
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
                const [seatLayout] = await db.query(
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
                        const [bookedSeatResult] = await db.query(
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



// --- Theatre Admin Protected Controller Functions (Placeholders for now) ---

exports.createShowtime = async (req, res, next) => {
    console.log("createShowtime controller function called"); // Placeholder log
    res.send("createShowtime endpoint - To be implemented"); // Placeholder response
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
    console.log("getShowtimesByTheater controller function called"); // Placeholder log
    res.send("getShowtimesByTheater endpoint - To be implemented"); // Placeholder response
};