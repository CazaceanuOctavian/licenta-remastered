
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react';

import AppContext from '../../state/AppContext';

//STORES
import ProductStore from '../../state/stores/ProductStore';
import UserStore from '../../state/stores/UserStore';


const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userStore] = useState(new UserStore())
  const [productStore] = useState(new ProductStore())


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
              <button onClick={() => {
                userStore.logout()
                setIsAuthenticated(false)
              }}
              >Logout
              </button>
            </div>
          </div>
        )
      }
      <Router>
        <Routes>
          <Route path='/' element= {
            <div>hellow world!</div>
          }
          />
           <Route path='/products' element= {
            <div>hellow products!</div>
          }
          />
        </Routes>
      </Router>


    </AppContext.Provider>
  )
}

export default App;
