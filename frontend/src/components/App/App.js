import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react';

import AppContext from '../../state/AppContext';

//STORES
import ProductStore from '../../state/stores/ProductStore';
import UserStore from '../../state/stores/UserStore';

import LoginForm from '../LoginForm/LoginForm';
import RegisterForm from '../RegisterForm/RegisterForm';
import UserFetchDetailsForm from '../UserFetchDetailsForm/UserFetchDetailsForm';


const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userStore] = useState(new UserStore())
  const [productStore] = useState(new ProductStore())

  //DATA PERSISTENCE THROUGH LocalStoradge
  useEffect(() => {
    userStore.emitter.addListener('LOGIN_SUCCESS', () => {
      // Save user data to localStorage when login is successful
      localStorage.setItem('user', JSON.stringify(userStore.data));
      setIsAuthenticated(true);
    });

    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        //!! Put data in the userStore class for passing on to context
        userStore.data = userData;
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        localStorage.removeItem('user');
      }
    }
  }, [userStore])

  const handleLogout = () => {
    localStorage.removeItem('user');
    userStore.data = {};
    setIsAuthenticated(false);
  };

  return (
    <AppContext.Provider value={{
      user: userStore,
      product: productStore
    }}>
      {
        isAuthenticated && (
          <div className='app-header'>
            <div>
              <h5>Welcome, {userStore.data.email}</h5>
            </div>
            <div>
              <button onClick={handleLogout}
              >Logout
              </button>
            </div>
          </div>
        )
      }
      <Router>
        <Routes>
          <Route path='/' element= {
            <UserFetchDetailsForm />
          } />
          <Route path='/login' element= {
            <LoginForm />
          } />
          <Route path='/register' element= {
            <RegisterForm />
          } />
          <Route path='/products' element= {
            <div>hellow products!</div>
          } />
        </Routes>
      </Router>
    </AppContext.Provider>
  )
}

export default App;