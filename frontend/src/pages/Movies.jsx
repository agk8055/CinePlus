import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

const Movies = () => {
  const [movies, setMovies] = useState([]);

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

  return (
    <div className="movies-page">
      <h2>Now Showing</h2>
      <div className="movie-grid">
        {movies.map(movie => (
          <div key={movie.movie_id} className="movie-card">
            <img src={movie.poster_url} alt={movie.title} />
            <div className="movie-info">
              <h3 className="movie-title">{movie.title}</h3>
              <p className="movie-genre">{movie.genre}</p>
              <Link to={`/movies/${movie.movie_id}`} className="btn-primary">Book Now</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Movies;