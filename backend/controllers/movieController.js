const pool = require('../config/db');

// Get all movies from the database
exports.getAllMovies = async (req, res, next) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [movies] = await connection.query('SELECT * FROM movies');
        res.status(200).json(movies);
    } catch (error) {
        console.error('Error fetching movies:', error);
        next(error); // Pass the error to the error-handling middleware
    } finally {
        if (connection) connection.release();
    }
};

// Get a single movie by ID
exports.getMovieById = async (req, res, next) => {
    let connection;
    try {
        const { id } = req.params;

        // Validate that 'id' is an integer
        if (!Number.isInteger(Number(id))) {
            const error = new Error('Invalid movie ID');
            error.statusCode = 400; // Bad Request
            throw error;
        }

        connection = await pool.getConnection();
        const [movie] = await connection.query('SELECT * FROM movies WHERE movie_id = ?', [id]);

        if (movie.length === 0) {
            const error = new Error('Movie not found');
            error.statusCode = 404; // Not Found
            throw error;
        }

        res.status(200).json(movie[0]);
    } catch (error) {
        console.error('Error fetching movie:', error);
        next(error); // Pass the error to the error-handling middleware
    } finally {
        if (connection) connection.release();
    }
};

// Search movies by title
exports.searchMovies = async (req, res, next) => {
    let connection;
    try {
        const { query } = req.query; // Get the search query from the request query parameters

        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        connection = await pool.getConnection();
        // Use LIKE to search for movies where the title contains the query string (case-insensitive)
        const [movies] = await connection.query(
            'SELECT movie_id, title FROM movies WHERE title LIKE ?',
            [`%${query}%`] // %query% for "contains" search
        );

        res.status(200).json(movies);
    } catch (error) {
        console.error('Error searching movies:', error);
        next(error);
    } finally {
        if (connection) connection.release();
    }
};


// Create a new movie
exports.createMovie = async (req, res, next) => {
    let connection;
    try {
        const { title, description, genre, language, poster_url, release_date, duration, rating, trailer_url } = req.body;
        connection = await pool.getConnection();

        const [result] = await connection.query(
            'INSERT INTO movies (title, description, genre, language, poster_url, release_date, duration, rating, trailer_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, description, genre, language, poster_url, release_date, duration, rating, trailer_url]
        );
        res.status(201).json({ message: 'Movie created successfully', movieId: result.insertId });
    } catch (error) {
        console.error('Error creating movie:', error);
        next(error);
    } finally {
        if (connection) connection.release();
    }
};

// Update an existing movie
exports.updateMovie = async (req, res, next) => {
    let connection;
    try {
        const { id } = req.params;
        const { title, description, genre, language, poster_url, release_date, duration, rating } = req.body;
        connection = await pool.getConnection();

        const [result] = await connection.query(
            'UPDATE movies SET title = ?, description = ?, genre = ?, language = ?, poster_url = ?, release_date = ?, duration = ?, rating = ? WHERE movie_id = ?',
            [title, description, genre, language, poster_url, release_date, duration, rating, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Movie not found' });
        }

        res.status(200).json({ message: 'Movie updated successfully' });
    } catch (error) {
        console.error('Error updating movie:', error);
        next(error);
    } finally {
        if (connection) connection.release();
    }
};

// Delete a movie
exports.deleteMovie = async (req, res, next) => {
    let connection;
    try {
        const { id } = req.params;
        connection = await pool.getConnection();

        // First, delete all booked seats related to bookings for this movie's showtimes
        await connection.query(
            'DELETE booked_seats FROM booked_seats ' +
            'INNER JOIN bookings ON booked_seats.booking_id = bookings.booking_id ' +
            'INNER JOIN showtimes ON bookings.showtime_id = showtimes.showtime_id ' +
            'WHERE showtimes.movie_id = ?',
            [id]
        );

        // Then delete all bookings related to showtimes of this movie
        await connection.query(
            'DELETE bookings FROM bookings ' +
            'INNER JOIN showtimes ON bookings.showtime_id = showtimes.showtime_id ' +
            'WHERE showtimes.movie_id = ?',
            [id]
        );

        // Then delete all showtimes that reference this movie
        await connection.query('DELETE FROM showtimes WHERE movie_id = ?', [id]);

        // Finally, delete the movie itself
        const [result] = await connection.query('DELETE FROM movies WHERE movie_id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Movie not found' });
        }

        res.status(200).json({ message: 'Movie deleted successfully' });
    } catch (error) {
        console.error('Error deleting movie:', error);
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({
                error: 'Cannot delete movie because there are existing bookings or booked seats that reference it. ' +
                       'Please delete or update the bookings and booked seats first.'
            });
        }
        next(error);
    } finally {
        if (connection) connection.release();
    }
};