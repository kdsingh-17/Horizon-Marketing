const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        console.log('URI present:', !!process.env.MONGODB_URI);
        
        if (!process.env.MONGODB_URI) {
            console.error('❌ MONGODB_URI is not defined in .env file');
            console.log('💡 Create a free MongoDB cluster at: https://mongodb.com');
            console.log('💡 Or use local MongoDB: mongodb://localhost:27017/horizon_marketing');
            
            // Fallback for testing
            process.env.MONGODB_URI = 'mongodb://localhost:27017/horizon_marketing';
            console.log('⚠️ Using fallback MongoDB URI');
        }
        
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.log('💡 Troubleshooting:');
        console.log('1. Check if MongoDB is running');
        console.log('2. Check .env file for MONGODB_URI');
        console.log('3. For Atlas: Add your IP to whitelist');
        console.log('4. For Atlas: Check username/password');
        process.exit(1);
    }
};

module.exports = connectDB;