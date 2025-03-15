import React, { useState, useContext, useEffect } from 'react'
import AppContext from '../../state/AppContext'
import { useLocation, useNavigate } from 'react-router-dom'
import './LoginForm.css' // Don't forget to create this CSS file

const LoginForm = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { user } = useContext(AppContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  const handleLoginClick = () => {
    user.login(email, password)
  }

  useEffect(() => {
    user.emitter.addListener('LOGIN_SUCCESS', () => {
      setIsAuthenticated(true)
      navigate(location.state.from)
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
              type='text'
              placeholder='Enter your email'
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          
          <div className='input-group'>
            <label htmlFor='password'>Password</label>
            <input
              id='password'
              type='password'
              placeholder='Enter your password'
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
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