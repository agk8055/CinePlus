// frontend/src/pages/DeleteShow.jsx
import React, { useState, useEffect, useContext } from 'react';
import api from '../api/api';
import { UserContext } from '../context/UserContext';
import './DeleteShow.css'; // Create DeleteShow.css for styling

const DeleteShow = () => {
    const [showtimes, setShowtimes] = useState([]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { user } = useContext(UserContext);

    useEffect(() => {
        const fetchShowtimes = async () => {
            setError('');
            setSuccessMessage('');
            try {
                // --- Removed hardcoded theaterId from URL ---
                const response = await api.get(`/showtimes/theaters`); // Call /showtimes/theaters - backend will handle auth user's theater
                setShowtimes(response.data);
            } catch (err) {
                console.error('Error fetching showtimes:', err);
                setError(err.response?.data?.error || 'Failed to load showtimes.');
                setShowtimes([]);
            }
        };

        fetchShowtimes();
    }, []);

    const handleDeleteShow = async (showtimeId) => {
        setError('');
        setSuccessMessage('');
        const confirmDelete = window.confirm('Are you sure you want to delete this show?');
        if (!confirmDelete) {
            return;
        }

        try {
            const response = await api.delete(`/showtimes/${showtimeId}`);
            if (response.status === 200) {
                setSuccessMessage(response.data.message);
                // Update showtimes list by filtering out the deleted showtime
                setShowtimes(showtimes.filter(show => show.showtime_id !== showtimeId));
            } else {
                setError(`Failed to delete show. Status: ${response.status}`);
            }
        } catch (err) {
            console.error('Error deleting showtime:', err);
            setError(err.response?.data?.error || 'Failed to delete showtime.');
        }
    };

    if (error) {
        return <div className="delete-show-container error">{error}</div>;
    }

    return (
        <div className="delete-show-container">
            <h2 className="delete-show-title">Delete Show</h2>
            {successMessage && <p className="success-message">{successMessage}</p>}
            {showtimes.length === 0 && !error ? (
                <p>No shows available for your theater.</p>
            ) : (
                <ul className="showtime-list">
                    {showtimes.map(showtime => (
                        <li key={showtime.showtime_id} className="showtime-item">
                            <div className="show-details">
                                <p><strong>Movie:</strong> {showtime.movie_title}</p>
                                <p><strong>Screen:</strong> {showtime.screen_number}</p>
                                <p><strong>Time:</strong> {new Date(showtime.start_time).toLocaleString()}</p>
                                <p><strong>Language:</strong> {showtime.language}</p>
                            </div>
                            <button
                                className="delete-button"
                                onClick={() => handleDeleteShow(showtime.showtime_id)}
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DeleteShow;