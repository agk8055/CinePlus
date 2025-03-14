// frontend/src/components/MovieCard.jsx
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
  return (
    <div className="movie-card">
      <img src={movie.poster_url} alt={movie.title} />
      <h3>{movie.title}</h3>
      <p>{movie.genre}</p>
      <Link to={`/movies/${Number(movie.movie_id)}`} className="btn">  {/* Cast to Number in Link */}
        Book Now
      </Link>
    </div>
  );
};

export default MovieCard;