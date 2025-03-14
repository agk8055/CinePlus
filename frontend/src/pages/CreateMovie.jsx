// frontend/src/pages/CreateMovie.jsx
import React, { useState } from 'react';
import api from '../api/api';
import './CreateMovie.css'; // We'll create this CSS file next

const CreateMovie = () => {
    const [title, setTitle] = useState('');
    const [genre, setGenre] = useState('');
    const [duration, setDuration] = useState('');
    const [releaseDate, setReleaseDate] = useState('');
    const [language, setLanguage] = useState('');
    const [description, setDescription] = useState('');
    const [posterUrl, setPosterUrl] = useState('');
    const [trailerUrl, setTrailerUrl] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        const movieData = {
            title,
            genre,
            duration,
            release_date: releaseDate, // match backend expected field name
            language,
            description,
            poster_url: posterUrl, // match backend expected field name
            trailer_url: trailerUrl  // match backend expected field name
        };

        try {
            const response = await api.post('/movies', movieData); // POST request to /api/v1/movies
            console.log('Movie created:', response.data);
            setSuccessMessage('Movie added successfully!');
            // Reset form fields after successful submission
            setTitle('');
            setGenre('');
            setDuration('');
            setReleaseDate('');
            setLanguage('');
            setDescription('');
            setPosterUrl('');
            setTrailerUrl('');
        } catch (error) {
            console.error('Error creating movie:', error.response ? error.response.data : error.message);
            if (error.response && error.response.data && error.response.data.errors) {
                // If backend sends validation errors
                const errorList = error.response.data.errors.map(err => err.msg).join(', ');
                setErrorMessage(`Movie creation failed. Validation errors: ${errorList}`);
            } else if (error.response && error.response.data && error.response.data.error) {
                // If backend sends a general error message
                setErrorMessage(error.response.data.error);
            }
             else {
                setErrorMessage('Failed to add movie. Please try again.');
            }
        }
    };

    return (
        <div className="create-movie-container">
            <h1>Add New Movie</h1>
            {successMessage && <p className="success-message">{successMessage}</p>}
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <form onSubmit={handleSubmit} className="create-movie-form">
                <div className="form-group">
                    <label htmlFor="title">Title:</label>
                    <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="genre">Genre:</label>
                    <input type="text" id="genre" value={genre} onChange={(e) => setGenre(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="duration">Duration (minutes):</label>
                    <input type="number" id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="releaseDate">Release Date:</label>
                    <input type="date" id="releaseDate" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="language">Language:</label>
                    <input type="text" id="language" value={language} onChange={(e) => setLanguage(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description:</label>
                    <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="posterUrl">Poster URL:</label>
                    <input type="url" id="posterUrl" value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="trailerUrl">Trailer URL:</label>
                    <input type="url" id="trailerUrl" value={trailerUrl} onChange={(e) => setTrailerUrl(e.target.value)} />
                </div>
                <button type="submit" className="submit-button">Add Movie</button>
            </form>
        </div>
    );
};

export default CreateMovie;