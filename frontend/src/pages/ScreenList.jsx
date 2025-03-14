// frontend/src/pages/ScreenList.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useParams, useNavigate } from 'react-router-dom';
import './ScreenList.css'; // Create ScreenList.css for styling

const ScreenList = () => {
    const { theaterId } = useParams(); // Get theaterId from URL params
    const [screens, setScreens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchScreens = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`/theaters/${theaterId}/screens`);
                setScreens(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching screens:', err);
                setError('Failed to load screens.');
                setLoading(false);
            }
        };

        fetchScreens();
    }, [theaterId]); // Re-fetch screens when theaterId changes

    const handleDeleteScreen = async (screenId) => {
        if (window.confirm('Are you sure you want to delete this screen?')) {
            try {
                await api.delete(`/theaters/screens/${screenId}`);
                alert('Screen deleted successfully.');
                // Refresh the screen list after deletion
                fetchScreens(); // Re-fetch screens to update the list
            } catch (err) {
                console.error('Error deleting screen:', err);
                alert('Failed to delete screen.');
            }
        }
    };

    if (loading) {
        return <p>Loading screens...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div className="screen-list-container">
            <h2 className="screen-list-title">Screens for Theater ID: {theaterId}</h2>
            {screens.length > 0 ? (
                <ul className="screens-ul">
                    {screens.map(screen => (
                        <li key={screen.screen_id} className="screen-list-item">
                            <div className="screen-info">
                                <h3 className="screen-number">Screen {screen.screen_number}</h3>
                                {/* You can add more screen details here if needed */}
                            </div>
                            <div className="screen-actions">
                                <button className="delete-screen-button" onClick={() => handleDeleteScreen(screen.screen_id)}>Delete Screen</button>
                                {/* We will add "Modify Screen" button later */}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No screens found for this theater.</p>
            )}
            <button className="back-to-theaters-button" onClick={() => navigate('/admin/theaters')}>Back to Theater List</button>
        </div>
    );
};

export default ScreenList;