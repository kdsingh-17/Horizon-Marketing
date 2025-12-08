const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');

// Email transporter setup
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ========== GET /api/contact (Test endpoint) ==========
router.get('/', (req, res) => {
    res.json({
        message: 'Contact API is working',
        status: 'OK',
        endpoints: {
            'POST /submit': 'Submit contact form',
            'GET /all': 'Get all contacts (admin)'
        }
    });
});

// ========== POST /api/contact/submit ==========
router.post('/submit', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, businessName, serviceInterest, message, sourcePage } = req.body;

        console.log('📥 Contact form received:', { firstName, email, businessName });

        // 1. Save to database
        const contact = new Contact({
            firstName,
            lastName,
            email,
            phone,
            businessName,
            serviceInterest,
            message,
            sourcePage: sourcePage || 'contact'
        });

        await contact.save();
        console.log('✅ Contact saved to database:', contact._id);

        // 2. Send email to business owner (YOU)
        const adminMailOptions = {
            from: `"Horizon Marketing Website" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Your email
            subject: `New Contact Form Submission - ${businessName}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <p><strong>Business:</strong> ${businessName}</p>
                <p><strong>Service Interest:</strong> ${serviceInterest}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
                <p><strong>Submitted from:</strong> ${sourcePage || 'Contact page'}</p>
                <hr>
                <p>Login to your dashboard to manage this lead.</p>
            `
        };

        // 3. Send confirmation email to user
        const userMailOptions = {
            from: `"Horizon Marketing" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Thank you for contacting Horizon Marketing!',
            html: `
                <h2>Thank you for reaching out, ${firstName}!</h2>
                <p>We have received your inquiry and one of our marketing specialists will contact you within 24 hours.</p>
                
                <h3>Your Submission Details:</h3>
                <ul>
                    <li><strong>Name:</strong> ${firstName} ${lastName}</li>
                    <li><strong>Business:</strong> ${businessName}</li>
                    <li><strong>Service Interest:</strong> ${serviceInterest}</li>
                </ul>
                
                <p><strong>Your Message:</strong><br>${message}</p>
                
                <hr>
                <h3>What happens next?</h3>
                <ol>
                    <li>Our team will review your requirements</li>
                    <li>We'll schedule a free consultation call</li>
                    <li>We'll prepare a customized marketing proposal</li>
                </ol>
                
                <p>In the meantime, feel free to explore our <a href="${process.env.FRONTEND_URL}/services.html">services</a>.</p>
                
                <p>Best regards,<br>
                <strong>The Horizon Marketing Team</strong></p>
                
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    This is an automated message. Please do not reply to this email.
                </p>
            `
        };

        // Send both emails
        await transporter.sendMail(adminMailOptions);
        await transporter.sendMail(userMailOptions);
        console.log('✅ Emails sent successfully');

        res.status(201).json({
            success: true,
            message: 'Form submitted successfully. Check your email for confirmation.',
            data: { id: contact._id }
        });

    } catch (error) {
        console.error('❌ Form submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting form. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// ========== GET /api/contact/all ==========
router.get('/all', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json({ success: true, count: contacts.length, data: contacts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;