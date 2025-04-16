import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearMessage } from "./AuthSlice";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import './Eventslist.css';

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const userEmail = useSelector((state) => state.email.userEmail);
  const loginMessage = useSelector((state) => state.auth.message);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
        }
      } catch (error) {
        console.error("Error fetching registered events:", error);
      }
    };

    fetchRegisteredEvents();
  }, [userEmail]);

  const handleRegister = async (eventTitle) => {
    if (!userEmail) {
      toast.error("Please log in to register for events.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/registerForEvent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, eventTitle }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message);
        // Update registered events list
        setRegisteredEvents([...registeredEvents, eventTitle]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error registering for event:", error);
      toast.error("Registration failed. Please try again.");
    }
  };

  return (
    <div className="events-container">
      <div className="admin-header">
        <h1 className="admin-heading">Upcoming Events</h1>
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/")}
        >
          ⬅ Back
        </button>
      </div>
      {userEmail && <p>Logged in as: <strong>{userEmail}</strong></p>}
      
      <div className="events-list">
        {events.map((event) => {
          const isFull = event.current_registrations >= event.Max_registrations;
          const isRegistered = registeredEvents.includes(event.title);

          return (
            <div key={event.id} className="event-item">
              <h3>{event.title}</h3>
              <p><strong>Date:</strong> {event.date}</p>
              <p><strong>Time:</strong> {event.time}</p>
              <p><strong>Location:</strong> {event.venue}</p>
              <p>{event.description}</p>
              <p><strong>Registered:</strong> {event.current_registrations} / {event.Max_registrations}</p>
              <button
                onClick={() => handleRegister(event.title)}
                className="register-button"
                disabled={isFull || isRegistered}
                style={{ 
                  backgroundColor: isRegistered ? "#4CAF50" : (isFull ? "#aaa" : "#4CAF50"),
                  cursor: (isFull || isRegistered) ? "not-allowed" : "pointer"
                }}
              >
                {isRegistered ? "Already Registered" : (isFull ? "Event Full" : "Register Now")}
              </button>
            </div>
          );
        })}
      </div>
      <ToastContainer />
    </div>
  );
};

export default EventsList;
