import React, { useState, useEffect, useRef } from 'react';
import { SERVER } from '../../../config/global';
import './ProductComparison.css';

const ProductComparison = ({ currentProduct, onClose, globalState }) => {
  // State to manage the product to compare with
  const [compareProduct, setCompareProduct] = useState(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Reference to the modal to allow clicking outside to close
  const modalRef = useRef(null);
  
  // Debounce search input
  const searchTimeoutRef = useRef(null);
  
  // Function to search for products
  const searchProducts = async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const response = await fetch(
        `${SERVER}/api/products?name=${encodeURIComponent(query)}&pageSize=10&pageNumber=0`
      );
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        // Filter out the current product from results
        const filteredResults = data.data.filter(product => {
          const productId = product.id || product._id;
          const currentId = currentProduct.id || currentProduct._id;
          return productId !== currentId;
        });
        
        setSearchResults(filteredResults);
      } else {
        setSearchResults([]);
      }
      
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle search input change with debounce
  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounce
    searchTimeoutRef.current = setTimeout(() => {
      searchProducts(query);
    }, 300);
  };
  
  // Handle selecting a product to compare
  const handleSelectProduct = (product) => {
    setCompareProduct(product);
    setSearchQuery('');
    setSearchResults([]);
  };
  
  // Clear the comparison product
  const clearCompareProduct = () => {
    setCompareProduct(null);
    setSearchQuery('');
  };
  
  // Handle clicking outside to close the modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);
  
  // Function to handle image error
  const handleImageError = (e) => {
    e.target.src = '/placeholder.jpeg';
  };
  
  // Helper function to determine if specifications match
  const doSpecificationsMatch = (spec1, spec2) => {
    if (!spec1 || !spec2) return false;
    return spec1 === spec2;
  };
  
  // Render the specifications comparison table
  const renderSpecificationsComparison = () => {
    if (!currentProduct || !compareProduct) return null;
    
    const currentSpecs = currentProduct.specifications || {};
    const compareSpecs = compareProduct.specifications || {};
    
    // Combine all spec keys from both products
    const allSpecKeys = [...new Set([
      ...Object.keys(currentSpecs),
      ...Object.keys(compareSpecs)
    ])].sort();
    
    return (
      <div className="comparison-specifications">
        <h3>Specifications Comparison</h3>
        <table className="comparison-specs-table">
          <thead>
            <tr>
              <th>Specification</th>
              <th>{currentProduct.name}</th>
              <th>{compareProduct.name}</th>
            </tr>
          </thead>
          <tbody>
            {allSpecKeys.map(key => {
              const currentValue = currentSpecs[key] || 'N/A';
              const compareValue = compareSpecs[key] || 'N/A';
              const isMatching = doSpecificationsMatch(currentValue, compareValue);
              
              return (
                <tr key={key} className={isMatching ? 'matching-spec' : ''}>
                  <td className="spec-name">{key}</td>
                  <td className="spec-value">{currentValue}</td>
                  <td className="spec-value">{compareValue}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="product-comparison-overlay">
      <div className="product-comparison-modal" ref={modalRef}>
        <div className="comparison-header">
          <h2>Product Comparison</h2>
          <button className="close-comparison-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="comparison-content">
          <div className="comparison-products">
            {/* Left side - Current Product */}
            <div className="comparison-product current-product">
              <div className="comparison-product-header">
                <h3>Current Product</h3>
                <button 
                  className="remove-product-btn" 
                  onClick={onClose}
                  title="Close comparison and return to product"
                >
                  ×
                </button>
              </div>
              
              <div className="comparison-product-details">
                <div className="comparison-product-image">
                  <img 
                    src={currentProduct.product_code ? `/${currentProduct.product_code}.jpeg` : '/placeholder.jpeg'} 
                    alt={currentProduct.name}
                    onError={handleImageError}
                  />
                </div>
                
                <div className="comparison-product-name">{currentProduct.name}</div>
                
                <div className="comparison-product-info">
                  <div className="comparison-product-price">
                    <strong>Price:</strong> {currentProduct.price?.toFixed(2)} RON
                  </div>
                  
                  <div className={`comparison-product-stock ${currentProduct.is_in_stoc ? 'in-stock' : 'out-of-stock'}`}>
                    {currentProduct.is_in_stoc ? 'In Stock' : 'Out of Stock'}
                  </div>
                  
                  <div className="comparison-product-manufacturer">
                    <strong>Manufacturer:</strong> {currentProduct.manufacturer}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side - Compare Product */}
            <div className="comparison-product compare-product">
              <div className="comparison-product-header">
                <h3>Compare With</h3>
                {compareProduct && (
                  <button 
                    className="remove-product-btn" 
                    onClick={clearCompareProduct}
                    title="Remove this product from comparison"
                  >
                    ×
                  </button>
                )}
              </div>
              
              {compareProduct ? (
                <div className="comparison-product-details">
                  <div className="comparison-product-image">
                    <img 
                      src={compareProduct.product_code ? `/${compareProduct.product_code}.jpeg` : '/placeholder.jpeg'} 
                      alt={compareProduct.name}
                      onError={handleImageError}
                    />
                  </div>
                  
                  <div className="comparison-product-name">{compareProduct.name}</div>
                  
                  <div className="comparison-product-info">
                    <div className="comparison-product-price">
                      <strong>Price:</strong> {compareProduct.price?.toFixed(2)} RON
                      {currentProduct.price && compareProduct.price && (
                        <div className="price-difference">
                          {compareProduct.price > currentProduct.price ? (
                            <span className="higher-price">
                              +{(compareProduct.price - currentProduct.price).toFixed(2)} RON
                            </span>
                          ) : compareProduct.price < currentProduct.price ? (
                            <span className="lower-price">
                              -{(currentProduct.price - compareProduct.price).toFixed(2)} RON
                            </span>
                          ) : (
                            <span className="same-price">Same price</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className={`comparison-product-stock ${compareProduct.is_in_stoc ? 'in-stock' : 'out-of-stock'}`}>
                      {compareProduct.is_in_stoc ? 'In Stock' : 'Out of Stock'}
                    </div>
                    
                    <div className="comparison-product-manufacturer">
                      <strong>Manufacturer:</strong> {compareProduct.manufacturer}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="comparison-search-container">
                  <div className="comparison-search">
                    <input 
                      type="text" 
                      placeholder="Search for a product to compare..." 
                      value={searchQuery} 
                      onChange={handleSearchInputChange}
                      className="comparison-search-input"
                    />
                    
                    {isSearching && (
                      <div className="comparison-search-loading">
                        <div className="comparison-loading-spinner"></div>
                      </div>
                    )}
                  </div>
                  
                  {searchResults.length > 0 && (
                    <div className="comparison-search-results">
                      {searchResults.map(product => {
                        const productId = product.id || product._id;
                        return (
                          <div 
                            key={productId} 
                            className="comparison-search-result"
                            onClick={() => handleSelectProduct(product)}
                          >
                            <div className="search-result-image">
                              <img 
                                src={product.product_code ? `/${product.product_code}.jpeg` : '/placeholder.jpeg'} 
                                alt={product.name}
                                onError={handleImageError}
                              />
                            </div>
                            <div className="search-result-info">
                              <div className="search-result-name">{product.name}</div>
                              <div className="search-result-price">{product.price?.toFixed(2)} RON</div>
                              <div className="search-result-manufacturer">{product.manufacturer}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {searchQuery && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                    <div className="comparison-no-results">
                      No products found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Specifications comparison table */}
          {compareProduct && renderSpecificationsComparison()}
        </div>
        
        <div className="comparison-footer">
          <button className="close-comparison-btn-footer" onClick={onClose}>
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductComparison;