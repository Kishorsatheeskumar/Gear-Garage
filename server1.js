const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware to parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// MySQL Database Connection (Update host, user, and password if needed)
const db = mysql.createConnection({
    host: 'localhost', // Ensure this matches the host your XAMPP MySQL server is using
    user: 'root', // Default user for XAMPP MySQL
    password: '', // Ensure this matches the password you've set in XAMPP (usually empty '' by default)
    database: 'gega' // Ensure this database exists in your XAMPP MySQL
});

// Establish MySQL Connection
db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to MySQL database.');
});

// Endpoint to handle form submission
app.post('/submit', (req, res) => {
    const { name, contact, email, service, branch } = req.body;

    // Validate form data
    if (!name || !contact || !email || !service || !branch) {
        res.status(400).send('All fields are required.');
        return;
    }

    // SQL Query to Insert Appointment Data
    const sql = 'INSERT INTO appointment (name, contact, email, service, branch) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [name, contact, email, service, branch], (err, result) => {
        if (err) {
            console.error('Error saving appointment:', err); // Log the error for debugging
            res.status(500).send('Error saving appointment.');
            return;
        }
        res.status(200).send('Appointment saved successfully.');
    });
});

// Start the server and listen for requests
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
