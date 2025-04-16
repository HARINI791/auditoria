import React from "react";
import { FaHome, FaCalendarAlt, FaUser, FaUserShield, FaComments, FaQrcode, FaBell, FaChartLine } from "react-icons/fa";
import "./Services.css";

const Services = () => {
  const mainServices = [
    {
      icon: <FaHome />,
      title: "Home Page (Landing Page)",
      description: "Welcome Banner, Search Bar, Upcoming Events Section, Login/Signup Button, Event Polling Section",
      features: ["Welcome Banner", "Search Bar", "Upcoming Events", "Login/Signup", "Event Polling"]
    },
    {
      icon: <FaCalendarAlt />,
      title: "Event Booking Interface",
      description: "Calendar View, Seat Selection Panel, Event Details Panel, Booking Confirmation, Notifications & Reminders",
      features: ["Calendar View", "Seat Selection", "Event Details", "Booking Confirmation", "Notifications"]
    },
    {
      icon: <FaUser />,
      title: "User Dashboard (For Students)",
      description: "My Bookings Section, Event Interest Polling, Saved Preferences, Feedback Submission",
      features: ["My Bookings", "Event Interest Polling", "Saved Preferences", "Feedback Submission"]
    }
  ];

  const additionalServices = [
    {
      icon: <FaUserShield />,
      title: "Admin Panel",
      description: "Dashboard Overview, Manage Bookings, User Management, Attendance Portal, Event Analytics"
    },
    {
      icon: <FaComments />,
      title: "Feedback & Rating System",
      description: "Feedback Forms, Live Comments, Report Issues"
    },
    {
      icon: <FaQrcode />,
      title: "QR Code System for Event Access",
      description: "Personalized QR Codes, Scan for Entry, Security Features"
    }
  ];

  const benefits = [
    {
      icon: <FaBell />,
      title: "Notifications & Reminders",
      description: "Upcoming Event Reminders, Booking Status Alerts, Poll & Survey Alerts"
    },
    {
      icon: <FaChartLine />,
      title: "Expected Outcomes",
      description: "Improved User Experience, Efficient Resource Allocation, Enhanced Communication"
    },
    {
      icon: <FaUser />,
      title: "Future Directions",
      description: "Integration with university systems, Mobile Application, Advanced Analytics"
    }
  ];

  return (
    <div className="services-container">
      <div className="services-hero">
        <h1>System Architecture</h1>
        <p className="hero-subtitle">A Comprehensive Solution for Auditorium Management</p>
      </div>

      <div className="services-content">
        <section className="main-services">
          <h2>Core Components</h2>
          <div className="services-grid">
            {mainServices.map((service, index) => (
              <div className="service-card" key={index}>
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <ul className="service-features">
                  {service.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="additional-services">
          <h2>Additional Components</h2>
          <div className="services-grid">
            {additionalServices.map((service, index) => (
              <div className="service-card" key={index}>
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="benefits-section">
          <h2>Benefits & Future Directions</h2>
          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <div className="benefit-card" key={index}>
                <div className="benefit-icon">{benefit.icon}</div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="cta-section">
          <h2>Research Project</h2>
          <p>A Research Proposal Submitted to Sravan kumar sir, Rajiv Gandhi University of Knowledge technologies, Computer Science and Engineering, 14 feb, 2025.</p>
          <button className="cta-button">Learn More</button>
        </section>
      </div>
    </div>
  );
};

export default Services;