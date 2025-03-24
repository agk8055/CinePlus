// frontend/src/components/BookingConfirmationModal.jsx
import React from 'react';
import './BookingConfirmationModal.css'; // Import modal-specific CSS

const BookingConfirmationModal = ({ isOpen, onClose, bookingDetails, onConfirmBooking }) => {
    if (!isOpen) {
        return null;
    }

    const handleConfirm = () => {
        onConfirmBooking(); // Call the booking confirmation function passed from parent
        onClose(); // Close the modal after confirmation is initiated
    };

    const formatTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    };


    return (
        <div className="booking-confirmation-modal-overlay">
            <div className="booking-confirmation-modal">
                <div className="modal-header">
                    <button className="close-button" onClick={onClose}>
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
                <div className="modal-body">
                    <div className="ticket">
                        <div className="ticket-header">
                            <h2>CinePlus+</h2>
                            <p>Movie Ticket</p>
                        </div>
                        <div className="ticket-body">
                            {bookingDetails && (
                                <>
                                    <div className="movie-info">
                                        <h3>{bookingDetails.movieTitle}</h3> {/* Movie title */}
                                        <p>Showtime: {formatTime(bookingDetails.showtimeTime)}</p> {/* Formatted showtime */}
                                        <p>Date: {formatDate(bookingDetails.showtimeTime)}</p> {/* Formatted date */}
                                    </div>
                                    <div className="theater-screen-info">
                                        <p>Theater: {bookingDetails.theaterName}</p> {/* Theater name */}
                                        <p>Screen: {bookingDetails.screenNumber}</p> {/* Screen number */}
                                    </div>
                                    <div className="seat-info">
                                        <p>Seats: {bookingDetails.seatLabels || 'N/A'}</p> {/* Seat labels */}
                                        <p>Total: ₹{bookingDetails.totalAmount ? bookingDetails.totalAmount.toFixed(2) : 'N/A'}</p> {/* Total amount, formatted */}
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="ticket-footer">
                            <p>Thank you for booking with CinePlus+</p>
                        </div>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="confirm-button" onClick={handleConfirm}>Confirm Booking</button>
                    <button className="cancel-button" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirmationModal;