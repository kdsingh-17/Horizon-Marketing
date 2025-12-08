const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    businessName: {
        type: String,
        required: [true, 'Business name is required'],
        trim: true
    },
    serviceInterest: {
        type: String,
        enum: ['seo', 'advertising', 'social', 'content', 'email', 'analytics', 'package'],
        required: [true, 'Service interest is required']
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true
    },
    sourcePage: {
        type: String,
        default: 'contact'
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'converted', 'archived'],
        default: 'new'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Contact', contactSchema);