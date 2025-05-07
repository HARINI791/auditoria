import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // also add this if not done yet
import './AdminPanel.css';
import './AttendanceSearch.css';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from './AuthSlice';
import { QRCodeCanvas } from 'qrcode.react';

const AdminPanel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const userType = useSelector((state) => state.auth.userType);

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated || userType !== 'admin') {
      navigate("/");
    }
  }, [isAuthenticated, userType, navigate]);

  const handleAdminLogout = () => {
    // Clear all admin-related data
    dispatch(logout());
    localStorage.removeItem('userEmail');
    
    // Show toast and navigate
    toast.success("Admin logged out successfully", {
      autoClose: 1000,
      hideProgressBar: true,
      onClose: () => {
        navigate("/");
      }
    });
  };

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editEventId, setEditEventId] = useState(null);
  const [events, setEvents] = useState([]);
  const [nonAcademicEvents, setNonAcademicEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    Max_registrations: "",
    session_link: ""
  });

  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [eventToDelete, setEventToDelete] = useState(null);
  const [nonAcademicEventToDelete, setNonAcademicEventToDelete] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showDoubts, setShowDoubts] = useState(false);
  const [selectedEventDoubts, setSelectedEventDoubts] = useState([]);
  const [selectedEventForDoubts, setSelectedEventForDoubts] = useState(null);
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  

  const [eventTitle, setEventTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPollFormVisible, setIsPollFormVisible] = useState(false);

  const [isNonAcademicFormVisible, setIsNonAcademicFormVisible] = useState(false);
  const [nonAcademicEventData, setNonAcademicEventData] = useState({
    movie_name: "",
    description: "",
    venue: "",
    event_date: "",
    slot_count: 1,
    slots: [
      { slot_number: 1, slot_time: "" }
    ]
  });

  const [academicScrollPosition, setAcademicScrollPosition] = useState(0);
  const [nonAcademicScrollPosition, setNonAcademicScrollPosition] = useState(0);

  const [qrEvent, setQrEvent] = useState(null);
  const [qrToken, setQrToken] = useState('');
  const [qrLoading, setQrLoading] = useState(false);

  const [deletingEventId, setDeletingEventId] = useState(null);

  // Reset form data
  const resetForm = () => {
    setEventData({
      title: "",
      description: "",
      date: "",
      time: "",
      venue: "",
      Max_registrations: "",
      session_link: ""
    });
    setIsFormVisible(false);
    setIsEditing(false);
    setEditEventId(null);
  };
  const fetchEvents = async () => {
    try {
      // Fetch academic events
      const academicResponse = await fetch("http://localhost:5000/getEvents");
      const academicData = await academicResponse.json();

      // Fetch non-academic events
      const nonAcademicResponse = await fetch("http://localhost:5000/getNonAcademicEvents");
      const nonAcademicData = await nonAcademicResponse.json();

      if (academicResponse.ok && Array.isArray(academicData.events)) {
        setEvents(academicData.events);
      } else {
        console.warn("Unexpected academic events data format:", academicData);
        setEvents([]);
      }

      if (nonAcademicResponse.ok && Array.isArray(nonAcademicData.events)) {
        setNonAcademicEvents(nonAcademicData.events);
      } else {
        console.warn("Unexpected non-academic events data format:", nonAcademicData);
        setNonAcademicEvents([]);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
      setNonAcademicEvents([]);
      toast.error("Error loading events", {
        autoClose: 1000
      });
    }
  };
  useEffect(() => {
   

    fetchEvents();
  }, []);

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
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingEvent(true);
    if (isEditing) {
      try {
        const response = await fetch("http://localhost:5000/updateEvent", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editEventId,
            ...eventData,
          }),
        });
        const result = await response.json();

        if (response.ok) {
          // Update the event in the local state
          setEvents(events.map(event =>
            event.id === editEventId ? { ...event, ...eventData } : event
          ));
          setIsEditing(false);
          setIsFormVisible(false);
          setEventData({
            title: "",
            description: "",
            date: "",
            time: "",
            venue: "",
            Max_registrations: "",
            session_link: ""
          });
          toast.success("Event updated successfully");
        } else {
          toast.error(result.message || "Error updating event");
        }
      } catch (error) {
        toast.error("Error occurred during event update");
      }
    } else {
      // Validate form data
      if (!eventData.title?.trim() || !eventData.description?.trim() || !eventData.date || 
          !eventData.time || !eventData.venue?.trim() || !eventData.Max_registrations) {
        toast.error("Please fill in all fields", {
          autoClose: 1000,
          hideProgressBar: true
        });
        return;
      }

      try {
        const formattedEventData = {
          ...eventData,
          Max_registrations: parseInt(eventData.Max_registrations) || 0
        };

        const response = await fetch("http://localhost:5000/addEvent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedEventData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to add event");
        }

        // Create a new event object
        const newEvent = {
          ...formattedEventData,
          id: result.id || Date.now()
        };

        // Update events list
        setEvents(prevEvents => [...prevEvents, newEvent]);
        resetForm();
        
        // Single toast for success
        toast.success("Event added successfully", {
          autoClose: 1000,
          hideProgressBar: true
        });
      } catch (error) {
        console.error("Error adding event:", error);
        toast.error(error.message || "Error adding event", {
          autoClose: 1000,
          hideProgressBar: true
        });
      }
    }
    setIsSubmittingEvent(false);
  };

  const handleEdit = (event) => {
    setIsFormVisible(true);
    setIsEditing(true);
    setEditEventId(event.id);
    setEventData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      venue: event.venue,
      Max_registrations: event.Max_registrations,
      session_link: event.session_link || ""
    });
  };

  const handleAcademicEventDeleteClick = (eventId) => {
    setEventToDelete(eventId);
  };

  const handleNonAcademicEventDeleteClick = (eventId) => {
    setNonAcademicEventToDelete(eventId);
  };

  const handleDeleteAcademicEvent = async () => {
    if (!eventToDelete) return;

    setDeletingEventId(eventToDelete); // Start animation
    try {
      const response = await fetch(`http://localhost:5000/deleteAcademincEvent/${eventToDelete}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        // Refresh events list
        const eventsResponse = await fetch("http://localhost:5000/events");
        const eventsData = await eventsResponse.json();
        if (eventsData.events) {
          setEvents(eventsData.events);
        }
      } else {
        toast.error(data.message);
      }
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
    setEventToDelete(null);
    setDeletingEventId(null);
  };

  const handleDeleteNonAcademicEvent = async () => {
    if (!nonAcademicEventToDelete) return;

    setDeletingEventId(nonAcademicEventToDelete); // Start animation
    try {
      const response = await fetch(`http://localhost:5000/deleteNonAcademicEvent/${nonAcademicEventToDelete}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        // Refresh events list
        const eventsResponse = await fetch("http://localhost:5000/events");
        const eventsData = await eventsResponse.json();
        if (eventsData.events) {
          setEvents(eventsData.events);
        }
      } else {
        toast.error(data.message);
      }
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
    setNonAcademicEventToDelete(null);
    setDeletingEventId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // For Max_registrations, ensure it's a positive number
    if (name === "Max_registrations") {
      const numValue = parseInt(value);
      if (numValue < 0) return; // Don't allow negative numbers
    }
    setEventData({
      ...eventData,
      [name]: value,
    });
  };

  const createAttendanceTable = async (eventTitle) => {
    try {
      const response = await fetch("http://localhost:5000/createAttendanceTable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventTitle }),
      });

      const result = await response.json();
      if (response.ok) {
        console.log(result.message);
      } else {
        console.error("Error creating attendance table:", result.message);
      }
    } catch (error) {
      console.error("Error creating attendance table:", error);
    }
  };

  const handleAttendance = async (eventTitle) => {
    try {
      const response = await fetch(`http://localhost:5000/getRegisteredStudents/${eventTitle}`);
      const data = await response.json();

      if (response.ok) {
        setSelectedEvent(eventTitle);
        setRegisteredStudents(data.registeredStudents || []);
        createAttendanceTable(eventTitle);
        setSearchQuery(''); // Reset search query when opening attendance
        setShowSearch(false); // Hide search bar when opening attendance
        
        // Fetch existing attendance data
        const attendanceResponse = await fetch(`http://localhost:5000/getAttendance/${eventTitle}`);
        const attendanceData = await attendanceResponse.json();
        
        if (attendanceResponse.ok) {
          const attendanceMap = {};
          attendanceData.attendance.forEach(record => {
            attendanceMap[record.student_email] = record.attended;
          });
          setAttendance(attendanceMap);
        }
      } else {
        console.error("Error fetching registered students:", data.message);
      }
    } catch (error) {
      console.error("Error fetching registered students:", error);
    }
  };

  const handleCheckboxChange = (studentEmail) => {
    setAttendance((prev) => ({
      ...prev,
      [studentEmail]: !prev[studentEmail],
    }));
  };

  const submitAttendance = async () => {
    try {
      for (const studentEmail in attendance) {
        const attended = attendance[studentEmail];

        await fetch("http://localhost:5000/markAttendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventTitle: selectedEvent,
            studentEmail,
            attended,
          }),
        });
      }

      alert("Attendance marked successfully!");
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error marking attendance:", error);
    }
  };

  const handleAddEventToPoll = async () => {
    if (!eventTitle.trim() || !description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/addEventToPoll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_title: eventTitle,
          event_description: description
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message);
        setEventTitle('');
        setDescription('');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error adding event to poll:', error);
      toast.error('Failed to add event to poll. Please try again.');
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const handleNonAcademicFormSubmit = async () => {
    setIsLoading(true);
    try {
      // Format the slots data to only include the time
      const formattedSlots = nonAcademicEventData.slots.map(slot => ({
        slot_time: slot.slot_time
      }));

      const response = await fetch("http://localhost:5000/addNonAcademicEvent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movie_name: nonAcademicEventData.movie_name,
          description: nonAcademicEventData.description,
          venue: nonAcademicEventData.venue,
          event_date: nonAcademicEventData.event_date,
          slots: formattedSlots
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to add non-academic event");
      }

      toast.success("Non-academic event added successfully", {
        autoClose: 1000,
        hideProgressBar: true
      });
      fetchEvents();
      // Reset form
      resetNonAcademicForm();

    } catch (error) {
      console.error("Error adding non-academic event:", error);
      toast.error(error.message || "Error adding non-academic event", {
        autoClose: 1000,
        hideProgressBar: true
      });
    }
    setIsLoading(false);
  };

  const handleNonAcademicInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "slot_count") {
      const count = parseInt(value);
      if (count >= 1 && count <= 5) {
        // Create or remove slots based on the new count
        const newSlots = Array(count).fill(null).map((_, index) => ({
          slot_number: index + 1,
          slot_time: nonAcademicEventData.slots[index]?.slot_time || ""
        }));
        
        setNonAcademicEventData(prev => ({
          ...prev,
          [name]: count,
          slots: newSlots
        }));
      }
    } else {
      setNonAcademicEventData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSlotTimeChange = (index, value) => {
    setNonAcademicEventData(prev => ({
      ...prev,
      slots: prev.slots.map((slot, i) => 
        i === index ? { ...slot, slot_time: value } : slot
      )
    }));
  };

  // Reset form data
  const resetNonAcademicForm = () => {
    setNonAcademicEventData({
      movie_name: "",
      description: "",
      venue: "",
      event_date: "",
      slot_count: 1,
      slots: [
        { slot_number: 1, slot_time: "" }
      ]
    });
    setIsNonAcademicFormVisible(false);
  };

  const scrollAcademicEvents = (direction) => {
    const container = document.querySelector('.academic-scroll-content');
    const scrollAmount = 300; // Adjust this value to control scroll distance
    const newPosition = direction === 'left' 
      ? academicScrollPosition - scrollAmount 
      : academicScrollPosition + scrollAmount;
    
    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    setAcademicScrollPosition(newPosition);
  };

  const scrollNonAcademicEvents = (direction) => {
    const container = document.querySelector('.non-academic-scroll-content');
    const scrollAmount = 300; // Adjust this value to control scroll distance
    const newPosition = direction === 'left' 
      ? nonAcademicScrollPosition - scrollAmount 
      : nonAcademicScrollPosition + scrollAmount;
    
    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    setNonAcademicScrollPosition(newPosition);
  };

  const handleGenerateQR = async (event) => {
    setQrEvent(event);
    setQrLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/generateAttendanceToken?eventId=${event.id}&slotId=1`);
      const data = await res.json();
      setQrToken(data.token);
    } catch (err) {
      setQrToken('');
      alert('Failed to generate QR');
    }
    setQrLoading(false);
  };

  const handleShowDoubts = async (event) => {
    try {
      const response = await fetch(`http://localhost:5000/events/${event.id}/doubts`);
      const data = await response.json();
      if (response.ok) {
        setSelectedEventDoubts(data);
        setSelectedEventForDoubts(event);
        setShowDoubts(true);
      } else {
        toast.error("Failed to fetch doubts");
      }
    } catch (error) {
      console.error("Error fetching doubts:", error);
      toast.error("Error fetching doubts");
    }
  };

  const [notificationSendingEventId, setNotificationSendingEventId] = useState("");
  const handleSendNotification = async (event) => {
    setIsSendingNotification(true);
    setNotificationSendingEventId(event.id);
    try {
      const response = await fetch(`http://localhost:5000/sendEventNotification/${event.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Notification sent successfully to all registered students");
      } else {
        toast.error(data.message || "Failed to send notification");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Error sending notification");
    }
    setNotificationSendingEventId("");
    setIsSendingNotification(false);
  };

  return (
    <>
      {isAuthenticated && userType === 'admin' ? (
        <div className="events-container">
          <div className="admin-header">
            <h1 className="admin-heading">Welcome to the Admin Panel</h1>
            <button type="button" className="back-button" onClick={handleAdminLogout}>
              ⬅ Back
            </button>
          </div>
          <p>Manage events, users, and settings here.</p>

          <div className="admin-buttons">
            <button
              onClick={() => {
                setIsFormVisible(!isFormVisible);
                setIsNonAcademicFormVisible(false);
                setIsEditing(false);
                setIsPollFormVisible(false);
              }}
              className="add-event-button"
            >
              {isFormVisible ? "Cancel" : "Add Academic Event (+)"}
            </button>

            <button
              onClick={() => {
                setIsNonAcademicFormVisible(!isNonAcademicFormVisible);
                setIsFormVisible(false);
                setIsEditing(false);
                setIsPollFormVisible(false);
              }}
              className="add-event-button"
            >
              {isNonAcademicFormVisible ? "Cancel" : "Add Non Academic Event (+)"}
            </button>

            <button
              onClick={() => {
                setIsPollFormVisible(!isPollFormVisible);
                setIsFormVisible(false);
                setIsNonAcademicFormVisible(false);
              }}
              className="add-event-button"
            >
              {isPollFormVisible ? "Cancel" : "Add Events to Poll (+)"}
            </button>
          </div>

          {isFormVisible && (
            <form onSubmit={handleFormSubmit} className="academic-form">
              <h2>Add Academic Event</h2>
              <div className="form-group">
                <label htmlFor="title">Event Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={eventData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter event title"
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Event Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={eventData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter event description"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Event Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={eventData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="time">Event Time</label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={eventData.time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="venue">Event Venue</label>
                  <input
                    type="text"
                    id="venue"
                    name="venue"
                    value={eventData.venue}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter venue"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="session_link">Live/Recorded Session Link (optional)</label>
                  <input
                    type="url"
                    id="session_link"
                    name="session_link"
                    value={eventData.session_link}
                    onChange={handleInputChange}
                    placeholder="Paste session link here"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="Max_registrations">Max Registrations</label>
                  <input
                    type="number"
                    id="Max_registrations"
                    name="Max_registrations"
                    value={eventData.Max_registrations}
                    onChange={handleInputChange}
                    required
                    min="1"
                    placeholder="Enter maximum registrations"
                  />
                </div>
              </div>
              <button disabled={isSubmittingEvent} type="submit" className="academic-submit-button">
                {isEditing ? "Update Event" : "Add Event"}
              </button>
            </form>
          )}

          {isNonAcademicFormVisible && (
            <div  className="non-academic-form">
              <h2>Add Non-Academic Event</h2>
              <div className="form-group">
                <label htmlFor="movie_name">Movie Name</label>
                <input
                  type="text"
                  id="movie_name"
                  name="movie_name"
                  value={nonAcademicEventData.movie_name}
                  onChange={handleNonAcademicInputChange}
                  required
                  placeholder="Enter movie name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Movie Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={nonAcademicEventData.description}
                  onChange={handleNonAcademicInputChange}
                  required
                  placeholder="Enter movie description"
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label htmlFor="venue">Venue</label>
                <input
                  type="text"
                  id="venue"
                  name="venue"
                  value={nonAcademicEventData.venue}
                  onChange={handleNonAcademicInputChange}
                  required
                  placeholder="Enter venue"
                />
              </div>
              <div className="form-group">
                <label htmlFor="event_date">Event Date</label>
                <input
                  type="date"
                  id="event_date"
                  name="event_date"
                  value={nonAcademicEventData.event_date}
                  onChange={handleNonAcademicInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="slot_count">Number of Slots (1-5)</label>
                <input
                  type="number"
                  id="slot_count"
                  name="slot_count"
                  min="1"
                  max="5"
                  value={nonAcademicEventData.slot_count}
                  onChange={handleNonAcademicInputChange}
                  required
                />
              </div>
              <div className="slots-container">
                <h3>Time Slots</h3>
                {nonAcademicEventData.slots.map((slot, index) => (
                  <div key={index} className="slot-input">
                    <label htmlFor={`slot_time_${index}`}>Slot {index + 1} Time</label>
                    <input
                      type="time"
                      id={`slot_time_${index}`}
                      value={slot.slot_time}
                      onChange={(e) => handleSlotTimeChange(index, e.target.value)}
                      required
                    />
                  </div>
                ))}
              </div>
              <button disabled={isLoading} type="button" onClick={(e)=>{
                e.preventDefault();
                e.stopPropagation()
                handleNonAcademicFormSubmit();
              }} className="non-academic-submit-button">
                Add Non-Academic Event
              </button>
            </div>
          )}

          {isPollFormVisible && (
            <form className="event-form">
              <div>
                <label htmlFor="eventTitle">Event Title</label>
                <input
                  type="text"
                  id="eventTitle"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="description">Event Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <button
                type="button"
                onClick={handleAddEventToPoll}
                className="add-event-submit-button"
              >
                Add to Poll
              </button>
            </form>
          )}

          <div className="events-list">
            <div className="events-section">
              <div className="section-header">
                <h2 className="section-title">Academic Events</h2>
              </div>
              <div className="scroll-container">
                <button 
                  className="scroll-arrow scroll-arrow-left"
                  onClick={() => scrollAcademicEvents('left')}
                  disabled={academicScrollPosition <= 0}
                >
                  ←
                </button>
                <div className="scroll-content academic-scroll-content">
                  {Array.isArray(events) && events.length > 0 ? (
                    events.map((event) =>
                      event ? (
                        <div
                          key={event.id}
                          className={`event-card${deletingEventId === event.id ? " deleting" : ""}`}
                        >
                          <div className="event-card-header">
                            <h3>{event.title}</h3>
                            <div className="event-card-actions">
                              <button 
                                onClick={() => handleEdit(event)} 
                                className="edit-icon-button"
                                title="Edit Event"
                              >
                                <svg viewBox="0 0 24 24">
                                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleAcademicEventDeleteClick(event.id)} 
                                className="delete-icon-button"
                                title="Delete Event"
                              >
                                <svg viewBox="0 0 24 24">
                                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                          <p><strong>Date:</strong> {formatDate(event.date)}</p>
                          <p><strong>Time:</strong> {formatTime(event.time)}</p>
                          <p><strong>Location:</strong> {event.venue}</p>
                          {event.session_link && (
                            <p>
                              <strong>Session Link:</strong>{" "}
                              <a href={event.session_link} target="_blank" rel="noopener noreferrer">
                                {event.session_link}
                              </a>
                            </p>
                          )}
                          <div className="event-description">
                            <p>{event.description}</p>
                          </div>
                          <div className="event-actions">
                            <button onClick={() => handleAttendance(event.title)} className="attendance-button">
                              <span className="button-icon"></span> MANAGE ATTENDANCE
                            </button>
                            <button onClick={() => handleGenerateQR(event)} className="generate-qr-button">
                              <span className="button-icon">
                                <svg viewBox="0 0 24 24">
                                  <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h8v8h-8v-8zm6 6h-4v-4h4v4z"/>
                                </svg>
                              </span>
                              Generate QR
                            </button>
                            <div className="notification-doubts-container">
                              <button onClick={() => handleShowDoubts(event)} className="show-doubts-button">
                                <span className="button-icon">
                                  <svg viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                                  </svg>
                                </span>
                                Show Doubts
                              </button>
                              <button 
                                onClick={() => handleSendNotification(event)} 
                                className="send-notification-button"
                                disabled={isSendingNotification && event.id === notificationSendingEventId}
                              >
                                <span className="button-icon">
                                  <svg viewBox="0 0 24 24">
                                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                                  </svg>
                                </span>
                                {isSendingNotification && event.id === notificationSendingEventId ? "Sending..." : "Send Notification"}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : null
                    )
                  ) : (
                    <p>No academic events found.</p>
                  )}
                </div>
                <button 
                  className="scroll-arrow scroll-arrow-right"
                  onClick={() => scrollAcademicEvents('right')}
                >
                  →
                </button>
              </div>
            </div>

            <div className="events-section">
              <div className="section-header">
                <h2 className="section-title">Non-Academic Events</h2>
              </div>
              <div className="scroll-container">
                <button 
                  className="scroll-arrow scroll-arrow-left"
                  onClick={() => scrollNonAcademicEvents('left')}
                  disabled={nonAcademicScrollPosition <= 0}
                >
                  ←
                </button>
                <div className="scroll-content non-academic-scroll-content">
                  {Array.isArray(nonAcademicEvents) && nonAcademicEvents.length > 0 ? (
                    nonAcademicEvents.map((event) =>
                      event ? (
                        <div
                          key={event.event_id}
                          className={`event-card${deletingEventId === event.event_id ? " deleting" : ""}`}
                        >
                          <h3>{event.movie_name}</h3>
                          <p><strong>Date:</strong> {formatDate(event.event_date)}</p>
                          <p><strong>Venue:</strong> {event.venue}</p>
                          <div className="event-description">
                            <p>{event.description}</p>
                          </div>
                          
                          <div className="event-actions">
                            <div className="edit-delete-buttons">
                              <button onClick={() => handleNonAcademicEventDeleteClick(event.event_id)} className="delete-event-button">
                                <span className="button-icon"></span> DELETE
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : null
                    )
                  ) : (
                    <p>No non-academic events found.</p>
                  )}
                </div>
                <button 
                  className="scroll-arrow scroll-arrow-right"
                  onClick={() => scrollNonAcademicEvents('right')}
                >
                  →
                </button>
              </div>
            </div>
          </div>

          {selectedEvent && (
            <>
              <div className="modal-overlay"></div>
              <div className="attendance-modal">
                <div className="attendance-modal-content">
                  <h2>Attendance for {selectedEvent}</h2>
                  <div className="search-toggle-container">
                    <button 
                      onClick={() => setShowSearch(!showSearch)} 
                      className="search-toggle-button"
                    >
                      <span className="button-icon"></span> {showSearch ? 'Hide Search' : 'Search'}
                    </button>
                  </div>
                  {showSearch && (
                    <div className="search-container">
                      <input
                        type="text"
                        placeholder="Search by email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                      />
                    </div>
                  )}
                  <table className="attendance-table">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registeredStudents
                        .filter(student => 
                          student.student_email.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((student) => (
                          <tr key={student.student_email}>
                            <td>{student.student_email}</td>
                            <td>
                              <input
                                type="checkbox"
                                checked={attendance[student.student_email] || false}
                                onChange={() => handleCheckboxChange(student.student_email)}
                              />
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  <div className="modal-buttons">
                    <button onClick={submitAttendance} className="submit-attendance-button">
                      Submit Attendance
                    </button>
                    <button onClick={() => {
                      setSelectedEvent(null);
                    }} className="close-button">
                     Close
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {eventToDelete && (
            <div className="delete-modal-overlay">
              <div className="delete-modal">
                <h3>Confirm Delete</h3>
                <p>Are you sure you want to delete this event? This action cannot be undone.</p>
                <div className="delete-modal-buttons">
                  <button 
                    className="delete-modal-cancel"
                    onClick={() => setEventToDelete(null)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="delete-modal-confirm"
                    onClick={handleDeleteAcademicEvent}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {nonAcademicEventToDelete && (
            <div className="delete-modal-overlay">
              <div className="delete-modal">
                <h3>Confirm Delete</h3>
                <p>Are you sure you want to delete this event? This action cannot be undone.</p>
                <div className="delete-modal-buttons">
                  <button 
                    className="delete-modal-cancel"
                    onClick={() => setEventToDelete(null)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="delete-modal-confirm"
                    onClick={handleDeleteNonAcademicEvent}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {qrEvent && (
            <div className="modal-overlay">
              <div className="qr-modal">
                <h3>Scan to Mark Attendance for {qrEvent.title || qrEvent.movie_name}</h3>
                {qrLoading ? (
                  <p>Loading QR...</p>
                ) : (
                  qrToken && <QRCodeCanvas value={qrToken} size={256} />
                )}
                <button onClick={() => setQrEvent(null)} className="close-modal-btn">Close</button>
              </div>
            </div>
          )}

          {showDoubts && (
            <div className="modal-overlay">
              <div className="doubts-modal">
                <div className="doubts-modal-content">
                  <h2>Doubts for {selectedEventForDoubts?.title}</h2>
                  <button 
                    className="close-doubts-button"
                    onClick={() => {
                      setShowDoubts(false);
                      setSelectedEventDoubts([]);
                      setSelectedEventForDoubts(null);
                    }}
                  >
                    ×
                  </button>
                  <div className="doubts-list">
                    {selectedEventDoubts.length > 0 ? (
                      selectedEventDoubts.map((doubt, index) => (
                        <div key={doubt.id} className="doubt-item">
                          <div className="doubt-header">
                            <span className="doubt-user">{doubt.user_name}</span>
                            <span className="doubt-time">
                              {new Date(doubt.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="doubt-text">{doubt.doubt_text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="no-doubts">No doubts have been asked for this event yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </>
  );
};

export default AdminPanel;
