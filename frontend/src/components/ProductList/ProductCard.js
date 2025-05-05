import React, { useState } from 'react';
import './ProductCard.css';

const ProductCard = ({ product, priceComparisonClass, onClick }) => {
  const [imageError, setImageError] = useState(false);
  
  // Determine image source based on product code
  const imageSrc = imageError || !product.product_code 
    ? '/placeholder.jpeg' 
    : `/${product.product_code}.jpeg`;
  
  // Handle image loading error
  const handleImageError = () => {
    setImageError(true);
  };
  
  return (
    <div 
      className={`product-card ${priceComparisonClass}`} 
      onClick={onClick}
    >
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
      <div className="view-product-hint">Click to view</div>
    </div>
  );
};

export default ProductCard;