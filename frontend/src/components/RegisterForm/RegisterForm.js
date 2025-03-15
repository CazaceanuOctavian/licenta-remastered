import React, { useState, useContext, useEffect } from 'react'
import AppContext from '../../state/AppContext'
import { useLocation, useNavigate } from 'react-router-dom'
import './RegisterForm.css' // We'll use the same styling approach

const RegisterForm = () => {
  const [isRegistered, setIsRegistered] = useState(false)
  const { user } = useContext(AppContext)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  // Email validation function
  const validateEmail = () => {
    // Regular expression for basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (!email) {
      setEmailError('Email is required')
      return false
    }
    
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address')
      return false
    }
    
    // Here you would typically make an API call to check if the email exists
    // For this example, we'll simulate checking for existing emails
    const checkEmailExists = async () => {
      try {
        // This would be your actual API call
        // const response = await fetch('/api/check-email', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ email })
        // });
        // const data = await response.json();
        
        // For demo purposes, let's pretend some emails are already taken
        const existingEmails = ['test@example.com', 'user@domain.com', 'admin@site.com']
        return existingEmails.includes(email.toLowerCase())
      } catch (error) {
        console.error('Error checking email:', error)
        return false
      }
    }
    
    // If the email exists, show an error
    if (checkEmailExists()) {
      setEmailError('This email is already registered')
      return false
    }
    
    setEmailError('')
    return true
  }

  const validatePasswords = () => {
    if (!password) {
      setPasswordError('Password is required')
      return false
    }
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return false
    }
    
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return false
    }
    
    setPasswordError('')
    return true
  }

  const handleRegisterClick = () => {
    const isEmailValid = validateEmail()
    const isPasswordValid = validatePasswords()
    
    if (isEmailValid && isPasswordValid) {
      user.register(name, email, password)
    }
  }
  
  // Real-time validation as user types
  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    // Clear error when user starts typing again
    if (emailError) setEmailError('')
  }

  useEffect(() => {
    user.emitter.addListener('REGISTER_SUCCESS', () => {
      setIsRegistered(true)
      navigate(location.state?.from || '/login')
    })
  }, [])

  return (
    <div className='login-page'>
      <div className='login-form'>
        <div className='form-container'>
          <h1 className='form-title'>Create Account</h1>
          <p className='form-subtitle'>Sign up to get started</p>
          
          <div className='input-group'>
            <label htmlFor='email'>Email</label>
            <input
              id='email'
              type='email'
              placeholder='Enter your email address'
              value={email}
              onChange={handleEmailChange}
              className={emailError ? 'input-error' : ''}
            />
            {emailError && <p className='error-message'>{emailError}</p>}
          </div>
          
          <div className='input-group'>
            <label htmlFor='password'>Password</label>
            <input
              id='password'
              type='password'
              placeholder='Create a password'
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          
          <div className='input-group'>
            <label htmlFor='confirm-password'>Confirm Password</label>
            <input
              id='confirm-password'
              type='password'
              placeholder='Confirm your password'
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
            {passwordError && <p className='error-message'>{passwordError}</p>}
          </div>
          
          <div className='form-footer'>
            <div className='terms-agreement'>
              <input type='checkbox' id='terms' />
              <label htmlFor='terms'>I agree to the <a href='#'>Terms of Service</a> and <a href='#'>Privacy Policy</a></label>
            </div>
          </div>
          
          <button className='login-button' onClick={handleRegisterClick}>
            Create Account
          </button>
          
          <p className='signup-link'>
            Already have an account? <a href='/login'>Sign in</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterForm