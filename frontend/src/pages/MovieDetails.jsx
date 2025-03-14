import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getMovieById } from "../api/api";

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await getMovieById(id);
        setMovie(response);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    };

    fetchMovieDetails();
  }, [id]);

  if (!movie) return <div className="loading">Loading...</div>;

  const handleBookNow = () => {
    navigate(`/showtimes/${id}`); // Redirect to the new showtimes page
  };

  const handleTrailerClick = () => {
    if (movie.trailer_url) {
      window.open(movie.trailer_url, '_blank'); // Opens trailer in new tab
    } else {
      alert('Trailer link not available for this movie.'); // Optional: Handle no trailer link
    }
  };

  return (
    <div className="movie-details-container">
      <div className="movie-details-poster">
        <img src={movie.poster_url} alt={movie.title} />
        <button onClick= {handleTrailerClick}  className="trailer-button">
          ▶ Trailer
        </button>
      </div>

      <div className="movie-details-info">
        <h2 className="movie-details-title">{movie.title}</h2>

        <div className="movie-details-rating">
          <span className="rating-star">★</span>
          <span>{movie.rating}/10</span>
          <span>({/* Add your logic to fetch vote count */}) </span>
          <button className="rate-now-button">Rate now</button>
        </div>

        <div className="movie-details-format">
          <span className="format-2d">2D</span>
          <span className="format-language">{movie.language}</span>
        </div>

        <div className="movie-details-misc">
          <span>{movie.duration}m</span>
          <span> • </span>
          <span>{movie.genre}</span>
          <span> • </span>
          <span>UA</span> 
          <span> • </span>
          <span>{new Date(movie.release_date).toLocaleDateString()}</span>
        </div>

        <button className="book-tickets-button" onClick={handleBookNow}>
          Book tickets
        </button>
      </div>

      <div className="movie-details-about">
        <h3>About the movie</h3>
        <p>{movie.description}</p>
      </div>
    </div>
  );
};

export default MovieDetails;