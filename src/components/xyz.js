import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

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
  });
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deletingEventId, setDeletingEventId] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:5000/getEvents");
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventData({
      ...eventData,
      [name]: value,
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevent double submit

    setIsSubmitting(true);

    if (isEditing) {
      // Update event
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
          setEventData({ title: "", description: "", date: "", time: "", venue: "" });
        } else {
          console.error("Error updating event:", result.message);
        }
      } catch (error) {
        console.error("Error occurred during event update:", error);
      }
    } else {
      // Add new event
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

    setIsSubmitting(false); // Re-enable button after request
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
    });
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;

    setDeletingEventId(eventToDelete); // Start animation

    try {
      const response = await fetch(`http://localhost:5000/deleteEvent/${eventToDelete}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (response.ok) {
        // Wait for animation, then remove from state
        setTimeout(() => {
          setEvents(events.filter(event => event.id !== eventToDelete));
          setDeletingEventId(null);
        }, 400); // 400ms matches the CSS animation duration
        toast.success(data.message);
      } else {
        toast.error(data.message);
        setDeletingEventId(null);
      }
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
      setDeletingEventId(null);
    }
    setEventToDelete(null);
  };

  const handleAttendance = async (eventTitle) => {
    try {
      const response = await fetch(`http://localhost:5000/getRegisteredStudents/${eventTitle}`);
      const data = await response.json();
  
      if (response.ok) {
        setSelectedEvent(eventTitle);
        setRegisteredStudents(data.registeredStudents || []);  // 🟢 Ensure it's always an array
      } else {
        console.error("Error fetching registered students:", data.message);
        setRegisteredStudents([]);  // 🟢 Handle error case
      }
    } catch (error) {
      console.error("Error fetching registered students:", error);
      setRegisteredStudents([]);  // 🟢 Prevent undefined state
    }
  };
  
  return (
    <div>
      <h1>Welcome to the Admin Panel</h1>
      <p>Manage events, users, and settings here.</p>

      <button onClick={() => { setIsFormVisible(!isFormVisible); setIsEditing(false); }} className="add-event-button">
        {isFormVisible ? "Cancel" : "Add Event (+)"}
      </button>

      {isFormVisible && (
        <form onSubmit={handleFormSubmit} className="event-form">
          <div>
            <label htmlFor="title">Event Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={eventData.title}
              onChange={handleInputChange}
              required
            />
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
            <input
              type="date"
              id="date"
              name="date"
              value={eventData.date}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
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
          <div>
            <label htmlFor="venue">Event Venue</label>
            <input
              type="text"
              id="venue"
              name="venue"
              value={eventData.venue}
              onChange={handleInputChange}
              required
            />
          </div>
          <button
            type="submit"
            className="academic-submit-button"
            disabled={isSubmitting}
          >
            {isEditing ? "Update Event" : isSubmitting ? "Adding..." : "Add Event"}
          </button>
        </form>
      )}

      <div className="events-list">
        {events.map((event) => (
          <div
            key={event.id}
            className={`event-card${deletingEventId === event.id ? " deleting" : ""}`}
          >
            <h3>{event.title}</h3>
            <p><strong>Date:</strong> {event.date}</p>
            <p><strong>Time:</strong> {event.time}</p>
            <p><strong>Location:</strong> {event.venue}</p>
            <p>{event.description}</p>
            <button onClick={() => handleEdit(event)} className="edit-event-button">
              📝 Edit
            </button>
            <button onClick={() => { setEventToDelete(event.id); }} className="delete-event-button">
              🗑️ Delete
            </button>
            <button onClick={() => handleAttendance(event.title)} className="attendance-button">
              📋 Attendance
            </button>
          </div>
        ))}
      </div>
      {/* Attendance List */}
      {selectedEvent && (
        <div className="attendance-modal">
          <h2>Registered Students for {selectedEvent}</h2>
          {registeredStudents.length > 0 ? (
            <ul>
              {registeredStudents.map((student, index) => (
                <li key={index}>{student.student_email}</li>
              ))}
            </ul>
          ) : (
            <p>No students registered for this event.</p>
          )}
          

          <button onClick={() => setSelectedEvent(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
