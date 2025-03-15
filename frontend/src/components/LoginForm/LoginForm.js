import React, { useState, useContext, useEffect } from 'react'
import AppContext from '../../state/AppContext'
import { useLocation, useNavigate } from 'react-router-dom'
import './LoginForm.css' // Don't forget to create this CSS file

const LoginForm = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { user } = useContext(AppContext)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [password, setPassword] = useState('')
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
    
    setEmailError('')
    return true
  }
  
  const validatePassword = () => {
    if (!password) {
      setPasswordError('Password is required')
      return false
    }
    
    setPasswordError('')
    return true
  }

  const handleLoginClick = () => {
    const isEmailValid = validateEmail()
    const isPasswordValid = validatePassword()
    
    if (isEmailValid && isPasswordValid) {
      user.login(email, password)
    }
  }
  
  const handleEmailChange = (e) => {
    setEmail(e.target.value)
    if (emailError) setEmailError('')
  }
  
  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
    if (passwordError) setPasswordError('')
  }

  useEffect(() => {
    user.emitter.addListener('LOGIN_SUCCESS', () => {
      setIsAuthenticated(true)
      navigate('/')
    })
  }, [])

  return (
    <div className='login-page'>
      <div className='login-form'>
        <div className='form-container'>
          <h1 className='form-title'>Welcome Back</h1>
          <p className='form-subtitle'>Sign in to continue</p>
          
          <div className='input-group'>
            <label htmlFor='email'>Email</label>
            <input
              id='email'
              type='email'
              placeholder='Enter your email'
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
              placeholder='Enter your password'
              value={password}
              onChange={handlePasswordChange}
              className={passwordError ? 'input-error' : ''}
            />
            {passwordError && <p className='error-message'>{passwordError}</p>}
          </div>
          
          <div className='form-footer'>
            <div className='remember-me'>
              <input type='checkbox' id='remember' />
              <label htmlFor='remember'>Remember me</label>
            </div>
            <a href='#' className='forgot-password'>Forgot password?</a>
          </div>
          
          <button className='login-button' onClick={handleLoginClick}>
            Sign In
          </button>
          
          <p className='signup-link'>
            Don't have an account? <a href='#/register'>Sign up</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginForm