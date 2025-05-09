import React, { useContext, useEffect, useState } from 'react';
import ProductCarousel from '../ProductList/MainProductCarousel';
import ProductModal from '../ProductList/ProductModal/ProductModal';
import AppContext from '../../state/AppContext';
import './HomeForm.css';

const HomeForm = () => {
  // Get global state
  const globalState = useContext(AppContext);
  
  // State for recent products
  const [recentProducts, setRecentProducts] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  
  // State for recommended products
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  
  // State for top category products
  const [topManufacturerProducts, setTopManufacturerProducts] = useState([]);
  const [topManufacturerName, setTopManufacturerName] = useState('');
  const [loadingTopManufacturer, setLoadingTopManufacturer] = useState(false);
  
  // State for most viewed products
  const [mostViewedProducts, setMostViewedProducts] = useState([]);
  const [loadingMostViewed, setLoadingMostViewed] = useState(false);
  
  // State for selected product and modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Check if user is logged in
  const isUserLoggedIn = () => {
    return (
      globalState.user.data && 
      globalState.user.data.email && 
      globalState.user.data.token && 
      globalState.user.data.id
    );
  };

  // Fetch most viewed products
  const fetchMostViewedProducts = async () => {
    try {
      setLoadingMostViewed(true);
      // Use the existing getProductsByViews method from the store
      const result = await globalState.product.getProductsByViews('desc', 30);
      setMostViewedProducts(result.data);
    } catch (error) {
      console.error('Error fetching most viewed products:', error);
    } finally {
      setLoadingMostViewed(false);
    }
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
      const recentData = [...globalState.product.data];
      setRecentProducts(recentData);
      setLoadingRecent(false);
      
      // After fetching recent products, generate recommendations and top category products
      if (recentData.length > 0) {
        setLoadingRecommended(true);
        setLoadingTopManufacturer(true);
        globalState.product.generateRecommendations(globalState, recentData);
        // Note: Top manufacturer products are generated within generateRecommendations
      }
    };
    
    const handleRecentFail = () => {
      console.error('Failed to fetch recent products');
      setLoadingRecent(false);
    };
    
    // Set up event listeners for recommendations
    const handleRecommendationsSuccess = () => {
      setRecommendedProducts([...globalState.product.recommendedData]);
      setLoadingRecommended(false);
    };
    
    const handleRecommendationsFail = () => {
      console.error('Failed to generate recommendations');
      setLoadingRecommended(false);
    };
    
    // Set up event listeners for top category products
    const handleTopManufacturerSuccess = () => {
      setTopManufacturerProducts([...globalState.product.topCategoryData]);
      
      // Determine the top manufacturer name from the first product
      if (globalState.product.topCategoryData.length > 0) {
        const firstProduct = globalState.product.topCategoryData[0];
        const extractedManufacturer = globalState.product.extractManufacturer(firstProduct);
        setTopManufacturerName(extractedManufacturer);
      }
      
      setLoadingTopManufacturer(false);
    };
    
    const handleTopManufacturerFail = () => {
      console.error('Failed to generate top manufacturer products');
      setLoadingTopManufacturer(false);
    };
    
    // Set up event listener for most viewed products
    const handleMostViewedSuccess = () => {
      // This is just a backup in case we want to use the event emitter approach later
      console.log('Most viewed products successfully fetched');
    };
    
    const handleMostViewedFail = () => {
      console.error('Failed to fetch most viewed products');
      setLoadingMostViewed(false);
    };
    
    // Add event listeners
    globalState.product.emitter.addListener('PRODUCT_FETCH_RECENT_SUCCESS', handleRecentSuccess);
    globalState.product.emitter.addListener('PRODUCT_FETCH_RECENT_FAIL', handleRecentFail);
    globalState.product.emitter.addListener('PRODUCT_RECOMMENDATIONS_SUCCESS', handleRecommendationsSuccess);
    globalState.product.emitter.addListener('PRODUCT_RECOMMENDATIONS_FAIL', handleRecommendationsFail);
    globalState.product.emitter.addListener('PRODUCT_TOP_CATEGORY_SUCCESS', handleTopManufacturerSuccess);
    globalState.product.emitter.addListener('PRODUCT_TOP_CATEGORY_FAIL', handleTopManufacturerFail);
    globalState.product.emitter.addListener('PRODUCT_GET_BY_VIEWS_SUCCESS', handleMostViewedSuccess);
    globalState.product.emitter.addListener('PRODUCT_GET_BY_VIEWS_ERROR', handleMostViewedFail);
    
    // Fetch data
    fetchRecentProducts();
    fetchMostViewedProducts(); // Fetch most viewed products
    
    // Clean up event listeners on component unmount
    return () => {
      globalState.product.emitter.removeAllListeners('PRODUCT_FETCH_RECENT_SUCCESS', handleRecentSuccess);
      globalState.product.emitter.removeAllListeners('PRODUCT_FETCH_RECENT_FAIL', handleRecentFail);
      globalState.product.emitter.removeAllListeners('PRODUCT_RECOMMENDATIONS_SUCCESS', handleRecommendationsSuccess);
      globalState.product.emitter.removeAllListeners('PRODUCT_RECOMMENDATIONS_FAIL', handleRecommendationsFail);
      globalState.product.emitter.removeAllListeners('PRODUCT_TOP_CATEGORY_SUCCESS', handleTopManufacturerSuccess);
      globalState.product.emitter.removeAllListeners('PRODUCT_TOP_CATEGORY_FAIL', handleTopManufacturerFail);
      globalState.product.emitter.removeAllListeners('PRODUCT_GET_BY_VIEWS_SUCCESS', handleMostViewedSuccess);
      globalState.product.emitter.removeAllListeners('PRODUCT_GET_BY_VIEWS_ERROR', handleMostViewedFail);
    };
  }, [globalState]);

  // Handle product click
  const handleProductClick = (productId) => {
    // Find the selected product from all product arrays
    const product = 
      recentProducts.find(product => (product.id || product._id) === productId) ||
      recommendedProducts.find(product => (product.id || product._id) === productId) ||
      topManufacturerProducts.find(product => (product.id || product._id) === productId) ||
      mostViewedProducts.find(product => (product.id || product._id) === productId);
    
    if (product) {
      setSelectedProduct(product);
      setShowModal(true);
    }
  };
  
  // Handle modal close
  const handleModalClose = () => {
    setShowModal(false);
    // We can keep the selected product in state until we need to open a new one
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
      
      {/* Most Viewed Products Section - Always visible regardless of login status */}
      <div className="most-viewed-section">
        <h2>Most Popular Products</h2>
        <p className="most-viewed-description">
          Check out the products that other users are viewing the most:
        </p>
        <ProductCarousel
          products={mostViewedProducts}
          loading={loadingMostViewed}
          noItemsMessage="We're gathering data on popular products. Please check back soon!"
          title=""
          currentProductId={null}
          onProductClick={handleProductClick}
          getPriceComparisonClass={getPriceComparisonClass}
        />
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
          
          {/* Top Manufacturer Products Section */}
          {(topManufacturerProducts.length > 0 || loadingTopManufacturer) && (
            <div className="top-category-section">
              <h2>{topManufacturerName ? `More from ${topManufacturerName}` : 'More from Your Favorite Brand'}</h2>
              <p className="recommendation-description">
                Since you've shown interest in {topManufacturerName || 'this brand'}, here are some popular items you might like:
              </p>
              <ProductCarousel
                products={topManufacturerProducts}
                loading={loadingTopManufacturer}
                noItemsMessage="We're still learning about your preferences. Browse more products to see top items from your favorite brand."
                title=""
                currentProductId={null}
                onProductClick={handleProductClick}
                getPriceComparisonClass={getPriceComparisonClass}
              />
            </div>
          )}
          
          {/* Recommended Products Section */}
          {(recommendedProducts.length > 0 || loadingRecommended) && (
            <div className="recommended-products-section">
              <h2>Recommended For You</h2>
              <p className="recommendation-description">
                Based on your recently viewed products, you might also like these items:
              </p>
              <ProductCarousel
                products={recommendedProducts}
                loading={loadingRecommended}
                noItemsMessage="We need more information about your preferences to make recommendations. Browse more products to get personalized recommendations."
                title=""
                currentProductId={null}
                onProductClick={handleProductClick}
                getPriceComparisonClass={getPriceComparisonClass}
              />
            </div>
          )}
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
      
      {/* Product Modal */}
      {showModal && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default HomeForm;