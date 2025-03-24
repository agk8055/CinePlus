import React, { useState, useEffect } from 'react';
import api from '../api/api';
import './CreateMovie.css'; // Reuse existing CSS

const DeleteMovie = () => {
    const [movies, setMovies] = useState([]);
    const [selectedMovieId, setSelectedMovieId] = useState('');
    const [selectedMovieTitle, setSelectedMovieTitle] = useState('');
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
                setSelectedMovieTitle(movie.title);
            }
        }
    }, [selectedMovieId, movies]);

    const handleDelete = async () => {
        setErrorMessage('');
        setSuccessMessage('');

        try {
            await api.delete(`/movies/${selectedMovieId}`);
            console.log('Movie deleted successfully');
            setSuccessMessage(`Movie "${selectedMovieTitle}" deleted successfully!`);
            setSelectedMovieId('');
            setSelectedMovieTitle('');
        } catch (error) {
            console.error('Error deleting movie:', error);
            setErrorMessage('Failed to delete movie. Please try again.');
        }
    };

    return (
        <div className="create-movie-container">
            <h1>Delete Movie</h1>
            {successMessage && <p className="success-message">{successMessage}</p>}
            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <div className="movie-selection">
                <label htmlFor="movieSelect">Select Movie to Delete:</label>
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
                <div>
                    <h3>Are you sure you want to delete "{selectedMovieTitle}"?</h3>
                    <button onClick={handleDelete} className="submit-button">Confirm Delete</button>
                </div>
            )}
        </div>
    );
};

export default DeleteMovie;