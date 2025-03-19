import mongoose from 'mongoose'

const createUserEntity = () => {
  const userSchema = new mongoose.Schema({
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    token: {
      type: String,
      default: null
    },
    type: {
      type: String,
      enum: ['user', 'admin'], // Add any other user types you need
      default: 'user'
    },
    savedProducts: [{
      product_code: {
        type: String,
        required: true,
        trim: true
      },
      email_notification: {
        type: Boolean,
        default: false
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }, {
    timestamps: true // Automatically manage createdAt and updatedAt
  })

  return mongoose.model('User', userSchema)
}

export default createUserEntity