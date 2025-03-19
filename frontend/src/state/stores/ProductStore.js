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

    async addProductToUserList(state, productCode) {
        try {
            const response = await fetch(`${SERVER}/api/users/userProductList/${productCode}`, {
                method: 'post',
                headers: {
                    authorization: state.user.data.token
                }
            })
            
            if(!response.ok) {
                throw response
            }

            const content = await response.json()
            this.emitter.emit("PRODUCT_ADD_TO_USER_LIST_SUCCESS")
        } catch (err) {
            console.warn(err);
            this.emitter.emit('PRODUCT_ADD_TO_USER_LIST_FAIL')
        }
    }

    async removeProductFromUserList(state, productCode) {
        try {
            const response = await fetch(`${SERVER}/api/users/userProductList/${productCode}`, {
                method: 'delete',
                headers: {
                    authorization: state.user.data.token
                }
            })
            
            if(!response.ok) {
                throw response
            }

            const content = await response.json()
            this.emitter.emit("PRODUCT_REMOVE_FROM_USER_LIST_SUCCESS")
        } catch (err) {
            console.warn(err);
            this.emitter.emit('PRODUCT_REMOVE_FROM_USER_LIST_FAIL')
        }
    }

    async checkIfInFavorites(state, productCode) {
        try {
            const response = await fetch(`${SERVER}/api/users/userProductList/${productCode}`, {
                method: 'get',
                headers: {
                    authorization: state.user.data.token
                }
            })
            
            if(!response.ok) {
                throw response
            }

            const content = await response.json()
            this.emitter.emit("PRODUCT_CHECK_IN_USER_LIST_SUCCESS")
            if (content.message === 'exists') {
                return true 
            } else {
                return false
            }
        } catch (err) {
            console.warn(err)
            this.emitter.emit("PRODUCT_CHECK_IN_USER_LIST_FAIL")
        }
    }

    async fetchFavoriteProducts(state) {
        try {
            const response = await fetch(`${SERVER}/api/users/userProductList`, {
                method: 'get',
                headers: {
                    authorization: state.user.data.token
                }
            });

            if(!response.ok) {
                throw response;
            }

            const content = await response.json();            
            this.data = content.data;
            this.emitter.emit("PRODUCT_FETCH_FAVORITES_SUCCESS");
        } catch (err) {
            console.warn(this.data);
            console.warn(err);
            this.emitter.emit("PRODUCT_FETCH_FAVORITES_FAIL");
        }
    }

    async addProductToMailingList(state, pcode) {
        try {
            const response = await fetch(`${SERVER}/api/users/userProductList/mailing/${pcode}`, {
                method: 'post',
                headers: {
                    authorization: state.user.data.token
                }
            });

            if(!response.ok) {
                throw response;
            }

            const content = await response.json()
            this.emitter.emit("PRODUCT_ADD_TO_MAILING_LIST_SUCCESS")
        } catch (err) {
            console.warn(err)
            this.emitter.emit("PRODUCT_ADD_TO_MAILING_LIST_FAIL")
        }
    }

    async removeProductFromMailingList(state, pcode) {
        try {
            const response = await fetch(`${SERVER}/api/users/userProductList/mailing/${pcode}`, {
                method: 'delete',
                headers: {
                    authorization: state.user.data.token
                }
            });

            if(!response.ok) {
                throw response;
            }

            const content = await response.json()
            this.emitter.emit("PRODUCT_ADD_TO_MAILING_LIST_SUCCESS")
        } catch (err) {
            console.warn(err)
            this.emitter.emit("PRODUCT_ADD_TO_MAILING_LIST_FAIL")
        }
    }
    
}

export default ProductStore;