import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import './CreateMovie.css'; // Reuse CreateMovie.css for styling

const CreateScreen = () => {
    const { theaterId } = useParams(); // Get theaterId from URL params
    const navigate = useNavigate();

    const [screenNumber, setScreenNumber] = useState('');
    const [seatRowsConfig, setSeatRowsConfig] = useState([{ row_name: '', seat_numbers: '', seat_type: 'Regular', price: 200 }]); // Initial row config - changed seat_count to seat_numbers

    const handleInputChange = (e) => {
        setScreenNumber(e.target.value);
    };

    const handleRowConfigChange = (index, field, value) => {
        const updatedRows = [...seatRowsConfig];
        updatedRows[index][field] = value;
        setSeatRowsConfig(updatedRows);
    };

    const addRowConfig = () => {
        setSeatRowsConfig([...seatRowsConfig, { row_name: '', seat_numbers: '', seat_type: 'Regular', price: 200 }]); // Initialize seat_numbers as empty string
    };

    const removeRowConfig = (index) => {
        const updatedRows = seatRowsConfig.filter((_, i) => i !== index);
        setSeatRowsConfig(updatedRows);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        const seatRows = seatRowsConfig.map(row => ({
            row_name: row.row_name.toUpperCase(), // Ensure row names are uppercase for consistency
            seat_numbers: row.seat_numbers, // Send as string - NO SPLITTING in frontend
            seat_type: row.seat_type, // Seat type will now be taken directly from user input
            price: parseFloat(row.price)
        }));

        const payload = { // Create payload object
            screen_number: parseInt(screenNumber, 10),
            seatRows: seatRows
        };

        console.log("Payload being sent to create screen API:", payload); // Log the payload

        try {
            await api.post(`/theaters/${theaterId}/screens`, payload); // Send the payload
            alert('Screen created successfully!');
            navigate('/admin'); // Redirect back to admin panel or theater management page
        } catch (error) {
            console.error('Error creating screen:', error);
            alert('Failed to create screen.');
        }
    };

    return (
        <div className="create-movie-container"> {/* Reusing CreateMovie.css class */}
            <h2>Create Screen for Theater ID: {theaterId}</h2>
            <form onSubmit={handleSubmit} className="create-movie-form">
                <div className="form-group">
                    <label htmlFor="screenNumber">Screen Number:</label>
                    <input type="number" id="screenNumber" value={screenNumber} onChange={handleInputChange} required />
                </div>

                <h3>Seat Configuration</h3>
                {seatRowsConfig.map((rowConfig, index) => (
                    <div key={index} className="seat-row-config">
                        <h4>Row {index + 1}</h4>
                        <div className="form-group">
                            <label htmlFor={`rowName-${index}`}>Row Name (e.g., A, B, C):</label>
                            <input type="text" id={`rowName-${index}`} value={rowConfig.row_name} onChange={(e) => handleRowConfigChange(index, 'row_name', e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor={`seatNumbers-${index}`}>Seat Numbers (comma-separated):</label>
                            <input type="text" id={`seatNumbers-${index}`} value={rowConfig.seat_numbers} onChange={(e) => handleRowConfigChange(index, 'seat_numbers', e.target.value)} required />
                            <p className="form-instruction">Enter seat numbers separated by commas (e.g., 1, 2, 3, 4)</p>
                        </div>
                        <div className="form-group">
                            <label htmlFor={`seatType-${index}`}>Seat Type (e.g., Regular, Premium, Executive):</label>
                            <input
                                type="text"
                                id={`seatType-${index}`}
                                value={rowConfig.seat_type}
                                onChange={(e) => handleRowConfigChange(index, 'seat_type', e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor={`price-${index}`}>Price:</label>
                            <input type="number" id={`price-${index}`} value={rowConfig.price} onChange={(e) => handleRowConfigChange(index, 'price', e.target.value)} required />
                        </div>
                        <button type="button" onClick={() => removeRowConfig(index)}>Remove Row</button>
                    </div>
                ))}
                <button type="button" onClick={addRowConfig}>Add Row Configuration</button>


                <button type="submit" className="submit-button">Create Screen</button>
            </form>
        </div>
    );
};

export default CreateScreen;