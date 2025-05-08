import React, { useContext, useEffect, useState } from 'react';
import ProductCarousel from '../ProductList/MainProductCarousel';
import ProductModal from '../ProductList/ProductModal/ProductModal';
import AppContext from '../../state/AppContext';
import { SERVER } from '../../config/global';
import './HomeForm.css';

const HomeForm = () => {
  // Get global state
  const globalState = useContext(AppContext);
  
  // State for recent products
  const [recentProducts, setRecentProducts] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  
  // State for recommended products
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loadingRecommended, setLoadingRecommended] = useState(true);
  
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

  // Helper function to extract category from a product
  const extractCategory = (product) => {
    const specifications = product.specifications || {};
    const categoryKeys = ['category', 'type', 'product_type', 'categorie', 'tip'];
    
    // Try to find category-related fields in specifications
    for (const key of categoryKeys) {
      if (specifications[key]) {
        return specifications[key];
      }
    }
    
    // If no category found, use manufacturer as fallback
    return product.manufacturer || 'Unknown';
  };

  // Helper function to calculate price statistics
  const calculatePriceStats = (products) => {
    if (!products.length) return { mean: 0, min: 0, max: 0 };
    
    const prices = products.map(p => parseFloat(p.price || 0)).filter(price => !isNaN(price));
    
    if (!prices.length) return { mean: 0, min: 0, max: 0 };
    
    const sum = prices.reduce((acc, price) => acc + price, 0);
    const mean = sum / prices.length;
    
    return {
      mean,
      min: mean * 0.85, // 15% below mean
      max: mean * 1.15  // 15% above mean
    };
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
      
      // After fetching recent products, generate recommendations
      generateRecommendations(recentData);
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

  // Generate recommendations based on recent products
  const generateRecommendations = async (recentProducts) => {
    if (!recentProducts.length) {
      setRecommendedProducts([]);
      setLoadingRecommended(false);
      return;
    }
    
    setLoadingRecommended(true);
    
    try {
      // Step 1: Analyze categories and their distribution
      const categoryMap = {};
      const categoryProducts = {};
      
      // Group products by category and count them
      recentProducts.forEach(product => {
        const category = extractCategory(product);
        
        if (!categoryMap[category]) {
          categoryMap[category] = 0;
          categoryProducts[category] = [];
        }
        
        categoryMap[category]++;
        categoryProducts[category].push(product);
      });
      
      // Calculate total count and percentages
      const totalCount = recentProducts.length;
      const categoryDistribution = Object.keys(categoryMap).map(category => ({
        category,
        count: categoryMap[category],
        percentage: (categoryMap[category] / totalCount) * 100,
        products: categoryProducts[category]
      }));
      
      console.log('Category distribution:', categoryDistribution);
      
      // Step 2: Calculate how many products to recommend from each category (max 30 total)
      const MAX_RECOMMENDATIONS = 30;
      const recommendationsPerCategory = categoryDistribution.map(category => ({
        ...category,
        toRecommend: Math.round((category.percentage / 100) * MAX_RECOMMENDATIONS)
      }));
      
      console.log('Recommendations per category:', recommendationsPerCategory);
      
      // Step 3: Fetch recommended products for each category
      const allRecommendations = [];
      
      for (const categoryInfo of recommendationsPerCategory) {
        if (categoryInfo.toRecommend <= 0) continue;
        
        // Calculate price range for this category
        const priceStats = calculatePriceStats(categoryInfo.products);
        console.log(`Price stats for ${categoryInfo.category}:`, priceStats);
        
        // Fetch products in this category with the price range
        const categoryProducts = await fetchCategoryRecommendations(
          categoryInfo.category,
          priceStats.min,
          priceStats.max,
          categoryInfo.toRecommend
        );
        
        // Filter out products that are already in recent products
        const recentProductIds = new Set(recentProducts.map(p => p.id || p._id));
        const filteredCategoryProducts = categoryProducts.filter(
          p => !recentProductIds.has(p.id || p._id)
        );
        
        allRecommendations.push(...filteredCategoryProducts);
      }
      
      // Shuffle the recommendations for variety
      const shuffledRecommendations = [...allRecommendations];
      for (let i = shuffledRecommendations.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledRecommendations[i], shuffledRecommendations[j]] = 
          [shuffledRecommendations[j], shuffledRecommendations[i]];
      }
      
      // Limit to MAX_RECOMMENDATIONS
      const limitedRecommendations = shuffledRecommendations.slice(0, MAX_RECOMMENDATIONS);
      
      setRecommendedProducts(limitedRecommendations);
      setLoadingRecommended(false);
      
      console.log('Final recommendations:', limitedRecommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setLoadingRecommended(false);
    }
  };

  // Fetch products by category and price range
  const fetchCategoryRecommendations = async (category, minPrice, maxPrice, count) => {
    try {
      const response = await fetch(
        `${SERVER}/api/products?name=${encodeURIComponent(category)}&minPrice=${minPrice.toFixed(2)}&maxPrice=${maxPrice.toFixed(2)}&pageSize=${count * 2}&pageNumber=0`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.status}`);
      }
      
      const content = await response.json();
      
      if (!content.data || !Array.isArray(content.data)) {
        console.error('Invalid response format:', content);
        return [];
      }
      
      return content.data.slice(0, count);
    } catch (error) {
      console.error(`Error fetching recommendations for ${category}:`, error);
      return [];
    }
  };

  // Handle product click
  const handleProductClick = (productId) => {
    // Find the selected product from the recentProducts or recommendedProducts array
    const product = 
      recentProducts.find(product => (product.id || product._id) === productId) ||
      recommendedProducts.find(product => (product.id || product._id) === productId);
    
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
          
          {/* Recommended Products Section */}
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