import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';

import AppContext from '../../state/AppContext';

//STORES
import ProductStore from '../../state/stores/ProductStore';
import UserStore from '../../state/stores/UserStore';

import Navbar from '../Navbar/Navbar'; 
import LoginForm from '../LoginForm/LoginForm';
import RegisterForm from '../RegisterForm/RegisterForm';
import UserFetchDetailsForm from '../UserFetchDetailsForm/UserFetchDetailsForm';
import ProductList from '../ProductList/ProductList';
import ProductCarousel from '../ProductList/ProductCarousel';
import HomeForm from '../HomeForm/HomeForm';


const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userStore] = useState(new UserStore())
  const [productStore] = useState(new ProductStore())

  //DATA PERSISTENCE THROUGH LocalStoradge
  useEffect(() => {
    userStore.emitter.addListener('LOGIN_SUCCESS', () => {
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
      <Router>
        {/* Replace the conditional rendering with the Navbar component */}
        <Navbar isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
        
        <Routes>
          <Route path='/' element= {
            <HomeForm />
          } />
          <Route path='/login' element= {
            <LoginForm />
          } />
          <Route path='/register' element= {
            <RegisterForm />
          } />
          <Route path='/products' element= {
            <ProductList />
          } />
          <Route path='/favorites' element= {
            <ProductCarousel />
          }/>
        </Routes>
      </Router>
    </AppContext.Provider>
  )
}

export default App;