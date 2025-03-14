// frontend/src/pages/AdminPanel.jsx
import React, { useContext, useEffect, useState } from 'react'; // Import useEffect and useState
import { Link } from 'react-router-dom';
import './AdminPanel.css';
import { UserContext } from '../context/UserContext'; // Import UserContext
import api from '../api/api'; // Import your api

const AdminPanel = () => {
    const { user } = useContext(UserContext); // Access user from UserContext
    const [userName, setUserName] = useState(''); // State for user's name

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await api.get('/auth/me'); // Call the new backend endpoint
                setUserName(response.data.name); // Set the user's name in state
            } catch (error) {
                console.error('Error fetching user profile:', error);
                // Handle error (e.g., redirect to login, display error message)
            }
        };

        fetchUserProfile();
    }, []); // Empty dependency array to run only once on component mount


    // Helper function to check if the user is a theatre_admin
    const isTheatreAdmin = user && user.role === 'theatre_admin';

    return (
        <div className="admin-panel-container">
            <h1 className="admin-panel-title">Admin Panel</h1>
            <p className="admin-panel-description">Welcome to the Admin Panel, {userName}!</p> {/* Display welcome message with name */}

            <div className="admin-card-buttons-container">
                {/* Conditionally render Movie Controls based on role */}
                {!isTheatreAdmin && ( // Render Movie Controls only if NOT a theatre_admin
                    <div className="admin-card-button">
                        <Link to="/admin/add-movie" className="admin-card-link">
                            <h3>Movie Controls</h3>
                            <p>Create a new movie listing</p>
                        </Link>
                    </div>
                )}

              {/* Theater Controls - Always shown to Theatre Admins and other Admins */}
              <div className="admin-card-button">
    <Link to="/admin/theaters" className="admin-card-link"> {/* Changed to /admin/theaters */}
        <h3>Theater Controls</h3>
        <p>Manage theaters and screens</p>
    </Link>
</div>

                {/* Show Controls - Always shown to Theatre Admins and other Admins */}
                <div className="admin-card-button">
                    <Link to="/admin/add-show" className="admin-card-link">
                        <h3>Show Controls</h3>
                        <p>Create a new movie showtime</p>
                    </Link>
                </div>

                {/* Theatre Admin Signup Card Button (NEW) -  Keep this if you want general admins to be able to signup theatre admins */}
                {/* {!isTheatreAdmin && (
                 <div className="admin-card-button">
                    <Link to="/admin/theatre-admin-signup" className="admin-card-link">
                        <h3>Theatre Admin Signup</h3>
                        <p>Register a new Theatre Admin and Theatre</p>
                    </Link>
                </div>
                )} */}
            </div>
        </div>
    );
};

export default AdminPanel;