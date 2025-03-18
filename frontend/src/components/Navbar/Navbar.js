import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import AppContext from '../../state/AppContext';
import './Navbar.css';

const Navbar = ({ isAuthenticated, handleLogout }) => {
  const { user } = useContext(AppContext);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };
  
  const handleLogoutClick = () => {
    closeDrawer();
    handleLogout();
  };
  
  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <Link to="/" className="brand-link">
              <span className="brand-text">MyApp</span>
            </Link>
          </div>
          
          <div className="navbar-links">
            <Link to="/products" className="nav-link">Products</Link>
          </div>
          
          <div className="navbar-auth">
            {isAuthenticated ? (
              <div className="auth-content">
                <div className="welcome-message">
                  <span>Welcome, {user.data.email}</span>
                </div>
                <button
                  className="burger-menu"
                  onClick={toggleDrawer}
                  aria-label="Menu"
                >
                  <span className="burger-line"></span>
                  <span className="burger-line"></span>
                  <span className="burger-line"></span>
                </button>
              </div>
            ) : (
              <div className="auth-content">
                <Link to="/login" className="btn-link">
                  <button className="btn btn-login">Login</button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Drawer Menu */}
      {isAuthenticated && (
        <div className={`drawer-menu ${isDrawerOpen ? 'open' : ''}`}>
          <div className="drawer-content">
            <div className="drawer-header">
              <h3>Menu</h3>
              <button className="close-drawer" onClick={closeDrawer}>
                &times;
              </button>
            </div>
            <div className="drawer-items">
              <Link to="/profile" className="drawer-item" onClick={closeDrawer}>
                <span className="drawer-icon">👤</span>
                Profile
              </Link>
              <Link to="/favorites" className="drawer-item" onClick={closeDrawer}>
                <span className="drawer-icon">⭐</span>
                Favorites
              </Link>
              <button className="drawer-item logout-button" onClick={handleLogoutClick}>
                <span className="drawer-icon">🚪</span>
                Logout
              </button>
            </div>
          </div>
          <div className="drawer-backdrop" onClick={closeDrawer}></div>
        </div>
      )}
    </>
  );
};

export default Navbar;