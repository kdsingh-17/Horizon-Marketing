// ===== BACKEND/SERVER.JS =====
// Add this at the VERY TOP
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Debug: Check if env variables are loaded
console.log('Environment check:');
console.log('- PORT:', process.env.PORT || 'Not set');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? 'Set (hidden)' : 'Not set');
console.log('- EMAIL_USER:', process.env.EMAIL_USER || 'Not set');

// Import packages (ONCE!)
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');

// Import routes
const contactRoutes = require('./routes/contactRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize Express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
    origin: 'http://localhost:8080', // Your frontend port
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from frontend (for production)
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

// Basic test route
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Backend is working!',
        timestamp: new Date().toISOString()
    });
});

// Serve HTML files for all frontend routes
app.get('*', (req, res) => {
    const requestedPath = req.path;
    
    // Map routes to HTML files
    const htmlFiles = {
        '/': 'index.html',
        '/index.html': 'index.html',
        '/services.html': 'services.html',
        '/contact.html': 'contact.html',
        '/admin.html': 'admin.html',
        '/seo-service.html': 'seo-service.html'
    };
    
    if (htmlFiles[requestedPath]) {
        res.sendFile(path.join(__dirname, '../frontend', htmlFiles[requestedPath]));
    } else if (requestedPath.endsWith('.html')) {
        // Try to serve other HTML files
        res.sendFile(path.join(__dirname, '../frontend', requestedPath));
    } else {
        // For API routes that don't exist
        res.status(404).json({ 
            success: false, 
            error: 'Endpoint not found',
            path: requestedPath 
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
// TEST DATABASE ENDPOINT
app.get('/api/test-db', async (req, res) => {
    try {
        // Get database stats
        const db = mongoose.connection.db;
        const stats = await db.stats();
        
        res.json({
            success: true,
            message: '✅ Database is working!',
            database: mongoose.connection.name,
            collections: stats.collections,
            objects: stats.objects,
            connection: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
        });
    } catch (error) {
        res.json({
            success: false,
            message: '❌ Database error',
            error: error.message
        });
    }
});

// Start server
const PORT = process.env.PORT || 5001;  // Change to 5001 or 8000
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    console.log(`📧 Email user: ${process.env.EMAIL_USER || 'Not configured'}`);
});