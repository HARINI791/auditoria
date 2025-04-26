import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearMessage } from "./AuthSlice";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaSearch } from 'react-icons/fa';
import './Eventslist.css';

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const userEmail = useSelector((state) => state.email.userEmail);
  const loginMessage = useSelector((state) => state.auth.message);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [scrollPosition, setScrollPosition] = useState(0);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  useEffect(() => {
    if (!userEmail) {
      toast.error("Please log in to access the events list.");
      navigate("/authPage");
    }
  }, [userEmail, navigate]);

  useEffect(() => {
    if (loginMessage) {
      dispatch(clearMessage());
    }
  }, [loginMessage, dispatch]);

  // Fetch all events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:5000/events");
        const data = await response.json();
        if (data.events) {
          setEvents(data.events);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  // Fetch user's registered events
  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      if (!userEmail) return;
      
      try {
        const response = await fetch(`http://localhost:5000/getRegisteredEvents/${userEmail}`);
        const data = await response.json();
        if (data.events) {
          setRegisteredEvents(data.events.map(event => event.title));
        } else {
          setRegisteredEvents([]); // Ensure empty array if no events
        }
      } catch (error) {
        console.error("Error fetching registered events:", error);
        setRegisteredEvents([]); // Reset to empty array on error
      }
    };

    fetchRegisteredEvents();
  }, [userEmail]);

  const handleRegister = async (eventTitle, eventDate, eventTime, eventDescription, eventVenue) => {
    if (!userEmail) {
      toast.error("Please log in to register for events.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/registerForEvent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, eventTitle, eventDate, eventTime, eventDescription, eventVenue }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message);
        // Update registered events list
        setRegisteredEvents(prev => [...prev, eventTitle]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error registering for event:", error);
      toast.error("Registration failed. Please try again.");
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollEvents = (direction) => {
    const container = document.querySelector('.events-scroll-content');
    const scrollAmount = 300; // Adjust this value to control scroll distance
    const newPosition = direction === 'left' 
      ? scrollPosition - scrollAmount 
      : scrollPosition + scrollAmount;
    
    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    setScrollPosition(newPosition);
  };

  return (
    <div className="events-container">
      <div className="admin-header">
       
        <h1 className="admin-heading">Upcoming Events</h1>
        <div className="header-right">
          <div className="search-container">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search for Events.."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
       
          <button
            type="button"
            className="back-button"
            onClick={() => navigate("/")}
          >
            ⬅ Back
          </button>
        </div>
      </div>
      {userEmail && <p>Logged in as: <strong>{userEmail}</strong></p>}
      
      <div className="events-list">
        <div className="events-section">
          <div className="section-header">
            <h2 className="section-title">Academic Events</h2>
          </div>
          <div className="scroll-container">
            <button 
              className="scroll-arrow scroll-arrow-left"
              onClick={() => scrollEvents('left')}
              disabled={scrollPosition <= 0}
            >
              ←
            </button>
            <div className="scroll-content events-scroll-content">
              {Array.isArray(filteredEvents) && filteredEvents.length > 0 ? (
                filteredEvents.map((event) => {
                  const isFull = event.current_registrations >= event.Max_registrations;
                  const isRegistered = registeredEvents.includes(event.title);

                  return (
                    <div key={event.id} className="event-card">
                      <h3>{event.title}</h3>
                      <p><strong>Date:</strong> {formatDate(event.date)}</p>
                      <p><strong>Time:</strong> {formatTime(event.time)}</p>
                      <p><strong>Location:</strong> {event.venue}</p>
                      <div className="event-description">
                        <p>{event.description}</p>
                      </div>
                      <div className="event-actions">
                        <button
                          onClick={() => handleRegister(event.title, event.date, event.time, event.description, event.venue)}
                          className={`register-button ${isRegistered ? 'registered' : ''}`}
                          disabled={isFull || isRegistered}
                        >
                          {isRegistered ? 'Registered' : (isFull ? 'Event Full' : 'Register')}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>No events found matching your search.</p>
              )}
            </div>
            <button 
              className="scroll-arrow scroll-arrow-right"
              onClick={() => scrollEvents('right')}
            >
              →
            </button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default EventsList;
