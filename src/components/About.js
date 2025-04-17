import React from "react";
import { FaUsers, FaTicketAlt, FaCalendarAlt, FaHeadset, FaQrcode, FaPoll, FaUserShield, FaBell } from "react-icons/fa";
import "./About.css";

const About = () => {
  return (
    <div className="about-container">
      <div className="about-hero">
        <h1>About Auditoria</h1>
        <p className="hero-subtitle">A Project by RGUKT Students</p>
      </div>

      <div className="about-content">
       
        <section className="features-section">
          <h2>Problem Statement</h2>
          <div className="features-grid">
            <div className="feature-card">
              <FaCalendarAlt className="feature-icon" />
              <h3>Inefficient Booking Process</h3>
              <p>Manual booking processes are time-consuming and prone to errors, involving physical forms and lengthy approval processes.</p>
            </div>
            <div className="feature-card">
              <FaTicketAlt className="feature-icon" />
              <h3>Lack of Real-Time Availability</h3>
              <p>Without a digital system, it's challenging to ascertain real-time availability, leading to double bookings and wasted time.</p>
            </div>
            <div className="feature-card">
              <FaBell className="feature-icon" />
              <h3>Limited Information Dissemination</h3>
              <p>Announcing events and sharing details relies on notice boards or word-of-mouth, which can be unreliable.</p>
            </div>
            <div className="feature-card">
              <FaUsers className="feature-icon" />
              <h3>Difficulty in Managing Bookings</h3>
              <p>Tracking bookings, managing cancellations, and coordinating with different stakeholders becomes complex and cumbersome.</p>
            </div>
          </div>
        </section>

        <section className="mission-section">
          <h2>Proposed Solution: Auditoria</h2>
          <div className="mission-content">
            <p>
              Auditoria is a web-based system designed to provide a user-friendly and efficient platform for 
              managing student auditorium bookings. The system incorporates key features to address the identified problems.
            </p>
            <div className="mission-stats">
              <div className="stat-item">
                <h3>Online Booking</h3>
                <p>Easy viewing and booking of auditorium spaces</p>
              </div>
              <div className="stat-item">
                <h3>Seat Selection</h3>
                <p>Choose preferred seating arrangements</p>
              </div>
              <div className="stat-item">
                <h3>Admin Panel</h3>
                <p>Comprehensive management for authorized personnel</p>
              </div>
            </div>
          </div>
        </section>

        <section className="contact-section">
          <h2>Key Features</h2>
          <div className="contact-content">
            <div className="contact-info">
              <p><FaTicketAlt /> Online Booking Portal</p>
              <p><FaUsers /> Desired Seat Selection</p>
              <p><FaBell /> Notifications and Reminders</p>
              <p><FaHeadset /> Detailed Event Descriptions</p>
              <p><FaUserShield /> Admin Panel for SRC, Placements Head, and SDCAC</p>
              <p><FaQrcode /> QR Code Access</p>
              <p><FaPoll /> Polling Feature</p>
              <p><FaUsers /> Attendance Portal (Class Representative Access)</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;