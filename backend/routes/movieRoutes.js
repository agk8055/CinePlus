const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const { body, validationResult } = require('express-validator');

// GET all movies
// Route: /api/v1/movies
router.get('/', movieController.getAllMovies);

// GET movies by search query
// Route: /api/v1/movies/search?query=
router.get('/search', movieController.searchMovies); // Define SEARCH route **FIRST**

// GET a single movie by ID
// Route: /api/v1/movies/:id
router.get('/:id', movieController.getMovieById); // Define GET BY ID route **SECOND**


// POST (Create) a new movie
// Route: /api/v1/movies
router.post(
    '/',
    [
        // Validation rules using express-validator
        body('title').notEmpty().withMessage('Title is required'),
        body('description').isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),
        body('genre').notEmpty().withMessage('Genre is required'),
        body('language').notEmpty().withMessage('Language is required'),
        body('poster_url').notEmpty().withMessage('Poster URL is required'),
        // ... other validation rules for other movie fields ...
    ],
    async (req, res, next) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() }); // 400 Bad Request - Validation errors
        }

        try {
            await movieController.createMovie(req, res);
        } catch (err) {
            next(err);
        }
    }
);

// PUT (Update) an existing movie by ID
// Route: /api/v1/movies/:id
router.put('/:id', movieController.updateMovie);

// DELETE a movie by ID
// Route: /api/v1/movies/:id
router.delete('/:id', movieController.deleteMovie);

module.exports = router;