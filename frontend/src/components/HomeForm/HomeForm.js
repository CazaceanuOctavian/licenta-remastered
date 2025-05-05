import React, { useContext, useEffect, useState } from 'react';
import ProductCarousel from '../ProductList/MainProductCarousel';
import AppContext from '../../state/AppContext';
import './HomeForm.css';

const HomeForm = () => {
  // Get global state
  const globalState = useContext(AppContext);
  
  // State for recent products
  const [recentProducts, setRecentProducts] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  
  // Check if user is logged in
  const isUserLoggedIn = () => {
    return (
      globalState.user.data && 
      globalState.user.data.email && 
      globalState.user.data.token && 
      globalState.user.data.id
    );
  };

  // Fetch recent products when component mounts
  useEffect(() => {
    const fetchRecentProducts = async () => {
      if (!isUserLoggedIn()) {
        setLoadingRecent(false);
        return;
      }
      
      try {
        setLoadingRecent(true);
        // Reset data to ensure we only get recent products
        globalState.product.data = [];
        await globalState.product.fetchRecentProducts(globalState);
      } catch (error) {
        console.error('Error fetching recent products:', error);
        setLoadingRecent(false);
      }
    };
    
    // Set up event listeners for data fetching
    const handleRecentSuccess = () => {
      setRecentProducts([...globalState.product.data]);
      setLoadingRecent(false);
    };
    
    const handleRecentFail = () => {
      console.error('Failed to fetch recent products');
      setLoadingRecent(false);
    };
    
    // Add event listeners
    globalState.product.emitter.addListener('PRODUCT_FETCH_RECENT_SUCCESS', handleRecentSuccess);
    globalState.product.emitter.addListener('PRODUCT_FETCH_RECENT_FAIL', handleRecentFail);
    
    // Fetch data
    fetchRecentProducts();
    
    // Clean up event listeners on component unmount
    return () => {
      globalState.product.emitter.removeAllListeners('PRODUCT_FETCH_RECENT_SUCCESS', handleRecentSuccess);
      globalState.product.emitter.removeAllListeners('PRODUCT_FETCH_RECENT_FAIL', handleRecentFail);
    };
  }, [globalState]);

  // Handle product click
  const handleProductClick = (productId) => {
    // You can implement modal opening logic here, similar to what you have in your provided code
    // For example, you might want to set a state that tracks the currently selected product
    // and then render a ProductModal component if that state is not null
    console.log('Product clicked:', productId);
    
    // Example of how you might handle this:
    // setSelectedProductId(productId);
  };

  // Price comparison function for carousel
  const getPriceComparisonClass = (price) => {
    // This is just a placeholder, you might want to implement actual comparison logic
    // based on your application's requirements
    return '';
  };

  return (
    <div className="home-form">
      <div className="welcome-section">
        <h1>Welcome to Product Price Tracker</h1>
        <p>Track prices, compare products, and get the best deals!</p>
      </div>
      
      {isUserLoggedIn() ? (
        <>
          {/* Recent Products Section */}
          <div className="recent-products-section">
            <h2>Your Recently Viewed Products</h2>
            <ProductCarousel
              products={recentProducts}
              loading={loadingRecent}
              noItemsMessage="You haven't viewed any products yet. Start browsing to see your recent products here!"
              title=""
              currentProductId={null}
              onProductClick={handleProductClick}
              getPriceComparisonClass={getPriceComparisonClass}
            />
          </div>
        </>
      ) : (
        <div className="login-prompt">
          <h2>Sign in to track your favorite products</h2>
          <p>Create an account or sign in to view your recent and favorite products.</p>
          <div className="auth-buttons">
            <a href="/#/login" className="login-button">Sign In</a>
            <a href="/#/register" className="register-button">Create Account</a>
          </div>
        </div>
      )}
      
      {/* You can add more sections here, like featured products or popular products */}
    </div>
  );
};

export default HomeForm;