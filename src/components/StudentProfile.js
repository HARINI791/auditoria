import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaTicketAlt, FaPoll, FaCommentAlt, FaCheckCircle, FaThumbsUp, FaThumbsDown, FaQuestionCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './StudentProfile.css';

const StudentProfile = () => {
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [attendedEvents, setAttendedEvents] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [activeTab, setActiveTab] = useState('mybookings');
  const [feedback, setFeedback] = useState({});
  const [existingFeedback, setExistingFeedback] = useState({});
  const [eventsPoll, setEventsPoll] = useState([]);
  const [userInterests, setUserInterests] = useState({});
  const [showDoubtModal, setShowDoubtModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [doubtText, setDoubtText] = useState('');
  const [isSubmittingDoubt, setIsSubmittingDoubt] = useState(false);
  const userEmail = useSelector((state) => state.email.userEmail);

  useEffect(() => {
    if (!userEmail) {
      return;
    }
    
    // Extract student ID from email
    const id = userEmail.split('@')[0].toUpperCase();
    setStudentId(id);

    // Fetch registered events for this student
    const fetchRegisteredEvents = async () => {
      try {
        const response = await fetch(`http://localhost:5000/getRegisteredEvents/${userEmail}`);
        const data = await response.json();
        if (data.events) {
          setRegisteredEvents(data.events);
        }
      } catch (error) {
        console.error('Error fetching registered events:', error);
        setRegisteredEvents([]);
      }
    };

    // Fetch attended events for this student
    const fetchAttendedEvents = async () => {
      try {
        const response = await fetch(`http://localhost:5000/getAttendedEvents/${userEmail}`);
        const data = await response.json();
        if (data.events) {
          setAttendedEvents(data.events);
          // Fetch existing feedback for each attended event
          data.events.forEach(event => {
            fetchExistingFeedback(event.title);
          });
        }
      } catch (error) {
        console.error('Error fetching attended events:', error);
        setAttendedEvents([]);
      }
    };

    // Fetch events poll
    const fetchEventsPoll = async () => {
      try {
        const response = await fetch('http://localhost:5000/getEventsPoll');
        const data = await response.json();
        if (data.events) {
          setEventsPoll(data.events);
        }
      } catch (error) {
        console.error('Error fetching events poll:', error);
        setEventsPoll([]);
      }
    };

    // Fetch user's interests
    const fetchUserInterests = async () => {
      try {
        const response = await fetch(`http://localhost:5000/getUserInterests/${userEmail}`);
        const data = await response.json();
        if (data.interests) {
          setUserInterests(data.interests);
        }
      } catch (error) {
        console.error('Error fetching user interests:', error);
        setUserInterests({});
      }
    };

    fetchRegisteredEvents();
    fetchAttendedEvents();
    fetchEventsPoll();
    fetchUserInterests();
  }, [userEmail]);

  const fetchExistingFeedback = async (eventTitle) => {
    try {
      const response = await fetch(`http://localhost:5000/getFeedback/${eventTitle}`);
      const data = await response.json();
      if (data.feedback) {
        const userFeedback = data.feedback.find(f => f.student_email === userEmail);
        if (userFeedback) {
          setExistingFeedback(prev => ({
            ...prev,
            [eventTitle]: userFeedback.feedback
          }));
          setFeedback(prev => ({
            ...prev,
            [eventTitle]: userFeedback.feedback
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  const handleFeedbackSubmit = async (eventTitle) => {
    if (!feedback[eventTitle]?.trim()) {
      toast.error('Please enter your feedback before submitting');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/submitFeedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          eventTitle,
          feedback: feedback[eventTitle]
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message);
        setExistingFeedback(prev => ({
          ...prev,
          [eventTitle]: feedback[eventTitle]
        }));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    }
  };

  const handleInterestUpdate = async (eventTitle, interested) => {
    // Check if user has already voted
    if (userInterests[eventTitle]) {
      toast.error('You have already voted for this event');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/updateInterest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_title: eventTitle,
          interested: interested,
          user_email: userEmail
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message);
        // Update local state to prevent multiple votes
        setUserInterests(prev => ({
          ...prev,
          [eventTitle]: interested
        }));
        // Refresh the events poll to update the counts
        const pollResponse = await fetch('http://localhost:5000/getEventsPoll');
        const pollData = await pollResponse.json();
        if (pollData.events) {
          setEventsPoll(pollData.events);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error updating interest:', error);
      toast.error('Failed to update interest. Please try again.');
    }
  };

  // Handle opening the doubt modal
  const openDoubtModal = (event) => {
    setCurrentEvent(event);
    setDoubtText('');
    setShowDoubtModal(true);
  };

  // Handle closing the doubt modal
  const closeDoubtModal = () => {
    setShowDoubtModal(false);
    setCurrentEvent(null);
    setDoubtText('');
  };

  // Handle submitting a doubt
  const handleDoubtSubmit = async () => {
    if (!doubtText.trim()) {
      toast.error('Please enter your doubt before submitting');
      return;
    }

    setIsSubmittingDoubt(true);

    try {
      const response = await fetch(`http://localhost:5000/events/${currentEvent.id}/doubts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_name:userEmail,
          doubt_text: doubtText
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message || 'Doubt submitted successfully!');
        closeDoubtModal();
      } else {
        toast.error(data.message || 'Error submitting doubt');
      }
    } catch (error) {
      console.error('Error submitting doubt:', error);
      toast.error('Failed to submit doubt. Please try again.');
    } finally {
      setIsSubmittingDoubt(false);
    }
  };

  if (!userEmail) {
    return (
      <div className="profile-container">
        <div className="profile-background"></div>
        <div className="profile-header">
          <div className="profile-avatar">
            <FaUser className="avatar-icon" />
          </div>
          <div className="profile-info">
            <h1>Please Login</h1>
            <p className="email">You need to be logged in to view your profile</p>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'mybookings':
        return (
          <div className="registered-events">
            <h2>My Bookings</h2>
            {registeredEvents.length === 0 ? (
              <p className="no-events">You haven't registered for any events yet.</p>
            ) : (
              <div className="events-grid">
                {registeredEvents.map((event) => (
                  <div key={event.id} className="event-card">
                    <div className="event-header">
                      <h3>{event.title}</h3>
                      <span className="event-status">Registered</span>
                    </div>
                    <p className="event-description">{event.description}</p>
                    <div className="event-details">
                      <div className="detail-item">
                        <FaCalendarAlt />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="detail-item">
                        <FaClock />
                        <span>{event.time}</span>
                      </div>
                      <div className="detail-item">
                        <FaMapMarkerAlt />
                        <span>{event.venue}</span>
                      </div>
                    </div>
                    <button 
                      className="ask-doubt-button"
                      onClick={() => {
                        openDoubtModal(event)
                      }}
                    >
                      <FaQuestionCircle /> Ask Doubt
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'polling':
        return (
          <div className="registered-events">
            <h2>Event Polls</h2>
            {eventsPoll.length === 0 ? (
              <p className="no-events">No events currently being polled.</p>
            ) : (
              <div className="events-grid">
                {eventsPoll.map((event) => (
                  <div key={event.event_title} className="event-card">
                    <div className="event-header">
                      <h3>{event.event_title}</h3>
                      <span className={`event-status ${userInterests[event.event_title] !== undefined ? 'reacted' : ''}`}>
                        {userInterests[event.event_title] !== undefined ? 'Poll Reacted' : 'Poll'}
                      </span>
                    </div>
                    <p className="event-description">{event.event_description}</p>
                    <div className="event-details">
                    </div>
                    <div className="poll-buttons">
                      <div className="poll-vote-container">
                        <button
                          className={`poll-button interested ${userInterests[event.event_title] === true ? 'voted' : ''}`}
                          onClick={() => handleInterestUpdate(event.event_title, true)}
                          disabled={userInterests[event.event_title] !== undefined}
                        >
                          <FaThumbsUp />
                        </button>
                        <div className="poll-count">
                          {event.interested || 0}
                        </div>
                        <div className="vote-label">Interested</div>
                      </div>
                      <div className="poll-vote-container">
                        <button
                          className={`poll-button not-interested ${userInterests[event.event_title] === false ? 'voted' : ''}`}
                          onClick={() => handleInterestUpdate(event.event_title, false)}
                          disabled={userInterests[event.event_title] !== undefined}
                        >
                          <FaThumbsDown />
                        </button>
                        <div className="poll-count">
                          {event.not_interested || 0}
                        </div>
                        <div className="vote-label">Not Interested</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'feedback':
        return (
          <div className="feedback-section">
            <h2>Event Feedback</h2>
            {attendedEvents.length === 0 ? (
              <p className="no-events">You haven't attended any events yet.</p>
            ) : (
              <div className="events-grid">
                {attendedEvents.map((event) => (
                  <div key={event.id} className="event-card">
                    <div className="event-header">
                      <h3>{event.title}</h3>
                      <span className="event-status">Attended</span>
                    </div>
                    <p className="event-description">{event.description}</p>
                    {existingFeedback[event.title] ? (
                      <div className="feedback-display">
                        <p>Your feedback: {existingFeedback[event.title]}</p>
                      </div>
                    ) : (
                      <div className="feedback-form">
                        <textarea
                          className="feedback-input"
                          placeholder="Enter your feedback..."
                          value={feedback[event.title] || ''}
                          onChange={(e) => setFeedback({
                            ...feedback,
                            [event.title]: e.target.value
                          })}
                        />
                        <button
                          className="submit-button"
                          onClick={() => handleFeedbackSubmit(event.title)}
                        >
                          Submit Feedback
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-background"></div>
      <div className="profile-header">
        <div className="profile-avatar">
          <FaUser className="avatar-icon" />
        </div>
        <div className="profile-info">
          <h1>Hi, {studentId}</h1>
          <p className="email">{userEmail}</p>
        </div>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'mybookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('mybookings')}
        >
          <FaTicketAlt /> My Bookings
        </button>
        <button 
          className={`tab-button ${activeTab === 'polling' ? 'active' : ''}`}
          onClick={() => setActiveTab('polling')}
        >
          <FaPoll /> Polling
        </button>
        <button 
          className={`tab-button ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          <FaCommentAlt /> Feedback
        </button>
      </div>

      {renderContent()}

      {/* Doubt Modal */}
      {showDoubtModal && (
        <div className="modal-overlay">
          <div className="doubt-modal">
            <div className="doubt-modal-header">
              <h2>Ask Doubt: {currentEvent?.title}</h2>
              <button className="close-button" onClick={closeDoubtModal}>×</button>
            </div>
            <div className="doubt-modal-body">
              <textarea
                className="doubt-input"
                placeholder="Type your doubt or question here..."
                value={doubtText}
                onChange={(e) => setDoubtText(e.target.value)}
              />
            </div>
            <div className="doubt-modal-footer">
              <button className="cancel-button" onClick={closeDoubtModal}>Cancel</button>
              <button 
                className="submit-button" 
                onClick={handleDoubtSubmit}
                disabled={isSubmittingDoubt}
              >
                {isSubmittingDoubt ? 'Submitting...' : 'Submit Doubt'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentProfile;