import { Link, useNavigate } from 'react-router-dom';
import { useCity } from '../context/CityContext';
import { useContext, useState, useRef, useEffect } from 'react';
import UserContext from '../context/UserContext';
import './Navbar.css';
import api, { getCities } from '../api/api';

const Navbar = () => {
    const { selectedCity, setSelectedCity } = useCity();
    const { isAuthenticated, logout, user } = useContext(UserContext);
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [cities, setCities] = useState([]);
    const [loadingCities, setLoadingCities] = useState(true);

    // Search functionality states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchResultsRef = useRef(null);

    const isUser = user && user.role === 'user';

    useEffect(() => {
        const fetchCitiesData = async () => {
            setLoadingCities(true);
            try {
                const data = await getCities();
                setCities(data);
            } catch (error) {
                console.error('Error fetching cities:', error);
            } finally {
                setLoadingCities(false);
            }
        };

        fetchCitiesData();
    }, []);

    const handleLogout = () => {
        logout();
        setIsDropdownOpen(false);
        navigate('/login');
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    useEffect(() => {
        function handleClickOutsideDropdown(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) && isDropdownOpen) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutsideDropdown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutsideDropdown);
        };
    }, [isDropdownOpen, dropdownRef]);

    // Function to handle search input changes
    const handleSearchChange = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        setSearchResults([]); // Clear previous results

        if (query.trim() && query.length > 1) { // Start searching after 3 characters
            try {
                const response = await api.get(`/movies/search?query=${query}`); // Call backend search API
                setSearchResults(response.data);
            } catch (error) {
                console.error('Error searching movies:', error);
                setSearchResults([{ movie_id: null, title: 'Error fetching results' }]); // Show error in dropdown
            }
        }
    };

    const handleSearchFocus = () => {
        setIsSearchFocused(true);
    };

    const handleSearchBlur = () => {
        setTimeout(() => { // Delay blur to allow click on search result
            setIsSearchFocused(false);
        }, 100);
    };


    useEffect(() => {
        function handleClickOutsideSearch(event) {
            if (searchResultsRef.current && !searchResultsRef.current.contains(event.target) && isSearchFocused) {
                setIsSearchFocused(false);
                setSearchResults([]); // Clear search results when search bar loses focus
            }
        }
        document.addEventListener("mousedown", handleClickOutsideSearch);
        return () => {
            document.removeEventListener("mousedown", handleClickOutsideSearch);
        };
    }, [isSearchFocused, searchResultsRef]);


    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                CinePlus+
            </Link>
            <div className="nav-links">

                {/* Search Bar */}
                <div className="search-section" ref={searchResultsRef} >
                    <input
                        type="text"
                        placeholder="Search movies..."
                        className="search-input"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={handleSearchFocus}
                        onBlur={handleSearchBlur}
                    />
                    {isSearchFocused && searchResults.length > 0 && (
                        <div className="search-results" >
                            <ul className="search-results-list">
                                {searchResults.length > 0 ? (
                                    searchResults.map(movie => (
                                        <li key={movie.movie_id}>
                                            {movie.movie_id ? (
                                                <Link to={`/movies/${movie.movie_id}`} onClick={() => { setSearchQuery(''); setSearchResults([]); setIsSearchFocused(false); }}>
                                                    {movie.title}
                                                </Link>
                                            ) : (
                                                <span className="no-results"> {movie.title} </span> // Display error message
                                            )}
                                        </li>
                                    ))
                                ) : (
                                    <li><span className="no-results">No movies found</span></li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>


                {/* City Selector */}
                <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    disabled={loadingCities}
                >
                    <option value="">{loadingCities ? "Loading Cities..." : "Select City"}</option>
                    {cities.map((city) => (
                        <option key={city} value={city}>
                            {city}
                        </option>
                    ))}
                </select>

                {/* Navigation Links */}
                <Link to="/movies" className="nav-link">
                    Movies
                </Link>

                {/* Authentication Section */}
                {isAuthenticated ? (
                    <div className="profile-dropdown" ref={dropdownRef}>
                        <button className="profile-button" onClick={toggleDropdown}>
                            <span className="profile-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-user">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </span>
                            Profile
                        </button>
                        <ul className={`dropdown-menu ${isDropdownOpen ? 'open' : ''}`}>
                            <li><Link to="/profile" className="dropdown-item">My Profile</Link></li>
                            <li><Link to="/bookings" className="dropdown-item">My Bookings</Link></li>
                            {!isUser && (
                                <li><Link to="/admin" className="dropdown-item">Admin Panel</Link></li>
                            )}
                            <li className="dropdown-divider"></li>
                            <li><span className="dropdown-item logout-text" onClick={handleLogout}>Logout</span></li>
                        </ul>
                    </div>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">
                            Login
                        </Link>
                        <Link to="/signup" className="nav-link">
                            Signup
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;