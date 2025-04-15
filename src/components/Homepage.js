import React from "react";
//import auditoriumBg from './auditoriumpic.png'; // adjust if you're in the same folder
import About from "./About";
const Homepage = () => {
    return(

<div className ="blur-background-container">
   <div className="background-image"></div>
   <div className="content">
   <h1 class="fancy-heading">Discover Events. Reserve Your Seat.</h1>
<p class="tagline">Auditoria lets you register for events created by admins — fast, simple, and hassle-free.</p>

        </div>
<About />
</div>


    );
};
export default Homepage;