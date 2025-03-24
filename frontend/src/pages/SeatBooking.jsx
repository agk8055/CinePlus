// frontend/src/pages/SeatBooking.jsx
import React, { useState, useContext, useEffect, useCallback } from 'react'; // Import useCallback
import { useParams } from 'react-router-dom';
import SeatLayout from '../components/SeatLayout';
import { UserContext } from '../context/UserContext';
import api, { getShowtimeDetailsById, getMovieById } from '../api/api'; // Import getShowtimeDetailsById and getMovieById
import BookingConfirmationModal from '../components/BookingConfirmationModal';
import './SeatBooking.css';

const SeatBooking = () => {
    const { screenId, showtimeId } = useParams();
    const { isAuthenticated, user } = useContext(UserContext);
    const [selectedSeatIds, setSelectedSeatIds] = useState([]);
    const [bookingStatus, setBookingStatus] = useState(null);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [bookingDetailsForModal, setBookingDetailsForModal] = useState(null);
    const [seatDataForLabels, setSeatDataForLabels] = useState([]);
    const [showtimeDetails, setShowtimeDetails] = useState(null);
    const [movieDetails, setMovieDetails] = useState(null);
    const [error, setError] = useState(null); // ADDED error state here


    useEffect(() => {
        // Fetch showtime details
        const fetchShowtimeAndMovieDetails = async () => {
            try {
                const selectedShowtimeDetails = await getShowtimeDetailsById(showtimeId); // Call new API function with showtimeId
                setShowtimeDetails(selectedShowtimeDetails);

                if (selectedShowtimeDetails) {
                    const movieResponse = await getMovieById(selectedShowtimeDetails.movie_id);
                    setMovieDetails(movieResponse);
                }

            } catch (error) {
                console.error("Error fetching showtime or movie details:", error);
                setError('Could not load showtime or movie details.'); // Now setError is defined
            }
        };

        fetchShowtimeAndMovieDetails();
    }, [showtimeId]);


    const handleSeatsSelected = useCallback((seatIds, seatsFullData) => { // Wrap with useCallback
        console.log("handleSeatsSelected called. seatsFullData:", seatsFullData); // ADD THIS LOG
        setSelectedSeatIds(seatIds);
        setSeatDataForLabels(seatsFullData); // Store full seat data
    }, []); // Empty dependency array - useCallback will memoize this function


    const openConfirmationModal = () => {
        if (selectedSeatIds.length === 0) {
            setBookingStatus({ type: 'error', message: 'Please select seats before proceeding.' });
            return;
        }

        console.log("seatDataForLabels in openConfirmationModal:", seatDataForLabels); // ADD THIS LOG

        // Prepare booking details to pass to modal
        setBookingDetailsForModal({
            movieTitle: movieDetails?.title, // Movie title from movieDetails state
            showtimeTime: showtimeDetails?.start_time, // Showtime from showtimeDetails state
            theaterName: showtimeDetails?.theater_name, // Theater name from showtimeDetails
            screenNumber: showtimeDetails?.screen_number, // Screen number from showtimeDetails
            seatCount: selectedSeatIds.length,
            seatLabels: getSelectedSeatLabels(),
            totalAmount: calculateTotalAmountForSeats(),
        });
        setIsConfirmationModalOpen(true);
    };

    const closeConfirmationModal = () => {
        setIsConfirmationModalOpen(false);
    };


    const handleBookNow = async () => {
        if (!isAuthenticated) {
            setBookingStatus({ type: 'error', message: 'Please log in to book seats.' });
            return;
        }

        if (selectedSeatIds.length === 0) {
            setBookingStatus({ type: 'error', message: 'Please select seats before proceeding.' });
            return;
        }

        try {
            const response = await api.post('/bookings', {
                showtimeId: parseInt(showtimeId),
                seatIds: selectedSeatIds.map(id => parseInt(id)),
            });

            console.log("Booking successful:", response.data);
            setBookingStatus({ type: 'success', message: 'Booking successful! Booking ID: ' + response.data.bookingId + ', Total Amount: ' + response.data.totalAmount });
            setIsConfirmationModalOpen(false);
            // Consider redirection to booking confirmation or bookings history page
        } catch (error) {
            console.error("Booking failed:", error);
            let errorMessage = 'Booking failed. Please try again.';
            if (error.response && error.response.data && error.response.data.error) {
                errorMessage = error.response.data.error;
                if (error.response.data.unavailableSeats) {
                    errorMessage += ' Unavailable seats: ' + error.response.data.unavailableSeats.join(', ');
                }
            }
            setBookingStatus({ type: 'error', message: errorMessage });
            setIsConfirmationModalOpen(false);
        }
    };

    const getSelectedSeatLabels = () => {
        if (!seatDataForLabels || seatDataForLabels.length === 0) { // Safety check
            return []; // Return empty array or handle no seats selected case
        }
        return seatDataForLabels.map(seat => `${seat.row}${seat.seat_number}`).join(', ');
    };

    const calculateTotalAmountForSeats = () => {
        return seatDataForLabels.reduce((total, seat) => total + parseFloat(seat.price), 0);
    };


    return (
        <div className="seat-booking">
            <h2>Select Seats</h2>
            <SeatLayout onSeatsSelected={handleSeatsSelected} />
            {bookingStatus && (
                <div className={`booking-status ${bookingStatus.type}`}>
                    {bookingStatus.message}
                </div>
            )}

            <button className="btn-primary" onClick={openConfirmationModal} disabled={bookingStatus && bookingStatus.type === 'success'}>
                Book Now
            </button>

            <BookingConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={closeConfirmationModal}
                bookingDetails={bookingDetailsForModal}
                onConfirmBooking={handleBookNow}
            />
             {error && <div className="booking-alert error">{error}</div>} {/* Display error message */}
        </div>
    );
};

export default SeatBooking;