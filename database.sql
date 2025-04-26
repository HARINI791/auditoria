-- Create the database
CREATE DATABASE IF NOT EXISTS auditoria;
USE auditoria;

-- Create nonacademic_events table
CREATE TABLE IF NOT EXISTS nonacademic_events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    movie_name VARCHAR(255) NOT NULL,
    description TEXT,
    venue VARCHAR(255),
    event_date DATE,
    slot_count INT CHECK (slot_count BETWEEN 1 AND 5)
);

-- Create event_slots table
CREATE TABLE IF NOT EXISTS event_slots (
    slot_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT,
    slot_number INT CHECK (slot_number BETWEEN 1 AND 5),
    slot_time TIME,
    FOREIGN KEY (event_id) REFERENCES nonacademic_events(event_id) ON DELETE CASCADE
);

-- Create seats table
CREATE TABLE IF NOT EXISTS seats (
    seat_id INT AUTO_INCREMENT PRIMARY KEY,
    slot_id INT,
    seat_number VARCHAR(10),
    is_booked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (slot_id) REFERENCES event_slots(slot_id) ON DELETE CASCADE
);

-- Add some sample data
INSERT INTO nonacademic_events (movie_name, description, venue, event_date, slot_count) VALUES
('The Dark Knight', 'A superhero movie about Batman', 'Main Auditorium', '2024-04-15', 3),
('Inception', 'A mind-bending sci-fi thriller', 'Main Auditorium', '2024-04-16', 2);

-- Add sample slots for the first movie
INSERT INTO event_slots (event_id, slot_number, slot_time) VALUES
(1, 1, '14:00:00'),
(1, 2, '17:00:00'),
(1, 3, '20:00:00');

-- Add sample slots for the second movie
INSERT INTO event_slots (event_id, slot_number, slot_time) VALUES
(2, 1, '15:00:00'),
(2, 2, '19:00:00');

-- Add sample seats for each slot
INSERT INTO seats (slot_id, seat_number, is_booked) VALUES
(1, 'A1', FALSE),
(1, 'A2', FALSE),
(1, 'A3', FALSE),
(2, 'A1', FALSE),
(2, 'A2', FALSE),
(2, 'A3', FALSE),
(3, 'A1', FALSE),
(3, 'A2', FALSE),
(3, 'A3', FALSE),
(4, 'A1', FALSE),
(4, 'A2', FALSE),
(4, 'A3', FALSE),
(5, 'A1', FALSE),
(5, 'A2', FALSE),
(5, 'A3', FALSE); 