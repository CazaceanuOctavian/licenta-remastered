import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import './MainProductCarousel.css';

// Configuration constants
const CAROUSEL_PAGE_SIZE = 4; // Items per page in carousel

const ProductCarousel = ({ 
  products,
  loading,
  noItemsMessage,
  title,
  currentProductId,
  onProductClick,
  getPriceComparisonClass,
  // --- NEW: Props to control and handle checkboxes on product cards ---
  showCheckboxes = false,        // Set to true to show checkboxes
  getCheckboxState = () => false, // Function to get a product's checked state by ID
  onCheckboxToggle = () => {}     // Function to call when a checkbox is toggled
}) => {
  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [carouselPage, setCarouselPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState('left');
  
  // Update all products when the products prop changes
  useEffect(() => {
    if (products && products.length > 0) {
      // Filter out current product if it exists in the list
      const filteredProducts = products.filter(product => {
        const productId = product.id || product._id;
        return productId !== currentProductId;
      });
      
      setAllProducts(filteredProducts);
    } else {
      setAllProducts([]);
    }
  }, [products, currentProductId]);
  
  // Update displayed products when page changes or all products change
  useEffect(() => {
    if (allProducts.length > 0) {
      const startIndex = carouselPage * CAROUSEL_PAGE_SIZE;
      const endIndex = startIndex + CAROUSEL_PAGE_SIZE;
      const pageProducts = allProducts.slice(startIndex, endIndex);
      setDisplayedProducts(pageProducts);
    } else {
      setDisplayedProducts([]);
    }
  }, [carouselPage, allProducts]);
  
  // Handle carousel navigation
  const handleCarouselNext = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setSlideDirection('left');
    
    // Wait for animation to complete before updating page
    setTimeout(() => {
      setCarouselPage(prev => prev + 1);
      setIsTransitioning(false);
    }, 300); // Match CSS transition duration
  };

  const handleCarouselPrev = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setSlideDirection('right');
    
    // Wait for animation to complete before updating page
    setTimeout(() => {
      setCarouselPage(prev => Math.max(0, prev - 1));
      setIsTransitioning(false);
    }, 300); // Match CSS transition duration
  };
  
  return (
    <div className="product-carousel-section">
      {title && <h3>{title}</h3>}
      {loading ? (
        <div className="carousel-loading">Loading products...</div>
      ) : displayedProducts.length > 0 ? (
        <div className="product-carousel">
          {carouselPage > 0 && (
            <button 
              className="carousel-nav prev" 
              onClick={handleCarouselPrev}
              aria-label="Previous products"
              disabled={isTransitioning}
            >
              ‹
            </button>
          )}
          
          <div className="carousel-container">
            <div 
              className={`carousel-grid ${isTransitioning ? `slide-${slideDirection}` : ''}`}
              style={{
                transform: isTransitioning ? 
                  (slideDirection === 'left' ? 'translateX(-100%)' : 'translateX(100%)') : 
                  'translateX(0)'
              }}
            >
              {displayedProducts.map((product) => {
                const productId = product.id || product._id;
                return (
                  <ProductCard
                    key={productId}
                    product={product}
                    priceComparisonClass={getPriceComparisonClass ? getPriceComparisonClass(product.price) : ''}
                    onClick={() => onProductClick(productId)}
                    // --- NEW: Pass checkbox props down to the ProductCard ---
                    showCheckbox={showCheckboxes}
                    isCheckboxChecked={getCheckboxState(productId)}
                    onCheckboxChange={() => onCheckboxToggle(product)} // Pass the whole product object up
                  />
                );
              })}
            </div>
          </div>

          {allProducts.length > (carouselPage + 1) * CAROUSEL_PAGE_SIZE && (
            <button 
              className="carousel-nav next" 
              onClick={handleCarouselNext}
              aria-label="Next products"
              disabled={isTransitioning}
            >
              ›
            </button>
          )}
        </div>
      ) : (
        <div className="no-carousel-products">
          {noItemsMessage || 'No products found.'}
        </div>
      )}
    </div>
  );
};

export default ProductCarousel;