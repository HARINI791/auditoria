import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // also add this if not done yet
import './AdminPanel.css';
import './AttendanceSearch.css';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from './AuthSlice';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    Max_registrations: ""
  });

  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [eventToDelete, setEventToDelete] = useState(null);

  const [eventTitle, setEventTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPollFormVisible, setIsPollFormVisible] = useState(false);

  // Reset form data
  const resetForm = () => {
    setEventData({
      title: "",
      description: "",
      date: "",
      time: "",
      venue: "",
      Max_registrations: ""
    });
    setIsFormVisible(false);
    setIsEditing(false);
    setEditEventId(null);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:5000/getEvents");
        const data = await response.json();

        if (response.ok && Array.isArray(data.events)) {
          setEvents(data.events);
        } else {
          console.warn("Unexpected data format:", data);
          setEvents([]);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
        toast.error("Error loading events", {
          autoClose: 1000
        });
      }
    };

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

  const handleFormSubmit = async (e) => {
    e.preventDefault();

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
    });
  };

  const handleDelete = async (eventId) => {
    // setEventToDelete(eventId);
    try {
      const response = await fetch(`http://localhost:5000/deleteEvent/${eventId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        setEvents(events.filter((event) => event.id !== eventId));
        console.log("Event deleted successfully:", result);
      } else {
        console.error("Error deleting event:", result.message);
      }
    } catch (error) {
      console.error("Error occurred during event deletion:", error);
    }
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
                setIsEditing(false);
                setIsPollFormVisible(false);
              }}
              className="add-event-button"
            >
              {isFormVisible ? "Cancel" : "Add Event (+)"}
            </button>

            <button
              onClick={() => {
                setIsPollFormVisible(!isPollFormVisible);
                setIsFormVisible(false);
              }}
              className="add-event-button"
            >
              {isPollFormVisible ? "Cancel" : "Add Events to Poll (+)"}
            </button>
          </div>

          {isFormVisible && (
            <form onSubmit={handleFormSubmit} className="event-form">
              <div>
                <label htmlFor="title">Event Title</label>
                <input type="text" id="title" name="title" value={eventData.title} onChange={handleInputChange} required />
              </div>
              <div>
                <label htmlFor="description">Event Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={eventData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="date">Event Date</label>
                <input type="date" id="date" name="date" value={eventData.date} onChange={handleInputChange} required />
              </div>
              <div>
                <label htmlFor="time">Event Time</label>
                <input type="time" id="time" name="time" value={eventData.time} onChange={handleInputChange} required />
              </div>
              <div>
                <label htmlFor="venue">Event Venue</label>
                <input type="text" id="venue" name="venue" value={eventData.venue} onChange={handleInputChange} required />
              </div>
              <div>
                <label htmlFor="Max_registrations">Max Registrations</label>
                <input
                  type="number"
                  id="Max_registrations"
                  name="Max_registrations"
                  value={eventData.Max_registrations}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit" className="add-event-submit-button">
                {isEditing ? "Update Event" : "Add Event"}
              </button>
            </form>
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
            {Array.isArray(events) && events.length > 0 ? (
              events.map((event) =>
                event ? (
                  <div key={event.id} className="event-item">
                    <div className="event-content">
                      <h3>{event.title}</h3>
                      <p><strong>Date:</strong> {formatDate(event.date)}</p>
                      <p><strong>Time:</strong> {formatTime(event.time)}</p>
                      <p><strong>Location:</strong> {event.venue}</p>
                      <div className="event-description">
                        <p>{event.description}</p>
                      </div>
                    </div>
                    <div className="event-actions">
                      <div className="edit-delete-buttons">
                        <button onClick={() => handleEdit(event)} className="edit-event-button">
                          <span className="button-icon"></span> EDIT
                        </button>
                        <button onClick={() => handleDelete(event.id)} className="delete-event-button">
                          <span className="button-icon"></span> DELETE
                        </button>
                      </div>
                      <button onClick={() => handleAttendance(event.title)} className="attendance-button">
                        <span className="button-icon"></span> MANAGE ATTENDANCE
                      </button>
                    </div>
                  </div>
                ) : null
              )
            ) : (
              <p>No events found.</p>
            )}
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
        </div>
      ) : null}
    </>
  );
};

export default AdminPanel;