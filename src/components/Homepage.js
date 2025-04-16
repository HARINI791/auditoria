import React from "react";
//import auditoriumBg from './auditoriumpic.png'; // adjust if you're in the same folder
import About from "./About";
const Homepage = () => {
    return(
<div className ="blur-background-container">
   <div className="background-image"></div>
   <div className="content">
   <h1 className="fancy-heading">Auditoria</h1>
   <p className="tagline">A Comprehensive Student Auditorium Availability and Booking System</p>
   <p className="subtitle">Streamlining the management of event spaces within academic institutions</p>
   </div>
<About />
</div>
    );
};
export default Homepage;