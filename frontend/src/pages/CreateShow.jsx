import React, { useState } from 'react';
import api from '../api/api';


const CreateShow = () => {
  const [movieId, setMovieId] = useState('');
  const [theaterId, setTheaterId] = useState('');
  const [showTime, setShowTime] = useState('');
  const [availableSeats, setAvailableSeats] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/shows', {
        movie_id: movieId,
        theater_id: theaterId,
        show_time: showTime,
        available_seats: availableSeats,
        price: price,
      });
      console.log('Show created:', response.data);
      alert('Show created successfully!');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create show');
    }
  };

  return (
    <div className="create-show">
      <h2>Create Show</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Movie ID"
          value={movieId}
          onChange={(e) => setMovieId(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Theater ID"
          value={theaterId}
          onChange={(e) => setTheaterId(e.target.value)}
          required
        />
        <input
          type="datetime-local"
          placeholder="Show Time"
          value={showTime}
          onChange={(e) => setShowTime(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Available Seats"
          value={availableSeats}
          onChange={(e) => setAvailableSeats(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <button type="submit">Create Show</button>
      </form>
    </div>
  );
};

export default CreateShow;