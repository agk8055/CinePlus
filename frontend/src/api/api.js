// src/api/api.js
import axios from 'axios';

// Get the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log("API_BASE_URL from .env:", API_BASE_URL);

// Create an axios instance with the base URL and default headers
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token to authorized requests
api.interceptors.request.use(
    (config) => {
        // Get token from local storage
        const token = localStorage.getItem('token');
        if (token) {
            // Add Authorization header with Bearer token
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Function to get a movie by ID
export const getMovieById = async (movieId) => {
    try {
        const response = await api.get(`/movies/${movieId}`);
        return response.data;
    } catch (error) {
        console.error("Error in getMovieById:", error);
        throw error;
    }
};

// Function to get theaters by city
export const getTheatersByCity = async (city) => {
    try {
        const response = await api.get(`/theaters/city/${city}`);
        return response.data;
    } catch (error) {
        console.error("Error in getTheatersByCity:", error);
        throw error;
    }
};

// Function to get all cities
export const getCities = async () => {
    try {
        const response = await api.get('/cities'); // Relative to baseURL
        return response.data;
    } catch (error) {
        console.error("Error in getCities:", error);
        throw error;
    }
};

// Function to get showtimes for a movie in a specific city and on a specific date
export const getShowtimesByMovie = async (movieId, city, date, filters = {}) => {
    try {
        const response = await api.get(`/showtimes/movies/${movieId}`, {
            params: {
                city,
                date,
                language: filters.language,
                showTiming: filters.showTiming,
                priceRange: filters.priceRange, // If you are using Price Range filter
                numberOfTickets: filters.numberOfTickets, // Pass numberOfTickets filter
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error in getShowtimesByMovie:", error);
        throw error;
    }
};

// Function to get seat layout for a specific screen and showtime
export const getSeatLayout = async (screenId, showtimeId) => {
    try {
        const response = await api.get(`/seats/screens/${screenId}/showtimes/${showtimeId}/seats`);
        return response.data;
    } catch (error) {
        console.error("Error in getSeatLayout:", error);
        throw error;
    }
};

// Function for Theatre Admin Signup
export const signupTheatreAdmin = async (signupData) => {
    try {
        const response = await api.post('/auth/theatreadminsignup', signupData);
        return response; // Return the entire response object
    } catch (error) {
        return error.response; // Return the error response object
    }
};

// Function to get user profile
export const getProfile = async () => {
    try {
        const response = await api.get('/auth/me'); // Corrected endpoint to /auth/me
        return response.data;
    } catch (error) {
        console.error("Error fetching profile:", error);
        throw error;
    }
};

// Function to update user profile
export const updateProfile = async (profileData) => {
    try {
        const response = await api.put('/auth/profile', profileData); // Corrected endpoint to /auth/profile
        return response.data;
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};

// Function to change user password
export const changePassword = async (passwordData) => {
    try {
        const response = await api.put('/auth/password', passwordData); // Corrected endpoint to /auth/password
        return response.data; // Or just return response to check status
    } catch (error) {
        console.error("Error changing password:", error);
        throw error;
    }
};

// Function to get user booking history
export const getMyBookings = async () => {
    try {
        const response = await api.get('/bookings/my-bookings');
        return response.data;
    } catch (error) {
        console.error("Error fetching booking history:", error);
        throw error;
    }
};

// --- ADDED API FUNCTIONS for Theater Details Page ---

// Function to get theater details by ID
export const getTheaterDetails = async (theaterId) => {
    try {
        const response = await api.get(`/theaters/${theaterId}/details`);
        return response.data;
    } catch (error) {
        console.error("Error in getTheaterDetails:", error);
        throw error;
    }
};

// Function to get showtimes for a theater in a specific city and on a specific date
export const getShowtimesByTheater = async (theaterId, date) => {
    try {
        const response = await api.get(`/theaters/${theaterId}/showtimes`, {
            params: {
                date: date,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error in getShowtimesByTheater:", error);
        throw error;
    }
};

// Function to cancel a booking
export const cancelBooking = async (bookingId) => {
    try {
        const response = await api.delete(`/bookings/${bookingId}`); // Backend DELETE endpoint for cancellation
        return response.data;
    } catch (error) {
        console.error("Error in cancelBooking:", error);
        throw error;
    }
};

export const getShowtimeDetailsById = async (showtimeId) => {
    try {
        const response = await api.get(`/showtimes/${showtimeId}/details`);
        return response.data;
    } catch (error) {
        console.error("Error in getShowtimeDetailsById:", error);
        throw error;
    }
};

export default api;