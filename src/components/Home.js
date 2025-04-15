import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux"; // Import Redux hook
import { Routes, Route, Link, useNavigate } from "react-router-dom"; // ❌ Removed BrowserRouter
import About from "./About";
import Services from "./Services";
import Contact from "./ContactUs";
import AuthPage from "./AuthPage";
import EventsList from "./Eventslist";
import AdminLogin from "./AdminLogin";
import AdminPanel from "./AdminPanel";
import Homepage from "./Homepage";
import { FaUser, FaBell, FaQuestionCircle, FaSignOutAlt } from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const loginMessage = useSelector((state) => state.auth.message); // Get login message from Redux
  const adminloginMessage = useSelector((state) => state.admin.message); // Get login message from Redux
  const navigate = useNavigate(); // Get navigation function

  // // Redirect to EventsList if login is successful
  // useEffect(() => {
  //   if (loginMessage === "Login successful") {
  //     navigate("/eventsList"); // Redirect to EventsList
  //   }
  //   if(adminloginMessage === "Login successful"){
  //     navigate("/AdminPanel");
  //   }
  // }, [loginMessage,adminloginMessage ,navigate]);

  return (
    <div>
      <nav className="navbar">
        <div className="logo"> <img src="/rgukt_logo.jpeg" alt="Logo" width="120" />Auditoria</div>
        <ul className="nav-links">
          <li><Link to="/about">About</Link></li>
          <li><Link to="/services">Services</Link></li>
          <li><Link to="/contact">Contact Us</Link></li>
          <li><Link to="/authPage">Register/Login</Link></li> 
          <li><Link to="/adminLogin">Admin</Link></li>  {/* Add Admin Login */}
        </ul>
        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}  style={{
    display: 'inline-block',
    width: '40px',
    height: '40px',
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: '8px',
    textAlign: 'center',
    lineHeight: '40px',
    cursor: 'pointer',
    fontSize: '24px',
    transition: 'all 0.3s ease',
  }}>☰</div>
        {menuOpen && (
          <div className="dropdown-menu">
            <a href="#"><FaUser className="icon" /> Student Profile</a>
            <a href="#"><FaBell className="icon" /> Notifications</a>
            <a href="#"><FaQuestionCircle className="icon" /> Help & Support</a>
            <a href="#"><FaSignOutAlt className="icon" /> Logout</a>
          </div>
        )}
      </nav>
     

      {/* Show login message
      {loginMessage && <div className="login-alert">{loginMessage}</div>} */}

       <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/authPage" element={<AuthPage />} /> 
        <Route path="/eventsList" element={<EventsList />} /> 
        <Route path="/adminLogin" element={<AdminLogin />} />
        <Route path="/adminPanel" element={<AdminPanel />} />  {/* Admin Panel */} 
      </Routes> 
    </div>
  );
};

export default Home;


// import React, { useState, useEffect } from "react";
// import { useSelector } from "react-redux"; // Import Redux hook
// import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
// import About from "./About";
// import Services from "./Services";
// import Contact from "./ContactUs";
// import AuthPage from "./AuthPage";
// import EventsList from "./Eventslist";
// import { FaUser, FaBell, FaQuestionCircle, FaSignOutAlt } from "react-icons/fa";

// const Home = () => {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const loginMessage = useSelector((state) => state.auth.message); // Get login message from Redux
//   const navigate = useNavigate(); // Get navigation function

//   // Redirect to EventsList if login is successful
//   useEffect(() => {
//     if (loginMessage === "Login successful") {
//       navigate("/eventsList"); // Redirect to EventsList
//     }
//   }, [loginMessage, navigate]);

//   return (
//     <div>
//       <nav className="navbar">
//         <div className="logo">Auditoria</div>
//         <ul className="nav-links">
//           <li><Link to="/about">About</Link></li>
//           <li><Link to="/services">Services</Link></li>
//           <li><Link to="/contact">Contact Us</Link></li>
//           <li><Link to="/authPage">Register/Login</Link></li> 
//         </ul>
//         <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>☰</div>
//         {menuOpen && (
//           <div className="dropdown-menu">
//             <a href="#"><FaUser className="icon" /> Student Profile</a>
//             <a href="#"><FaBell className="icon" /> Notifications</a>
//             <a href="#"><FaQuestionCircle className="icon" /> Help & Support</a>
//             <a href="#"><FaSignOutAlt className="icon" /> Logout</a>
//           </div>
//         )}
//       </nav>

//       {/* Show login message */}
//       {loginMessage && <div className="login-alert">{loginMessage}</div>}

//       <Routes>
//         <Route path="/" element={<h1>Welcome to Auditoria</h1>} />
//         <Route path="/about" element={<About />} />
//         <Route path="/services" element={<Services />} />
//         <Route path="/contact" element={<Contact />} />
//         <Route path="/authPage" element={<AuthPage />} /> 
//         <Route path="/eventsList" element={<EventsList />} /> 
//       </Routes>
//     </div>
//   );
// };

// export default Home;

// import React, { useState } from "react";
// import { useSelector } from "react-redux"; // Import Redux hook
// import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
// import About from "./About";
// import Services from "./Services";
// import Contact from "./ContactUs";
// import AuthPage from "./AuthPage";
// import EventsList from "./Eventslist";
// import { FaUser, FaBell, FaQuestionCircle, FaSignOutAlt } from "react-icons/fa";

// const Home = () => {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const loginMessage = useSelector((state) => state.auth.message); // Get message from Redux

//   return (
//     <Router>
//       <div>
//         <nav className="navbar">
//           <div className="logo">Auditoria</div>
//           <ul className="nav-links">
//             <li><Link to="/about">About</Link></li>
//             <li><Link to="/services">Services</Link></li>
//             <li><Link to="/contact">Contact Us</Link></li>
//             <li><Link to="/authPage">Register/Login</Link></li> 
//           </ul>
//           <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>☰</div>
//           {menuOpen && (
//             <div className="dropdown-menu">
//               <a href="#"><FaUser className="icon" /> Student Profile</a>
//               <a href="#"><FaBell className="icon" /> Notifications</a>
//               <a href="#"><FaQuestionCircle className="icon" /> Help & Support</a>
//               <a href="#"><FaSignOutAlt className="icon" /> Logout</a>
//             </div>
//           )}
//         </nav>

//         {/* Show login message */}
//         {loginMessage && <div className="login-alert">{loginMessage}</div>}

//         <Routes>
//           <Route path="/" element={<h1>Welcome to Auditoria</h1>} />
//           <Route path="/about" element={<About />} />
//           <Route path="/services" element={<Services />} />
//           <Route path="/contact" element={<Contact />} />
//           <Route path="/authPage" element={<AuthPage />} /> 
//           <Route path="/eventsList" element={<EventsList />} /> 
//         </Routes>
//       </div>
//     </Router>
//   );
// };

// export default Home;

// // import { useState } from "react";
// // //import "./Home.css"; // Import CSS file
// // import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
// // import About from "./About";
// // import Services from "./Services";
// // import Contact from "./ContactUs";
// // import AuthPage from "./AuthPage";
// // import EventsList from "./components/Eventslist";
// // import { FaUser, FaBell, FaQuestionCircle, FaSignOutAlt } from "react-icons/fa";
// // const Home = () => {
// //   const [menuOpen, setMenuOpen] = useState(false);

// //   return (
// //     <Router>
// //     <div>
// //     <nav className="navbar">
// //       <div className="logo">Auditoria</div>
// //        <div>
// //        <ul className="nav-links">
// //             <li><Link to="/about">About</Link></li>
// //             <li><Link to="/services">Services</Link></li>
// //             <li><Link to="/contact">Contact Us</Link></li>
// //             <li><Link to="/authPage">Register/Login</Link></li> 
// //           </ul>
// //       </div>
// //       <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
// //         ☰
// //       </div>

// //       {menuOpen && (
// //         <div className="dropdown-menu">
// //          <a href="#"><FaUser className="icon" /> Student Profile</a>
// //           <a href="#"><FaBell className="icon" /> Notifications</a>
// //           <a href="#"><FaQuestionCircle className="icon" /> Help & Support</a>
// //           <a href="#"><FaSignOutAlt className="icon" /> Logout</a>
// //         </div>
// //       )}
// //     </nav>
// //      {/* Content */}
// //      {/* <main className="main-content">
// //      <h1>Welcome to Auditoria</h1>
// //      <p>Your best event management system.</p>
// //    </main> */}
// //    <Routes>
// //           <Route path="/" element={<h1>Welcome to Auditoria</h1>} />
// //           <Route path="/about" element={<About />} />
// //           <Route path="/services" element={<Services />} />
// //           <Route path="/contact" element={<Contact />} />
// //            <Route path="/authPage" element={<AuthPage />} /> 
// //            <Route path="/eventsList" element={<EventsList />} /> 
// //         </Routes>
// //    </div>
// //    </Router>
// //   );
// // };

// // export default Home;
// // import React, { useState } from "react";
// // import { FaBars, FaTimes } from "react-icons/fa"; // Importing icons
// // //import "./Home.css"; // Import CSS for styling

// // const Home = () => {
// //   const [menuOpen, setMenuOpen] = useState(false);

// //   // Toggle dropdown menu
// //   const toggleMenu = () => {
// //     setMenuOpen(!menuOpen);
// //   };

// //   return (
// //     <div className="home-container">
// //       {/* Navbar */}
// //       <nav className="navbar">
// //         {/* Left - Logo */}
// //         <div className="logo">Auditoria</div>

// //         {/* Center - Navigation Links (Visible on Large Screens) */}
// //         <ul className="nav-links">
// //           <li><a href="#about">About</a></li>
// //           <li><a href="#services">Services</a></li>
// //           <li><a href="#contact">Contact Us</a></li>
// //         </ul>

// //         {/* Right - Hamburger Menu */}
// //         <div className="menu-icon" onClick={toggleMenu}>
// //           {menuOpen ? <FaTimes /> : <FaBars />}
// //         </div>

// //         {/* Dropdown Menu (Visible when menuOpen is true) */}
// //         {menuOpen && (
// //           <div className="dropdown-menu">
// //             <ul>
// //               <li><a href="#profile">Student Profile</a></li>
// //               <li><a href="#notifications">Notifications</a></li>
// //               <li><a href="#support">Help & Support</a></li>
// //               <li><a href="#logout">Logout</a></li>
// //             </ul>
// //           </div>
// //         )}
// //       </nav>

// //       {/* Main Content */}
// //       <main className="main-content">
// //         <h1>Welcome to Auditoria</h1>
// //         <p>Your best event management system.</p>
// //       </main>
// //     </div>
// //   );
// // };

// // export default Home;



