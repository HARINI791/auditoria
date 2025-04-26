const express = require("express");
const router = express.Router();
const db = require("../db");
const sendEmail = require("../mailer");

router.post("/create", async (req, res) => {
  const { question, options } = req.body;

  db.query("INSERT INTO polls (question) VALUES (?)", [question], (err, result) => {
    if (err) return res.status(500).json({ message: "Failed to create poll" });

    const pollId = result.insertId;
    const pollOptions = options.map(opt => [pollId, opt]);

    db.query("INSERT INTO poll_options (poll_id, option_text) VALUES ?", [pollOptions], (err) => {
      if (err) return res.status(500).json({ message: "Failed to insert poll options" });

      db.query("SELECT email FROM users", (err, results) => {
        if (err) return res.status(500).json({ message: "Failed to get users" });

        results.forEach(user => {
          const html = `<h3>New Poll:</h3><p>${question}</p><p>Login to vote.</p>`;
          sendEmail(user.email, "New Poll Created", html);
        });

        return res.status(200).json({ message: "Poll created and emails sent" });
      });
    });
  });
});

module.exports = router;
