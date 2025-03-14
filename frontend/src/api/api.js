// src/api/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log("API_BASE_URL from .env:", API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const getMovieById = async (movieId) => {
  try {
      const response = await api.get(`/movies/${movieId}`);
      return response.data;
  } catch (error) {
      console.error("Error in getMovieById:", error);
      throw error;
  }
};

// Get theaters by city
export const getTheatersByCity = async (city) => {
  try {
    const response = await api.get(`/theaters/city/${city}`);
    return response.data;
  } catch (error) {
    console.error("Error in getTheatersByCity:", error);
    throw error;
  }
};

// Get showtimes for a movie in a specific city and on a specific date
export const getShowtimesByMovie = async (movieId, city, date, filters = {}) => {
  try {
      const response = await api.get(`/showtimes/movies/${movieId}`, {
          params: {
              city,
              date,
              language: filters.language,
              showTiming: filters.showTiming,
              priceRange: filters.priceRange, // (If you are using Price Range filter)
              numberOfTickets: filters.numberOfTickets, // Pass numberOfTickets filter
          },
      });
      return response.data;
  } catch (error) {
      console.error("Error in getShowtimesByMovie:", error);
      throw error;
  }
};


export const getSeatLayout = async (screenId, showtimeId) => {
  try {

      const absoluteURL = `${API_BASE_URL}/seats/screens/${screenId}/showtimes/${showtimeId}/seats`; // **Notice the addition of `/seats` here**
      console.log("api.js: getSeatLayout - Making API call to:", absoluteURL);
      const response = await axios.get(absoluteURL);
      return response.data;
  } catch (error) {
      console.error("Error in getSeatLayout:", error);
      throw error;
  }
};

// Function for Theatre Admin Signup (NEW FUNCTION)
export const signupTheatreAdmin = async (signupData) => {
    try {
        const response = await api.post('/auth/theatreadminsignup', signupData);
        return response; // Return the entire response object
    } catch (error) {
        return error.response; // Return the error response object
    }
};


export default api;