const pool = require('../config/db');

// Get all movies
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

// Get movie by ID
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

//Create a new movie (add your logic here)
exports.createMovie = async (req, res, next) => {
  let connection;
  try {
    const { title, description, genre, language, poster_url, release_date, duration, rating, trailer_url } = req.body; // Include trailer_url from req.body
    connection = await pool.getConnection();

    // Perform the database insertion - INCLUDE trailer_url in both columns and values
    const [result] = await connection.query(
      'INSERT INTO movies (title, description, genre, language, poster_url, release_date, duration, rating, trailer_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, genre, language, poster_url, release_date, duration, rating, trailer_url] // Include trailer_url value
    );
    res.status(201).json({ message: 'Movie created successfully', movieId: result.insertId });

  } catch (error) {
    console.error('Error creating movie:', error);
    next(error); // Pass the error to the error-handling middleware
  } finally {
    if (connection) connection.release();
  }
};

// Update an existing movie (add your logic here)
exports.updateMovie = async (req, res, next) => {
  let connection;
    try {
        const { id } = req.params;
        const { title, description, genre, language, poster_url, release_date, duration, rating } = req.body;
        connection = await pool.getConnection();

        // Perform the database update
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

// Delete a movie (add your logic here)
exports.deleteMovie = async (req, res, next) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();

    // Perform the database deletion
    const [result] = await connection.query('DELETE FROM movies WHERE movie_id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.status(200).json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    next(error);
  } finally {
    if (connection) connection.release();
  }
};