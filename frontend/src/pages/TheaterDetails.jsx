// src/pages/TheaterDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getTheaterDetails, getShowtimesByTheater } from "../api/api"; // Import new API functions
import { useCity } from "../context/CityContext";
import Filter from "../components/Filter"; // You might need a filter, or remove if not needed
import "./TheaterDetails.css"; // Importing TheaterDetails.css instead of Showtimes.css

const TheaterDetails = () => {
    const { theaterId } = useParams();
    const { selectedCity } = useCity(); // You might use city context if needed for filtering or display
    const [theaterDetails, setTheaterDetails] = useState(null);
    const [showtimes, setShowtimes] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [filters, setFilters] = useState({});
    const [availableLanguages, setAvailableLanguages] = useState([]); // State for available languages - adapt if needed for theater showtimes

    useEffect(() => {
        const fetchTheaterData = async () => {
            try {
                const details = await getTheaterDetails(theaterId);
                setTheaterDetails(details);
            } catch (error) {
                console.error("Error fetching theater details:", error);
            }
        };

        const fetchShowtimesForTheater = async () => {
            try {
                const response = await getShowtimesByTheater(theaterId, selectedDate);
                if (response && response.showtimes) {
                    setShowtimes(response.showtimes);
                    // Extract available languages from showtimes if needed for theater-specific filtering
                    const languages = [...new Set(response.showtimes.map(st => st.show_language).filter(lang => lang))];
                    setAvailableLanguages(languages);
                } else {
                    setShowtimes([]);
                    setAvailableLanguages([]);
                    console.error("No showtimes or invalid response for theater:", theaterId);
                }
            } catch (error) {
                console.error("Error fetching showtimes for theater:", error);
                setShowtimes([]);
                setAvailableLanguages([]);
            }
        };

        fetchTheaterData();
        fetchShowtimesForTheater();
    }, [theaterId, selectedDate]);

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const handleFilterChange = (newFilters) => {
        console.log("Filters updated in TheaterDetails:", newFilters);
        setFilters(newFilters);
    };

    if (!theaterDetails) {
        return <div className="loading">Loading Theater Details...</div>;
    }

    // Group showtimes by movie title
    const groupedShowtimesByMovie = {};
    showtimes.forEach(showtime => {
        if (!groupedShowtimesByMovie[showtime.movie_title]) {
            groupedShowtimesByMovie[showtime.movie_title] = [];
        }
        groupedShowtimesByMovie[showtime.movie_title].push(showtime);
    });


    // Function to generate an array of dates (e.g., 10 days from today) - Same as in Showtimes.jsx
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
        <div className="theater-details-container"> {/* Updated container class name */}
            <div className="theater-details-header"> {/* Updated header class name */}
                <h2>{theaterDetails.name}</h2>
                <p className="theater-details-genre">{theaterDetails.location}, {theaterDetails.city}</p> {/* Updated genre class name */}
            </div>
            <div className="theater-details-date-selector"> {/* Updated date selector class name */}
                {dateRange.map(date => {
                    const dateObj = new Date(date);
                    const day = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                    const dayOfMonth = dateObj.getDate();
                    const month = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

                    return (
                        <button
                            key={date}
                            className={`theater-details-date-button ${selectedDate === date ? 'active' : ''}`}
                            onClick={() => handleDateChange(date)}
                        >
                            <span className="theater-details-day">{day}</span> {/* Updated day class name */}
                            <span className="theater-details-day-month">{dayOfMonth} {month}</span> {/* Updated day-month class name */}
                        </button>
                    );
                })}
            </div>

            {/* You might want to adapt or remove Filter component as per Theater Details page needs */}
            {availableLanguages.length > 0 && <Filter onFilterChange={handleFilterChange} availableLanguages={availableLanguages} />}

            <div className="theater-details-showtimes-list"> {/* Updated showtimes list class name */}
                {Object.keys(groupedShowtimesByMovie).map(movieTitle => (
                    <div key={movieTitle} className="theater-details-movie-card"> {/* Updated movie card class name */}
                        <div className="theater-details-movie-info"> {/* Updated movie info class name */}
                            <span className="theater-details-heart-icon">♡</span> {/* Updated heart icon class name */}
                            <h3>{movieTitle}</h3> {/* Movie title here */}
                            {/* <button className="info-button">INFO</button> */} {/* Info button - decide if needed */}
                        </div>
                        {/* <div className="amenities">  Amenity section - decide if needed
                            <span className="amenity-icon">🍿</span>
                            Food & Beverage
                        </div> */}

                        <div className="theater-details-showtime-buttons"> {/* Updated showtime buttons class name */}
                            {groupedShowtimesByMovie[movieTitle].map(showtime => {
                                const startTime = new Date(showtime.start_time);
                                const timeString = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                return (
                                    <Link
                                        key={showtime.showtime_id}
                                        to={`/booking/screen/${showtime.screen_id}/showtime/${showtime.showtime_id}`}
                                        className="theater-details-showtime-button" // Updated showtime button class name
                                    >
                                        {timeString} {/* Removed language display here */}
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

export default TheaterDetails;