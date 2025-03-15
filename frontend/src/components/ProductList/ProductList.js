import { useContext, useEffect, useState } from "react"
import AppContext from "../../state/AppContext"

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

    useEffect(() => {
        globalState.product.getAllProducts(name, manufacturer, minPrice, maxPrice, pageSize, pageNumber, sortField, sortOrder, extendedProduct, productCode)
        globalState.product.emitter.addListener('PRODUCT_GET_ALL_SUCCESS', () => {
            setProducts(globalState.product.data)
            console.log(products)
        })
    }, [])


}

export default ProductList