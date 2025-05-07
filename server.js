// Endpoint to send notifications to registered students
app.post('/sendEventNotification/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    // Get event details
    const eventQuery = 'SELECT * FROM events WHERE id = ?';
    const [event] = await db.query(eventQuery, [eventId]);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Get all registered students for this event
    const studentsQuery = `
      SELECT DISTINCT s.email, s.name 
      FROM students s
      JOIN event_registrations er ON s.email = er.student_email
      WHERE er.event_id = ?
    `;
    const [students] = await db.query(studentsQuery, [eventId]);

    if (students.length === 0) {
      return res.status(400).json({ message: 'No registered students found for this event' });
    }

    // Send email to each student
    const emailPromises = students.map(student => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: student.email,
        subject: `Event Starting Soon: ${event.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e50914;">Event Starting Soon!</h2>
            <p>Hello ${student.name},</p>
            <p>This is a reminder that the event you registered for is about to start:</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">${event.title}</h3>
              <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${event.time}</p>
              <p><strong>Venue:</strong> ${event.venue}</p>
              <p><strong>Description:</strong> ${event.description}</p>
            </div>
            <p>Please join the event on time. We look forward to seeing you there!</p>
            <p>Best regards,<br>The Event Management Team</p>
          </div>
        `
      };

      return transporter.sendMail(mailOptions);
    });

    await Promise.all(emailPromises);

    res.json({ message: 'Notifications sent successfully to all registered students' });
  } catch (error) {
    console.error('Error sending notifications:', error);
    res.status(500).json({ message: 'Error sending notifications' });
  }
}); 