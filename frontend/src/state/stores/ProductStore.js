import EventEmitter from "../../utils/EventEmitter";
import { SERVER } from "../../config/global";

class ProductStore {
    constructor() {
        this.data = []
        this.emitter = new EventEmitter()
    }

    async getAllProducts(name = '', manufacturer = '', minPrice = '', maxPrice = '', pageSize = '', pageNumber = '', sortField = '', sortOrder = '', extendedProduct = '', productCode = '') {
        try {
            const response = await fetch(`${SERVER}/api/products?name=${name}&manufacturer=${manufacturer}&minPrice=${minPrice}&maxPrice=${maxPrice}&pageSize=${pageSize}&pageNumber=${pageNumber === '' ? 0 : pageNumber}&sortField=${sortField}&sortOrder=${sortOrder}&extendedProduct=${extendedProduct}&productCode=${productCode}`);
            
            if (!response.ok) {
                throw response;
            }
            const content = await response.json();
            this.data = content.data;
            this.emitter.emit('PRODUCT_GET_ALL_SUCCESS');
        } catch (err) {
            console.warn(err);
            this.emitter.emit('PRODUCT_GET_ALL_ERROR');
        }
    }
}

export default ProductStore;