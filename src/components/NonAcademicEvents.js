import React, { useState, useEffect } from "react";
import { FaSearch, FaClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./NonAcademicEvents.css";
import { toast } from "react-hot-toast";

const NonAcademicEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedSlotTime, setSelectedSlotTime] = useState(null);
  const [availableSeats, setAvailableSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);
  const [bookingConfirmationDetails, setBookingConfirmationDetails] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/getNonAcademicEvents");
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      const data = await response.json();
      setEvents(data.events || []);
      setError(null);
    } catch (err) {
      setError("Failed to load events. Please try again later.");
      console.error("Error fetching events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSeats = async (slotId) => {
    try {
      const response = await fetch(`http://localhost:5000/getEventSeats/${slotId}`);
      if (!response.ok) throw new Error('Failed to fetch seats');
      const data = await response.json();
      console.log('Fetched seats:', data.seats); // Debug log
      setAvailableSeats(data.seats);
    } catch (error) {
      console.error('Error fetching seats:', error);
      toast.error('Failed to load seats');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleViewTimeSlots = (event) => {
    setSelectedEvent(event);
    setIsBookingModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsBookingModalOpen(false);
    setSelectedEvent(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleSlotSelect = async (slotId, slotTime) => {
    try {
      console.log('Selecting slot:', slotId, 'Time:', slotTime); // Debug log
      setSelectedSlot(slotId);
      setSelectedSlotTime(slotTime);
      
      // Clear previous selections
      setSelectedSeats([]);
      setAvailableSeats([]);

      // Fetch seats for the selected slot
      const response = await fetch(`http://localhost:5000/getEventSeats/${slotId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch seats');
      }
      
      const data = await response.json();
      console.log('Fetched seats:', data.seats); // Debug log
      setAvailableSeats(data.seats);
    } catch (error) {
      console.error('Error selecting slot:', error);
      toast.error('Failed to load seats. Please try again.');
    }
  };

  const handleSeatSelect = (seatId) => {
    console.log('Attempting to select seat:', seatId); // Debug log
    
    if (selectedSeats.includes(seatId)) {
      console.log('Removing seat:', seatId); // Debug log
      setSelectedSeats(prev => prev.filter(id => id !== seatId));
    } else if (selectedSeats.length < 10) {
      console.log('Adding seat:', seatId); // Debug log
      setSelectedSeats(prev => [...prev, seatId]);
    } else {
      toast.warning('You can only select up to 10 seats');
    }
  };

  const handleBookTickets = async () => {
    try {
      console.log('Starting booking process...'); // Debug log
      
      if (!selectedSeats.length) {
        toast.error('Please select seats first');
        return;
      }

      const userEmail = document.getElementById('userEmail').value;
      if (!userEmail) {
        toast.error('Please enter your email');
        return;
      }

      // Get selected seat numbers and details
      const selectedSeatNumbers = selectedSeats.map(seatId => {
        const seat = availableSeats.find(seat => seat.id === seatId);
        console.log('Found seat:', seat); // Debug log
        return seat ? seat.seat_number : null;
      }).filter(Boolean);

      // Log all relevant data
      console.log('Selected Event:', selectedEvent);
      console.log('Selected Slot:', selectedSlot);
      console.log('Selected Slot Time:', selectedSlotTime);
      console.log('Selected Seats:', selectedSeats);
      console.log('Selected Seat Numbers:', selectedSeatNumbers);

      const bookingData = {
        eventId: selectedEvent.event_id,
        slotId: selectedSlot,
        seatIds: selectedSeats,
        userEmail: userEmail,
        movieName: selectedEvent.movie_name,
        eventDate: selectedEvent.event_date,
        slotTime: selectedSlotTime,
        seatNumbers: selectedSeatNumbers
      };

      console.log('Sending booking data:', bookingData); // Debug log

      const response = await fetch("http://localhost:5000/bookEventSeats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      console.log('Response status:', response.status); // Debug log
      const data = await response.json();
      console.log('Response data:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.error || "Booking failed");
      }

      // Set booking confirmation details
      setBookingConfirmationDetails({
        movieName: selectedEvent.movie_name,
        date: selectedEvent.event_date,
        time: selectedSlotTime,
        seats: selectedSeatNumbers,
        email: userEmail,
        bookingId: data.bookingId
      });

      // Show success message and confirmation
      toast.success("Booking successful!");
      setShowBookingConfirmation(true);

      // Close the booking modal
      handleCloseModal();
      
    } catch (error) {
      console.error("Error booking event:", error);
      toast.error(error.message || "Failed to book seats. Please try again.");
    }
  };

  const filteredEvents = events.filter((event) =>
    event.movie_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper function to organize seats into a grid
  const organizeSeatsIntoGrid = (seats) => {
    const grid = {};
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const cols = Array.from({ length: 10 }, (_, i) => i + 1);

    // Initialize empty grid
    rows.forEach(row => {
      grid[row] = {};
      cols.forEach(col => {
        grid[row][col] = null;
      });
    });

    // Fill in the seats
    seats.forEach(seat => {
      const row = seat.seat_number.charAt(0);
      const col = parseInt(seat.seat_number.slice(1));
      if (grid[row] && grid[row][col] === null) {
        grid[row][col] = seat;
      }
    });

    return grid;
  };

  return (
    <div className="non-academic-events-container">
      <div className="events-header">
        <h1>Non-Academic Events</h1>
        <p>Discover and book your favorite movie screenings</p>
      </div>

      <div className="search-container">
        <div className="search-input-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading events...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : filteredEvents.length === 0 ? (
        <div className="no-events">
          {searchQuery ? "No movies found matching your search." : "No movies available at the moment."}
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <div key={event.event_id} className="event-card">
              <div className="event-poster">
                <div className="poster-placeholder">
                  {event.movie_name?.charAt(0) || 'M'}
                </div>
              </div>
              <div className="event-details">
                <h3>{event.movie_name || 'Untitled Movie'}</h3>
                <div className="event-description">
                  {event.description || 'No description available'}
                </div>
                <div className="event-info">
                  <p><strong>Date:</strong> {formatDate(event.event_date)}</p>
                  <p><strong>Venue:</strong> {event.venue || 'Venue not specified'}</p>
                  <div className="time-slots">
                    <FaClock className="clock-icon" />
                    <span>{event.slot_count || 0} time slots available</span>
                  </div>
                </div>
                <button
                  className="book-now-button"
                  onClick={() => handleViewTimeSlots(event)}
                >
                  View Time Slots
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isBookingModalOpen && selectedEvent && (
        <div className="modal-overlay">
          <div className="booking-modal">
            <h2>Book {selectedEvent.movie_name}</h2>
            
            <form onSubmit={handleBookTickets} className="booking-form">
              {/* Time Slots Section */}
              <div className="time-slots-section">
                <h3>Select Show Time</h3>
                <div className="time-slots-grid">
                  {selectedEvent.slots?.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      className={`time-slot-button ${selectedSlot === slot.id ? 'selected' : ''}`}
                      onClick={() => handleSlotSelect(slot.id, slot.time)}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>

              {selectedSlot && (
                <div className="seats-selection-container">
                  <div className="header-bar"></div>
                  
                  <div className="selection-header">
                    <h2>MOVIE SEAT SELECTION</h2>
                    <p className="instruction-text">Fill The Required Details Below And Select Your Seats</p>
                  </div>

                  <div className="selection-form">
                    <div className="form-field">
                      <label>Name *</label>
                      <input 
                        type="text" 
                        id="userEmail" 
                        name="userEmail" 
                        required 
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="form-field">
                      <label>Number of Seats *</label>
                      <input 
                        type="number" 
                        value={selectedSeats.length} 
                        readOnly 
                      />
                    </div>
                  </div>

                  <div className="seat-legend">
                    <div className="legend-item">
                      <div className="legend-box legend-selected"></div>
                      <span>Selected Seat</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-box legend-reserved"></div>
                      <span>Reserved Seat</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-box"></div>
                      <span>Empty Seat</span>
                    </div>
                  </div>

                  {/* Column Numbers */}
                  <div className="column-numbers">
                    {[...Array(10)].map((_, i) => (
                      <span key={i}>{i + 1}</span>
                    ))}
                  </div>

                  {/* Seats Grid */}
                  <div className="seats-grid">
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map((row) => {
                      const seatsGrid = organizeSeatsIntoGrid(availableSeats);
                      return (
                        <div key={row} className="seat-row">
                          <span className="row-label">{row}</span>
                          {[...Array(10)].map((_, col) => {
                            const seat = seatsGrid[row][col + 1];
                            const isSelected = seat && selectedSeats.includes(seat.id);
                            const isBooked = seat && seat.is_booked;

                            return (
                              <button
                                key={`${row}${col + 1}`}
                                type="button"
                                className={`seat-button ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                                onClick={() => seat && !isBooked && handleSeatSelect(seat.id)}
                                disabled={!seat || isBooked}
                              >
                                {`${row}${col + 1}`}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>

                  <div className="screen"></div>

                  <div className="action-buttons">
                    <button 
                      type="button" 
                      className="cancel-button" 
                      onClick={handleCloseModal}
                    >
                      CANCEL
                    </button>
                    <button 
                      type="button"
                      className="book-button"
                      disabled={selectedSeats.length === 0}
                      onClick={handleBookTickets}
                    >
                      BOOK NOW
                    </button>
                  </div>
                </div>
              )}

             
            </form>
          </div>
        </div>
      )}

      {showBookingConfirmation && bookingConfirmationDetails && (
        <div className="modal-overlay">
          <div className="booking-confirmation-modal">
            <div className="confirmation-header">
              <div className="booking-success-icon">✓</div>
              <h2>Booking Confirmed!</h2>
              <p>Your tickets have been booked successfully</p>
            </div>

            <div className="confirmation-details">
              <div className="movie-details">
                <h3>{bookingConfirmationDetails.movieName}</h3>
                <p className="booking-id">Booking ID: #{bookingConfirmationDetails.bookingId}</p>
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Show Date</span>
                  <span className="detail-value">{formatDate(bookingConfirmationDetails.date)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Show Time</span>
                  <span className="detail-value">{bookingConfirmationDetails.time}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Selected Seats</span>
                  <span className="detail-value">{bookingConfirmationDetails.seats.join(', ')}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{bookingConfirmationDetails.email}</span>
                </div>
              </div>
            </div>

            <div className="confirmation-actions">
              <button 
                className="view-bookings-btn"
                onClick={() => {
                  setShowBookingConfirmation(false);
                  navigate('/bookings');
                }}
              >
                View My Bookings
              </button>
              <button 
                className="close-btn"
                onClick={() => setShowBookingConfirmation(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NonAcademicEvents; 