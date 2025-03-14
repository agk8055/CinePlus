import React from 'react';
import { useParams } from 'react-router-dom';
import SeatLayout from '../components/SeatLayout'; // Import the SeatLayout component

const SeatBooking = () => {
    const { screenId, showtimeId } = useParams(); // Get screenId and showtimeId from URL params

    return (
        <div className="seat-booking">
            <h2>Select Seats</h2>
            {/* SeatLayout will now fetch data itself using screenId and showtimeId from useParams */}
            <SeatLayout />
            {/* You can add additional UI elements or logic here in SeatBooking if needed later */}
            <button className="btn-primary">Proceed to Payment (Not Implemented Yet)</button>
        </div>
    );
};

export default SeatBooking;