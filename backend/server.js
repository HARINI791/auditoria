const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

// JWT Secret Key harini
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// MySQL Connection with simplified configuration
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "8125754668", // Use your actual MySQL password
  database: "auth_db"
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
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

  // Query to insert event data into the events table
  const query = "INSERT INTO events (title, description, date, time, venue, Max_registrations) VALUES (?, ?, ?, ?, ?, ?)";

  db.query(query, [title, description, date, time, venue, Max_registrations], (err, result) => {
    if (err) {
      console.error("Error inserting event:", err);
      return res.status(500).json({ message: "Error adding event" });
    }

    res.status(201).json({ message: "Event added successfully", eventId: result.insertId });
  });
});

// Add Event Retrieval API Endpoint
app.get("/getEvents", (req, res) => {
  // Query to retrieve all events from the events table
  const query = "SELECT * FROM events";

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
    FROM events e 
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

  const query = "DELETE FROM events WHERE id = ?";
  
  db.query(query, [eventId], (err, result) => {
    if (err) {
      console.error("Error deleting event:", err);
      return res.status(500).json({ message: "Error deleting event" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  });
});

app.put("/updateEvent", (req, res) => {
  const { id, title, description, date, time, venue } = req.body;

  const query = "UPDATE events SET title = ?, description = ?, date = ?, time = ?, venue = ? WHERE id = ?";
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
  const { userEmail, eventTitle } = req.body;

  // First check if user is already registered for this event
  const checkQuery = "SELECT * FROM registered_students WHERE student_email = ? AND event_registered = ?";
  db.query(checkQuery, [userEmail, eventTitle], (err, results) => {
    if (err) {
      console.error("Error checking registration:", err);
      return res.status(500).json({ message: "Error checking registration status" });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "You are already registered for this event" });
    }

    // If not registered, proceed with registration
    const insertQuery = "INSERT INTO registered_students (student_email, event_registered) VALUES (?, ?)";
    db.query(insertQuery, [userEmail, eventTitle], (err, result) => {
      if (err) {
        console.error("Error registering for event:", err);
        return res.status(500).json({ message: "Error registering for event" });
      }

      res.status(201).json({ message: "Registered successfully!" });
    });
  });
});

app.post("/createAttendanceTable", (req, res) => {
  const { eventTitle } = req.body;
  const tableName = `attendance_${eventTitle.replace(/\s+/g, "_")}`; // Replace spaces with underscores

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
  const tableName = `attendance_${eventTitle.replace(/\s+/g, "_")}`;

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
    FROM events e
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
  const getEventsQuery = "SELECT title FROM events";
  
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

// Server Listening
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
