const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gega'
});

db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to MySQL database.');
});

// Temporary store for form data and OTP
let tempData = {};
let otpStore = {};

// Generate OTP and store form data
app.post('/send-otp', (req, res) => {
    const { name, contact, email, service, branch } = req.body;

    if (!name || !contact || !email || !service || !branch) {
        console.error('Error: Missing form data');
        return res.status(400).send('All fields are required.');
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    otpStore[email] = otp;

    // Store form data temporarily for later use
    tempData[email] = { name, contact, email, service, branch };

    console.log(`Generated OTP for ${email}: ${otp}`);

    // Send OTP via email using Nodemailer
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'demo11mail22@gmail.com',  // Replace with your email
            pass: 'pkbu ahcq wwjc phqc'  // Replace with app-specific password or "less secure apps" setting
        }
    });

    let mailOptions = {
        from: 'demo11mail22@gmail.com',
        to: email,
        subject: 'Your OTP for Gear Garage',
        text: `Your OTP is ${otp}. Please enter it to confirm your appointment.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            res.status(500).send('Error sending OTP.');
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).send('OTP sent successfully.');
        }
    });
});

// Validate OTP and save appointment data to the database
app.post('/validate-otp', (req, res) => {
    const { otp, email } = req.body;

    // Check if the OTP matches the one stored for the email
    if (otpStore[email] && otpStore[email] == otp) {
        // OTP is valid, retrieve the stored form data
        const formData = tempData[email];
        if (!formData) {
            console.error('No form data found for email:', email);
            return res.status(400).send('Form data not found.');
        }

        const { name, contact, service, branch } = formData;

        console.log(`Attempting to save data for: ${email}`);

        // SQL query to insert data into the database
        const sql = 'INSERT INTO appointment (name, contact, email, service, branch) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [name, contact, email, service, branch], (err, result) => {
            if (err) {
                console.error('Error saving appointment:', err);
                res.status(500).send('Error saving appointment.');
                return;
            }

            // Log successful insertion and clean up
            console.log('Appointment saved to database for:', email);
            delete tempData[email]; // Remove temp data after saving to DB
            delete otpStore[email]; // Remove OTP after successful validation

            res.status(200).send('Appointment confirmed and saved.');
        });
    } else {
        console.error('Invalid OTP for email:', email);
        res.status(400).send('Invalid OTP.');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
