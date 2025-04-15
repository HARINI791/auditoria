import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // also add this if not done yet

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
  const navigate = useNavigate();

    // 🛡️ Check for admin access on mount
    useEffect(() => {
      const userRole = localStorage.getItem("role"); // or localStorage.getItem("isAdmin")
      if (userRole !== "admin") {
        //alert("Unauthorized access! Redirecting to home.");
        navigate("/adminLogin"); // or navigate("/login")
        toast.error("Oops! This page is restricted to administrators only.");

      }
    }, [navigate]);
  

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
        setAttendance({});
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

  return (
    <div className="events-container">
      <div className="admin-header">
        <h1 className="admin-heading">Welcome to the Admin Panel</h1>
        <button type="button" className="back-button" onClick={() => navigate("/")}>
          ⬅ Back
        </button>
      </div>
      <p>Manage events, users, and settings here.</p>

      <button
        onClick={() => {
          setIsFormVisible(!isFormVisible);
          setIsEditing(false);
        }}
        className="add-event-button"
      >
        {isFormVisible ? "Cancel" : "Add Event (+)"}
      </button>

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

      <div className="events-list">
        {Array.isArray(events) && events.length > 0 ? (
          events.map((event) => (
            <div key={event.id} className="event-item">
              <h3>{event.title}</h3>
              <p><strong>Date:</strong> {event.date}</p>
              <p><strong>Time:</strong> {event.time}</p>
              <p><strong>Location:</strong> {event.venue}</p>
              <p>{event.description}</p>
              <button onClick={() => handleEdit(event)} className="edit-event-button">EDIT</button>
              <button onClick={() => handleDelete(event.id)} className="delete-event-button">DELETE</button>
              <button onClick={() => handleAttendance(event.title)} className="attendance-button">
                MANAGE ATTENDANCE
              </button>
            </div>
          ))
        ) : (
          <p>No events found.</p>
        )}
      </div>

      {selectedEvent && (
        <div className="attendance-modal">
          <h2>Take Attendance for {selectedEvent}</h2>
          {registeredStudents.length > 0 ? (
            <ul>
              {registeredStudents.map((student, index) => (
                <li key={index}>
                  {student.student_email}
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
          <button onClick={submitAttendance} className="submit-attendance-button">✅ Submit Attendance</button>
          <button onClick={() => setSelectedEvent(null)}>❌ Close</button>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;


// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";  

// const AdminPanel = () => {
//   const [isFormVisible, setIsFormVisible] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editEventId, setEditEventId] = useState(null);
//   const [events, setEvents] = useState([]);
//   const [eventData, setEventData] = useState({
//     title: "",
//     description: "",
//     date: "",
//     time: "",
//     venue: "",
//     Max_registrations: "", // ← Add this
//   });

//   const [registeredStudents, setRegisteredStudents] = useState([]);
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [attendance, setAttendance] = useState({}); // Store attendance state
//   const navigate = useNavigate(); 

//   // Fetch events from backend
//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         const response = await fetch("http://localhost:5000/getEvents");
//         const data = await response.json();
//         if (data.events) {
//           setEvents(data.events);
//         }
//       } catch (error) {
//         console.error("Error fetching events:", error);
//       }
//     };

//     fetchEvents();
//   }, []);
//   const handleFormSubmit = async (e) => {
//     e.preventDefault();
    
//     if (isEditing) {
//       // Update event
//       try {
//         const response = await fetch("http://localhost:5000/updateEvent", {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ id: editEventId, ...eventData }),
//         });

//         const result = await response.json();

//         if (response.ok) {
//           console.log("Event updated successfully:", result);
//           setEvents(events.map((event) => (event.id === editEventId ? { ...event, ...eventData } : event)));
//           setIsEditing(false);
//           setIsFormVisible(false);
//           setEventData({ title: "", description: "", date: "", time: "", venue: "", Max_registrations: ""});
//         } else {
//           console.error("Error updating event:", result.message);
//         }
//       } catch (error) {
//         console.error("Error occurred during event update:", error);
//       }
//     } else {
//       // Add new event
//       try {
//         const response = await fetch("http://localhost:5000/addEvent", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(eventData),
//         });

//         const result = await response.json();

//         if (response.ok) {
//           console.log("Event added successfully:", result);
//           setEvents([...events, result.event]);
//           setIsFormVisible(false);
//         } else {
//           console.error("Error adding event:", result.message);
//         }
//       } catch (error) {
//         console.error("Error occurred during form submission:", error);
//       }
//     }
//   };

//   const handleEdit = (event) => {
//     setIsFormVisible(true);
//     setIsEditing(true);
//     setEditEventId(event.id);
//     setEventData({
//       title: event.title,
//       description: event.description,
//       date: event.date,
//       time: event.time,
//       venue: event.venue,
//       Max_registrations: event.Max_registrations,
//     });
//   };

//   const handleDelete = async (eventId) => {
//     try {
//       const response = await fetch(`http://localhost:5000/deleteEvent/${eventId}`, {
//         method: "DELETE",
//       });

//       const result = await response.json();

//       if (response.ok) {
//         setEvents(events.filter((event) => event.id !== eventId));
//         console.log("Event deleted successfully:", result);
//       } else {
//         console.error("Error deleting event:", result.message);
//       }
//     } catch (error) {
//       console.error("Error occurred during event deletion:", error);
//     }
//   };
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setEventData({
//       ...eventData,
//       [name]: value,
//     });
//   };

//   // Create Attendance Table for the event
//   const createAttendanceTable = async (eventTitle) => {
//     try {
//       const response = await fetch("http://localhost:5000/createAttendanceTable", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ eventTitle }),
//       });

//       const result = await response.json();
//       if (response.ok) {
//         console.log(result.message);
//       } else {
//         console.error("Error creating attendance table:", result.message);
//       }
//     } catch (error) {
//       console.error("Error creating attendance table:", error);
//     }
//   };

//   // Fetch registered students for the selected event
//   const handleAttendance = async (eventTitle) => {
//     try {
//       const response = await fetch(`http://localhost:5000/getRegisteredStudents/${eventTitle}`);
//       const data = await response.json();

//       if (response.ok) {
//         setSelectedEvent(eventTitle);
//         setRegisteredStudents(data.registeredStudents || []);
//         createAttendanceTable(eventTitle); // Ensure attendance table is created
//         setAttendance({}); // Reset attendance selection
//       } else {
//         console.error("Error fetching registered students:", data.message);
//       }
//     } catch (error) {
//       console.error("Error fetching registered students:", error);
//     }
//   };

//   // Handle checkbox change for marking attendance
//   const handleCheckboxChange = (studentEmail) => {
//     setAttendance((prev) => ({
//       ...prev,
//       [studentEmail]: !prev[studentEmail], // Toggle attendance state
//     }));
//   };

//   // Submit attendance to the backend
//   const submitAttendance = async () => {
//     try {
//       for (const studentEmail in attendance) {
//         const attended = attendance[studentEmail];

//         await fetch("http://localhost:5000/markAttendance", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             eventTitle: selectedEvent,
//             studentEmail,
//             attended,
//           }),
//         });
//       }

//       alert("Attendance marked successfully!");
//       setSelectedEvent(null); // Close modal
//     } catch (error) {
//       console.error("Error marking attendance:", error);
//     }
//   };

//   return (
//     <div className="events-container">
//     <div className="admin-header">
//   <h1 className="admin-heading">Welcome to the Admin Panel</h1>
//   <button
//     type="button"
//     className="back-button"
//     onClick={() => navigate("/")}
//   >
//     ⬅ Back
//   </button>
// </div>
//       {/* <button
//   type="button"  // <--- Add this to prevent form submission
//   className="auth-button"
//   onClick={() => navigate("/")}
// >
//   Back
// </button> */}
//       <p>Manage events, users, and settings here.</p>

     

//       <button
//         onClick={() => {
//           setIsFormVisible(!isFormVisible);
//           setIsEditing(false);
//         }}
//         className="add-event-button"
//       >
//         {isFormVisible ? "Cancel" : "Add Event (+)"}
//       </button>
//       {isFormVisible && (
//         <form onSubmit={handleFormSubmit} className="event-form">
//           <div>
//             <label htmlFor="title">Event Title</label>
//             <input
//               type="text"
//               id="title"
//               name="title"
//               value={eventData.title}
//               onChange={handleInputChange}
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="description">Event Description</label>
//             <textarea
//               id="description"
//               name="description"
//               value={eventData.description}
//               onChange={handleInputChange}
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="date">Event Date</label>
//             <input
//               type="date"
//               id="date"
//               name="date"
//               value={eventData.date}
//               onChange={handleInputChange}
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="time">Event Time</label>
//             <input
//               type="time"
//               id="time"
//               name="time"
//               value={eventData.time}
//               onChange={handleInputChange}
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="venue">Event Venue</label>
//             <input
//               type="text"
//               id="venue"
//               name="venue"
//               value={eventData.venue}
//               onChange={handleInputChange}
//               required
//             />
//           </div>
//           <div>
//   <label htmlFor="Max_registrations">Max Registrations</label>
//   <input
//     type="number"
//     id="Max_registrations"
//     name="Max_registrations"
//     value={eventData.Max_registrations}
//     onChange={handleInputChange}
//     required
//   />
// </div>

//           <button type="submit" className="add-event-submit-button">
//             {isEditing ? "Update Event" : "Add Event"}
//           </button>
//         </form>
//       )}
//       {/* Event List */}
//       <div className="events-list">
//         {events.map((event) => (
//           <div key={event.id} className="event-item">
//             <h3>{event.title}</h3>
//             <p><strong>Date:</strong> {event.date}</p>
//             <p><strong>Time:</strong> {event.time}</p>
//             <p><strong>Location:</strong> {event.venue}</p>
//             <p>{event.description}</p>
//             <button onClick={() => handleEdit(event)} className="edit-event-button">
//               EDIT
//             </button>
//             <button onClick={() => handleDelete(event.id)} className="delete-event-button">
//              DELETE
//             </button>
//             <button onClick={() => handleAttendance(event.title)} className="attendance-button">
//               MANAGE  ATTENDANCE
//             </button>
//           </div>
//         ))}
//       </div>

//       {/* Attendance Modal */}
//       {selectedEvent && (
//         <div className="attendance-modal">
//           <h2>Take Attendance for {selectedEvent}</h2>

//           {registeredStudents.length > 0 ? (
//             <ul>
//               {registeredStudents.map((student, index) => (
//                 <li key={index}>
//                   {student.student_email}
//                   <input
//                     type="checkbox"
//                     checked={!!attendance[student.student_email]} // Convert undefined to false
//                     onChange={() => handleCheckboxChange(student.student_email)}
//                   />
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p>No students registered for this event.</p>
//           )}

//           <button onClick={submitAttendance} className="submit-attendance-button">
//             ✅ Submit Attendance
//           </button>
//           <button onClick={() => setSelectedEvent(null)}>❌ Close</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminPanel;















// import React, { useState, useEffect } from "react";

// const AdminPanel = () => {
//   const [isFormVisible, setIsFormVisible] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editEventId, setEditEventId] = useState(null);
//   const [events, setEvents] = useState([]);
//   const [eventData, setEventData] = useState({
//     title: "",
//     description: "",
//     date: "",
//     time: "",
//     venue: "",
//   });
//   const [registeredStudents, setRegisteredStudents] = useState([]);
//   const [selectedEvent, setSelectedEvent] = useState(null);

//   // Fetch events from backend
//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         const response = await fetch("http://localhost:5000/getEvents");
//         const data = await response.json();
//         if (data.events) {
//           setEvents(data.events);
//         }
//       } catch (error) {
//         console.error("Error fetching events:", error);
//       }
//     };

//     fetchEvents();
//   }, []);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setEventData({
//       ...eventData,
//       [name]: value,
//     });
//   };

//   const handleFormSubmit = async (e) => {
//     e.preventDefault();
    
//     if (isEditing) {
//       // Update event
//       try {
//         const response = await fetch("http://localhost:5000/updateEvent", {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ id: editEventId, ...eventData }),
//         });

//         const result = await response.json();

//         if (response.ok) {
//           console.log("Event updated successfully:", result);
//           setEvents(events.map((event) => (event.id === editEventId ? { ...event, ...eventData } : event)));
//           setIsEditing(false);
//           setIsFormVisible(false);
//           setEventData({ title: "", description: "", date: "", time: "", venue: "" });
//         } else {
//           console.error("Error updating event:", result.message);
//         }
//       } catch (error) {
//         console.error("Error occurred during event update:", error);
//       }
//     } else {
//       // Add new event
//       try {
//         const response = await fetch("http://localhost:5000/addEvent", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(eventData),
//         });

//         const result = await response.json();

//         if (response.ok) {
//           console.log("Event added successfully:", result);
//           setEvents([...events, result.event]);
//           setIsFormVisible(false);
//         } else {
//           console.error("Error adding event:", result.message);
//         }
//       } catch (error) {
//         console.error("Error occurred during form submission:", error);
//       }
//     }
//   };

//   const handleEdit = (event) => {
//     setIsFormVisible(true);
//     setIsEditing(true);
//     setEditEventId(event.id);
//     setEventData({
//       title: event.title,
//       description: event.description,
//       date: event.date,
//       time: event.time,
//       venue: event.venue,
//     });
//   };

//   const handleDelete = async (eventId) => {
//     try {
//       const response = await fetch(`http://localhost:5000/deleteEvent/${eventId}`, {
//         method: "DELETE",
//       });

//       const result = await response.json();

//       if (response.ok) {
//         setEvents(events.filter((event) => event.id !== eventId));
//         console.log("Event deleted successfully:", result);
//       } else {
//         console.error("Error deleting event:", result.message);
//       }
//     } catch (error) {
//       console.error("Error occurred during event deletion:", error);
//     }
//   };

//   // const handleAttendance = async (eventTitle) => {
//   //   try {
//   //     const response = await fetch(`http://localhost:5000/getRegisteredStudents/${eventTitle}`);
//   //     const data = await response.json();

//   //     if (response.ok) {
//   //       setSelectedEvent(eventTitle);
//   //       setRegisteredStudents(data.registeredStudents);
//   //     } else {
//   //       console.error("Error fetching registered students:", data.message);
//   //     }
//   //   } catch (error) {
//   //     console.error("Error fetching registered students:", error);
//   //   }
//   // };
//   const handleAttendance = async (eventTitle) => {
//     try {
//       const response = await fetch(`http://localhost:5000/getRegisteredStudents/${eventTitle}`);
//       const data = await response.json();
  
//       if (response.ok) {
//         setSelectedEvent(eventTitle);
//         setRegisteredStudents(data.registeredStudents || []);  // 🟢 Ensure it's always an array
//       } else {
//         console.error("Error fetching registered students:", data.message);
//         setRegisteredStudents([]);  // 🟢 Handle error case
//       }
//     } catch (error) {
//       console.error("Error fetching registered students:", error);
//       setRegisteredStudents([]);  // 🟢 Prevent undefined state
//     }
//   };
  
//   return (
//     <div>
//       <h1>Welcome to the Admin Panel</h1>
//       <p>Manage events, users, and settings here.</p>

//       <button onClick={() => { setIsFormVisible(!isFormVisible); setIsEditing(false); }} className="add-event-button">
//         {isFormVisible ? "Cancel" : "Add Event (+)"}
//       </button>

//       {isFormVisible && (
//         <form onSubmit={handleFormSubmit} className="event-form">
//           <div>
//             <label htmlFor="title">Event Title</label>
//             <input
//               type="text"
//               id="title"
//               name="title"
//               value={eventData.title}
//               onChange={handleInputChange}
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="description">Event Description</label>
//             <textarea
//               id="description"
//               name="description"
//               value={eventData.description}
//               onChange={handleInputChange}
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="date">Event Date</label>
//             <input
//               type="date"
//               id="date"
//               name="date"
//               value={eventData.date}
//               onChange={handleInputChange}
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="time">Event Time</label>
//             <input
//               type="time"
//               id="time"
//               name="time"
//               value={eventData.time}
//               onChange={handleInputChange}
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="venue">Event Venue</label>
//             <input
//               type="text"
//               id="venue"
//               name="venue"
//               value={eventData.venue}
//               onChange={handleInputChange}
//               required
//             />
//           </div>
//           <button type="submit" className="add-event-submit-button">
//             {isEditing ? "Update Event" : "Add Event"}
//           </button>
//         </form>
//       )}

//       <div className="events-list">
//         {events.map((event) => (
//           <div key={event.id} className="event-item">
//             <h3>{event.title}</h3>
//             <p><strong>Date:</strong> {event.date}</p>
//             <p><strong>Time:</strong> {event.time}</p>
//             <p><strong>Location:</strong> {event.venue}</p>
//             <p>{event.description}</p>
//             <button onClick={() => handleEdit(event)} className="edit-event-button">
//               📝 Edit
//             </button>
//             <button onClick={() => handleDelete(event.id)} className="delete-event-button">
//               🗑️ Delete
//             </button>
//             <button onClick={() => handleAttendance(event.title)} className="attendance-button">
//               📋 Attendance
//             </button>
//           </div>
//         ))}
//       </div>
//       {/* Attendance List */}
//       {selectedEvent && (
//         <div className="attendance-modal">
//           <h2>Registered Students for {selectedEvent}</h2>
//           {registeredStudents.length > 0 ? (
//             <ul>
//               {registeredStudents.map((student, index) => (
//                 <li key={index}>{student.student_email}</li>
//               ))}
//             </ul>
//           ) : (
//             <p>No students registered for this event.</p>
//           )}
          

//           <button onClick={() => setSelectedEvent(null)}>Close</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminPanel;


// // // import React, { useState, useEffect } from "react"; 

// // // const AdminPanel = () => {
// // //   const [isFormVisible, setIsFormVisible] = useState(false);
// // //   const [eventData, setEventData] = useState({
// // //     title: "",
// // //     description: "",
// // //     date: "",
// // //     time: "",
// // //     venue: "",
// // //   });
// // //   const [events, setEvents] = useState([]);

// // //   // Fetch events from backend
// // //   useEffect(() => {
// // //     const fetchEvents = async () => {
// // //       try {
// // //         const response = await fetch("http://localhost:5000/events");
// // //         const data = await response.json();
// // //         if (data.events) {
// // //           setEvents(data.events);
// // //         }
// // //       } catch (error) {
// // //         console.error("Error fetching events:", error);
// // //       }
// // //     };

// // //     fetchEvents();
// // //   }, []);

// // //   const handleInputChange = (e) => {
// // //     const { name, value } = e.target;
// // //     setEventData({
// // //       ...eventData,
// // //       [name]: value,
// // //     });
// // //   };

// // //   const handleFormSubmit = async (e) => {
// // //     e.preventDefault();
// // //     console.log("Event Data Submitted: ", eventData);

// // //     try {
// // //       const response = await fetch("http://localhost:5000/addEvent", {
// // //         method: "POST",
// // //         headers: {
// // //           "Content-Type": "application/json",
// // //         },
// // //         body: JSON.stringify(eventData),
// // //       });

// // //       const result = await response.json();

// // //       if (response.ok) {
// // //         console.log("Event added successfully:", result);
// // //         setIsFormVisible(false); // Hide form after submission
// // //         setEvents([...events, result.event]); // Update event list after adding a new event
// // //       } else {
// // //         console.error("Error adding event:", result.message);
// // //       }
// // //     } catch (error) {
// // //       console.error("Error occurred during form submission:", error);
// // //     }
// // //   };

// // //   // Delete Event function
// // //   const handleDelete = async (eventId) => {
// // //     try {
// // //       const response = await fetch(`http://localhost:5000/deleteEvent/${eventId}`, {
// // //         method: "DELETE",
// // //       });

// // //       const result = await response.json();

// // //       if (response.ok) {
// // //         // Remove the deleted event from the list
// // //         setEvents(events.filter((event) => event.id !== eventId));
// // //         console.log("Event deleted successfully:", result);
// // //       } else {
// // //         console.error("Error deleting event:", result.message);
// // //       }
// // //     } catch (error) {
// // //       console.error("Error occurred during event deletion:", error);
// // //     }
// // //   };

// // //   return (
// // //     <div>
// // //       <h1>Welcome to the Admin Panel</h1>
// // //       <p>Manage events, users, and settings here.</p>

// // //       <button onClick={() => setIsFormVisible(!isFormVisible)} className="add-event-button">
// // //         {isFormVisible ? "Cancel" : "Add Event (+)"}
// // //       </button>

// // //       {isFormVisible && (
// // //         <form onSubmit={handleFormSubmit} className="event-form">
// // //           <div>
// // //             <label htmlFor="title">Event Title</label>
// // //             <input
// // //               type="text"
// // //               id="title"
// // //               name="title"
// // //               value={eventData.title}
// // //               onChange={handleInputChange}
// // //               required
// // //             />
// // //           </div>
// // //           <div>
// // //             <label htmlFor="description">Event Description</label>
// // //             <textarea
// // //               id="description"
// // //               name="description"
// // //               value={eventData.description}
// // //               onChange={handleInputChange}
// // //               required
// // //             />
// // //           </div>
// // //           <div>
// // //             <label htmlFor="date">Event Date</label>
// // //             <input
// // //               type="date"
// // //               id="date"
// // //               name="date"
// // //               value={eventData.date}
// // //               onChange={handleInputChange}
// // //               required
// // //             />
// // //           </div>
// // //           <div>
// // //             <label htmlFor="time">Event Time</label>
// // //             <input
// // //               type="time"
// // //               id="time"
// // //               name="time"
// // //               value={eventData.time}
// // //               onChange={handleInputChange}
// // //               required
// // //             />
// // //           </div>
// // //           <div>
// // //             <label htmlFor="venue">Event Venue</label>
// // //             <input
// // //               type="text"
// // //               id="venue"
// // //               name="venue"
// // //               value={eventData.venue}
// // //               onChange={handleInputChange}
// // //               required
// // //             />
// // //           </div>
// // //           <button type="submit" className="add-event-submit-button">
// // //             Add Event
// // //           </button>
// // //         </form>
// // //       )}

// // //       <div className="events-list">
// // //         {events.map((event) => (
// // //           <div key={event.id} className="event-item">
// // //             <h3>{event.title}</h3>
// // //             <p><strong>Date:</strong> {event.date}</p>
// // //             <p><strong>Time:</strong> {event.time}</p>
// // //             <p><strong>Location:</strong> {event.venue}</p>
// // //             <p>{event.description}</p>
// // //             <button onClick={() => handleDelete(event.id)} className="delete-event-button">
// // //               🗑️ Delete
// // //             </button>
// // //           </div>
// // //         ))}
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default AdminPanel;
// import React, { useState, useEffect } from "react";

// const AdminPanel = () => {
//   const [events, setEvents] = useState([]);
//   const [registeredStudents, setRegisteredStudents] = useState([]);
//   const [selectedEvent, setSelectedEvent] = useState(null);

//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         const response = await fetch("http://localhost:5000/getEvents");
//         const data = await response.json();
//         if (data.events) {
//           setEvents(data.events);
//         }
//       } catch (error) {
//         console.error("Error fetching events:", error);
//       }
//     };

//     fetchEvents();
//   }, []);

//   // 🟢 Function to fetch registered students
//   const handleAttendance = async (eventTitle) => {
//     try {
//       const response = await fetch(`http://localhost:5000/getRegisteredStudents/${eventTitle}`);
//       const data = await response.json();

//       if (response.ok) {
//         setSelectedEvent(eventTitle);
//         setRegisteredStudents(data.registeredStudents);
//       } else {
//         console.error("Error fetching registered students:", data.message);
//       }
//     } catch (error) {
//       console.error("Error fetching registered students:", error);
//     }
//   };

//   return (
//     <div>
//       <h1>Admin Panel</h1>
//       <p>Manage events and view attendance here.</p>

//       <div className="events-list">
//         {events.map((event) => (
//           <div key={event.id} className="event-item">
//             <h3>{event.title}</h3>
//             <p><strong>Date:</strong> {event.date}</p>
//             <p><strong>Time:</strong> {event.time}</p>
//             <p><strong>Location:</strong> {event.venue}</p>
//             <p>{event.description}</p>

//             {/* Attendance Button */}
//             <button onClick={() => handleAttendance(event.title)} className="attendance-button">
//               📋 Attendance
//             </button>
//           </div>
//         ))}
//       </div>

//       {/* Attendance List */}
//       {selectedEvent && (
//         <div className="attendance-modal">
//           <h2>Registered Students for {selectedEvent}</h2>
//           {registeredStudents.length > 0 ? (
//             <ul>
//               {registeredStudents.map((student, index) => (
//                 <li key={index}>{student.student_email}</li>
//               ))}
//             </ul>
//           ) : (
//             <p>No students registered for this event.</p>
//           )}
//           <button onClick={() => setSelectedEvent(null)}>Close</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminPanel;

// import React, { useState, useEffect } from "react"; -------------------------------

// const AdminPanel = () => {
//   const [events, setEvents] = useState([]);
//   const [registeredStudents, setRegisteredStudents] = useState([]);
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [newEvent, setNewEvent] = useState({ title: "", description: "", date: "", time: "", venue: "" });
//   const [attendance, setAttendance] = useState({});
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   // Fetch events
//   useEffect(() => {
//     fetchEvents();
//   }, []);

//   const fetchEvents = async () => {
//     try {
//       const response = await fetch("http://localhost:5000/getEvents");
//       const data = await response.json();
//       if (data.events) {
//         setEvents(data.events);
//       }
//     } catch (error) {
//       console.error("Error fetching events:", error);
//     }
//   };

//   // 🟢 Fetch Registered Students
//   const handleAttendance = async (eventTitle) => {
//     try {
//       const response = await fetch(`http://localhost:5000/getRegisteredStudents/${eventTitle}`);
//       const data = await response.json();
//       if (response.ok) {
//         setSelectedEvent(eventTitle);
//         setRegisteredStudents(data.registeredStudents);
//         setAttendance(
//           data.registeredStudents.reduce((acc, student) => {
//             acc[student.student_email] = false;
//             return acc;
//           }, {})
//         );
//         setIsModalOpen(true);
//       }
//     } catch (error) {
//       console.error("Error fetching registered students:", error);
//     }
//   };

//   // 🟢 Mark Attendance
//   const markAttendance = async () => {
//     try {
//       await fetch("http://localhost:5000/markAttendance", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ eventTitle: selectedEvent, attendance }),
//       });
//       alert("Attendance marked successfully!");
//       setIsModalOpen(false);
//     } catch (error) {
//       console.error("Error marking attendance:", error);
//     }
//   };

//   // 🟢 Create Event
//   const createEvent = async (e) => {
//     e.preventDefault();
//     try {
//       await fetch("http://localhost:5000/addEvent", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(newEvent),
//       });
//       fetchEvents();
//       setNewEvent({ title: "", description: "", date: "", time: "", venue: "" });
//     } catch (error) {
//       console.error("Error adding event:", error);
//     }
//   };

//   // 🟢 Delete Event
//   const deleteEvent = async (id) => {
//     try {
//       await fetch(`http://localhost:5000/deleteEvent/${id}`, { method: "DELETE" });
//       fetchEvents();
//     } catch (error) {
//       console.error("Error deleting event:", error);
//     }
//   };

//   return (
//     <div className="admin-panel">
//       <h1>Admin Panel</h1>
      
//       {/* 🎯 Add Event Form */}
//       <form onSubmit={createEvent} className="event-form">
//         <input type="text" placeholder="Title" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} required />
//         <textarea placeholder="Description" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} required />
//         <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} required />
//         <input type="time" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} required />
//         <input type="text" placeholder="Venue" value={newEvent.venue} onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })} required />
//         <button type="submit">Add Event</button>
//       </form>

//       {/* 🎯 Event List */}
//       <div className="events-list">
//         {events.map((event) => (
//           <div key={event.id} className="event-card">
//             <h3>{event.title}</h3>
//             <p>{event.description}</p>
//             <p><strong>Date:</strong> {event.date}</p>
//             <p><strong>Time:</strong> {event.time}</p>
//             <p><strong>Venue:</strong> {event.venue}</p>
//             <button onClick={() => handleAttendance(event.title)}>📋 Mark Attendance</button>
//             <button onClick={() => deleteEvent(event.id)} className="delete-button">🗑 Delete</button>
//           </div>
//         ))}
//       </div>

//       {/* 🎯 Attendance Modal */}
//       {isModalOpen && (
//         <div className="modal">
//           <h2>Mark Attendance for {selectedEvent}</h2>
//           <ul>
//             {registeredStudents.map((student, index) => (
//               <li key={index}>
//                 <input type="checkbox" checked={attendance[student.student_email]} onChange={() => setAttendance({ ...attendance, [student.student_email]: !attendance[student.student_email] })} />
//                 {student.student_email}
//               </li>
//             ))}
//           </ul>
//           <button onClick={markAttendance}>Submit Attendance</button>
//           <button onClick={() => setIsModalOpen(false)}>Close</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminPanel;



// import React, { useState, useEffect } from "react";

// const AdminPanel = () => {
//   const [isFormVisible, setIsFormVisible] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editEventId, setEditEventId] = useState(null);
//   const [events, setEvents] = useState([]);
//   const [eventData, setEventData] = useState({
//     title: "",
//     description: "",
//     date: "",
//     time: "",
//     venue: "",
//   });

//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [registeredStudents, setRegisteredStudents] = useState([]);
//   const [attendance, setAttendance] = useState({});
//   const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);

//   // Fetch events from backend
//   useEffect(() => {
//     fetchEvents();
//   }, []);

//   const fetchEvents = async () => {
//     try {
//       const response = await fetch("http://localhost:5000/getEvents");
//       const data = await response.json();
//       if (data.events) {
//         setEvents(data.events);
//       }
//     } catch (error) {
//       console.error("Error fetching events:", error);
//     }
//   };

//   const fetchRegisteredStudents = async (eventTitle) => {
//     try {
//       const response = await fetch(`http://localhost:5000/getRegisteredStudents/${eventTitle}`);
//       const data = await response.json();
//       if (data.students) {
//         setRegisteredStudents(data.students);
//         setAttendance(
//           data.students.reduce((acc, student) => {
//             acc[student.student_email] = false; // Default attendance is false
//             return acc;
//           }, {})
//         );
//       }
//     } catch (error) {
//       console.error("Error fetching registered students:", error);
//     }
//   };

//   const handleAttendanceClick = async (event) => {
//     setSelectedEvent(event);
//     await fetchRegisteredStudents(event.title);
//     setIsAttendanceModalOpen(true);
//   };

//   const handleCheckboxChange = (email) => {
//     setAttendance((prevAttendance) => ({
//       ...prevAttendance,
//       [email]: !prevAttendance[email],
//     }));
//   };

//   const submitAttendance = async () => {
//     try {
//       const response = await fetch("http://localhost:5000/submitAttendance", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ eventTitle: selectedEvent.title, attendance }),
//       });

//       const result = await response.json();
//       if (response.ok) {
//         console.log("Attendance recorded successfully:", result);
//         setIsAttendanceModalOpen(false);
//       } else {
//         console.error("Error recording attendance:", result.message);
//       }
//     } catch (error) {
//       console.error("Error submitting attendance:", error);
//     }
//   };

//   return (
//     <div>
//       <h1>Welcome to the Admin Panel</h1>
//       <button onClick={() => { setIsFormVisible(!isFormVisible); setIsEditing(false); }}>
//         {isFormVisible ? "Cancel" : "Add Event (+)"}
//       </button>

//       {isFormVisible && (
//         <form>
//           <input type="text" name="title" value={eventData.title} onChange={(e) => setEventData({ ...eventData, title: e.target.value })} placeholder="Event Title" required />
//           <input type="text" name="description" value={eventData.description} onChange={(e) => setEventData({ ...eventData, description: e.target.value })} placeholder="Description" required />
//           <input type="date" name="date" value={eventData.date} onChange={(e) => setEventData({ ...eventData, date: e.target.value })} required />
//           <input type="time" name="time" value={eventData.time} onChange={(e) => setEventData({ ...eventData, time: e.target.value })} required />
//           <input type="text" name="venue" value={eventData.venue} onChange={(e) => setEventData({ ...eventData, venue: e.target.value })} placeholder="Venue" required />
//           <button type="submit">{isEditing ? "Update Event" : "Add Event"}</button>
//         </form>
//       )}

//       <div>
//         {events.map((event) => (
//           <div key={event.id}>
//             <h3>{event.title}</h3>
//             <button onClick={() => handleAttendanceClick(event)}>📋 Mark Attendance</button>
//           </div>
//         ))}
//       </div>

//       {isAttendanceModalOpen && (
//         <div className="modal">
//           <h2>Attendance for {selectedEvent.title}</h2>
//           <ul>
//             {registeredStudents.map((student) => (
//               <li key={student.student_email}>
//                 <input
//                   type="checkbox"
//                   checked={attendance[student.student_email]}
//                   onChange={() => handleCheckboxChange(student.student_email)}
//                 />
//                 {student.student_email}
//               </li>
//             ))}
//           </ul>
//           <button onClick={submitAttendance}>Submit Attendance</button>
//           <button onClick={() => setIsAttendanceModalOpen(false)}>Close</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminPanel;
