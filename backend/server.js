const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../')));

// Email configuration
const transporter = nodemailer.createTransporter({
    service: 'gmail', // or your email service
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, projectType, message } = req.body;

        // Validate required fields
        if (!name || !email || !projectType || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please fill in all required fields' 
            });
        }

        // Email to you (business owner)
        const mailOptions = {
            from: process.env.EMAIL_USER || 'your-email@gmail.com',
            to: 'info@slvcconstructions.com', // Your business email
            subject: `New Contact Form Submission - ${projectType}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <p><strong>Project Type:</strong> ${projectType}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
                <hr>
                <p><small>Submitted on: ${new Date().toLocaleString()}</small></p>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);

        // Auto-reply to customer
        const autoReplyOptions = {
            from: process.env.EMAIL_USER || 'your-email@gmail.com',
            to: email,
            subject: 'Thank you for contacting SLVC Constructions',
            html: `
                <h2>Thank you for contacting SLVC Constructions!</h2>
                <p>Dear ${name},</p>
                <p>We have received your inquiry about ${projectType} and will get back to you within 24 hours.</p>
                <p>In the meantime, you can:</p>
                <ul>
                    <li>Call us at: +1 (555) 123-4567</li>
                    <li>Visit our office: 123 Construction Ave, City, State 12345</li>
                </ul>
                <p>Best regards,<br>SLVC Constructions Team</p>
            `
        };

        await transporter.sendMail(autoReplyOptions);

        res.json({ 
            success: true, 
            message: 'Thank you! Your message has been sent successfully.' 
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Sorry, there was an error sending your message. Please try again.' 
        });
    }
});

// Serve the main website
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Website: http://localhost:${PORT}`);
}); 