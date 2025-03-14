import { Link, useNavigate } from 'react-router-dom';
import { useCity } from '../context/CityContext';
import { useContext } from 'react';
import UserContext from '../context/UserContext';

const Navbar = () => {
  const { selectedCity, setSelectedCity } = useCity();
  const { isAuthenticated, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to the login page
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        CinePlus+
      </Link>
      <div className="nav-links">
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
        >
          <option value="">Select City</option>
          <option value="Kochi">Kochi</option>
          <option value="Thrissur">Thrissur</option>
          <option value="Kottayam">Kottayam</option>
        </select>
        <Link to="/movies" className="nav-link">
          Movies
        </Link>
        {isAuthenticated ? (
          <button onClick={handleLogout} className="nav-link">
            Logout
          </button>
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