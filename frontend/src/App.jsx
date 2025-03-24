import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CityProvider } from './context/CityContext';
import { UserProvider } from './context/UserContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Movies from './pages/Movies';
import MovieDetails from './pages/MovieDetails';
import SeatBooking from './pages/SeatBooking';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminSignup from './pages/AdminSignup';
import AdminPanel from './pages/AdminPanel';
import CreateMovie from './pages/CreateMovie';
import CreateShow from './pages/CreateShow';
import DeleteShow from './pages/DeleteShow';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import Showtimes from "./pages/Showtimes";
import TheatreAdminSignup from './pages/TheatreAdminSignup';
import CreateScreen from './pages/CreateScreen';
import TheaterList from './pages/TheaterList';
import ScreenList from './pages/ScreenList';
import Profile from './pages/Profile';
import Bookings from './pages/Bookings'; // Import Bookings component - ADDED
import EditMovie from './pages/EditMovie'; // Import EditMovie component
import DeleteMovie from './pages/DeleteMovie'; // Import DeleteMovie component
import TheaterDetails from './pages/TheaterDetails'; // IMPORT TheaterDetails

function App() {
    return (
        <UserProvider>
            <CityProvider>
                <Router>
                    <div className="dark-theme">
                        <Navbar />
                        <div className="container">
                            <Routes>
                                {/* Public routes */}
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />
                                <Route path="/adminsignup" element={<AdminSignup />} />
                                <Route path="/theatreadminsignup" element={<TheatreAdminSignup />} />

                                {/* Admin routes protected by ProtectedRoute component */}
                                <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
                                <Route path="/admin/theaters" element={<ProtectedRoute><TheaterList /></ProtectedRoute>} />
                                <Route path="/admin/theaters/:theaterId/screens" element={<ProtectedRoute><ScreenList /></ProtectedRoute>} />
                                <Route path="/admin/theaters/:theaterId/create-screen" element={<ProtectedRoute><CreateScreen /></ProtectedRoute>} />

                                {/* Movie management routes */}
                                <Route path="/admin/add-movie" element={<ProtectedRoute><CreateMovie /></ProtectedRoute>} />
                                <Route path="/admin/edit-movie" element={<ProtectedRoute><EditMovie /></ProtectedRoute>} /> {/* Added edit movie route */}
                                <Route path="/admin/delete-movie" element={<ProtectedRoute><DeleteMovie /></ProtectedRoute>} /> {/* Added delete movie route */}

                                {/* Show management routes */}
                                <Route path="/admin/add-show" element={<ProtectedRoute><CreateShow /></ProtectedRoute>} />
                                <Route path="/admin/delete-show" element={<ProtectedRoute><DeleteShow /></ProtectedRoute>} />

                                {/* Movie and showtime browsing routes */}
                                <Route path="/movies" element={<Movies />} />
                                <Route path="/movies/:id" element={<MovieDetails />} />
                                <Route path="/showtimes/:id" element={<Showtimes />} />
                                <Route path="/booking/screen/:screenId/showtime/:showtimeId" element={<SeatBooking />} />
                                <Route path="/theaters/:theaterId" element={<TheaterDetails />} /> {/* ADD THEATER DETAILS ROUTE */}


                                {/* User profile and bookings */}
                                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                                <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} /> {/* Add Bookings Route - ADDED */}
                            </Routes>
                        </div>
                    </div>
                </Router>
            </CityProvider>
        </UserProvider>
    );
}

export default App;