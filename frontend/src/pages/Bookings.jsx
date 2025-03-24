import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../context/UserContext';
import { getMyBookings, cancelBooking } from '../api/api';
import './Bookings.css';

const Bookings = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [upcomingBookings, setUpcomingBookings] = useState([]);
    const [pastBookings, setPastBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cancellationError, setCancellationError] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            setError(null);
            try {
                if (!user) {
                    navigate('/login');
                    return;
                }
                const data = await getMyBookings();
                const now = new Date();

                const upcoming = [];
                const past = [];

                data.forEach(booking => {
                    const showtimeDateTime = new Date(booking.start_time);
                    showtimeDateTime >= now ? upcoming.push(booking) : past.push(booking);
                });

                setUpcomingBookings(upcoming);
                setPastBookings(past);

            } catch (err) {
                setError('Failed to load booking history.');
                console.error("Error fetching bookings:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [user, navigate]);

    const handleCancelBooking = async (bookingId) => {
        setCancellationError(null);
        try {
            await cancelBooking(bookingId);
            setUpcomingBookings(upcomingBookings.map(booking =>
                booking.booking_id === bookingId ? { ...booking, status: 'cancelled' } : booking
            ));
            setPastBookings(pastBookings.map(booking =>
                booking.booking_id === bookingId ? { ...booking, status: 'cancelled' } : booking
            ));
            alert('Booking cancelled successfully.');
        } catch (error) {
            setCancellationError('Failed to cancel booking. Please try again.');
            console.error('Error cancelling booking:', error);
        }
    };

    if (loading) {
        return <div className="bookings-container">Loading booking history...</div>;
    }

    const renderBookings = (bookings, isPast = false) => (
        <div className="bookings-grid">
            {bookings.map(booking => {
                const showtime = new Date(booking.start_time);
                const timeUntilShowtime = showtime - new Date();
                const isCancelable = timeUntilShowtime > 2 * 60 * 60 * 1000;
                const isCancelled = booking.status === 'cancelled';

                return (
                    <div key={booking.booking_id} className={`booking-card ${isCancelled ? 'cancelled' : ''}`}>
                        <div className="card-content">
                            <img src={booking.poster_url} alt={booking.movie_title} className="movie-poster" />

                            <div className="card-details">
                                <div className="card-header">
                                    <h3 className="movie-title">{booking.movie_title}</h3>
                                    {isCancelled && <span className="status-badge">Cancelled</span>}
                                </div>

                                <div className="showtime-info">
                                    <div className="time-block">
                                        <span className="date">
                                            {new Date(booking.start_time).toLocaleDateString('en-IN', {
                                                weekday: 'short',
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </span>
                                        <span className="time">
                                            {new Date(booking.start_time).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <div className="screen-info">Screen {booking.screen_number}</div>
                                </div>

                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="label">Theater</span>
                                        <span className="value">{booking.theater_name}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Seats</span>
                                        {!isCancelled && (
                                            <span className="value seats">{booking.seat_numbers}</span>
                                        )}
                                        {isCancelled && (
                                            <span className="value seats">-</span>
                                        )}
                                    </div>
                                    <div className="info-item">
                                        <span className="label">Booking ID</span>
                                        <span className="value">{booking.booking_id}</span>
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <div className="price">₹{booking.total_amount}</div>
                                    {!isPast && !isCancelled && isCancelable && (
                                        <button
                                            className="cancel-btn"
                                            onClick={() => handleCancelBooking(booking.booking_id)}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="bookings-container">
            <div className="bookings-header">
                <h1>Booking History</h1>
            </div>

            {error && <div className="error-message">{error}</div>}
            {cancellationError && <div className="error-message">{cancellationError}</div>}

            <section className="bookings-section">
                <div className="section-header">
                    <h2>Upcoming Screenings</h2>
                    <span className="badge">{upcomingBookings.length}</span>
                </div>
                {upcomingBookings.length > 0 ?
                    renderBookings(upcomingBookings) :
                    <div className="empty-state">No upcoming bookings found</div>
                }
            </section>

            <section className="bookings-section">
                <div className="section-header">
                    <h2>Past Bookings</h2>
                    <span className="badge">{pastBookings.length}</span>
                </div>
                {pastBookings.length > 0 ?
                    renderBookings(pastBookings, true) :
                    <div className="empty-state">No past bookings found</div>
                }
            </section>
        </div>
    );
};

export default Bookings;