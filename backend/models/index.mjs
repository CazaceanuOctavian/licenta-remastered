import mongoose from 'mongoose'
import dotenv from 'dotenv'
import createUserEntity from './user.mjs'
import createProductEntity from './product.mjs'

dotenv.config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yourdbname')
    console.log('Connected to MongoDB')
  } catch (err) {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  }
}

// Initialize the connection
connectDB()

// Create the models
const User = createUserEntity()
const Product = createProductEntity()

export default {
  mongoose,
  User,
  Product
}

export {
  User
}