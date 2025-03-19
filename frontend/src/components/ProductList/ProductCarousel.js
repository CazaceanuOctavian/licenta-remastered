import { useContext, useEffect, useState, useRef } from "react"
import AppContext from "../../state/AppContext"
import Product from "../ProductList/Product/Product"
import './ProductCarousel.css'

const FavoriteProductCarousel = () => {
    const globalState = useContext(AppContext)
    const [favoriteProducts, setFavoriteProducts] = useState([])
    const [productsByType, setProductsByType] = useState({})
    const [productTypes, setProductTypes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    
    // Notification states
    const [notificationPrefs, setNotificationPrefs] = useState({})
    const [showPopup, setShowPopup] = useState(false)
    const [currentProductType, setCurrentProductType] = useState(null)
    const [userEmail, setUserEmail] = useState("")
    
    // Refs for carousel navigation
    const carouselRefs = useRef({})

    useEffect(() => {
        // Fetch favorite products when component mounts
        fetchFavoriteProducts()

        // Add listeners for product fetch events
        globalState.product.emitter.addListener('PRODUCT_FETCH_FAVORITES_SUCCESS', handleFavoritesFetched)
        globalState.product.emitter.addListener('PRODUCT_FETCH_FAVORITES_FAIL', handleFetchError)
        globalState.product.emitter.addListener('PRODUCT_REMOVE_FROM_USER_LIST_SUCCESS', handleProductRemoved)

        // Cleanup listeners when component unmounts
        return () => {
            globalState.product.emitter.removeAllListeners('PRODUCT_FETCH_FAVORITES_SUCCESS')
            globalState.product.emitter.removeAllListeners('PRODUCT_FETCH_FAVORITES_FAIL')
            globalState.product.emitter.removeAllListeners('PRODUCT_REMOVE_FROM_USER_LIST_SUCCESS')
        }
    }, [])

    useEffect(() => {
        // Group products by exact product_code when favoriteProducts changes
        if (favoriteProducts.length > 0) {
            const groupedProducts = {}
            
            favoriteProducts.forEach(product => {
                // Use the exact product_code from the product data
                const productCode = product.product_code || 'uncategorized'
                
                if (!groupedProducts[productCode]) {
                    groupedProducts[productCode] = []
                }
                
                groupedProducts[productCode].push(product)
            })
            
            setProductsByType(groupedProducts)
            setProductTypes(Object.keys(groupedProducts))
            
            // Initialize notification preferences based on email_notification property
            const initialNotificationPrefs = {}
            
            Object.entries(groupedProducts).forEach(([productCode, products]) => {
                // Check if all products in this group have email_notification set to true
                const allHaveEmailNotification = products.every(product => product.email_notification === true)
                initialNotificationPrefs[productCode] = allHaveEmailNotification
            })
            
            setNotificationPrefs(initialNotificationPrefs)
        }
    }, [favoriteProducts])

    const fetchFavoriteProducts = () => {
        setLoading(true)
        setError(null)
        globalState.product.fetchFavoriteProducts(globalState)
    }

    const handleFavoritesFetched = () => {
        setFavoriteProducts(globalState.product.data)
        setLoading(false)
    }

    const handleFetchError = () => {
        setLoading(false)
        setError("Failed to load favorite products. Please try again.")
    }

    const handleProductRemoved = () => {
        // Refresh the favorites list after removing a product
        fetchFavoriteProducts()
    }

    const removeFromFavorites = (productCode) => {
        globalState.product.removeProductFromUserList(globalState, productCode)
    }

    // Carousel navigation functions
    const scrollCarousel = (productType, direction) => {
        const carouselContainer = carouselRefs.current[productType]
        if (carouselContainer) {
            const scrollAmount = direction === 'left' ? -300 : 300
            carouselContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' })
        }
    }

    // Set carousel ref
    const setCarouselRef = (productType, ref) => {
        carouselRefs.current[productType] = ref
    }

    // Get product category info - use for grouping or display
    const getProductCategoryInfo = (products) => {
        if (!products || products.length === 0) return "Products"
        
        // Try to get category from the first product in the group
        const firstProduct = products[0]
        return firstProduct.category || "Products"
    }

    const renderCarousel = (productType, products) => {
        // Get the category name for this product group
        const categoryName = getProductCategoryInfo(products)
        
        return (
            <div className="carousel-section" key={productType}>
                <h3>
                    <span className="product-code">{productType}</span>
                    <span className="category-name">{categoryName}</span>
                </h3>
                <div className="carousel-container">
                    <button 
                        className="carousel-nav carousel-prev" 
                        onClick={() => scrollCarousel(productType, 'left')}
                        aria-label="Previous products"
                    >
                        &lt;
                    </button>
                    
                    <div 
                        className="carousel-items" 
                        ref={(ref) => setCarouselRef(productType, ref)}
                    >
                        {products.map((product) => (
                            <div key={product._id} className="carousel-item">
                                <div className="product-card">
                                    <div className="product-image">
                                        {/* Placeholder for product image */}
                                        <div className="image-placeholder">
                                            <span>{product.manufacturer || "Product"}</span>
                                        </div>
                                    </div>
                                    <div className="product-info">
                                        <h4>{product.name}</h4>
                                        <p className="product-price">${product.price.toFixed(2)}</p>
                                        <p className="product-manufacturer">{product.manufacturer}</p>
                                    </div>
                                    <button 
                                        className="remove-favorite-btn"
                                        onClick={() => removeFromFavorites(product.product_code)}
                                    >
                                        Remove from Favorites
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button 
                        className="carousel-nav carousel-next" 
                        onClick={() => scrollCarousel(productType, 'right')}
                        aria-label="Next products"
                    >
                        &gt;
                    </button>
                </div>
            </div>
        )
    }

    // Handle notification preferences
    const handleNotificationClick = (productType) => {
        setCurrentProductType(productType);
        setShowPopup(true);
    }
    
    const handleSubscribe = (e) => {
        e.preventDefault();
        // Here you would typically send this to your backend
        console.log(`Subscribed to updates for ${currentProductType} with email: ${userEmail}`);
        
        // Update notification preferences
        setNotificationPrefs(prev => ({
            ...prev,
            [currentProductType]: true
        }));
        
        // Close popup
        setShowPopup(false);
        setUserEmail("");
    }
    
    const closePopup = () => {
        setShowPopup(false);
        setUserEmail("");
    }

    return (
        <div className="favorite-products-container">
            <h2>My Favorite Products</h2>
            
            <div className="favorite-products-content">
                {/* Loading State */}
                {loading ? (
                    <div className="loading">Loading your favorite products...</div>
                ) : error ? (
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={fetchFavoriteProducts}>Try Again</button>
                    </div>
                ) : favoriteProducts.length > 0 ? (
                    <div className="carousels-container">
                        {productTypes.map(productType => (
                            <div key={productType} className="carousel-wrapper">
                                {renderCarousel(productType, productsByType[productType])}
                                <div className="notification-option">
                                    <label className="notification-checkbox">
                                        <input 
                                            type="checkbox" 
                                            checked={notificationPrefs[productType] || false}
                                            onChange={() => handleNotificationClick(productType)}
                                        />
                                        <span className="checkmark"></span>
                                        <span className="notification-text">Notify me when a better offer is available</span>
                                    </label>
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
                
                {/* Email Subscription Popup */}
                {showPopup && (
                    <div className="popup-overlay">
                        <div className="popup-container">
                            <button className="popup-close" onClick={closePopup}>×</button>
                            <h3>Email Notifications</h3>
                            <p>Would you like to receive email notifications when better offers are available for products with code <strong>{currentProductType}</strong>?</p>
                            
                            <form onSubmit={handleSubscribe}>                                
                                <div className="popup-actions">
                                    <button type="button" className="btn-cancel" onClick={closePopup}>Cancel</button>
                                    <button type="submit" className="btn-subscribe">Subscribe</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default FavoriteProductCarousel