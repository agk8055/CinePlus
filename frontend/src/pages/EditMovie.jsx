import React, { useState, useEffect } from 'react';
import api from '../api/api';
import './CreateMovie.css'; // Reuse existing CSS

const EditMovie = () => {
    const [movies, setMovies] = useState([]);
    const [selectedMovieId, setSelectedMovieId] = useState('');
    const [title, setTitle] = useState('');
    const [genre, setGenre] = useState('');
    const [duration, setDuration] = useState(''); // Initialize as string
    const [releaseDate, setReleaseDate] = useState('');
    const [language, setLanguage] = useState('');
    const [description, setDescription] = useState('');
    const [posterUrl, setPosterUrl] = useState('');
    const [trailerUrl, setTrailerUrl] = useState('');
    const [rating, setRating] = useState(''); // Initialize as string
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await api.get('/movies');
                setMovies(response.data);
            } catch (error) {
                console.error('Error fetching movies:', error);
            }
        };

        fetchMovies();
    }, []);

    useEffect(() => {
        if (selectedMovieId) {
            const movie = movies.find(movie => movie.movie_id === parseInt(selectedMovieId));
            if (movie) {
                setTitle(movie.title || '');
                setGenre(movie.genre || '');
                setDuration(movie.duration.toString() || '');
                
                // Convert release_date to ISO format if needed
                const releaseDateValue = movie.release_date 
                    ? new Date(movie.release_date).toISOString().split('T')[0] 
                    : '';
                setReleaseDate(releaseDateValue);

                setLanguage(movie.language || '');
                setDescription(movie.description || '');
                setPosterUrl(movie.poster_url || '');
                setTrailerUrl(movie.trailer_url || '');
                setRating(movie.rating || ''); // Ensure rating is a string
            }
        }
    }, [selectedMovieId, movies]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        const movieData = {
            title,
            genre,
            duration: parseInt(duration), // Convert to number
            release_date: releaseDate,
            language,
            rating,
            description,
            poster_url: posterUrl,
            trailer_url: trailerUrl
        };

        try {
            const response = await api.put(`/movies/${selectedMovieId}`, movieData);
            console.log('Movie updated:', response.data);
            setSuccessMessage('Movie updated successfully!');
        } catch (error) {
            console.error('Error updating movie:', error);
            setErrorMessage('Failed to update movie. Please try again.');
        }
    };

    return (
        <div className="create-movie-container">
            <h1>Edit Movie</h1>
            {successMessage && <p className="success-message">{successMessage}</p>}
            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <div className="movie-selection">
                <label htmlFor="movieSelect">Select Movie to Edit:</label>
                <select 
                    id="movieSelect" 
                    value={selectedMovieId}
                    onChange={(e) => setSelectedMovieId(e.target.value)}
                    required
                >
                    <option value="">Select a movie</option>
                    {movies.map(movie => (
                        <option key={movie.movie_id} value={movie.movie_id}>
                            {movie.title} ({movie.release_date})
                        </option>
                    ))}
                </select>
            </div>

            {selectedMovieId && (
                <form onSubmit={handleSubmit} className="create-movie-form">
                    <div className="form-group">
                        <label htmlFor="title">Title:</label>
                        <input 
                            type="text" 
                            id="title" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="genre">Genre:</label>
                        <input 
                            type="text" 
                            id="genre" 
                            value={genre} 
                            onChange={(e) => setGenre(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="duration">Duration (minutes):</label>
                        <input 
                            type="number" 
                            id="duration" 
                            value={duration} 
                            onChange={(e) => setDuration(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="releaseDate">Release Date:</label>
                        <input 
                            type="date" 
                            id="releaseDate" 
                            value={releaseDate} 
                            onChange={(e) => setReleaseDate(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="language">Language:</label>
                        <input 
                            type="text" 
                            id="language" 
                            value={language} 
                            onChange={(e) => setLanguage(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="rating">Rating:</label>
                        <select 
                            id="rating" 
                            value={rating} 
                            onChange={(e) => setRating(e.target.value)} 
                            required
                        >
                            <option value="">Select a rating</option>
                            <option value="U">U</option>
                            <option value="UA">UA</option>
                            <option value="A">A</option>
                            <option value="S">S</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description:</label>
                        <textarea 
                            id="description" 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="posterUrl">Poster URL:</label>
                        <input 
                            type="url" 
                            id="posterUrl" 
                            value={posterUrl} 
                            onChange={(e) => setPosterUrl(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="trailerUrl">Trailer URL:</label>
                        <input 
                            type="url" 
                            id="trailerUrl" 
                            value={trailerUrl} 
                            onChange={(e) => setTrailerUrl(e.target.value)} 
                        />
                    </div>
                    <button type="submit" className="submit-button">Update Movie</button>
                </form>
            )}
        </div>
    );
};

export default EditMovie;