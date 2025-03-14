// frontend/src/pages/TheaterList.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/api';
import './TheaterList.css';
import { useNavigate } from 'react-router-dom';

const TheaterList = () => {
    const [theaters, setTheaters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTheaters = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get('/theaters');
                setTheaters(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching theaters:', err);
                setError('Failed to load theaters.');
                setLoading(false);
            }
        };

        fetchTheaters();
    }, []);

    const handleAddScreenClick = (theaterId) => {
        navigate(`/admin/theaters/${theaterId}/create-screen`);
    };

    const handleModifyScreensClick = (theaterId) => {
        navigate(`/admin/theaters/${theaterId}/screens`); // Navigate to ScreenList page
    };


    if (loading) {
        return <p>Loading theaters...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div className="theater-list-container">
            <h2 className="theater-list-title">Theater List</h2>
            {theaters.length > 0 ? (
                <ul className="theaters-ul">
                    {theaters.map(theater => (
                        <li key={theater.theater_id} className="theater-list-item">
                            <div className="theater-info">
                                <h3 className="theater-name">{theater.name}</h3>
                                <p className="theater-location">{theater.location}, {theater.city}</p>
                            </div>
                            <div className="theater-actions">
                                <button className="modify-screens-button" onClick={() => handleModifyScreensClick(theater.theater_id)}>Modify Screens</button>
                                <button className="add-screen-button" onClick={() => handleAddScreenClick(theater.theater_id)}>Add Screen</button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No theaters found.</p>
            )}
        </div>
    );
};

export default TheaterList;