const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "satya1982*", // Change if needed
  database: "auth_db",
});

db.connect((err) => {
  if (err) throw err;
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
      [email, id, password],
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

    res.status(200).json({ message: "Login successful", user });
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

    res.status(200).json({ message: "Login successful", admin });
  });
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

// Insert registration data into the registrations table
  const query = "INSERT INTO registered_students (student_email, event_registered) VALUES (?, ?)";
db.query(query, [userEmail, eventTitle], (err, result) => {
    if (err) {
      console.error("Error registering for event:", err);
      return res.status(500).json({ message: "Already registered for the event" });
    }

    res.status(201).json({ message: "Registered successfully!" });
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



//Get registered students for an event
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

// Server Listening
app.listen(5000, () => {
  console.log("Server running on port 5000");
});

// //Delete Event API Endpoint
// app.delete("/deleteEvent/:id", (req, res) => {
//   const eventId = req.params.id;

//   const query = "DELETE FROM events WHERE id = ?";
  
//   db.query(query, [eventId], (err, result) => {
//     if (err) {
//       console.error("Error deleting event:", err);
//       return res.status(500).json({ message: "Error deleting event" });
//     }

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "Event not found" });
//     }

//     res.status(200).json({ message: "Event deleted successfully" });
//   });
// });
