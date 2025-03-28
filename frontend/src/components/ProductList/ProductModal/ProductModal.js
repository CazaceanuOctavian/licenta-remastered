import React, { useContext, useEffect, useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AppContext from '../../../state/AppContext';
import { SERVER } from '../../../config/global';
import './ProductModal.css';

const ProductModal = ({ product: initialProduct, onClose }) => {
  // Reference to the modal container for scrolling
  const modalRef = useRef(null);
  
  // Get global state to check user login status
  const globalState = useContext(AppContext);
  
  // State to track the currently displayed product
  const [currentProduct, setCurrentProduct] = useState(initialProduct);
  // State to track related products
  const [relatedProducts, setRelatedProducts] = useState([]);
  // Loading state
  const [loading, setLoading] = useState(false);
  // Keep track of all products we've seen to avoid duplicate fetches
  const [allProducts, setAllProducts] = useState({});
  // Processed price history data for the chart
  const [priceHistoryData, setPriceHistoryData] = useState([]);
  // State to track if we need to fetch the full product details
  const [loadingFullProduct, setLoadingFullProduct] = useState(false);
  // State to track if product is in favorites
  const [isInFavorites, setIsInFavorites] = useState(false);
  // State to track if adding to favorites
  const [addingToFavorites, setAddingToFavorites] = useState(false);

  // Check if user is logged in
  const isUserLoggedIn = () => {
    return (
      globalState.user.data && 
      globalState.user.data.email && 
      globalState.user.data.token && 
      globalState.user.data.id
    );
  };

  // Initialize allProducts with the initial product
  useEffect(() => {
    if (initialProduct) {
      setAllProducts(prev => ({
        ...prev,
        [initialProduct.id || initialProduct._id]: initialProduct
      }));
      
      // Check if we need to fetch the full product (including price history)
      if (!initialProduct.price_history) {
        fetchFullProductDetails(initialProduct.id || initialProduct._id);
      }
    }
  }, [initialProduct]);

  // Setup event listeners for favorites operations
  useEffect(() => {
    // Set up event listeners for favorites operations
    const handleAddSuccess = () => {
      setIsInFavorites(true);
      setAddingToFavorites(false);
      console.log('Product added to favorites successfully');
    };
    
    const handleAddFail = () => {
      setAddingToFavorites(false);
      console.error('Failed to add product to favorites');
    };
    
    const handleRemoveSuccess = () => {
      setIsInFavorites(false);
      setAddingToFavorites(false);
      console.log('Product removed from favorites successfully');
    };
    
    const handleRemoveFail = () => {
      setAddingToFavorites(false);
      console.error('Failed to remove product from favorites');
    };
    
    // Add event listeners
    globalState.product.emitter.addListener('PRODUCT_ADD_TO_USER_LIST_SUCCESS', handleAddSuccess);
    globalState.product.emitter.addListener('PRODUCT_ADD_TO_USER_LIST_FAIL', handleAddFail);
    globalState.product.emitter.addListener('PRODUCT_REMOVE_FROM_USER_LIST_SUCCESS', handleRemoveSuccess);
    globalState.product.emitter.addListener('PRODUCT_REMOVE_FROM_USER_LIST_FAIL', handleRemoveFail);
    
    // Clean up event listeners on component unmount
    return () => {
      globalState.product.emitter.removeAllListeners('PRODUCT_ADD_TO_USER_LIST_SUCCESS', handleAddSuccess);
      globalState.product.emitter.removeAllListeners('PRODUCT_ADD_TO_USER_LIST_FAIL', handleAddFail);
      globalState.product.emitter.removeAllListeners('PRODUCT_REMOVE_FROM_USER_LIST_SUCCESS', handleRemoveSuccess);
      globalState.product.emitter.removeAllListeners('PRODUCT_REMOVE_FROM_USER_LIST_FAIL', handleRemoveFail);
    };
  }, [globalState.product.emitter]);

  // Scroll to top when the current product changes
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.scrollTop = 0;
    }
    
    // Check if product is in favorites when current product changes
    if (isUserLoggedIn() && currentProduct && currentProduct.product_code) {
      checkIfInFavorites();
    }
  }, [currentProduct]);

  // Check if the current product is in user's favorites
  const checkIfInFavorites = async () => {
    if (!isUserLoggedIn() || !currentProduct || !currentProduct.product_code) {
      return;
    }
    
    try {
      // Use the new checkIfInFavorites method from ProductStore
      const isFavorite = await globalState.product.checkIfInFavorites(
        globalState,
        currentProduct.product_code
      );
      
      // Update state based on the result
      setIsInFavorites(isFavorite);
    } catch (error) {
      console.error('Error checking favorites status:', error);
    }
  };

  // Handle favorites button click
  const handleFavoritesClick = () => {
    if (!isUserLoggedIn()) {
      // Redirect to login page
      window.location.href = '/#/login';
      return;
    }
    
    // If user is logged in, add/remove from favorites
    if (isInFavorites) {
      handleRemoveFromFavorites();
    } else {
      handleAddToFavorites();
    }
  };

  // Handle adding product to favorites
  const handleAddToFavorites = async () => {
    if (!isUserLoggedIn()) return;
    
    try {
      setAddingToFavorites(true);
      const productCode = currentProduct.product_code;
      
      if (!productCode) {
        console.error('No product code available for this product');
        setAddingToFavorites(false);
        return;
      }
      
      // Call the addProductToUserList method from ProductStore
      await globalState.product.addProductToUserList(globalState, productCode);
      
      // Note: The state update will happen through the event listener we set up
    } catch (error) {
      console.error('Error adding to favorites:', error);
      setAddingToFavorites(false);
    }
  };

  // Handle removing product from favorites
  const handleRemoveFromFavorites = async () => {
    if (!isUserLoggedIn()) return;
    
    try {
      setAddingToFavorites(true);
      const productCode = currentProduct.product_code;
      
      if (!productCode) {
        console.error('No product code available for this product');
        setAddingToFavorites(false);
        return;
      }
      
      // Call the removeProductFromUserList method from ProductStore
      await globalState.product.removeProductFromUserList(globalState, productCode);
      
      // Note: The state update will happen through the event listener we set up
    } catch (error) {
      console.error('Error removing from favorites:', error);
      setAddingToFavorites(false);
    }
  };

  // Function to fetch full product details with price history
  const fetchFullProductDetails = async (productId) => {
    try {
      setLoadingFullProduct(true);
      console.log('Fetching full product details for product ID:', productId);
      
      const response = await fetch(`${SERVER}/api/products/${productId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch product details: ${response.status}`);
      }
      
      const productData = await response.json();
      console.log('Full product details received:', productData);
      
      if (productData) {
        // Update the current product with full details
        setCurrentProduct(productData);
        
        // Also update the product in allProducts
        setAllProducts(prev => ({
          ...prev,
          [productId]: productData
        }));
      }
      
      setLoadingFullProduct(false);
    } catch (error) {
      console.error('Error fetching full product details:', error);
      setLoadingFullProduct(false);
    }
  };

  // Process price history data when current product changes
  useEffect(() => {
    if (!currentProduct || !currentProduct.price_history || !Array.isArray(currentProduct.price_history)) {
      setPriceHistoryData([]);
      return;
    }

    // Sort price history by timestamp (oldest to newest)
    const sortedHistory = [...currentProduct.price_history].sort((a, b) => {
      // Parse timestamps for comparison
      return a.timestamp.localeCompare(b.timestamp);
    });

    // Format data for the chart
    const formattedData = sortedHistory.map(entry => {
      // Parse timestamp format: "2025_03_13_21_01"
      try {
        const [year, month, day, hour, minute] = entry.timestamp.split('_');
        const dateLabel = `${month}/${day} ${hour}:${minute}`;
        
        return {
          date: dateLabel,
          price: entry.price,
          // Store original timestamp for tooltip
          fullTimestamp: `${year}-${month}-${day} ${hour}:${minute}`
        };
      } catch (error) {
        console.error('Error parsing timestamp:', entry.timestamp, error);
        return {
          date: 'Unknown',
          price: entry.price,
          fullTimestamp: 'Invalid date'
        };
      }
    });

    setPriceHistoryData(formattedData);
  }, [currentProduct]);

  // Fetch related products when the current product changes
  useEffect(() => {
    // Only proceed if we have a product
    if (!currentProduct) return;

    const currentProductCode = currentProduct.product_code;
    console.log('Current product code:', currentProductCode);
    
    if (!currentProductCode) {
      console.log('No product code available, skipping fetch');
      return;
    }
    
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        console.log('Fetching related products for code:', currentProductCode);
        
        const response = await fetch(
          `${SERVER}/api/products?productCode=${currentProductCode}`
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch related products: ${response.status}`);
        }
        
        const content = await response.json();
        console.log('API response:', content);
        
        if (!content.data || !Array.isArray(content.data)) {
          console.error('Invalid response format:', content);
          setLoading(false);
          return;
        }
        
        // Filter out the current product by id
        const currentId = currentProduct.id || currentProduct._id;
        const related = content.data.filter(item => {
          const itemId = item.id || item._id;
          return itemId !== currentId;
        });
        
        console.log('Related products after filtering:', related);
        
        // Update the allProducts with new related products
        const productsMap = { ...allProducts };
        related.forEach(product => {
          const productId = product.id || product._id;
          if (!productsMap[productId]) {
            productsMap[productId] = product;
          }
        });
        
        setAllProducts(productsMap);
        setRelatedProducts(related);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching related products:', error);
        setLoading(false);
      }
    };
    
    fetchRelatedProducts();
    
  }, [currentProduct]); // Dependency on currentProduct to refetch when it changes

  // Handle switching to a related product
  const handleProductSwitch = (productId) => {
    // Find the product in our cached products
    const newMainProduct = allProducts[productId];
    
    if (newMainProduct) {
      // Set the clicked product as the main product
      setCurrentProduct(newMainProduct);
      
      // Check if we need to fetch full details for this product
      if (!newMainProduct.price_history) {
        fetchFullProductDetails(productId);
      }
    }
  };

  // Helper function to determine price comparison class
  const getPriceComparisonClass = (relatedProductPrice) => {
    if (!currentProduct || !currentProduct.price || !relatedProductPrice) return '';
    
    const mainPrice = parseFloat(currentProduct.price);
    const comparisonPrice = parseFloat(relatedProductPrice);
    
    if (comparisonPrice < mainPrice) return 'lower-price';
    if (comparisonPrice > mainPrice) return 'higher-price';
    return '';
  };

  // Format price for display in chart tooltip
  const formatPrice = (value) => {
    return `${value.toFixed(2)} RON`;
  };

  // Calculate min and max y-axis values
  const getYAxisDomain = () => {
    if (!priceHistoryData.length) return [0, 0];
    
    const prices = priceHistoryData.map(item => item.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    
    // Add 5% padding to top and bottom
    const padding = (max - min) * 0.05;
    return [
      Math.max(0, min - padding), // Don't go below 0
      max + padding
    ];
  };

  // Early return if no product
  if (!currentProduct) return null;

  // Destructure current product properties
  const { 
    name, 
    manufacturer, 
    price, 
    specifications, 
    is_in_stoc, 
    description, 
    product_code
  } = currentProduct;

  // Calculate y-axis domain
  const yAxisDomain = getYAxisDomain();

  return (
    <div className="product-modal-overlay" onClick={(e) => {
      // Close modal when clicking on the overlay (outside the modal content)
      if (e.target.className === 'product-modal-overlay') {
        onClose();
      }
    }}>
      <div className="product-modal" ref={modalRef}>
        <div className="modal-header">
          <h2>{name}</h2>
          <button className="close-modal-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="modal-top-info">
            <div className="modal-main-details">
              <div className="modal-price">{price?.toFixed(2)} RON</div>
              <div className={`modal-stock ${is_in_stoc ? 'in-stock' : 'out-of-stock'}`}>
                {is_in_stoc ? 'In Stock' : 'Out of Stock'}
              </div>
              {product_code && <div className="modal-product-code">Product Code: {product_code}</div>}
            </div>

            <div className="modal-manufacturer">
              <strong>Manufacturer:</strong> {manufacturer}
            </div>
          </div>
          
          {description && (
            <div className="modal-description">
              <h3>Description</h3>
              <p>{description}</p>
            </div>
          )}
          
          {specifications && Object.keys(specifications).length > 0 && (
            <div className="modal-specifications">
              <h3>Specifications</h3>
              <table>
                <tbody>
                  {Object.entries(specifications).map(([key, value]) => (
                    <tr key={key}>
                      <td className="spec-name">{key}</td>
                      <td className="spec-value">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Price History Chart */}
          <div className="modal-price-history">
            <h3>Price History</h3>
            {loadingFullProduct ? (
              <div className="loading-price-history">Loading price history data...</div>
            ) : priceHistoryData.length > 0 ? (
              <div className="price-chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={priceHistoryData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      label={{ value: 'Date', position: 'insideBottomRight', offset: -5 }} 
                    />
                    <YAxis 
                      domain={yAxisDomain}
                      label={{ value: 'Price (RON)', angle: -90, position: 'insideLeft' }} 
                      tickFormatter={formatPrice}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value.toFixed(2)} RON`, 'Price']}
                      labelFormatter={(label, payload) => {
                        if (payload && payload.length > 0) {
                          return `Date: ${payload[0].payload.fullTimestamp}`;
                        }
                        return label;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#1976d2" 
                      activeDot={{ r: 8 }} 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="price-history-summary">
                  {priceHistoryData.length > 1 && (
                    <>
                      <div className="price-history-stat">
                        <span>Lowest Price:</span> 
                        <span className="price-value lower-price">
                          {Math.min(...priceHistoryData.map(item => item.price)).toFixed(2)} RON
                        </span>
                      </div>
                      <div className="price-history-stat">
                        <span>Highest Price:</span> 
                        <span className="price-value higher-price">
                          {Math.max(...priceHistoryData.map(item => item.price)).toFixed(2)} RON
                        </span>
                      </div>
                      <div className="price-history-stat">
                        <span>Price Changes:</span> 
                        <span className="price-value">
                          {new Set(priceHistoryData.map(item => item.price)).size - 1}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="no-price-history">
                No price history available for this product.
              </div>
            )}
          </div>
          
          <div className="modal-related-products">
            <h3>Related Products {product_code ? `(Code: ${product_code})` : ''}</h3>
            {loading ? (
              <div className="related-loading">Loading related products...</div>
            ) : relatedProducts.length > 0 ? (
              <>
                <div className="price-comparison-legend">
                  <div className="price-legend-item">
                    <span className="price-indicator lower-price-indicator"></span>
                    <span>Lower price than current product</span>
                  </div>
                  <div className="price-legend-item">
                    <span className="price-indicator same-price-indicator"></span>
                    <span>Same price as current product</span>
                  </div>
                  <div className="price-legend-item">
                    <span className="price-indicator higher-price-indicator"></span>
                    <span>Higher price than current product</span>
                  </div>
                </div>
                <div className="related-products-grid">
                  {relatedProducts.map((relatedProduct) => {
                    const productId = relatedProduct.id || relatedProduct._id;
                    return (
                      <div 
                        className={`related-product-card ${getPriceComparisonClass(relatedProduct.price)}`} 
                        key={productId}
                        onClick={() => handleProductSwitch(productId)}
                      >
                        <div className="related-product-name">{relatedProduct.name}</div>
                        <div className="related-product-info">
                          <div className="related-product-price">{relatedProduct.price?.toFixed(2)} RON</div>
                          <div className={`related-product-stock ${relatedProduct.is_in_stoc ? 'in-stock' : 'out-of-stock'}`}>
                            {relatedProduct.is_in_stoc ? 'In Stock' : 'Out of Stock'}
                          </div>
                        </div>
                        {Object.entries(relatedProduct.specifications || {}).slice(0, 3).map(([key, value]) => (
                          <div className="related-product-spec" key={key}>
                            <span className="related-spec-name">{key}:</span> {value}
                          </div>
                        ))}
                        <div className="view-product-hint">Click to view this product</div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="no-related-products">
                {product_code ? 
                  `No related products found with code: ${product_code}` : 
                  'No product code available to search related products.'
                }
              </div>
            )}
          </div>
        </div>
        
        <div className="modal-footer">
          <div className="modal-footer-actions">
            {/* Always show favorites button, but handle login redirect for non-authenticated users */}
            <button 
              className={`favorites-btn ${isUserLoggedIn() && isInFavorites ? 'remove-favorites' : 'add-favorites'}`}
              onClick={handleFavoritesClick}
              disabled={addingToFavorites}
            >
              {addingToFavorites ? (
                'Processing...'
              ) : (isUserLoggedIn() && isInFavorites) ? (
                'Remove from Favorites'
              ) : (
                'Add to Favorites'
              )}
            </button>
            
            <button 
              className="add-to-cart-btn"
              disabled={!is_in_stoc}
            >
              {is_in_stoc ? 'Add to Cart' : 'Out of Stock'}
            </button>
            
            <button className="close-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;