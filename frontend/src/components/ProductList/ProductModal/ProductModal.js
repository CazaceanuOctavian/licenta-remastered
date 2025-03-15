import React, { useContext, useEffect, useState } from 'react';
import AppContext from '../../../state/AppContext';
import { SERVER } from '../../../config/global';
import './ProductModal.css';

const ProductModal = ({ product, onClose }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch related products when the modal opens
  useEffect(() => {
    // Only proceed if we have a product
    if (!product) return;

    const currentProductCode = product.product_code;
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
        const currentId = product.id || product._id;
        const related = content.data.filter(item => {
          const itemId = item.id || item._id;
          return itemId !== currentId;
        });
        
        console.log('Related products after filtering:', related);
        setRelatedProducts(related);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching related products:', error);
        setLoading(false);
      }
    };
    
    fetchRelatedProducts();
    
    // No cleanup needed for this effect
  }, [product]); // Dependency on product to refetch if product changes

  // Early return if no product
  if (!product) return null;

  // Destructure product properties
  const { 
    name, 
    manufacturer, 
    price, 
    specifications, 
    is_in_stoc, 
    description, 
    product_code
  } = product;

  return (
    <div className="product-modal-overlay" onClick={(e) => {
      // Close modal when clicking on the overlay (outside the modal content)
      if (e.target.className === 'product-modal-overlay') {
        onClose();
      }
    }}>
      <div className="product-modal">
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
          
          <div className="modal-related-products">
            <h3>Related Products {product_code ? `(Code: ${product_code})` : ''}</h3>
            {loading ? (
              <div className="related-loading">Loading related products...</div>
            ) : relatedProducts.length > 0 ? (
              <div className="related-products-grid">
                {relatedProducts.map((relatedProduct) => (
                  <div className="related-product-card" key={relatedProduct.id || relatedProduct._id}>
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
                  </div>
                ))}
              </div>
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
          <button 
            className="add-to-cart-btn"
            disabled={!is_in_stoc}
          >
            {is_in_stoc ? 'Add to Cart' : 'Out of Stock'}
          </button>
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;