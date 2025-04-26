import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import './Bookings.css';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail'); // Get user email from storage
      const response = await fetch(`http://localhost:5000/getUserBookings/${userEmail}`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      
      const data = await response.json();
      setBookings(data.bookings);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) return <div className="bookings-loading">Loading bookings...</div>;

  return (
    <div className="bookings-container">
      <h2>My Bookings</h2>
      
      {bookings.length === 0 ? (
        <div className="no-bookings">No bookings found</div>
      ) : (
        <div className="bookings-grid">
          {bookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <h3>{booking.movie_name}</h3>
                <span className="booking-date">
                  Booked on: {formatDate(booking.booking_date)}
                </span>
              </div>
              
              <div className="booking-details">
                <p><strong>Show Date:</strong> {formatDate(booking.event_date)}</p>
                <p><strong>Show Time:</strong> {booking.slot_time}</p>
                <p><strong>Seats:</strong> {JSON.parse(booking.seat_numbers).join(', ')}</p>
              </div>
              
              <div className="booking-footer">
                <span className="booking-id">Booking ID: {booking.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings; 