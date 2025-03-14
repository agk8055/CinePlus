// backend/controllers/theaterController.js
const db = require('../config/db');

exports.getAllTheaters = async (req, res) => {
    try {
        let query = 'SELECT * FROM theaters';
        let queryParams = [];

        if (req.user && req.user.role === 'theatre_admin') {
            query = 'SELECT * FROM theaters WHERE user_id = ?'; // Filter by user_id for theatre_admin
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



exports.createScreen = async (req, res) => {
    console.log("createScreen controller function called");
    const { theaterId } = req.params;
    const { screen_number, seatRows } = req.body; // Expecting screen_number and seatRows from request body

    console.log("Received theaterId:", theaterId);
    console.log("Received screen_number:", screen_number);
    console.log("Received seatRows:", seatRows);

    if (!theaterId || !screen_number || !seatRows) {
        console.log("Missing required fields");
        return res.status(400).json({ error: 'Missing required fields: theaterId, screen_number, seatRows' });
    }

    try {
        // 1. Calculate total_seats from seatRows
        let total_seats = 0;
        for (const rowConfig of seatRows) {
            total_seats += parseInt(rowConfig.seat_count, 10); // Sum up seat_count for each row
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
            const { row_name, seat_count, seat_type, price } = rowConfig;
            console.log("Processing row:", row_name, "config:", rowConfig);
            for (let seat_number = 1; seat_number <= seat_count; seat_number++) {
                console.log("Creating seat:", seat_number, "in row:", row_name);

                // Construct the SQL query string and parameters
                const sqlQuery = `INSERT INTO seats (screen_id, seat_number, \`row\`, seat_type, price) VALUES (?, ?, ?, ?, ?)`; // Using template literals and backticks
                const queryParams = [screen_id, seat_number, row_name, seat_type, price];

                console.log("Executing SQL Query:", sqlQuery); // Log the raw SQL query
                console.log("Query Parameters:", queryParams);     // Log the parameters

                await db.query(sqlQuery, queryParams);

                console.log("Seat created successfully:", seat_number, "in row:", row_name);
            }
            console.log("Row processing complete:", row_name);
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
        // 1. Delete seats associated with the screen (important to do this first to avoid foreign key issues)
        await db.query('DELETE FROM seats WHERE screen_id = ?', [screenId]);

        // 2. Delete the screen itself
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