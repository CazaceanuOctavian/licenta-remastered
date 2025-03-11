// createAdminUser.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from './models/user.mjs'

// Load environment variables
dotenv.config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your_database_name';

// Admin user credentials - you may want to set these in your .env file
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'qwe123';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Function to create admin user
async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    
    // Create new admin user
    const adminUser = new User({
      email: ADMIN_EMAIL,
      passwordHash,
      type: 'admin'
    });
    
    // Save admin user to database
    const savedAdmin = await adminUser.save();
    
    console.log('Admin user created successfully');
    console.log(`Admin ID: ${savedAdmin._id}`);
    console.log(`Admin Email: ${savedAdmin.email}`);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    // Close MongoDB connection
    mongoose.connection.close();
  }
}

// Run the function
createAdminUser();