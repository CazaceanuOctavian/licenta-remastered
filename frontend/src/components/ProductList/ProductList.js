import { useContext, useEffect, useState } from "react"
import AppContext from "../../state/AppContext"
import Product from "./Product/Product"
import './ProductList.css'

const ProductList = () => {
    //TODO --> FIX MANUFACTURER --> Fa-l sa apara doar dupa ce s-au cautat deja produse...

    const globalState = useContext(AppContext)
    const [products, setProducts] = useState([])
    //FILTER PARAMS
    const [name, setName] = useState('')
    const [manufacturer, setManufacturer] = useState('')
    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')
    const [pageSize, setPageSize] = useState('20') // Set default pageSize to 20
    const [pageNumber, setPageNumber] = useState('0') // Start at page 0
    const [sortField, setSortField] = useState('')
    const [sortOrder, setSortOrder] = useState('')
    const [extendedProduct] = useState('')
    const [productCode, setProductCode] = useState('')
    const [loading, setLoading] = useState(true)
    const [filterCounter, setFilterCounter] = useState(0)

    useEffect(() => {
        // Set initial page to 0
        setPageNumber('0')
        
        // Add listener for successful product fetch
        globalState.product.emitter.addListener('PRODUCT_GET_ALL_SUCCESS', handleProductsFetched)
        
        // Clean up listener when component unmounts
        return () => {
            globalState.product.emitter.removeAllListeners('PRODUCT_GET_ALL_SUCCESS', handleProductsFetched)
        }
    }, []) // Empty dependency array means this runs once on mount
    
    // Separate useEffect to fetch products when component mounts or pageNumber changes
    useEffect(() => {
        fetchProducts()
    }, [pageNumber]) // This will run when pageNumber changes
    
    // Don't automatically fetch on filter changes - only on Apply button click or page change
    useEffect(() => {
        if (filterCounter > 0) { // Skip the initial render
            fetchProducts()
        }
    }, [filterCounter])

    const fetchProducts = () => {
        setLoading(true)
        console.log(`Fetching products for page: ${pageNumber}`)
        
        globalState.product.getAllProducts(
            name, 
            manufacturer, 
            minPrice, 
            maxPrice, 
            pageSize || '20', // Use 20 as fallback if pageSize is empty
            pageNumber || '0', // Use 0 as fallback if pageNumber is empty
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

    // Handle filter changes - THIS WAS MISSING
    const applyFilters = () => {
        // Reset to first page when applying filters
        setPageNumber('0')
        // Increment filter counter to trigger a fetch
        setFilterCounter(prev => prev + 1)
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
                                onChange={(e) => {
                                    setPageSize(e.target.value)
                                    // Reset to first page and fetch products with new page size
                                    setPageNumber('0')
                                    setTimeout(() => {
                                        // Increment filter counter to trigger a fetch with the new page size
                                        setFilterCounter(prev => prev + 1)
                                    }, 0) // Ensure state updates before fetch
                                }}
                            >
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
                                        const newPage = Math.max(0, parseInt(pageNumber) - 1)
                                        setPageNumber(newPage.toString())
                                        // No need to call fetchProducts as useEffect will handle it
                                    }}
                                    disabled={pageNumber === '0' || !pageNumber}
                                >
                                    Previous
                                </button>
                                <span>Page {parseInt(pageNumber || '0') + 1}</span>
                                <button 
                                    onClick={() => {
                                        const newPage = parseInt(pageNumber || '0') + 1
                                        setPageNumber(newPage.toString())
                                        // No need to call fetchProducts as useEffect will handle it
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