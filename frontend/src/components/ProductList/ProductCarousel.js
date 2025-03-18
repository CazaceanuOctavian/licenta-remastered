import { useContext, useEffect, useState } from "react"
import AppContext from "../../state/AppContext"
import Product from "../ProductList/Product/Product" // Assuming same Product component
import './ProductCarousel.css'

const FavoriteProductList = () => {
    const globalState = useContext(AppContext)
    const [favoriteProducts, setFavoriteProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

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
                    <div className="favorites-grid">
                        {favoriteProducts.map((product) => (
                            <div key={product.id || product._id} className="favorite-product-item">
                                <Product product={product} />
                                <button 
                                    className="remove-favorite-btn"
                                    onClick={() => removeFromFavorites(product.productCode)}
                                >
                                    Remove from Favorites
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-favorites">
                        <p>You haven't added any products to your favorites yet.</p>
                        <a href="/products" className="browse-products-link">Browse Products</a>
                    </div>
                )}
            </div>
        </div>
    )
}

export default FavoriteProductList