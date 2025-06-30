import React, { useState } from 'react';
import './ProductCard.css';

const ProductCard = ({ 
  product, 
  priceComparisonClass, 
  onClick,
  showCheckbox = false,
  isCheckboxChecked = false,
  onCheckboxChange = () => {}
}) => {
  const [imageError, setImageError] = useState(false);
  
  const imageSrc = imageError || !product.product_code 
    ? '/placeholder.jpeg' 
    : `/${product.product_code}.jpeg`;
  
  const handleImageError = () => {
    setImageError(true);
  };

  // This is the key change: stop the click event from bubbling up to the card's onClick
  const handleNotificationAreaClick = (e) => {
    e.stopPropagation();
  };
  
  return (
    // The main onClick for opening the modal is now on this outer container
    <div 
      className={`product-card ${priceComparisonClass}`} 
      onClick={onClick}
    >
      {/* --- NEW: Dedicated notification area at the top --- */}
      {showCheckbox && (
        <div 
          className="product-card-notification-area" 
          onClick={handleNotificationAreaClick} // Stop propagation here
        >
          <label className="notification-label">
            <input 
              type="checkbox"
              checked={isCheckboxChecked}
              onChange={onCheckboxChange}
            />
            <span className="custom-checkmark"></span>
            <span className="notification-label-text">Email me better offers</span>
          </label>
        </div>
      )}

      {/* The rest of the card content. A click anywhere here will trigger the modal */}
      <div className="product-card-image">
        <img 
          src={imageSrc} 
          alt={product.name}
          onError={handleImageError}
        />
      </div>
      <div className="product-card-name">{product.name}</div>
      <div className="product-card-info">
        <div className="product-card-price">{product.price?.toFixed(2)} RON</div>
        <div className={`product-card-stock ${product.is_in_stoc ? 'in-stock' : 'out-of-stock'}`}>
          {product.is_in_stoc ? 'In Stock' : 'Out of Stock'}
        </div>
      </div>
      <div className="product-card-manufacturer">
        By: {product.manufacturer}
      </div>
      <div className="view-product-hint">Click card to view</div>
    </div>
  );
};

export default ProductCard;