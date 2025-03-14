// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import useLocation
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
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import Showtimes from "./pages/Showtimes";
import TheatreAdminSignup from './pages/TheatreAdminSignup';
import CreateScreen from './pages/CreateScreen';
import TheaterList from './pages/TheaterList';
import ScreenList from './pages/ScreenList'; // Import ScreenList Component


function App() {
    return (
        <UserProvider>
            <CityProvider>
                <Router>
                    <div className="dark-theme">
                        <Navbar />
                        <div className="container">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />
                                <Route path="/adminsignup" element={<AdminSignup />} />
                                <Route path="/theatreadminsignup" element={<TheatreAdminSignup />} />


                                <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
                                <Route path="/admin/theaters" element={<ProtectedRoute><TheaterList /></ProtectedRoute>} />
                                <Route path="/admin/theaters/:theaterId/screens" element={<ProtectedRoute><ScreenList /></ProtectedRoute>} /> {/* Route for ScreenList - ADDED */}
                                <Route path="/admin/theaters/:theaterId/create-screen" element={<ProtectedRoute><CreateScreen /></ProtectedRoute>} />


                                {/* Protected Admin Routes - Nested under /admin */}
                                <Route path="/admin/add-movie" element={<ProtectedRoute><CreateMovie /></ProtectedRoute>} />
                                <Route path="/admin/add-show" element={<ProtectedRoute><CreateShow /></ProtectedRoute>} />


                                <Route path="/movies" element={<Movies />} />
                                <Route path="/movies/:id" element={<MovieDetails />} />
                                <Route path="/showtimes/:id" element={<Showtimes />} />
                                <Route path="/booking/screen/:screenId/showtime/:showtimeId" element={<SeatBooking />} />
                            </Routes>
                        </div>
                    </div>
                </Router>
            </CityProvider>
        </UserProvider>
    );
}

export default App;