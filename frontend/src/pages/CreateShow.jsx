// frontend/src/pages/CreateShow.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/api';
import './CreateShow.css'; // Import CSS for styling

const CreateShow = () => {
    const [movies, setMovies] = useState([]);
    const [theaters, setTheaters] = useState([]);
    const [screens, setScreens] = useState([]);
    const [movieId, setMovieId] = useState('');
    const [theaterId, setTheaterId] = useState('');
    const [screenId, setScreenId] = useState('');
    const [showTime, setShowTime] = useState('');
    const [language, setLanguage] = useState('');
    const [error, setError] = useState('');
    const [movieLanguages, setMovieLanguages] = useState([]); // To store languages of selected movie

    useEffect(() => {
        // Fetch movies for dropdown
        const fetchMovies = async () => {
            try {
                const response = await api.get('/movies'); // Assuming your backend movie route is /movies
                setMovies(response.data);
            } catch (err) {
                console.error('Error fetching movies:', err);
                setError('Failed to load movies.');
            }
        };

        // Fetch theaters for dropdown
        const fetchTheaters = async () => {
            try {
                const response = await api.get('/theaters'); // Assuming your backend theater route is /theaters
                setTheaters(response.data);
            } catch (err) {
                console.error('Error fetching theaters:', err);
                setError('Failed to load theaters.');
            }
        };

        fetchMovies();
        fetchTheaters();
    }, []);

    useEffect(() => {
        // Fetch screens when theaterId changes
        const fetchScreens = async () => {
            if (theaterId) {
                try {
                    const response = await api.get(`/theaters/${theaterId}/screens`); // Assuming route to get screens by theater ID
                    setScreens(response.data);
                } catch (err) {
                    console.error('Error fetching screens:', err);
                    setError('Failed to load screens for this theater.');
                    setScreens([]); // Clear screens on error
                }
            } else {
                setScreens([]); // Clear screens if no theater selected
            }
        };

        fetchScreens();
    }, [theaterId]);

    useEffect(() => {
        // Set movie languages when movieId changes
        const setLanguagesForMovie = () => {
            if (movieId) {
                const selectedMovie = movies.find(movie => movie.movie_id === parseInt(movieId));
                if (selectedMovie && selectedMovie.language) { // Assuming language is stored as a comma-separated string or array in movie data
                    const languagesArray = selectedMovie.language.split(',').map(lang => lang.trim()); // Split comma-separated languages into array
                    setMovieLanguages(languagesArray);
                    if (languagesArray.length > 0) {
                        setLanguage(languagesArray[0]); // Default to first language
                    } else {
                        setLanguage(''); // No language available
                    }
                } else {
                    setMovieLanguages([]);
                    setLanguage('');
                }
            } else {
                setMovieLanguages([]);
                setLanguage('');
            }
        };
        setLanguagesForMovie();
    }, [movieId, movies]);



    const handleSubmit = async (e) => {
      e.preventDefault();
      setError(''); // Clear previous errors
      if (!movieId || !theaterId || !screenId || !showTime || !language) {
          setError('Please fill in all fields.');
          return;
      }
  
      try {
          // --- Send the entire showTime value as start_time ---
          const response = await api.post(`/showtimes/screens/${screenId}`, {
              movie_id: movieId,
              screen_id: screenId,
              start_time: showTime, // Send the complete datetime value from datetime-local
              language: language,
          });
          console.log('Show created:', response.data);
          alert('Show created successfully!');
          // Reset form or redirect as needed
          setMovieId('');
          setTheaterId('');
          setScreenId('');
          setShowTime('');
          setLanguage('');
      } catch (err) {
          setError(err.response?.data?.error || 'Failed to create show');
          console.error('Error creating show:', err);
      }
  };
  


    return (
        <div className="create-show-container">
            <h2 className="create-show-title">Create Show</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit} className="create-show-form">
                <div className="form-group">
                    <label htmlFor="movie">Movie:</label>
                    <select id="movie" value={movieId} onChange={(e) => setMovieId(e.target.value)} required>
                        <option value="">Select Movie</option>
                        {movies.map((movie) => (
                            <option key={movie.movie_id} value={movie.movie_id}>{movie.title}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="theater">Theater:</label>
                    <select id="theater" value={theaterId} onChange={(e) => setTheaterId(e.target.value)} required>
                        <option value="">Select Theater</option>
                        {theaters.map((theater) => (
                            <option key={theater.theater_id} value={theater.theater_id}>{theater.name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="screen">Screen:</label>
                    <select id="screen" value={screenId} onChange={(e) => setScreenId(e.target.value)} required disabled={!theaterId}>
                        <option value="">Select Screen</option>
                        {screens.map((screen) => (
                            <option key={screen.screen_id} value={screen.screen_id}>{`Screen ${screen.screen_number}`}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="language">Language:</label>
                    <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)} required disabled={movieLanguages.length <= 1}>
                        {movieLanguages.map((lang, index) => (
                            <option key={index} value={lang}>{lang}</option>
                        ))}
                    </select>
                    {movieLanguages.length <= 1 && movieId && (<p className="form-info">Language automatically set based on movie.</p>)}
                    {!movieId && (<p className="form-info">Select a movie to see available languages.</p>)}

                </div>


                <div className="form-group">
                    <label htmlFor="showTime">Show Time:</label>
                    <input
                        type="datetime-local"
                        id="showTime"
                        value={showTime}
                        onChange={(e) => setShowTime(e.target.value)}
                        required
                    />
                </div>

                {/* Price input removed */}

                <button type="submit" className="submit-button">Create Show</button>
            </form>
        </div>
    );
};

export default CreateShow;