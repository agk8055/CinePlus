const db = require('../config/db');

exports.getAllTheaters = async (req, res) => {
    try {
        let query = 'SELECT * FROM theaters';
        let queryParams = [];

        // If the user is a theatre_admin, fetch only theaters associated with their user_id
        if (req.user && req.user.role === 'theatre_admin') {
            query = 'SELECT * FROM theaters WHERE user_id = ?';
            queryParams = [req.user.userId];
        }

        const [theaters] = await db.query(query, queryParams);
        res.json(theaters);
    } catch (error) {
        console.error('Error fetching theaters:', error);
        res.status(500).json({ error: 'Failed to fetch theaters' });
    }
};

exports.getScreensByTheater = async (req, res) => {
    const { theaterId } = req.params;
    try {
        const [screens] = await db.query('SELECT * FROM screens WHERE theater_id = ?', [theaterId]);
        res.json(screens);
    } catch (error) {
        console.error('Error fetching screens:', error);
        res.status(500).json({ error: 'Failed to fetch screens' });
    }
};

exports.getTheatersByCity = async (req, res) => {
    const { city } = req.params;
    try {
        const [theaters] = await db.query('SELECT * FROM theaters WHERE city = ?', [city]);
        res.json(theaters);
    } catch (error) {
        console.error('Error fetching theaters by city:', error);
        res.status(500).json({ error: 'Failed to fetch theaters by city' });
    }
};


exports.getTheaterById = async (req, res) => {
    const { theaterId } = req.params;
    try {
        const [theaters] = await db.query('SELECT * FROM theaters WHERE theater_id = ?', [theaterId]);
        if (theaters.length === 0) {
            return res.status(404).json({ error: 'Theater not found' });
        }
        res.json(theaters[0]);
    } catch (error) {
        console.error('Error fetching theater by ID:', error);
        res.status(500).json({ error: 'Failed to fetch theater' });
    }
};

// --- ADDED CONTROLLER FUNCTIONS ---

exports.getTheaterDetails = async (req, res) => {
    const { theaterId } = req.params;
    try {
        const [theaterDetails] = await db.query('SELECT * FROM theaters WHERE theater_id = ?', [theaterId]);
        if (theaterDetails.length === 0) {
            return res.status(404).json({ error: 'Theater not found' });
        }
        res.json(theaterDetails[0]);
    } catch (error) {
        console.error('Error fetching theater details:', error);
        res.status(500).json({ error: 'Failed to fetch theater details' });
    }
};


exports.getShowtimesByTheater = async (req, res) => {
    const { theaterId } = req.params;
    const { date } = req.query; // Optional date filter
    let connection;
    try {
        connection = await db.getConnection();

        let query = `
            SELECT
                st.showtime_id,
                st.start_time,
                st.language AS show_language,
                m.movie_id,
                m.title AS movie_title,
                m.language AS movie_language,
                sc.screen_id,
                sc.screen_number,
                th.theater_id,
                th.name AS theater_name
            FROM showtimes AS st
            JOIN movies AS m ON st.movie_id = m.movie_id
            JOIN screens AS sc ON st.screen_id = sc.screen_id
            JOIN theaters AS th ON sc.theater_id = th.theater_id
            WHERE th.theater_id = ?
        `;
        const params = [theaterId];

        if (date) {
            query += ' AND DATE(st.start_time) = ?';
            params.push(date);
        }


        const [showtimes] = await connection.query(query, params);
        res.json({ showtimes: showtimes });

    } catch (error) {
        console.error('Error fetching showtimes by theater:', error);
        res.status(500).json({ error: 'Failed to fetch showtimes by theater', details: error.message });
    } finally {
        if (connection) connection.release();
    }
};


exports.createScreen = async (req, res) => {
    console.log("createScreen controller function called");
    const { theaterId } = req.params;
    const { screen_number, seatRows } = req.body; // Expecting screen_number and seatRows from request body

    console.log("Received theaterId:", theaterId);
    console.log("Received screen_number:", screen_number);
    console.log("Received seatRows:", JSON.stringify(seatRows, null, 2)); // Log seatRows with formatting

    if (!theaterId || !screen_number || !seatRows) {
        console.log("Missing required fields");
        return res.status(400).json({ error: 'Missing required fields: theaterId, screen_number, seatRows' });
    }

    // Validate seatRows input to be an array and have expected structure
    if (!Array.isArray(seatRows)) {
        return res.status(400).json({ error: 'seatRows must be an array' });
    }
    for (const rowConfig of seatRows) {
        if (typeof rowConfig !== 'object' || !rowConfig.row_name || !rowConfig.seat_numbers || !rowConfig.seat_type || !rowConfig.price) {
            return res.status(400).json({ error: 'Each item in seatRows must be an object with properties: row_name, seat_numbers, seat_type, price' });
        }
        if (isNaN(parseFloat(rowConfig.price))) { // Only price needs to be validated as number here
             return res.status(400).json({ error: 'price must be a decimal number for each row' });
        }
        if (typeof rowConfig.seat_numbers !== 'string') {
            return res.status(400).json({ error: 'seat_numbers must be a comma-separated string' });
        }
    }


    try {
        // 1. Calculate total_seats from seatRows (based on seat_numbers provided)
        let total_seats = 0;
        for (const rowConfig of seatRows) {
            const seatNumbersArray = rowConfig.seat_numbers.split(',').map(s => s.trim()).filter(s => s !== "");
            total_seats += seatNumbersArray.length;
        }
        console.log("Calculated total_seats:", total_seats); // Log calculated total_seats

        // 2. Create the Screen - INCLUDE total_seats in INSERT query
        const [screenResult] = await db.query(
            'INSERT INTO screens (theater_id, screen_number, total_seats) VALUES (?, ?, ?)', // Added total_seats to query
            [theaterId, screen_number, total_seats] // Added total_seats value
        );
        const screen_id = screenResult.insertId;
        console.log("Screen created, screen_id:", screen_id);

         // 3. Create Seats based on seatRows configuration
         for (const rowConfig of seatRows) {
            const { row_name, seat_numbers, seat_type, price } = rowConfig;
            const seatNumbersArray = seat_numbers.split(',').map(s => s.trim()).filter(s => s !== ""); // Parse seat numbers string to array

            console.log(`Processing row: ${row_name}, seatNumbersArray: ${JSON.stringify(seatNumbersArray)}`); // Log seatNumbersArray

            for (const seat_number of seatNumbersArray) { // Iterate through seat numbers array
                console.log(`Creating seat: ${seat_number}, row: ${row_name}`); // Log seat creation

                // Construct the SQL query string and parameters
                const sqlQuery = `INSERT INTO seats (screen_id, \`seat_number\`, \`row\`, seat_type, price) VALUES (?, ?, ?, ?, ?)`; // Using template literals and backticks
                const queryParams = [screen_id, seat_number, row_name, seat_type, price];

                console.log("Executing SQL Query:", sqlQuery); // Log the raw SQL query
                console.log("Query Parameters:", queryParams);     // Log the parameters

                await db.query(sqlQuery, queryParams);

                console.log(`Seat created successfully: ${seat_number}, row: ${row_name}`); // Log seat creation success
            }
            console.log(`Row processing complete: ${row_name}`);
        }

        res.status(201).json({ message: 'Screen and seats created successfully', screen_id });
        console.log("Screen and seats creation successful, response sent");

    } catch (error) {
        console.error('Error creating screen and seats:', error);
        console.error("Detailed Error:", error);
        res.status(500).json({ error: 'Failed to create screen and seats', details: error.message });
        console.log("Error response sent");
    }
};

exports.deleteScreen = async (req, res) => {
    const { screenId } = req.params;

    if (!screenId) {
        return res.status(400).json({ error: 'Screen ID is required' });
    }

    try {
        // 1. Delete showtimes associated with the screen - IMPORTANT: Delete this FIRST
        await db.query('DELETE FROM showtimes WHERE screen_id = ?', [screenId]);

        // 2. Delete seats associated with the screen (now safe to delete seats as showtimes are gone)
        await db.query('DELETE FROM seats WHERE screen_id = ?', [screenId]);

        // 3. Delete the screen itself (now safe as no showtimes or seats are referencing it)
        const [result] = await db.query('DELETE FROM screens WHERE screen_id = ?', [screenId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Screen not found' });
        }

        res.json({ message: 'Screen deleted successfully' });

    } catch (error) {
        console.error('Error deleting screen:', error);
        res.status(500).json({ error: 'Failed to delete screen' });
    }
};

// --- ADD THESE CONTROLLER FUNCTIONS ---

exports.createTheater = async (req, res) => {
    console.log("createTheater controller function called"); // Placeholder log
    res.send("createTheater endpoint - To be implemented"); // Placeholder response
};

exports.updateTheater = async (req, res) => {
    console.log("updateTheater controller function called"); // Placeholder log
    res.send("updateTheater endpoint - To be implemented"); // Placeholder response
};

exports.deleteTheater = async (req, res) => {
    console.log("deleteTheater controller function called"); // Placeholder log
    res.send("deleteTheater endpoint - To be implemented"); // Placeholder response
};

exports.getCities = async (req, res) => {
    const sql = 'SELECT DISTINCT city FROM theaters';
    try {
        const [results] = await db.query(sql); // Use await and destructure results array
        const cities = results.map(row => row.city);
        res.json(cities);
    } catch (error) {
        console.error('Error fetching cities:', error);
        return res.status(500).json({ error: 'Failed to fetch cities' });
    }
};