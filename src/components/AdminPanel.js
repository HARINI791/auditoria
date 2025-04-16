import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // also add this if not done yet
import './AdminPanel.css';

const AdminPanel = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editEventId, setEditEventId] = useState(null);
  const [events, setEvents] = useState([]);
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    Max_registrations: "",
  });

  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [eventToDelete, setEventToDelete] = useState(null);
  const navigate = useNavigate();

  const [eventTitle, setEventTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPollFormVisible, setIsPollFormVisible] = useState(false);

    useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:5000/getEvents");
        const data = await response.json();
        console.log("Fetched events:", data); // Debug

        if (Array.isArray(data.events)) {
          setEvents(data.events);
        } else {
          console.warn("Unexpected data format:", data);
          setEvents([]);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        setEvents([]);
      }
    };

    fetchEvents();
  }, []);

 

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (isEditing) {
      try {
        const response = await fetch("http://localhost:5000/updateEvent", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: editEventId, ...eventData }),
        });

        const result = await response.json();

        if (response.ok) {
          console.log("Event updated successfully:", result);
          setEvents(events.map((event) => (event.id === editEventId ? { ...event, ...eventData } : event)));
          setIsEditing(false);
          setIsFormVisible(false);
          setEventData({ title: "", description: "", date: "", time: "", venue: "", Max_registrations: "" });
        } else {
          console.error("Error updating event:", result.message);
        }
      } catch (error) {
        console.error("Error occurred during event update:", error);
      }
    } else {
      try {
        const response = await fetch("http://localhost:5000/addEvent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventData),
        });

        const result = await response.json();

        if (response.ok) {
          console.log("Event added successfully:", result);
          setEvents([...events, result.event]);
          setIsFormVisible(false);
        } else {
          console.error("Error adding event:", result.message);
        }
      } catch (error) {
        console.error("Error occurred during form submission:", error);
      }
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
    <div className="events-container">
      <div className="admin-header">
        <h1 className="admin-heading">Welcome to the Admin Panel</h1>
        <button type="button" className="back-button" onClick={() => navigate("/")}>
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
                <h3>{event.title}</h3>
                <p><strong>Date:</strong> {event.date}</p>
                <p><strong>Time:</strong> {event.time}</p>
                <p><strong>Location:</strong> {event.venue}</p>
                <p>{event.description}</p>
                <div className="event-actions">
                  <div className="edit-delete-buttons">
                    <button onClick={() => handleEdit(event)} className="edit-event-button">
                      <span className="button-icon">✏️</span> EDIT
                    </button>
                    <button onClick={() => handleDelete(event.id)} className="delete-event-button">
                      <span className="button-icon">🗑️</span> DELETE
                    </button>
                  </div>
                  <button onClick={() => handleAttendance(event.title)} className="attendance-button">
                    <span className="button-icon">👥</span> MANAGE ATTENDANCE
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
        <div className="attendance-modal">
          <h2>Take Attendance for {selectedEvent}</h2>
          
          {registeredStudents.length > 0 ? (
            <ul className="attendance-list">
              {registeredStudents.map((student, index) => (
                <li key={index} className="student-item">
                  <span>{student.student_email}</span>
                  <input
                    type="checkbox"
                    checked={!!attendance[student.student_email]}
                    onChange={() => handleCheckboxChange(student.student_email)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p>No students registered for this event.</p>
          )}
          
          <div className="modal-buttons">
            <button onClick={submitAttendance} className="submit-attendance-button">
              ✅ Submit Attendance
            </button>
            <button onClick={() => {
              setSelectedEvent(null);
            }} className="close-button">
              ❌ Close
            </button>
          </div>
        </div>
      )}
     

       <ToastContainer /> 
    </div>
  );
};

export default AdminPanel;