const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// Basic authentication middleware (simplified - use proper auth in production)
const requireAuth = (req, res, next) => {
    // In production, use JWT or sessions
    const authHeader = req.headers.authorization;
    
    if (authHeader === 'Bearer admin123') { // Simple hardcoded token for demo
        next();
    } else {
        res.status(401).json({ success: false, message: 'Unauthorized' });
    }
};

// Get dashboard stats
router.get('/stats', requireAuth, async (req, res) => {
    try {
        const totalLeads = await Contact.countDocuments();
        const newLeads = await Contact.countDocuments({ status: 'new' });
        const contactedLeads = await Contact.countDocuments({ status: 'contacted' });
        const convertedLeads = await Contact.countDocuments({ status: 'converted' });
        
        const serviceStats = await Contact.aggregate([
            { $group: { _id: '$serviceInterest', count: { $sum: 1 } } }
        ]);
        
        const recentLeads = await Contact.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select('firstName lastName email businessName serviceInterest status createdAt');
        
        res.json({
            success: true,
            data: {
                totalLeads,
                newLeads,
                contactedLeads,
                convertedLeads,
                serviceStats,
                recentLeads
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all leads with pagination
router.get('/leads', requireAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        const leads = await Contact.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await Contact.countDocuments();
        
        res.json({
            success: true,
            data: leads,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update lead status
router.put('/leads/:id', requireAuth, async (req, res) => {
    try {
        const { status, notes } = req.body;
        
        const lead = await Contact.findById(req.params.id);
        if (!lead) {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }
        
        if (status) lead.status = status;
        if (notes) lead.notes = notes;
        
        await lead.save();
        
        res.json({ success: true, data: lead });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;