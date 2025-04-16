import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { logout } from "./AuthSlice";
import About from "./About";
import Services from "./Services";
import Contact from "./ContactUs";
import AuthPage from "./AuthPage";
import EventsList from "./Eventslist";
import AdminLogin from "./AdminLogin";
import AdminPanel from "./AdminPanel";
import Homepage from "./Homepage";
import StudentProfile from "./StudentProfile";
import { FaUser, FaBell, FaQuestionCircle, FaSignOutAlt, FaBars } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import './Home.css';

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const userType = useSelector((state) => state.auth.userType);
  const userEmail = useSelector((state) => state.email.userEmail);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.nav-icons') && !event.target.closest('.nav-links')) {
        setMenuOpen(false);
        setNavOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setMenuOpen(false);
    setNavOpen(false);
  }, [navigate]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div>
      <nav className="navbar">
        <div className="logo">Auditoria</div>
        <ul className={`nav-links ${navOpen ? 'active' : ''}`}>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/services">Services</Link></li>
          <li><Link to="/contact">Contact Us</Link></li>
          {!isAuthenticated && (
            <>
              <li><Link to="/authPage">Register/Login</Link></li>
              <li><Link to="/adminLogin">Admin</Link></li>
            </>
          )}
          {isAuthenticated && userType === 'user' && (
            <>
              <li><Link to="/eventsList">Events</Link></li>
            </>
          )}
          {isAuthenticated && userType === 'admin' && (
            <li><Link to="/adminPanel">Admin Panel</Link></li>
          )}
          {isAuthenticated && (
            <li>
              <button onClick={handleLogout} className="logout-button">
                <FaSignOutAlt /> Logout
              </button>
            </li>
          )}
        </ul>
        {isAuthenticated && userType === 'user' && (
          <div className="nav-icons">
            <Link to="/profile" className="profile-icon">
              <FaUser />
            </Link>
            <div className="menu-icon" onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
              setNavOpen(!navOpen);
            }}>
              <FaBars />
            </div>
          </div>
        )}
        {menuOpen && isAuthenticated && userType === 'user' && (
          <div className="dropdown-menu">
            <Link to="/profile"><FaUser className="icon" /> {userEmail}</Link>
            <a href="#"><FaBell className="icon" /> Notifications</a>
            <a href="#"><FaQuestionCircle className="icon" /> Help</a>
          </div>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/authPage" element={<AuthPage />} />
        <Route path="/eventsList" element={<EventsList />} />
        <Route path="/adminLogin" element={<AdminLogin />} />
        <Route path="/adminPanel" element={<AdminPanel />} />
        <Route path="/profile" element={<StudentProfile />} />
      </Routes>
      <ToastContainer />
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



