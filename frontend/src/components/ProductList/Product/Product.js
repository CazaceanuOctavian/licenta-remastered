import React, { useState, useContext } from 'react';
import ProductModal from '../ProductModal/ProductModal';
import AppContext from '../../../state/AppContext';
import './Product.css';

const Product = ({ product }) => {
  const [showModal, setShowModal] = useState(false);
  const { name, manufacturer, price, is_in_stoc } = product;

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <div className="product-card">
        <div className="product-header">
          <h3 className="product-name">{name}</h3>
          <span className={`product-stock ${is_in_stoc ? 'in-stock' : 'out-of-stock'}`}>
            {is_in_stoc ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
        
        <div className="product-info">
          <div className="product-brand">
            <strong>Manufacturer:</strong> {manufacturer}
          </div>
          <div className="product-price">
            <strong>Price:</strong> {price?.toFixed(2)} RON
          </div>
        </div>
        
        <button className="view-details-btn" onClick={handleOpenModal}>View Details</button>
      </div>

      {showModal && (
        <ProductModal 
          product={product}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default Product;