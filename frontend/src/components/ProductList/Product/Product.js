import React from 'react';
import './Product.css';

const Product = ({ product }) => {
  const { name, manufacturer, price, specifications, is_in_stoc } = product;

  return (
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
          <strong>Price:</strong> {price.toFixed(2)} RON
        </div>
      </div>
      
      {/* <div className="product-specs">
        <h4>Key Specifications</h4>
        <ul>
          {specifications && (
            <>
              {specifications["Procesor"] && <li><strong>Processor:</strong> {specifications["Procesor"]}</li>}
              {specifications["Familie procesor"] && <li><strong>Processor Family:</strong> {specifications["Familie procesor"]}</li>}
              {specifications["Model procesor"] && <li><strong>Processor Model:</strong> {specifications["Model procesor"]}</li>}
              {specifications["Capacitate memorie"] && <li><strong>Memory:</strong> {specifications["Capacitate memorie"]}</li>}
              {specifications["Capacitate SSD"] && <li><strong>Storage:</strong> {specifications["Capacitate SSD"]}</li>}
              {specifications["Diagonala"] && <li><strong>Display:</strong> {specifications["Diagonala"]}</li>}
              {specifications["Rezolutie maxima"] && <li><strong>Resolution:</strong> {specifications["Rezolutie maxima"]}</li>}
              {specifications["Procesor grafic"] && <li><strong>Graphics:</strong> {specifications["Procesor grafic"]}</li>}
            </>
          )}
        </ul>
      </div> */}
      
      <button className="view-details-btn">View Details</button>
    </div>
  );
};

export default Product;