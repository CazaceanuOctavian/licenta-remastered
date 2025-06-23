import { useContext, useEffect, useState } from "react";
import AppContext from "../../state/AppContext";
import ProductCarousel from './MainProductCarousel';
import ProductModal from './ProductModal/ProductModal'; // <-- Import the modal component
import './ProductCarousel.css';

const FavoriteProductCarousel = () => {
    const globalState = useContext(AppContext);
    const [favoriteProducts, setFavoriteProducts] = useState([]);

    // State for category grouping
    const [productsByCategory, setProductsByCategory] = useState({});
    const [productCategories, setProductCategories] = useState([]);

    // Loading and error state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mailingListStatus, setMailingListStatus] = useState(null);

    // --- NEW: State for managing the product modal ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Notification states
    const [notificationPrefs, setNotificationPrefs] = useState({});
    const [showPopup, setShowPopup] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [isUnsubscribing, setIsUnsubscribing] = useState(false);

    // --- Event Listener Setup ---
    useEffect(() => {
        // Fetch favorite products when component mounts
        fetchFavoriteProducts();

        // Define handlers for events
        const handleFavoritesFetched = () => {
            setFavoriteProducts(globalState.product.data);
            setLoading(false);
        };
        const handleFetchError = () => {
            setLoading(false);
            setError("Failed to load favorite products. Please try again.");
        };
        const handleProductRemoved = () => {
            fetchFavoriteProducts(); // Refresh the list
        };
        const handleMailingListSuccess = () => {
            setMailingListStatus({ type: 'success', message: 'Email notification preference updated successfully!' });
            setTimeout(() => setMailingListStatus(null), 3000);
        };
        const handleMailingListError = () => {
            setMailingListStatus({ type: 'error', message: 'Failed to update email notification preference. Please try again.' });
            setTimeout(() => setMailingListStatus(null), 5000);
        };
        
        // Add listeners
        globalState.product.emitter.addListener('PRODUCT_FETCH_FAVORITES_SUCCESS', handleFavoritesFetched);
        globalState.product.emitter.addListener('PRODUCT_FETCH_FAVORITES_FAIL', handleFetchError);
        globalState.product.emitter.addListener('PRODUCT_REMOVE_FROM_USER_LIST_SUCCESS', handleProductRemoved);
        globalState.product.emitter.addListener('PRODUCT_ADD_TO_MAILING_LIST_SUCCESS', handleMailingListSuccess);
        globalState.product.emitter.addListener('PRODUCT_ADD_TO_MAILING_LIST_FAIL', handleMailingListError);

        // Cleanup listeners
        return () => {
            globalState.product.emitter.removeAllListeners('PRODUCT_FETCH_FAVORITES_SUCCESS');
            globalState.product.emitter.removeAllListeners('PRODUCT_FETCH_FAVORITES_FAIL');
            globalState.product.emitter.removeAllListeners('PRODUCT_REMOVE_FROM_USER_LIST_SUCCESS');
            globalState.product.emitter.removeAllListeners('PRODUCT_ADD_TO_MAILING_LIST_SUCCESS');
            globalState.product.emitter.removeAllListeners('PRODUCT_ADD_TO_MAILING_LIST_FAIL');
        };
    }, [globalState]);

    // --- Grouping Logic ---
    useEffect(() => {
        if (favoriteProducts.length > 0) {
            const groupedProducts = {};
            favoriteProducts.forEach(product => {
                const category = product.category || 'Uncategorized';
                if (!groupedProducts[category]) {
                    groupedProducts[category] = [];
                }
                groupedProducts[category].push(product);
            });
            
            setProductsByCategory(groupedProducts);
            setProductCategories(Object.keys(groupedProducts));

            const initialNotificationPrefs = {};
            Object.entries(groupedProducts).forEach(([category, products]) => {
                initialNotificationPrefs[category] = products.every(p => p.email_notification === true);
            });
            setNotificationPrefs(initialNotificationPrefs);
        } else {
            setProductsByCategory({});
            setProductCategories([]);
        }
    }, [favoriteProducts]);

    // --- NEW: Handlers for opening and closing the modal ---
    const handleProductClick = (productId) => {
        const productToShow = favoriteProducts.find(p => (p.id || p._id) === productId);
        if (productToShow) {
            setSelectedProduct(productToShow);
            setIsModalOpen(true);
        } else {
            console.error("Could not find the clicked product in the favorites list.");
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    // --- Data Fetching and Action Handlers ---
    const fetchFavoriteProducts = () => {
        setLoading(true);
        setError(null);
        globalState.product.fetchFavoriteProducts(globalState);
    };

    const removeFromFavorites = (category) => {
        const productsToRemove = productsByCategory[category] || [];
        const productCodes = [...new Set(productsToRemove.map(p => p.product_code))];
        productCodes.forEach(code => {
            globalState.product.removeProductFromUserList(globalState, code);
        });
    };
    
    const handleNotificationClick = (category) => {
        setCurrentCategory(category);
        const isCurrentlyEnabled = notificationPrefs[category] || false;
        setIsUnsubscribing(isCurrentlyEnabled);
        setShowPopup(true);
    };
    
    const handleSubscribe = (e) => {
        e.preventDefault();
        const productsToUpdate = productsByCategory[currentCategory] || [];
        const productCodes = [...new Set(productsToUpdate.map(p => p.product_code))];
        productCodes.forEach(code => {
            if (isUnsubscribing) {
                globalState.product.removeProductFromMailingList(globalState, code);
            } else {
                globalState.product.addProductToMailingList(globalState, code);
            }
        });
        setNotificationPrefs(prev => ({ ...prev, [currentCategory]: !isUnsubscribing }));
        closePopup();
    };
    
    const closePopup = () => {
        setShowPopup(false);
        setCurrentCategory(null);
    };

    // --- Component Render ---
    return (
        <div className="favorite-products-container">
            <h2>My Favorite Products</h2>
            
            <div className="favorite-products-content">
                {mailingListStatus && (
                    <div className={`status-message ${mailingListStatus.type}`}>
                        <p>{mailingListStatus.message}</p>
                    </div>
                )}
                
                {loading ? (
                    <div className="loading">Loading your favorite products...</div>
                ) : error ? (
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={fetchFavoriteProducts}>Try Again</button>
                    </div>
                ) : favoriteProducts.length > 0 ? (
                    <div className="carousels-container">
                        {productCategories.map(category => (
                            <div key={category} className="carousel-wrapper">
                                <ProductCarousel
                                    products={productsByCategory[category]}
                                    title={<h3>{category}</h3>}
                                    loading={false}
                                    onProductClick={handleProductClick} // <-- Connect the click handler
                                />
                                <div className="carousel-actions">
                                    <div className="notification-option">
                                        <label className="notification-checkbox">
                                            <input 
                                                type="checkbox" 
                                                checked={notificationPrefs[category] || false}
                                                onChange={() => handleNotificationClick(category)}
                                            />
                                            <span className="checkmark"></span>
                                            <span className="notification-text">Notify me about better offers</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-favorites">
                        <p>You haven't added any products to your favorites yet.</p>
                        <a href="/products" className="browse-products-link">Browse Products</a>
                    </div>
                )}
                
                {showPopup && (
                    <div className="popup-overlay">
                        <div className="popup-container">
                            <button className="popup-close" onClick={closePopup}>×</button>
                            <h3>Email Notifications for {currentCategory}</h3>
                            {isUnsubscribing ? (
                                <>
                                    <p>Stop receiving email notifications for all products in the <strong>{currentCategory}</strong> category?</p>
                                    <form onSubmit={handleSubscribe}>                                
                                        <div className="popup-actions">
                                            <button type="button" className="btn-cancel" onClick={closePopup}>Cancel</button>
                                            <button type="submit" className="btn-unsubscribe">Unsubscribe</button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <>
                                    <p>Receive notifications for better offers on products in the <strong>{currentCategory}</strong> category?</p>
                                    <form onSubmit={handleSubscribe}>                                
                                        <div className="popup-actions">
                                            <button type="button" className="btn-cancel" onClick={closePopup}>Cancel</button>
                                            <button type="submit" className="btn-subscribe">Subscribe</button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* --- NEW: Conditionally render the ProductModal --- */}
            {isModalOpen && selectedProduct && (
                <ProductModal 
                    product={selectedProduct} 
                    onClose={handleCloseModal} 
                />
            )}
        </div>
    );
};

export default FavoriteProductCarousel;