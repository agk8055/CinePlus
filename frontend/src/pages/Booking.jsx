import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';

const Booking = () => {
  const { showtimeId } = useParams();
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const response = await api.get(`/showtimes/${showtimeId}/seats`);
        setSeats(response.data);
      } catch (error) {
        console.error('Error fetching seats:', error);
      }
    };

    fetchSeats();
  }, [showtimeId]);

  const handleSeatSelection = (seatId, price) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
      setTotalAmount(totalAmount - price);
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
      setTotalAmount(totalAmount + price);
    }
  };

  const handleBooking = async () => {
    try {
      const response = await api.post('/bookings', {
        userId: 1, // Replace with actual user ID
        showtimeId,
        seatIds: selectedSeats,
        totalAmount,
      });
      alert('Booking successful!');
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking');
    }
  };

  return (
    <div className="booking-page">
      <h2>Select Seats</h2>
      <div className="seat-grid">
        {seats.map(seat => (
          <button
            key={seat.seat_id}
            className={`seat ${selectedSeats.includes(seat.seat_id) ? 'selected' : ''}`}
            onClick={() => handleSeatSelection(seat.seat_id, seat.seat_type === 'Premium' ? 200 : 150)}
          >
            {seat.seat_number}
          </button>
        ))}
      </div>
      <p><strong>Total Amount:</strong> ₹{totalAmount}</p>
      <button onClick={handleBooking} className="btn-primary">Confirm Booking</button>
    </div>
  );
};

export default Booking;