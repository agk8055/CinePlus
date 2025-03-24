// frontend/src/context/UserContext.js
import { createContext, useState, useEffect } from 'react';
import api from '../api/api';

export const UserContext = createContext(); // Add 'export' here to make it a named export

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkLoginStatus = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Verify the token with your backend and get user profile
                    const response = await api.get('/auth/me');

                    setUser(response.data); // Set entire user data from /auth/me including name, role, etc.
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Token verification failed or user profile fetch error:', error);
                    localStorage.removeItem('token'); // Remove invalid token
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        };

        checkLoginStatus();
    }, []);

    const login = (userData) => {
        setUser(userData); // Expect userData to now include name, role, etc. from login response
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <UserContext.Provider value={{ user, setUser, isAuthenticated, login, logout }}> {/* ADDED setUser to value */}
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;