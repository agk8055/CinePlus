// src/pages/Showtimes.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getShowtimesByMovie, getMovieById } from "../api/api";
import { useCity } from "../context/CityContext";
import Filter from "../components/Filter";
import "./Showtimes.css";

const Showtimes = () => {
    const { id: movieId } = useParams();
    const { selectedCity } = useCity();
    const [showtimes, setShowtimes] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [movieDetails, setMovieDetails] = useState(null);
    const [filters, setFilters] = useState({});
    const [availableLanguages, setAvailableLanguages] = useState([]); // State for available languages


    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                const response = await getMovieById(movieId);
                setMovieDetails(response);
                // No need to extract language from movieDetails here anymore.
            } catch (error) {
                console.error("Error fetching movie details:", error);
            }
        };

        const fetchShowtimesAndLanguages = async () => { // Combined function name
            if (selectedCity) {
                try {
                    const response = await getShowtimesByMovie(movieId, selectedCity, selectedDate, filters);
                    console.log("API Response:", response); // ADD THIS LINE - Debugging log

                    if (response && response.showtimes) { // Check if response and response.showtimes are defined
                        setShowtimes(response.showtimes); // Access showtimes from response object
                    } else {
                        setShowtimes([]); // Set showtimes to empty array if response or response.showtimes is missing
                        console.error("API response is missing 'showtimes' property or response is undefined:", response); // Log if showtimes is missing
                    }
                    if (response && response.availableLanguages) {
                        setAvailableLanguages(response.availableLanguages); // Access availableLanguages from response
                    } else {
                        setAvailableLanguages([]); // Set availableLanguages to empty array if missing
                        console.error("API response is missing 'availableLanguages' property or response is undefined:", response); // Log if availableLanguages is missing
                    }

                } catch (error) {
                    console.error("Error fetching showtimes:", error);
                    setShowtimes([]); // Set showtimes to empty array on error as well
                    setAvailableLanguages([]); // Clear languages on error too
                }
            } else {
                setShowtimes([]); // Clear showtimes if no city selected
                setAvailableLanguages([]); // Clear languages if no city selected
            }
        };

        fetchMovieDetails();
        fetchShowtimesAndLanguages(); // Call combined function
    }, [movieId, selectedCity, selectedDate, filters]);


    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const handleFilterChange = (newFilters) => {
        console.log("Filters updated in Showtimes:", newFilters);
        setFilters(newFilters);
    };

    // Group showtimes by theater
    const groupedShowtimes = {};
    showtimes.forEach(showtime => { // Line 58 is here
        if (!groupedShowtimes[showtime.theater_name]) {
            groupedShowtimes[showtime.theater_name] = [];
        }
        groupedShowtimes[showtime.theater_name].push(showtime);
    });

    // Function to generate an array of dates (e.g., 10 days from today)
    const generateDateRange = (startDate, days) => {
        const dates = [];
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    };

    const today = new Date();
    const dateRange = generateDateRange(today, 10); // Generate 10 days from today

    return (
        <div className="showtimes-container">
            {movieDetails && (
                <div className="movie-header">
                    <h2>{movieDetails.title} </h2>
                    <p className="genre">{movieDetails.genre.toUpperCase()}</p>
                </div>
            )}
            <div className="date-selector">
                {dateRange.map(date => {
                    const dateObj = new Date(date);
                    const day = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                    const dayOfMonth = dateObj.getDate();
                    const month = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

                    return (
                        <button
                            key={date}
                            className={`date-button ${selectedDate === date ? 'active' : ''}`}
                            onClick={() => handleDateChange(date)}
                        >
                            <span className="day">{day}</span>
                            <span className="day-month">{dayOfMonth} {month}</span>
                        </button>
                    );
                })}
            </div>

            <Filter onFilterChange={handleFilterChange} availableLanguages={availableLanguages} />

            <div className="showtimes-list">
                {Object.keys(groupedShowtimes).map(theaterName => (
                    <div key={theaterName} className="theater-card">
                        <div className="theater-info">
                            <span className="heart-icon">♡</span>
                            <h3>{theaterName}</h3>
                            {/* Placeholder for an info icon */}
                            <button className="info-button">INFO</button>
                        </div>
                        <div className="amenities">
                            <span className="amenity-icon">🍿</span>
                            Food & Beverage
                        </div>

                        <div className="showtime-buttons">
                            {groupedShowtimes[theaterName].map(showtime => {
                                const startTime = new Date(showtime.start_time);
                                const timeString = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });


                                return (
                                    <Link
                                        key={showtime.showtime_id}
                                        to={`/booking/screen/${showtime.screen_id}/showtime/${showtime.showtime_id}`}
                                        className="showtime-button"
                                    >
                                        {timeString}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Showtimes;