require('dotenv').config(); // load .env at the very top
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const pollRoutes = require("./routes/polls");
const nodemailer = require('nodemailer');


const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/polls", pollRoutes);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hariniprasad285@gmail.com',
    pass: 'rdbrjfnutxnbooxd', // Use the 16-char App Password
  },
});


// Function to set up automated event reminders
function setupAutomaticEventReminders(db) {
  // Check for upcoming events every 5 minutes (300000 milliseconds)
  setInterval(() => {
    console.log("Running event reminder check...");
    
    // Get current time
    const now = new Date();
    
    // Calculate one hour from now
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    
    // Query to get all events
    const getEventsQuery = "SELECT * FROM academic_events";
    
    db.query(getEventsQuery, (err, events) => {
      if (err) {
        console.error("Error fetching events:", err);
        return;
      }
      
      // Filter events starting in approximately one hour
      events.forEach(event => {
        // Parse event date and time from ISO string
        const eventDateTime = new Date(event.date);
        
        if (isNaN(eventDateTime)) {
          console.error(`Invalid date format for event "${event.title}": ${event.date}`);
          return;
        }
        
        // Calculate time difference in minutes
        const diffMs = eventDateTime.getTime() - oneHourLater.getTime();
        const diffMinutes = Math.round(diffMs / 60000); // Convert to minutes
        
        // Check if event starts in approximately one hour (within a 5-minute window)
        if (Math.abs(diffMinutes) <= 5) {
          console.log(`Event "${event.title}" starts in one hour. Sending reminders...`);
          
          // Get all registered students for this event
          const getStudentsQuery = "SELECT student_email FROM registered_students WHERE event_registered = ?";
          
          db.query(getStudentsQuery, [event.title], (err, students) => {
            if (err) {
              console.error(`Error fetching registered students for event ${event.title}:`, err);
              return;
            }
            
            // Format date and time for email
            const eventDate = eventDateTime.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            
            const eventTime = eventDateTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            });
            
            // Send email to each registered student
            students.forEach(student => {
              const mailOptions = {
                from: '"Auditoria" <hariniprasad285@gmail.com>',
                to: student.student_email,
                subject: `REMINDER: Event "${event.title}" starts in 1 hour!`,
                html: `
                  <h3>Hi ${student.student_email.split("@")[0].toUpperCase()},</h3>
                  <p>This is a friendly reminder that you are registered for an event that starts in 1 hour:</p>
                  <ul>
                    <li><strong>Title:</strong> ${event.title}</li>
                    <li><strong>Description:</strong> ${event.description}</li>
                    <li><strong>Date:</strong> ${eventDate}</li>
                    <li><strong>Time:</strong> ${eventTime}</li>
                    <li><strong>Venue:</strong> ${event.venue}</li>
                  </ul>
                  <p>We look forward to seeing you there!<br><strong>Team Auditoria</strong></p>
                `,
              };
              
              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.error(`Error sending reminder to ${student.student_email}:`, error);
                } else {
                  console.log(`Reminder sent to ${student.student_email} for event "${event.title}"`);
                }
              });
            });
          });
        }
      });
    });
  }, 300000); // Check every 5 minutes (300000 ms)
}


// JWT Secret Key 
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// MySQL Connection with simplified configuration
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "mysql", // Use your actual MySQL password
  database: "auth_db"
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  setupAutomaticEventReminders(db);

  // Create non_academic_events table if it doesn't exist
  const createNonAcademicEventsTable = `
    CREATE TABLE IF NOT EXISTS nonacademic_events (
      event_id INT AUTO_INCREMENT PRIMARY KEY,
      movie_name VARCHAR(255) NOT NULL,
      description TEXT,
      venue VARCHAR(255),
      event_date DATE,
      image_url VARCHAR(255),
      slot_count INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.query(createNonAcademicEventsTable, (err) => {
    if (err) {
      console.error("Error creating non_academic_events table:", err);
    } else {
      console.log("Non-academic events table created or already exists");
    }
  });

  // After the createNonAcademicEventsTable query
  const alterNonAcademicEventsTable = `
    ALTER TABLE nonacademic_events
    MODIFY COLUMN event_id INT AUTO_INCREMENT,
    MODIFY COLUMN movie_name VARCHAR(255) NOT NULL,
    MODIFY COLUMN description TEXT,
    MODIFY COLUMN venue VARCHAR(255),
    MODIFY COLUMN event_date DATE,

    MODIFY COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  `;

  db.query(alterNonAcademicEventsTable, (err) => {
    if (err) {
      console.error("Error altering nonacademic_events table:", err);
    } else {
      console.log("Nonacademic_events table altered successfully");
    }
  });

  // Create event_slots table if it doesn't exist
  const createEventSlotsTable = `
    CREATE TABLE IF NOT EXISTS event_slots (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id INT NOT NULL,
      slot_time TIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES nonacademic_events(event_id) ON DELETE CASCADE
    )
  `;

  db.query(createEventSlotsTable, (err) => {
    if (err) {
      console.error("Error creating event_slots table:", err);
    } else {
      console.log("Event slots table created or already exists");
    }
  });

  // Create seat_bookings table if it doesn't exist
  const createSeatBookingsTable = `
    CREATE TABLE IF NOT EXISTS seat_bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id INT NOT NULL,
      slot_id INT NOT NULL,
      user_email VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES nonacademic_events(event_id) ON DELETE CASCADE,
      FOREIGN KEY (slot_id) REFERENCES event_slots(id) ON DELETE CASCADE
    )
  `;

  db.query(createSeatBookingsTable, (err) => {
    if (err) {
      console.error("Error creating seat_bookings table:", err);
    } else {
      console.log("Seat bookings table created or already exists");
    }
  });

  // Create event_seats table if it doesn't exist
  const createEventSeatsTable = `
    CREATE TABLE IF NOT EXISTS event_seats (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slot_id INT NOT NULL,
      seat_number VARCHAR(10) NOT NULL,
      is_booked BOOLEAN DEFAULT FALSE,
      booked_by VARCHAR(255),
      FOREIGN KEY (slot_id) REFERENCES event_slots(id) ON DELETE CASCADE,
      UNIQUE KEY unique_seat (slot_id, seat_number)
    )
  `;

  db.query(createEventSeatsTable, (err) => {
    if (err) {
      console.error("Error creating event_seats table:", err);
    } else {
      console.log("Event seats table created or already exists");
    }
  });

  // Create bookings table if it doesn't exist
  const createBookingsTable = `
    CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id INT NOT NULL,
      slot_id INT NOT NULL,
    user_email VARCHAR(255) NOT NULL,
      movie_name VARCHAR(255) NOT NULL,
      event_date DATE NOT NULL,
      slot_time VARCHAR(10) NOT NULL,
      seat_numbers TEXT NOT NULL,
      booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES nonacademic_events(event_id) ON DELETE CASCADE,
      FOREIGN KEY (slot_id) REFERENCES event_slots(id) ON DELETE CASCADE
    )
  `;

  db.query(createBookingsTable, (err) => {
    if (err) {
      console.error("Error creating bookings table:", err);
    } else {
      console.log("Bookings table created or already exists");
    }
  });

  console.log("MySQL Connected...");
});

// 🟢 REGISTER API
app.post("/register", async (req, res) => {
  const { email, id, password } = req.body;

  // Check if user already exists
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (results.length > 0) {
      return res.status(400).json({ message: "User already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    db.query(
      "INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)",
      [email, id, hashedPassword],
      (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.status(201).json({ message: "Registration successful" });
      }
    );
  });
});

// 🔵 LOGIN API
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (results.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = results[0];

    // ✅ Try comparing with bcrypt first
    const isMatch = await bcrypt.compare(password, user.password_hash);

    // ✅ If bcrypt doesn't match, try direct comparison (for plain text passwords)
    if (!isMatch && password !== user.password_hash) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, type: 'user' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        email: user.email,
        id: user.id
      }
    });
  });
});

// 🔵 ADMIN LOGIN API
app.post("/adminlogin", async (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM admins WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (results.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const admin = results[0];

    // ✅ Try comparing with bcrypt first
    const isMatch = await bcrypt.compare(password, admin.password);

    // ✅ If bcrypt doesn't match, try direct comparison (for plain text passwords)
    if (!isMatch && password !== admin.password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, type: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        email: admin.email,
        id: admin.id
      }
    });
  });
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Protected route example
app.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

// Add Event API Endpoint
app.post("/addEvent", (req, res) => {
  const { title, description, date, time, venue, Max_registrations } = req.body;

  const insertQuery =
    "INSERT INTO academic_events (title, description, date, time, venue, Max_registrations) VALUES (?, ?, ?, ?, ?, ?)";

  db.query(
    insertQuery,
    [title, description, date, time, venue, Max_registrations],
    (err, result) => {
      if (err) {
        console.error("Error inserting event:", err);
        return res.status(500).json({ message: "Error adding event" });
      }

      const fetchEmailsQuery = "SELECT email FROM users"; 

      db.query(fetchEmailsQuery, async (emailErr, emailResults) => {
        if (emailErr) {
          console.error("Error fetching emails:", emailErr);
          return res.status(500).json({
            message: "Event added, but failed to fetch user emails",
            eventId: result.insertId,
          });
        }

        const emailList = emailResults.map((row) => row.email);


        // Send emails to all users
        for (const email of emailList) {
          const mailOptions = {
            from: '"Auditoria" <hariniprasad285@gmail.com>',
            to: email,
            subject: "New Event Announcement",
            html: `
              <h3>Hi ${email.split("@")[0].toUpperCase()},</h3>
              <p>A new event has been added. Here are the details:</p>
              <ul>
                <li><strong>Title:</strong> ${title}</li>
                <li><strong>Description:</strong> ${description}</li>
                <li><strong>Date:</strong> ${date}</li>
                <li><strong>Time:</strong> ${time}</li>
                <li><strong>Venue:</strong> ${venue}</li>
              </ul>
              <p>Don't miss it!<br><strong>Team Auditoria</strong></p>
            `,
          };

          try {
            await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${email}`);
          } catch (emailErr) {
            console.error(`Error sending email to ${email}:`, emailErr);
          }
        }

        return res.status(201).json({
          message: "Event added and emails sent successfully",
          eventId: result.insertId,
        });
      });
    }
  );
});

// Add Event Retrieval API Endpoint
app.get("/getEvents", (req, res) => {
  // Query to retrieve all events from the academic_events table
  const query = "SELECT * FROM academic_events";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving events:", err);
      return res.status(500).json({ message: "Error retrieving events" });
    }

    res.status(200).json({ events: results });
  });
});

// Get Events API Endpoint
app.get("/events", (req, res) => {
  const query = `
    SELECT 
      e.*, 
      COUNT(rs.id) AS current_registrations 
    FROM academic_events e 
    LEFT JOIN registered_students rs 
    ON e.title = rs.event_registered 
    GROUP BY e.id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving events:", err);
      return res.status(500).json({ message: "Error fetching events" });
    }
    res.status(200).json({ events: results });
  });
});

// Delete Event API Endpoint
app.delete("/deleteEvent/:id", (req, res) => {
  const eventId = req.params.id;
  console.log(eventId);
  const query = "DELETE FROM nonacademic_events WHERE event_id = ?";
  
  db.query(query, [eventId], (err, result) => {
    if (err) {
      console.error("Error deleting event:", err);
      return res.status(500).json({ message: "Error deleting event" });
    }

    console.log(result)
    if (result.affectedRows === 0) {

      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  });
});

app.put("/updateEvent", (req, res) => {
  const { id, title, description, date, time, venue } = req.body;

  const query = "UPDATE academic_events SET title = ?, description = ?, date = ?, time = ?, venue = ? WHERE id = ?";
  db.query(query, [title, description, date, time, venue, id], (err, result) => {
    if (err) {
      console.error("Error updating event:", err);
      return res.status(500).json({ message: "Error updating event" });
    }
    res.status(200).json({ message: "Event updated successfully" });
  });
});

// Register for an event API Endpoint
app.post("/registerForEvent", (req, res) => {
  const { userEmail, eventTitle, eventDate, eventTime, eventVenue,eventDescription } = req.body;

  const checkQuery = "SELECT * FROM registered_students WHERE student_email = ? AND event_registered = ?";
  db.query(checkQuery, [userEmail, eventTitle], (err, results) => {
    if (err) {
      console.error("Error checking registration:", err);
      return res.status(500).json({ message: "Error checking registration status" });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "You are already registered for this event" });
    }

    const insertQuery = "INSERT INTO registered_students (student_email, event_registered) VALUES (?, ?)";
    db.query(insertQuery, [userEmail, eventTitle], async (err, result) => {
      if (err) {
        console.error("Error registering for event:", err);
        return res.status(500).json({ message: "Error registering for event" });
      }

      // ✅ Setup email transporter
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'hariniprasad285@gmail.com',
          pass: 'rdbrjfnutxnbooxd', // Use app password if 2FA is enabled
        },
      });

      // ✅ Compose the email
      const mailOptions = {
        from: '"Auditoria" <hariniprasad285@gmail.com>',
        to: userEmail,
        subject: 'Event Registration Confirmation',
        html: `
          <h3>Hi ${userEmail.split('@')[0].toUpperCase()},</h3>
          <p>You have successfully registered for the event:</p>
          <ul>
                <li><strong>Title:</strong> ${eventTitle}</li>
                <li><strong>Description:</strong> ${eventDescription}</li>
                <li><strong>Date:</strong> ${eventDate}</li>
                <li><strong>Time:</strong> ${eventTime}</li>
                <li><strong>Venue:</strong> ${eventVenue}</li>
              </ul>
          <p>Thank you for using <strong>Auditoria</strong>.</p>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        return res.status(201).json({ message: "Registered successfully! Confirmation email sent." });
      } catch (emailErr) {
        console.error("Error sending confirmation email:", emailErr);
        return res.status(201).json({ message: "Registered successfully! But failed to send confirmation email." });
      }
    });
  });
});


app.post("/createAttendanceTable", (req, res) => {
  const { eventTitle } = req.body;
  // Replace all special characters with underscores
  const tableName = `attendance_${eventTitle.replace(/[^a-zA-Z0-9]/g, "_")}`;

  const query = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_email VARCHAR(255) NOT NULL UNIQUE,
      attended BOOLEAN DEFAULT FALSE
    )
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("Error creating attendance table:", err);
      return res.status(500).json({ message: "Error creating attendance table" });
    }

    res.status(201).json({ message: `Attendance table '${tableName}' created successfully!` });
  });
});

app.post("/markAttendance", (req, res) => {
  const { eventTitle, studentEmail, attended } = req.body;
  // Use the same sanitization for consistency
  const tableName = `attendance_${eventTitle.replace(/[^a-zA-Z0-9]/g, "_")}`;

  const query = `INSERT INTO ${tableName} (student_email, attended) VALUES (?, ?)`;

  db.query(query, [studentEmail, attended], (err, result) => {
    if (err) {
      console.error("Error marking attendance:", err);
      return res.status(500).json({ message: "Error marking attendance" });
    }

    res.status(200).json({ message: "Attendance marked successfully!" });
  });
});

// Get registered students for an event
app.get("/getRegisteredStudents/:eventTitle", (req, res) => {
  const eventTitle = req.params.eventTitle;

  const query = "SELECT student_email FROM registered_students WHERE event_registered = ?";
  
  db.query(query, [eventTitle], (err, results) => {
    if (err) {
      console.error("Error fetching registered students:", err);
      return res.status(500).json({ message: "Error fetching registered students" });
    }

    res.status(200).json({ registeredStudents: results });
  });
});

// Get registered events for a specific user
app.get("/getRegisteredEvents/:email", (req, res) => {
  const userEmail = req.params.email;

  const query = `
    SELECT e.* 
    FROM academic_events e
    INNER JOIN registered_students rs ON e.title = rs.event_registered
    WHERE rs.student_email = ?
  `;

  db.query(query, [userEmail], (err, results) => {
    if (err) {
      console.error("Error fetching registered events:", err);
      return res.status(500).json({ message: "Error fetching registered events" });
    }

    res.status(200).json({ events: results });
  });
});

// Get attended events for a specific user
app.get("/getAttendedEvents/:email", (req, res) => {
  const userEmail = req.params.email;

  // First get all events
  const getEventsQuery = "SELECT title FROM academic_events";
  
  db.query(getEventsQuery, (err, events) => {
    if (err) {
      console.error("Error fetching events:", err);
      return res.status(500).json({ message: "Error fetching events" });
    }

    const attendedEvents = [];
    let completedQueries = 0;

    // For each event, check if the user attended
    events.forEach(event => {
      const tableName = `attendance_${event.title.replace(/\s+/g, "_")}`;
      const checkAttendanceQuery = `SELECT attended FROM ${tableName} WHERE student_email = ? AND attended = true`;

      db.query(checkAttendanceQuery, [userEmail], (err, results) => {
        completedQueries++;
        
        if (!err && results.length > 0) {
          attendedEvents.push({
            title: event.title,
            attended: true
          });
        }

        // When all queries are complete, send the response
        if (completedQueries === events.length) {
          res.status(200).json({ events: attendedEvents });
        }
      });
    });

    // If there are no events, send empty response immediately
    if (events.length === 0) {
      res.status(200).json({ events: [] });
    }
  });
});

// Submit feedback for an event
app.post("/submitFeedback", (req, res) => {
  const { userEmail, eventTitle, feedback } = req.body;
  const tableName = `feedback_${eventTitle.replace(/\s+/g, "_")}`;

  // First, create the feedback table if it doesn't exist
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_email VARCHAR(255) NOT NULL,
      event_title VARCHAR(255) NOT NULL,
      feedback TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.query(createTableQuery, (err) => {
    if (err) {
      console.error("Error creating feedback table:", err);
      return res.status(500).json({ message: "Error creating feedback table" });
    }

    // Check if user has already submitted feedback for this event
    const checkQuery = `SELECT * FROM ${tableName} WHERE student_email = ?`;
    db.query(checkQuery, [userEmail], (err, results) => {
      if (err) {
        console.error("Error checking existing feedback:", err);
        return res.status(500).json({ message: "Error checking existing feedback" });
      }

      if (results.length > 0) {
        // Update existing feedback
        const updateQuery = `UPDATE ${tableName} SET feedback = ? WHERE student_email = ?`;
        db.query(updateQuery, [feedback, userEmail], (err) => {
          if (err) {
            console.error("Error updating feedback:", err);
            return res.status(500).json({ message: "Error updating feedback" });
          }
          res.status(200).json({ message: "Feedback updated successfully" });
        });
      } else {
        // Insert new feedback
        const insertQuery = `INSERT INTO ${tableName} (student_email, event_title, feedback) VALUES (?, ?, ?)`;
        db.query(insertQuery, [userEmail, eventTitle, feedback], (err) => {
          if (err) {
            console.error("Error inserting feedback:", err);
            return res.status(500).json({ message: "Error submitting feedback" });
          }
          res.status(201).json({ message: "Feedback submitted successfully" });
        });
      }
    });
  });
});

// Get feedback for an event
app.get("/getFeedback/:eventTitle", (req, res) => {
  const eventTitle = req.params.eventTitle;
  const tableName = `feedback_${eventTitle.replace(/\s+/g, "_")}`;

  const query = `SELECT * FROM ${tableName}`;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching feedback:", err);
      return res.status(500).json({ message: "Error fetching feedback" });
    }
    res.status(200).json({ feedback: results });
  });
});

// Add event to poll
app.post("/addEventToPoll", (req, res) => {
  const { event_title, event_description } = req.body;

  const query = `INSERT INTO events_poll (event_title, event_description, interested, not_interested) VALUES (?, ?, 0, 0)`;

  db.query(query, [event_title, event_description], (err, result) => {
    if (err) {
      console.error("Error adding event to poll:", err.sqlMessage || err);
      return res.status(500).json({ message: "Error adding event to poll" });
    }
    console.log("Event inserted:", result);
    res.status(201).json({ message: "Event added to poll successfully" });
  });
  
});

// Create user_interests table if it doesn't exist
const createUserInterestsTable = `
  CREATE TABLE IF NOT EXISTS user_interests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    event_title VARCHAR(255) NOT NULL,
    interested BOOLEAN NOT NULL,
    UNIQUE KEY unique_user_event (user_email, event_title)
  )
`;

db.query(createUserInterestsTable, (err) => {
  if (err) {
    console.error('Error creating user_interests table:', err);
  }
});

// Get user's interests
app.get("/getUserInterests/:email", (req, res) => {
  const userEmail = req.params.email;
  const query = "SELECT event_title, interested FROM user_interests WHERE user_email = ?";
  
  db.query(query, [userEmail], (err, results) => {
    if (err) {
      console.error("Error fetching user interests:", err);
      return res.status(500).json({ message: "Error fetching user interests" });
    }

    const interests = {};
    results.forEach(result => {
      interests[result.event_title] = result.interested;
    });

    res.status(200).json({ interests });
  });
});

// Update interest count
app.post("/updateInterest", (req, res) => {
  const { event_title, interested, user_email } = req.body;

  // First, check if user has already voted
  const checkQuery = "SELECT * FROM user_interests WHERE user_email = ? AND event_title = ?";
  db.query(checkQuery, [user_email, event_title], (err, results) => {
    if (err) {
      console.error("Error checking user interest:", err);
      return res.status(500).json({ message: "Error checking user interest" });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "You have already voted for this event" });
    }

    // If user hasn't voted, proceed with the update
    const column = interested ? 'interested' : 'not_interested';
    const updateQuery = `UPDATE events_poll SET ${column} = ${column} + 1 WHERE event_title = ?`;
    const insertQuery = "INSERT INTO user_interests (user_email, event_title, interested) VALUES (?, ?, ?)";

    db.query(updateQuery, [event_title], (err) => {
      if (err) {
        console.error("Error updating interest count:", err);
        return res.status(500).json({ message: "Error updating interest count" });
      }

      db.query(insertQuery, [user_email, event_title, interested], (err) => {
        if (err) {
          console.error("Error recording user interest:", err);
          return res.status(500).json({ message: "Error recording user interest" });
        }

        res.status(200).json({ message: "Interest recorded successfully" });
      });
    });
  });
});

// Get events poll
app.get("/getEventsPoll", (req, res) => {
  const query = "SELECT * FROM events_poll";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching events poll:", err);
      return res.status(500).json({ message: "Error fetching events poll" });
    }
    res.status(200).json({ events: results });
  });
});

// Search student suggestions endpoint
app.get("/searchStudentSuggestions/:eventTitle/:query", (req, res) => {
  const { eventTitle, query } = req.params;

  const searchQuery = `
    SELECT DISTINCT student_email 
    FROM registered_students 
    WHERE event_registered = ? 
    AND student_email LIKE ?
  `;

  db.query(searchQuery, [eventTitle, `%${query}%`], (err, results) => {
    if (err) {
      console.error("Error searching for students:", err);
      return res.status(500).json({ message: "Error searching for students" });
    }

    const suggestions = results.map(result => result.student_email);
    res.status(200).json({ suggestions });
  });
});

// Search specific student endpoint
app.get("/searchStudent/:eventTitle/:email", (req, res) => {
  const { eventTitle, email } = req.params;

  const searchQuery = `
    SELECT * FROM registered_students 
    WHERE event_registered = ? 
    AND student_email = ?
  `;

  db.query(searchQuery, [eventTitle, email], (err, results) => {
    if (err) {
      console.error("Error searching for student:", err);
      return res.status(500).json({ message: "Error searching for student" });
    }

    if (results.length > 0) {
      res.status(200).json({ found: true, student: results[0] });
    } else {
      res.status(200).json({ found: false });
    }
  });
});

// Add Non-Academic Event API Endpoint
app.post("/addNonAcademicEvent", (req, res) => {
  const { movie_name, description, venue, event_date, slots } = req.body;
  
  // Validate required fields
  if (!movie_name || !event_date || !slots || !Array.isArray(slots)) {
    return res.status(400).json({ error: 'Missing required fields or invalid slots format' });
  }

  const sql = 'INSERT INTO nonacademic_events (movie_name, description, venue, event_date, slot_count) VALUES (?, ?, ?, ?, ?)';
  
  db.query(sql, [movie_name, description, venue, event_date, slots.length], (err, result) => {
    if (err) {
      console.error('Error adding non-academic event:', err);
      return res.status(500).json({ error: 'Error adding non-academic event' });
    }

    const eventId = result.insertId;
    
    // Insert slots
    if (slots.length > 0) {
      const slotValues = slots.map(slot => [eventId, slot.slot_time]);
      const slotSql = 'INSERT INTO event_slots (event_id, slot_time) VALUES ?';
      
      db.query(slotSql, [slotValues], async (err, slotResult) => {
        if (err) {
          console.error('Error adding slots:', err);
          // Rollback the event insertion if slot insertion fails
          db.query('DELETE FROM nonacademic_events WHERE event_id = ?', [eventId]);
          return res.status(500).json({ error: 'Error adding slots' });
        }

        // Create seats for each slot
        try {
          const firstSlotId = slotResult.insertId;
          const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
          const seatNumbers = Array.from({ length: 10 }, (_, i) => i + 1);
          
          for (let i = 0; i < slots.length; i++) {
            const slotId = firstSlotId + i;
            const seatValues = [];
            
            // Create exactly 100 seats (10x10) for each slot
            for (const letter of seatLetters) {
              for (const number of seatNumbers) {
                seatValues.push([slotId, `${letter}${number}`]);
              }
            }
            
            // Insert all seats for this slot
            await new Promise((resolve, reject) => {
              const seatSql = 'INSERT INTO event_seats (slot_id, seat_number) VALUES ?';
              db.query(seatSql, [seatValues], (err, result) => {
                if (err) {
                  console.error('Error inserting seats:', err);
                  reject(err);
                } else {
                  resolve(result);
                }
              });
            });
          }
          
          res.json({ message: 'Non-academic event added successfully' });
        } catch (error) {
          console.error('Error adding seats:', error);
          db.query('DELETE FROM nonacademic_events WHERE event_id = ?', [eventId]);
          return res.status(500).json({ error: 'Error adding seats: ' + error.message });
        }
      });
    } else {
      res.json({ message: 'Non-academic event added successfully' });
    }
  });
});

// Update the getEventSeats endpoint
app.get("/getEventSeats/:slotId", (req, res) => {
  const slotId = req.params.slotId;
  
  const sql = `
    SELECT id, seat_number, is_booked
    FROM event_seats
    WHERE slot_id = ?
    ORDER BY seat_number
  `;
  
  db.query(sql, [slotId], (err, results) => {
    if (err) {
      console.error('Error fetching seats:', err);
      return res.status(500).json({ error: 'Error fetching seats' });
    }
    
    // Add some logging
    console.log(`Fetched ${results.length} seats for slot ${slotId}`);
    
    res.json({ 
      seats: results.map(seat => ({
        id: seat.id,
        seat_number: seat.seat_number,
        is_booked: Boolean(seat.is_booked)
      }))
    });
  });
});

// Add endpoint to book seats
app.post("/bookEventSeats", async (req, res) => {
  console.log('Received booking request:', req.body);
  
  const { eventId, slotId, seatIds, userEmail, movieName, eventDate, slotTime, seatNumbers } = req.body;
  
  if (!eventId || !slotId || !seatIds || !userEmail || !Array.isArray(seatIds)) {
    console.log('Validation failed:', { eventId, slotId, seatIds, userEmail });
    return res.status(400).json({ 
      error: 'Invalid booking request',
      details: { eventId, slotId, seatIds, userEmail }
    });
  }

  // Format the date to YYYY-MM-DD format
  const formattedDate = new Date(eventDate).toISOString().split('T')[0];

  // Update seats to booked status
  const updateQuery = 'UPDATE event_seats SET is_booked = TRUE, booked_by = ? WHERE id IN (?) AND slot_id = ? AND is_booked = FALSE';
  db.query(updateQuery, [userEmail, seatIds, slotId], (err, updateResult) => {
    if (err) {
      console.error('Error updating seats:', err);
      return res.status(500).json({ error: 'Failed to update seats' });
    }

    // Insert booking record
    const bookingQuery = `
      INSERT INTO bookings (
        event_id, 
        slot_id, 
        user_email, 
        movie_name,
        event_date,
        slot_time,
        seat_numbers,
        booking_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    
    db.query(bookingQuery, 
      [eventId, slotId, userEmail, movieName, formattedDate, slotTime, JSON.stringify(seatNumbers)],
      (err, bookingResult) => {
        if (err) {
          console.error('Error creating booking:', err);
          // If booking fails, revert the seat updates
          const revertQuery = 'UPDATE event_seats SET is_booked = FALSE, booked_by = NULL WHERE id IN (?) AND slot_id = ?';
          db.query(revertQuery, [seatIds, slotId]);
          return res.status(500).json({ error: 'Failed to create booking' });
        }

        res.json({ 
          message: 'Booking successful',
          bookingId: bookingResult.insertId
        });
      }
    );
  });
});

// Add endpoint to get user bookings
app.get("/getUserBookings/:email", async (req, res) => {
  const userEmail = req.params.email;
  
  const query = `
    SELECT * FROM bookings 
    WHERE user_email = ? 
    ORDER BY booking_date DESC
  `;
  
  try {
    const [bookings] = await db.promise().query(query, [userEmail]);
    res.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get Non-Academic Events API Endpoint
app.get("/getNonAcademicEvents", (req, res) => {
  const query = `
    SELECT 
      e.*,
      GROUP_CONCAT(CONCAT(s.id, ':', s.slot_time)) as slot_data
    FROM nonacademic_events e
    LEFT JOIN event_slots s ON e.event_id = s.event_id
    GROUP BY e.event_id
    ORDER BY e.event_date DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving non-academic events:", err);
      return res.status(500).json({ message: "Error retrieving non-academic events" });
    }

    // Format the results to include slot times and IDs as an array of objects
    const events = results.map(event => ({
      ...event,
      slots: event.slot_data ? event.slot_data.split(',').map(slot => {
        const [id, time] = slot.split(':');
        return { id: parseInt(id), time };
      }) : []
    }));

    res.status(200).json({ events });
  });
});

// Debug endpoint to check table structure
app.get('/debug/nonacademic_events', (req, res) => {
  const query = 'DESC nonacademic_events';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error checking table structure:', err);
      return res.status(500).json({ error: 'Error checking table structure' });
    }
    
    res.json({ table_structure: results });
  });
});

// Server Listening
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
