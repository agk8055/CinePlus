import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieById } from "../api/api";
import "./MovieDetails.css";

const MovieDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                console.log('Fetching movie with ID:', id);
                const response = await getMovieById(id);
                console.log('Fetched movie:', response);
                setMovie(response);
            } catch (error) {
                console.error("Error fetching movie details:", error);
            }
        };

        fetchMovieDetails();
    }, [id]);

    if (!movie) return <div className="loading">Loading...</div>;

    const handleBookNow = () => {
        navigate(`/showtimes/${id}`);
    };

    const handleTrailerClick = () => {
        if (movie.trailer_url) {
            window.open(movie.trailer_url, '_blank');
        } else {
            alert('Trailer link not available for this movie.');
        }
    };

    return (
        <div className="movie-details-wrapper">
            {/* Content container - No more backdrop */}
            <div className="movie-details-content">
                <div className="movie-details-container">
                    <div className="movie-details-poster">
                        <img src={movie.poster_url} alt={movie.title} />
                        <button onClick={handleTrailerClick} className="trailer-button">
                            <span className="play-icon">▶</span> Trailer
                        </button>
                    </div>

                    <div className="movie-details-info">


                        <h2 className="movie-details-title">{movie.title}</h2>

                        <div className="movie-details-format">
                            <span className="format-pill">2D</span>
                            <span className="format-pill">{movie.language}</span>
                            {movie.rating && <span className="format-pill age-rating">{movie.rating}</span>}
                        </div>

                        <div className="movie-details-misc">
                            <span>{movie.duration}m</span>
                            <span className="dot-separator">•</span>
                            <span>{movie.genre}</span>
                            <span className="dot-separator">•</span>
                            <span>{new Date(movie.release_date).toLocaleDateString(
                                "en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                }
                            )}</span>
                        </div>

                        <button className="book-tickets-button" onClick={handleBookNow}>
                            Book tickets
                        </button>
                    </div>
                </div>

                <div className="movie-details-about">
                    <h3>About the movie</h3>
                    <p>{movie.description}</p>
                </div>
            </div>
        </div>
    );
};

export default MovieDetails;