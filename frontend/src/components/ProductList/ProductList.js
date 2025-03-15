import { useContext, useEffect, useState } from "react"
import AppContext from "../../state/AppContext"
import Product from "./Product/Product" // Import the Product component
import './ProductList.css'

const ProductList = () => {
    //TODO --> FIX PAGINATION
            // FIX MANUFACTURER --> Fa-l sa apara doar dupa ce s-au cautat deja produse...

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
            
            <div className="content-layout">
                {/* Filters Sidebar */}
                <div className="filters-sidebar">
                    <h3>Filter Products</h3>
                    
                    <div className="filter-inputs">
                        <button className="apply-filters-btn" onClick={applyFilters}>
                            Apply Filters
                        </button>

                        <div className="filter-item">
                            <label>Product Name</label>
                            <input 
                                type="text" 
                                placeholder="Enter product name" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        
                        <div className="filter-item">
                            <label>Manufacturer</label>
                            <input 
                                type="text" 
                                placeholder="Enter manufacturer" 
                                value={manufacturer} 
                                onChange={(e) => setManufacturer(e.target.value)}
                            />
                        </div>
                        
                        <div className="filter-item">
                            <label>Min Price</label>
                            <input 
                                type="number" 
                                placeholder="Min price" 
                                value={minPrice} 
                                onChange={(e) => setMinPrice(e.target.value)}
                            />
                        </div>
                        
                        <div className="filter-item">
                            <label>Max Price</label>
                            <input 
                                type="number" 
                                placeholder="Max price" 
                                value={maxPrice} 
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>
                        
                        <div className="filter-item">
                            <label>Product Code</label>
                            <input 
                                type="text" 
                                placeholder="Enter product code" 
                                value={productCode} 
                                onChange={(e) => setProductCode(e.target.value)}
                            />
                        </div>
                        
                        <div className="filter-item">
                            <label>Sort By</label>
                            <select 
                                value={sortField} 
                                onChange={(e) => setSortField(e.target.value)}
                            >
                                <option value="">Select field</option>
                                <option value="name">Name</option>
                                <option value="price">Price</option>
                                <option value="manufacturer">Manufacturer</option>
                            </select>
                        </div>
                        
                        <div className="filter-item">
                            <label>Sort Order</label>
                            <select 
                                value={sortOrder} 
                                onChange={(e) => setSortOrder(e.target.value)}
                            >
                                <option value="">Select order</option>
                                <option value="ASC">Ascending</option>
                                <option value="DESC">Descending</option>
                            </select>
                        </div>
                        
                        <div className="filter-item">
                            <label>Items Per Page</label>
                            <select 
                                value={pageSize} 
                                onChange={(e) => setPageSize(e.target.value)}
                            >
                                <option value="">Select count</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                {/* Products Content Area */}
                <div className="products-content">
                    {/* Loading State */}
                    {loading ? (
                        <div className="loading">Loading products...</div>
                    ) : products.length > 0 ? (
                        <>
                            <div className="products-grid">
                                {products.map((product) => (
                                    <Product key={product.id || product._id} product={product} />
                                ))}
                            </div>
                            
                            {/* Pagination */}
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
                        </>
                    ) : (
                        <div className="no-products">No products found matching your criteria.</div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProductList