import { useContext, useEffect, useState } from "react";
import AppContext from "../../state/AppContext";
import ProductCarousel from './MainProductCarousel';
import ProductModal from './ProductModal/ProductModal';
import './ProductCarousel.css';

const FavoriteProductCarousel = () => {
    const globalState = useContext(AppContext);
    const [favoriteProducts, setFavoriteProducts] = useState([]);
    const [productsByCategory, setProductsByCategory] = useState({});
    const [productCategories, setProductCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mailingListStatus, setMailingListStatus] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // --- UPDATED: State for individual product notification preferences ---
    // Stores state as { "productId1": true, "productId2": false }
    const [productNotificationPrefs, setProductNotificationPrefs] = useState({});

    // --- Event Listener Setup ---
    useEffect(() => {
        fetchFavoriteProducts();

        const handleFavoritesFetched = () => {
            setFavoriteProducts(globalState.product.data);
            setLoading(false);
        };
        const handleFetchError = () => {
            setLoading(false);
            setError("Failed to load favorite products. Please try again.");
        };
        const handleProductRemoved = () => fetchFavoriteProducts(); // Refresh list on removal
        const handleMailingListSuccess = () => {
            setMailingListStatus({ type: 'success', message: 'Email notification preference updated successfully!' });
            // Don't refetch here, as the UI is already updated optimistically
            setTimeout(() => setMailingListStatus(null), 3000);
        };
        const handleMailingListError = () => {
            setMailingListStatus({ type: 'error', message: 'Failed to update preference. Please try again.' });
            // Note: On error, you might want to revert the optimistic UI update.
            // For simplicity, we are not doing that here, but it's a consideration for robust apps.
            setTimeout(() => setMailingListStatus(null), 5000);
        };
        
        globalState.product.emitter.addListener('PRODUCT_FETCH_FAVORITES_SUCCESS', handleFavoritesFetched);
        globalState.product.emitter.addListener('PRODUCT_FETCH_FAVORITES_FAIL', handleFetchError);
        globalState.product.emitter.addListener('PRODUCT_REMOVE_FROM_USER_LIST_SUCCESS', handleProductRemoved);
        globalState.product.emitter.addListener('PRODUCT_ADD_TO_MAILING_LIST_SUCCESS', handleMailingListSuccess);
        globalState.product.emitter.addListener('PRODUCT_ADD_TO_MAILING_LIST_FAIL', handleMailingListError);

        return () => {
            globalState.product.emitter.removeAllListeners(); // Clean up all listeners for this component
        };
    }, [globalState]);

    // --- Grouping and Preference Logic ---
    useEffect(() => {
        if (favoriteProducts.length > 0) {
            const groupedProducts = {};
            const initialPrefs = {};
            favoriteProducts.forEach(product => {
                const category = product.category || 'Uncategorized';
                if (!groupedProducts[category]) {
                    groupedProducts[category] = [];
                }
                groupedProducts[category].push(product);

                // Populate individual preferences using the product's ID
                const productId = product.id || product._id;
                initialPrefs[productId] = product.email_notification === true;
            });
            
            setProductsByCategory(groupedProducts);
            setProductCategories(Object.keys(groupedProducts));
            setProductNotificationPrefs(initialPrefs); // Set the new state for individual products
        } else {
            setProductsByCategory({});
            setProductCategories([]);
            setProductNotificationPrefs({});
        }
    }, [favoriteProducts]);

    // --- Modal Handlers ---
    const handleProductClick = (productId) => {
        const productToShow = favoriteProducts.find(p => (p.id || p._id) === productId);
        if (productToShow) {
            setSelectedProduct(productToShow);
            setIsModalOpen(true);
        }
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    // --- Action Handlers ---
    const fetchFavoriteProducts = () => {
        setLoading(true);
        setError(null);
        globalState.product.fetchFavoriteProducts(globalState);
    };

    // --- NEW: Handler for toggling a single product's notification preference ---
    const handleProductNotificationToggle = (product) => {
        const productId = product.id || product._id;
        const productCode = product.product_code;
        const isCurrentlyEnabled = !!productNotificationPrefs[productId];

        // Optimistically update the UI for instant feedback
        setProductNotificationPrefs(prev => ({
            ...prev,
            [productId]: !isCurrentlyEnabled
        }));

        // Call the appropriate API endpoint based on the previous state
        if (isCurrentlyEnabled) {
            globalState.product.removeProductFromMailingList(globalState, productCode);
        } else {
            globalState.product.addProductToMailingList(globalState, productCode);
        }
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
                                    onProductClick={handleProductClick}
                                    // --- NEW: Activate and connect checkbox functionality ---
                                    showCheckboxes={true}
                                    getCheckboxState={(productId) => !!productNotificationPrefs[productId]}
                                    onCheckboxToggle={handleProductNotificationToggle}
                                />
                                {/* --- The old category-level actions are now removed --- */}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-favorites">
                        <p>You haven't added any products to your favorites yet.</p>
                        <a href="/products" className="browse-products-link">Browse Products</a>
                    </div>
                )}
                
                {/* --- The popup and its related logic are now removed --- */}
            </div>

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