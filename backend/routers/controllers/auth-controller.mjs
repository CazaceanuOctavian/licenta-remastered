import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../../models/user.model.js' // Update this path to your MongoDB model

const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email })
    
    if (user) {
      const isPasswordValid = await bcrypt.compare(req.body.password, user.passwordHash)
      
      if (isPasswordValid) {
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
        
        // Update user with token
        await User.updateOne(
          { _id: user._id },
          { token: token }
        )
        
        res.status(200).json({ 
          token, 
          email: user.email, 
          id: user._id.toString(), 
          type: user.type 
        })
      } else {
        res.status(401).json({ message: 'Invalid email or password' })
      }
    } else {
      res.status(401).json({ message: 'Invalid email or password' })
    }
  } catch (err) {
    next(err)
  }
}

const logout = async (req, res, next) => {
  try {
    const result = await User.updateOne(
      { token: req.body.token },
      { $set: { token: null } }
    )
    
    if (result.modifiedCount > 0) {
      res.status(200).json({ message: 'User logged out' })
    } else {
      res.status(401).json({ message: 'Invalid token' })
    }
  } catch (err) {
    next(err)
  }
}

const register = async (req, res, next) => {
  try {
    const passwordHash = await bcrypt.hash(req.body.password, 10)
    
    const newUser = new User({
      email: req.body.email,
      passwordHash: passwordHash,
      type: req.body.type || 'user' // Default user type if not specified
    })
    
    const savedUser = await newUser.save()
    
    res.status(201).json({
      id: savedUser._id,
      email: savedUser.email,
      type: savedUser.type
    })
  } catch (err) {
    // Check for duplicate email error (MongoDB error code 11000)
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' })
    }
    next(err)
  }
}

export default {
  login,
  logout,
  register
}