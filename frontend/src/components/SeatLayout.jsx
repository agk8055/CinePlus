// frontend/src/components/SeatLayout.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './SeatLayout.css';
import { getSeatLayout } from '../api/api';

const SeatLayout = ({ onSeatsSelected }) => { // Add onSeatsSelected prop
    const { screenId, showtimeId } = useParams();
    const [seatsData, setSeatsData] = useState([]);
    const [bookedSeatIds, setBookedSeatIds] = useState([]);
    const [seatStatus, setSeatStatus] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);

    useEffect(() => {
        const fetchSeatData = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getSeatLayout(screenId, showtimeId);
                console.log("SeatLayout.jsx: API Response Data:", data);
                setSeatsData(data.seats);
                setBookedSeatIds(data.bookedSeatIds);
                initializeSeatStatusFromData(data.seats);
            } catch (e) {
                setError(e);
                console.error("SeatLayout.jsx: Error fetching seat layout:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchSeatData();
    }, [screenId, showtimeId]);

    const initializeSeatStatusFromData = (seats) => {
        const initialStatus = {};
        seats.forEach(seat => {
            initialStatus[seat.seat_id] = seat.isBooked ? 'booked' : 'available';
        });
        setSeatStatus(initialStatus);
    };

    const handleSeatClick = (seatId) => {
        if (seatStatus[seatId] === 'booked') {
            return;
        }

        setSeatStatus(prevStatus => {
            const newStatus = { ...prevStatus };
            if (newStatus[seatId] === 'available') {
                newStatus[seatId] = 'selected';
            } else if (newStatus[seatId] === 'selected') {
                newStatus[seatId] = 'available';
            }
            return newStatus;
        });

        setSelectedSeats(currentSelectedSeats => {
            if (currentSelectedSeats.includes(seatId)) {
                return currentSelectedSeats.filter(seat => seat !== seatId);
            } else {
                return [...currentSelectedSeats, seatId];
            }
        });
    };

    useEffect(() => {
        if (onSeatsSelected) {
            // Get full seat objects for selected seat IDs
            const selectedSeatFullData = selectedSeats.map(seatId => {
                return seatsData.find(seat => seat.seat_id === seatId);
            }).filter(seat => seat !== undefined); // Filter out undefined
            onSeatsSelected(selectedSeats, selectedSeatFullData); // Call callback
        }
    }, [selectedSeats, onSeatsSelected]); // Removed seatsData from dependency array


    if (loading) {
        return <p>Loading seat layout...</p>;
    }

    if (error) {
        return <p>Error: {error.message}</p>;
    }

    const groupedSeatsByType = seatsData.reduce((groups, seat) => {
        const type = seat.seat_type;
        if (!groups[type]) {
            groups[type] = [];
        }
        groups[type].push(seat);
        return groups;
    }, {});

    const groupedSeatsByRow = Object.entries(groupedSeatsByType).reduce((typeGroups, [seatType, seatsOfType]) => {
        typeGroups[seatType] = seatsOfType.reduce((rowGroups, seat) => {
            const row = seat.row;
            if (!rowGroups[row]) {
                rowGroups[row] = [];
            }
            rowGroups[row].push(seat);
            return rowGroups;
        }, {});
        return typeGroups;
    }, {});

    const getSelectedSeatLabels = () => {
        return selectedSeats.map(seatId => {
            const seat = seatsData.find(s => s.seat_id === seatId);
            if (seat) {
                return `${seat.row}${seat.seat_number}`;
            }
            return `Seat ID ${seatId}`;
        });
    };


    return (
        <div className="seat-layout-container">
            {Object.entries(groupedSeatsByRow).map(([seatType, rowGroups]) => (
                <div key={seatType} className="seat-category-section">
                    <h3 className="seat-category-label">{seatType.toUpperCase()} Seats</h3>
                    {Object.entries(rowGroups).map(([rowLabel, seatsInRow]) => (
                        <div key={rowLabel} className="seat-row">
                            <div className="row-label">{rowLabel}</div>
                            <div className="seats">
                                {seatsInRow.map(seat => (
                                    seat.seat_number === '0' ? (
                                        <div key={`${seat.seat_id}-space`} className="seat-space"></div>
                                    ) : (
                                        <div
                                            key={seat.seat_id}
                                            className={`seat ${seatStatus[seat.seat_id] || 'available'}`}
                                            onClick={() => handleSeatClick(seat.seat_id)}
                                        >
                                            {seat.seat_number}
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ))}

            <div className="seat-legend">
                <div className="legend-item"><div className="seat available"></div> Available</div>
                <div className="legend-item"><div className="seat booked"></div> Booked</div>
                <div className="legend-item"><div className="seat selected"></div> Selected</div>
            </div>
            {selectedSeats.length > 0 && (
                <div className="selected-seats-display">
                    Selected Seats: {getSelectedSeatLabels().join(', ')}
                </div>
            )}
             <div className="screen-view">Screen  - All eyes this way!</div>
        </div>
    );
};

export default SeatLayout;