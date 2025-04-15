// // import React, { useState, useEffect } from "react";

// // const EventsList = () => {
// //   // State to store events
// //   const [events, setEvents] = useState([]);

// //   // Fetch events data from the backend
// //   useEffect(() => {
// //     const fetchEvents = async () => {
// //       try {
// //         const response = await fetch("http://localhost:5000/events");
// //         const data = await response.json();
// //         if (data.events) {
// //           setEvents(data.events);  // Update the state with the events data
// //         }
// //       } catch (error) {
// //         console.error("Error fetching events:", error);
// //       }
// //     };

// //     fetchEvents();  // Call the fetch function when the component mounts
// //   }, []);  // Empty dependency array means it runs only once when the component mounts

// //   return (
// //     <div className="events-container">
// //       <h2>Upcoming Events</h2>
// //       <div className="events-list">
// //         {events.map((event) => (
// //           <div key={event.id} className="event-item">
// //             <h3>{event.title}</h3>
// //             <p><strong>Date:</strong> {event.date}</p>
// //             <p><strong>Time:</strong> {event.time}</p>
// //             <p><strong>Location:</strong> {event.venue}</p>
// //             <p>{event.description}</p>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // };

// // export default EventsList;


// // // import React from "react";

// // // const EventsList = () => {
// // //   // Sample events data
// // //   const events = [
// // //     { id: 1, title: "Tech Conference 2025", date: "April 10, 2025", location: "Auditorium A" },
// // //     { id: 2, title: "Music Festival", date: "May 15, 2025", location: "Main Hall" },
// // //     { id: 3, title: "Startup Pitch", date: "June 20, 2025", location: "Conference Room 2" },
// // //   ];

// // //   return (
// // //     <div className="events-container">
// // //       <h2>Upcoming Events</h2>
// // //       <ul className="events-list">
// // //         {events.map((event) => (
// // //           <li key={event.id} className="event-item">
// // //             <div className = "event"><h3>{event.title}</h3>
// // //             <p><strong>Date:</strong> {event.date}</p>
// // //             <p><strong>Location:</strong> {event.location}</p></div>
// // //           </li>
// // //         ))}
// // //       </ul>
// // //     </div>
// // //   );
// // // };

// // // export default EventsList;




// import React, { useState, useEffect } from "react";
// import { useSelector } from "react-redux";  // Import useSelector to access Redux state

// const EventsList = () => {
//   const [events, setEvents] = useState([]);
//   const userEmail = useSelector((state) => state.email.userEmail);  // ✅ Get user email from Redux

//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         const response = await fetch("http://localhost:5000/events");
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

//   return (
//     <div className="events-container">
//       <h2>Upcoming Events</h2>
//       {userEmail && <p>Logged in as: <strong>{userEmail}</strong></p>}  {/* ✅ Display user email */}
      
//       <div className="events-list">
//         {events.map((event) => (
//           <div key={event.id} className="event-item">
//             <h3>{event.title}</h3>
//             <p><strong>Date:</strong> {event.date}</p>
//             <p><strong>Time:</strong> {event.time}</p>
//             <p><strong>Location:</strong> {event.venue}</p>
//             <p>{event.description}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default EventsList;


// import React, { useState, useEffect } from "react";
// import { useSelector } from "react-redux";
// import Toast from "./Toast"; 
// //import './Eventslist.css';
// const EventsList = () => {
//   const [events, setEvents] = useState([]);
//   const [toastMsg, setToastMsg] = useState("Login Successful"); // ⬅️ for toast
//   const userEmail = useSelector((state) => state.email.userEmail);
//   const loginMessage = useSelector((state) => state.auth.message); // ⬅️ from Redux
//   const dispatch = useDispatch();

//   useEffect(() => {
//     if (loginMessage) {
//       setToastMsg(loginMessage);          // Show the toast
//       dispatch(clearMessage());           // Clear message from Redux after showing
//     }
//   }, [loginMessage, dispatch]);

//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         const response = await fetch("http://localhost:5000/events");
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

//   // 🔵 Function to handle event registration
//   const handleRegister = async (eventTitle) => {
//     if (!userEmail) {
//       alert("Please log in to register for events.");
//       return;
//     }

//     try {
//       const response = await fetch("http://localhost:5000/registerForEvent", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ userEmail, eventTitle }),
//       });

//       const data = await response.json();
//       alert(data.message);
//     } catch (error) {
//       console.error("Error registering for event:", error);
//       alert("Registration failed.");
//     }
//   };

//   return (
//     <div className="events-container">
//       <h2>Upcoming Events</h2>
//       {userEmail && <p>Logged in as: <strong>{userEmail}</strong></p>}
      
//       <div className="events-list" >
//         {events.map((event) => (
//           <div key={event.id} className="event-item">
//             <h3>{event.title}</h3>
//             <p><strong>Date:</strong> {event.date}</p>
//             <p><strong>Time:</strong> {event.time}</p>
//             <p><strong>Location:</strong> {event.venue}</p>
//             <p>{event.description}</p>
            
//             {/* ✅ "Register Now" Button */}
//             <button onClick={() => handleRegister(event.title)}>Register Now</button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default EventsList;

// import React, { useState, useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { clearMessage } from "./AuthSlice"; // <-- import clearMessage
// import Toast from "./Toast"; 
// import { useNavigate } from "react-router-dom";              // <-- use your Toast component

// const EventsList = () => {
//   const [events, setEvents] = useState([]);
//   const [toastMsg, setToastMsg] = useState(""); // ⬅️ for toast
//   const userEmail = useSelector((state) => state.email.userEmail);
//   const loginMessage = useSelector((state) => state.auth.message); // ⬅️ from Redux
//   const dispatch = useDispatch();
//   const navigate = useNavigate(); 

//   useEffect(() => {
//     if (loginMessage) {
//       setToastMsg(loginMessage);          // Show the toast
//       dispatch(clearMessage());           // Clear message from Redux after showing
//     }
//   }, [loginMessage, dispatch]);

//   useEffect(() => {
//     const fetchEvents = async () => {
//       try {
//         const response = await fetch("http://localhost:5000/events");
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

//   const handleRegister = async (eventTitle) => {
//     if (!userEmail) {
//       alert("Please log in to register for events.");
//       return;
//     }

//     try {
//       const response = await fetch("http://localhost:5000/registerForEvent", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ userEmail, eventTitle }),
//       });

//       const data = await response.json();
//       alert(data.message);
//     } catch (error) {
//       console.error("Error registering for event:", error);
//       alert("Registration failed.");
//     }
//   };

//   return (
//     <div className="events-container">
//       {/* <h2>Upcoming Events</h2>
//       <button
//   type="button"  // <--- Add this to prevent form submission
//   className="auth-button"
//   onClick={() => navigate("/")}
// >
//   Back
// </button> */}
// <div className="admin-header">
//   <h1 className="admin-heading">Upcoming Events</h1>
//   <button
//     type="button"
//     className="back-button"
//     onClick={() => navigate("/")}
//   >
//     ⬅ Back
//   </button>
// </div>
//       {userEmail && <p>Logged in as: <strong>{userEmail}</strong></p>}
      
//       <div className="events-list">
//         {/* {events.map((event) => (
//           <div key={event.id} className="event-item">
//             <h3>{event.title}</h3>
//             <p><strong>Date:</strong> {event.date}</p>
//             <p><strong>Time:</strong> {event.time}</p>
//             <p><strong>Location:</strong> {event.venue}</p>
//             <p>{event.description}</p>
//             <button onClick={() => handleRegister(event.title)}>Register Now</button>
//           </div>
//         ))} */}
//         {events.map((event) => {
//   const isFull = event.current_registrations >= event.Max_registrations;

//   return (
//     <div key={event.id} className="event-item">
//       <h3>{event.title}</h3>
//       <p><strong>Date:</strong> {event.date}</p>
//       <p><strong>Time:</strong> {event.time}</p>
//       <p><strong>Location:</strong> {event.venue}</p>
//       <p>{event.description}</p>
//       <p><strong>Registered:</strong> {event.current_registrations} / {event.Max_registrations}</p>
//       <button
//         onClick={() => handleRegister(event.title)}
//         disabled={isFull}
//         style={{ backgroundColor: isFull ? "#aaa" : "#4CAF50", cursor: isFull ? "not-allowed" : "pointer" }}
//       >
//         {isFull ? "Event Full" : "Register Now"}
//       </button>
//     </div>
//   );
// })}

//       </div>

//       {/* ✅ Toast message */}
//       {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg("")} />}
//     </div>
//   );
// };

// export default EventsList;

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearMessage } from "./AuthSlice"; // <-- import clearMessage
//import Toast from "./Toast"; 
import { useNavigate } from "react-router-dom";              // <-- use your Toast component
import { toast, ToastContainer } from 'react-toastify'; // <-- import Toastify
import 'react-toastify/dist/ReactToastify.css'; // <-- CSS for Toastify

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [toastMsg, setToastMsg] = useState(""); // ⬅️ for toast
  const userEmail = useSelector((state) => state.email.userEmail);
  const loginMessage = useSelector((state) => state.auth.message); // ⬅️ from Redux
  const dispatch = useDispatch();
  const navigate = useNavigate(); 

  useEffect(() => {
    if (!userEmail) {
      toast.error("Please log in to access the events list."); // <-- show error toast
      // Redirect to login if not logged in
      navigate("/authPage");
      //  // Delay navigation after toast
      //  setTimeout(() => {
      //   navigate("/authPage");
      // }, 1500);  // Wait for 1.5 seconds before redirecting
    } 
    }
  , [userEmail, navigate]);

  useEffect(() => {
    if (loginMessage) {
      setToastMsg(loginMessage);          // Show the toast
      dispatch(clearMessage());           // Clear message from Redux after showing
    }
  }, [loginMessage, dispatch]);

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

  const handleRegister = async (eventTitle) => {
    if (!userEmail) {
      alert("Please log in to register for events.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/registerForEvent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, eventTitle }),
      });

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error("Error registering for event:", error);
      alert("Registration failed.");
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
                disabled={isFull}
                style={{ backgroundColor: isFull ? "#aaa" : "#4CAF50", cursor: isFull ? "not-allowed" : "pointer" }}
              >
                {isFull ? "Event Full" : "Register Now"}
              </button>
            </div>
          );
        })}
      </div>

    {/* Toast Container for showing Toastify messages */}
    {/* <ToastContainer /> */}
    </div>
  );
};

export default EventsList;
