// frontend/src/pages/Home.jsx
import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import UserContext from '../context/UserContext'; // Import UserContext

const Home = () => {
    const [movies, setMovies] = useState([]);
    const { user, isAuthenticated } = useContext(UserContext); // Get user and isAuthenticated from context

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await api.get('/movies');
                console.log("Fetched Movies:", response.data);
                setMovies(response.data);
            } catch (error) {
                console.error("Error fetching movies:", error);
            }
        };

        fetchMovies();
    }, []);

    return (
        <div className="home-page">
            <h1>Welcome to CinePlus</h1>
            <p>Book your movie tickets in just a few clicks!</p>
            <Link to="/movies" className="btn-primary">Browse Movies</Link>

            {/* Conditionally render Admin Panel button */}
            {isAuthenticated && user && user.role === 'admin' && (
                <Link to="/admin" className="btn-primary" style={{ marginLeft: '1rem' }}>
                    Admin Panel
                </Link>
            )}

            {/* Display Featured Movies */}
            <h2>Featured Movies</h2>
            <div className="movie-grid">
                {movies.slice(0, 4).map((movie) => (
                    <div key={movie.movie_id} className="movie-card">
                        <img src={movie.poster_url} alt={movie.title} />
                        <div className="movie-info">
                            <h3 className="movie-title">{movie.title}</h3>
                            <p className="movie-genre">{movie.genre}</p>
                            <Link to={`/movies/${movie.movie_id}`} className="btn-primary">
                                Book Now
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;