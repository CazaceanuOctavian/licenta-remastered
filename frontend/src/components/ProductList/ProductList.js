import { useContext, useEffect, useState } from "react"
import AppContext from "../../state/AppContext"
import Product from "./Product/Product" // Import the Product component
import './ProductList.css'

const ProductList = () => {
    const globalState = useContext(AppContext)
    const [products, setProducts] = useState([])
    //FILTER PARAMS
    const [name, setName] = useState('')
    const [manufacturer, setManufacturer] = useState('')
    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')
    const [pageSize, setPageSize] = useState('')
    const [pageNumber, setPageNumber] = useState('')
    const [sortField, setSortField] = useState('')
    const [sortOrder, setSortOrder] = useState('')
    const [extendedProduct] = useState('')
    const [productCode, setProductCode] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch products when component mounts
        fetchProducts()

        // Add listener for successful product fetch
        globalState.product.emitter.addListener('PRODUCT_GET_ALL_SUCCESS', handleProductsFetched)

        // Clean up listener on component unmount
        return () => {
            globalState.product.emitter.removeListener('PRODUCT_GET_ALL_SUCCESS', handleProductsFetched)
        }
    }, [])

    const fetchProducts = () => {
        setLoading(true)
        globalState.product.getAllProducts(
            name, 
            manufacturer, 
            minPrice, 
            maxPrice, 
            pageSize, 
            pageNumber, 
            sortField, 
            sortOrder, 
            extendedProduct, 
            productCode
        )
    }

    const handleProductsFetched = () => {
        setProducts(globalState.product.data)
        setLoading(false)
    }

    // Handle filter changes
    const applyFilters = () => {
        fetchProducts()
    }

    return (
        <div className="product-list-container">
            <h2>Products</h2>
            
            {/* Filter Controls */}
            <div className="filters">
                <div className="filter-group">
                    <input 
                        type="text" 
                        placeholder="Product Name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input 
                        type="text" 
                        placeholder="Manufacturer" 
                        value={manufacturer} 
                        onChange={(e) => setManufacturer(e.target.value)}
                    />
                    <input 
                        type="number" 
                        placeholder="Min Price" 
                        value={minPrice} 
                        onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <input 
                        type="number" 
                        placeholder="Max Price" 
                        value={maxPrice} 
                        onChange={(e) => setMaxPrice(e.target.value)}
                    />
                    <input 
                        type="text" 
                        placeholder="Product Code" 
                        value={productCode} 
                        onChange={(e) => setProductCode(e.target.value)}
                    />
                </div>
                
                <div className="filter-controls">
                    <select 
                        value={sortField} 
                        onChange={(e) => setSortField(e.target.value)}
                    >
                        <option value="">Sort By</option>
                        <option value="name">Name</option>
                        <option value="price">Price</option>
                        <option value="manufacturer">Manufacturer</option>
                    </select>
                    
                    <select 
                        value={sortOrder} 
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <option value="">Order</option>
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                    
                    <select 
                        value={pageSize} 
                        onChange={(e) => setPageSize(e.target.value)}
                    >
                        <option value="">Items per page</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                    
                    <button onClick={applyFilters}>Apply Filters</button>
                </div>
            </div>
            
            {/* Products Display */}
            {loading ? (
                <div className="loading">Loading products...</div>
            ) : products.length > 0 ? (
                <div className="products-grid">
                    {products.map((product) => (
                        <Product key={product.id || product._id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="no-products">No products found matching your criteria.</div>
            )}
            
            {/* Pagination */}
            {products.length > 0 && (
                <div className="pagination">
                    <button 
                        onClick={() => {
                            const newPage = Math.max(1, parseInt(pageNumber) - 1)
                            setPageNumber(newPage.toString())
                            fetchProducts()
                        }}
                        disabled={pageNumber === '1' || !pageNumber}
                    >
                        Previous
                    </button>
                    <span>Page {pageNumber || 1}</span>
                    <button 
                        onClick={() => {
                            const newPage = parseInt(pageNumber || '1') + 1
                            setPageNumber(newPage.toString())
                            fetchProducts()
                        }}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}

export default ProductList