import EventEmitter from "../../utils/EventEmitter";
import { SERVER } from "../../config/global";

class ProductStore {
    constructor() {
        this.data = []
        this.recommendedData = [] // Add for recommended products
        this.topCategoryData = [] // Add for most viewed category products
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

    //PRODUCT VIEWS & IMPRESSIONS SECTION

    async incrementProductViews(productId) {
        try {
          const response = await fetch(`${SERVER}/api/products/${productId}/views`, {
            method: 'PUT'
          });
          
          if (!response.ok) {
            throw response;
          }
          
          const content = await response.json();
          this.emitter.emit('PRODUCT_INCREMENT_VIEWS_SUCCESS', content);
          return content.views;
        } catch (err) {
          console.warn(err);
          this.emitter.emit('PRODUCT_INCREMENT_VIEWS_ERROR');
          throw err;
        }
      }
      
      async incrementProductImpressions(productId) {
        try {
          const response = await fetch(`${SERVER}/api/products/${productId}/impressions`, {
            method: 'PUT'
          });
          
          if (!response.ok) {
            throw response;
          }
          
          const content = await response.json();
          this.emitter.emit('PRODUCT_INCREMENT_IMPRESSIONS_SUCCESS', content);
          return content.impressions;
        } catch (err) {
          console.warn(err);
          this.emitter.emit('PRODUCT_INCREMENT_IMPRESSIONS_ERROR');
          throw err;
        }
      }


    //RECENT PRODUCTS LIST FUNCTIONS
    // Add these new methods to your ProductStore class

    async addProductToRecentList(state, productCode) {
        try {
            const response = await fetch(`${SERVER}/api/users/recentProductList/${productCode}`, {
                method: 'post',
                headers: {
                    authorization: state.user.data.token
                }
            });
            
            if(!response.ok) {
                throw response;
            }

            const content = await response.json();
            this.emitter.emit("PRODUCT_ADD_TO_RECENT_LIST_SUCCESS");
        } catch (err) {
            console.warn(err);
            this.emitter.emit('PRODUCT_ADD_TO_RECENT_LIST_FAIL');
        }
    }

    async fetchRecentProducts(state) {
        try {
            const response = await fetch(`${SERVER}/api/users/recentProductList`, {
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
            this.emitter.emit("PRODUCT_FETCH_RECENT_SUCCESS");
        } catch (err) {
            console.warn(err);
            this.emitter.emit("PRODUCT_FETCH_RECENT_FAIL");
        }
    }
    
    // RECOMMENDATION FUNCTIONS
    // Helper function to extract manufacturer from a product
    extractManufacturer(product) {
        // Use the manufacturer field directly if available
        if (product.manufacturer) {
            return product.manufacturer;
        }
        
        // If no manufacturer found, check specifications
        const specifications = product.specifications || {};
        const manufacturerKeys = ['manufacturer', 'brand', 'producer', 'make'];
        
        // Try to find manufacturer-related fields in specifications
        for (const key of manufacturerKeys) {
            if (specifications[key]) {
                return specifications[key];
            }
        }
        
        // If still no manufacturer found, use a default
        return 'Unknown Manufacturer';
    }

    // Helper function to calculate price statistics
    calculatePriceStats(products) {
        if (!products.length) return { mean: 0, min: 0, max: 0 };
        
        const prices = products.map(p => parseFloat(p.price || 0)).filter(price => !isNaN(price));
        
        if (!prices.length) return { mean: 0, min: 0, max: 0 };
        
        const sum = prices.reduce((acc, price) => acc + price, 0);
        const mean = sum / prices.length;
        
        return {
            mean,
            min: mean * 0.85, // 15% below mean
            max: mean * 1.15  // 15% above mean
        };
    }

    async fetchManufacturerRecommendations(state, manufacturer, minPrice, maxPrice, count) {
        try {
            const response = await fetch(
                `${SERVER}/api/products?manufacturer=${encodeURIComponent(manufacturer)}&minPrice=${minPrice.toFixed(2)}&maxPrice=${maxPrice.toFixed(2)}&pageSize=${count * 2}&pageNumber=0`,
                {
                    method: 'get',
                    headers: state.user.data.token ? {
                        authorization: state.user.data.token
                    } : {}
                }
            );
            
            if (!response.ok) {
                throw response;
            }
            
            const content = await response.json();
            
            if (!content.data || !Array.isArray(content.data)) {
                console.error('Invalid response format:', content);
                return [];
            }
            
            return content.data.slice(0, count);
        } catch (err) {
            console.warn(`Error fetching recommendations for manufacturer ${manufacturer}:`, err);
            return [];
        }
    }

    async generateRecommendations(state, recentProducts) {
        if (!recentProducts || !recentProducts.length) {
            this.recommendedData = [];
            this.emitter.emit('PRODUCT_RECOMMENDATIONS_FAIL');
            return;
        }
        
        try {
            // Step 1: Analyze manufacturers and their distribution
            const manufacturerMap = {};
            const manufacturerProducts = {};
            
            // Group products by manufacturer and count them
            recentProducts.forEach(product => {
                const manufacturer = this.extractManufacturer(product);
                
                if (!manufacturerMap[manufacturer]) {
                    manufacturerMap[manufacturer] = 0;
                    manufacturerProducts[manufacturer] = [];
                }
                
                manufacturerMap[manufacturer]++;
                manufacturerProducts[manufacturer].push(product);
            });
            
            // Calculate total count and percentages
            const totalCount = recentProducts.length;
            const manufacturerDistribution = Object.keys(manufacturerMap).map(manufacturer => ({
                manufacturer,
                count: manufacturerMap[manufacturer],
                percentage: (manufacturerMap[manufacturer] / totalCount) * 100,
                products: manufacturerProducts[manufacturer]
            }));
            
            console.log('Manufacturer distribution:', manufacturerDistribution);
            
            // Find the top manufacturer (most viewed)
            const topManufacturer = manufacturerDistribution.sort((a, b) => b.count - a.count)[0];
            console.log('Top manufacturer:', topManufacturer);
            
            // Generate products for the top manufacturer in parallel with recommendations
            this.generateTopManufacturerProducts(state, topManufacturer, recentProducts);
            
            // Step 2: Calculate how many products to recommend from each manufacturer (max 30 total)
            const MAX_RECOMMENDATIONS = 30;
            const recommendationsPerManufacturer = manufacturerDistribution.map(manufacturerInfo => ({
                ...manufacturerInfo,
                toRecommend: Math.round((manufacturerInfo.percentage / 100) * MAX_RECOMMENDATIONS)
            }));
            
            console.log('Recommendations per manufacturer:', recommendationsPerManufacturer);
            
            // Step 3: Fetch recommended products for each manufacturer
            const allRecommendations = [];
            
            for (const manufacturerInfo of recommendationsPerManufacturer) {
                if (manufacturerInfo.toRecommend <= 0) continue;
                
                // Calculate price range for this manufacturer
                const priceStats = this.calculatePriceStats(manufacturerInfo.products);
                console.log(`Price stats for ${manufacturerInfo.manufacturer}:`, priceStats);
                
                // Fetch products for this manufacturer with the price range
                const manufacturerProducts = await this.fetchManufacturerRecommendations(
                    state,
                    manufacturerInfo.manufacturer,
                    priceStats.min,
                    priceStats.max,
                    manufacturerInfo.toRecommend
                );
                
                // Filter out products that are already in recent products
                const recentProductIds = new Set(recentProducts.map(p => p.id || p._id));
                const filteredManufacturerProducts = manufacturerProducts.filter(
                    p => !recentProductIds.has(p.id || p._id)
                );
                
                allRecommendations.push(...filteredManufacturerProducts);
            }
            
            // Shuffle the recommendations for variety
            const shuffledRecommendations = [...allRecommendations];
            for (let i = shuffledRecommendations.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledRecommendations[i], shuffledRecommendations[j]] = 
                [shuffledRecommendations[j], shuffledRecommendations[i]];
            }
            
            // Limit to MAX_RECOMMENDATIONS
            this.recommendedData = shuffledRecommendations.slice(0, MAX_RECOMMENDATIONS);
            this.emitter.emit('PRODUCT_RECOMMENDATIONS_SUCCESS');
            
        } catch (err) {
            console.warn('Error generating recommendations:', err);
            this.emitter.emit('PRODUCT_RECOMMENDATIONS_FAIL');
        }
    }
    
    async generateTopManufacturerProducts(state, topManufacturer, recentProducts) {
        if (!topManufacturer) {
            this.topCategoryData = [];
            this.emitter.emit('PRODUCT_TOP_CATEGORY_FAIL');
            return;
        }
        
        try {
            console.log(`Generating products for top manufacturer: ${topManufacturer.manufacturer}`);
            
            // Calculate price range based on all products in this manufacturer
            const priceStats = this.calculatePriceStats(topManufacturer.products);
            
            // We want exactly 30 products from this manufacturer
            const MAX_PRODUCTS = 30;
            
            // Fetch products from this manufacturer with a wider price range (±25% instead of 15%)
            // This helps ensure we get enough products to fill the carousel
            const widerPriceMin = priceStats.mean * 0.75;
            const widerPriceMax = priceStats.mean * 1.25;
            
            // Fetch more products than needed to account for filtering
            const manufacturerProducts = await this.fetchManufacturerRecommendations(
                state,
                topManufacturer.manufacturer,
                widerPriceMin,
                widerPriceMax,
                MAX_PRODUCTS * 2
            );
            
            // Filter out products that are already in recent products
            const recentProductIds = new Set(recentProducts.map(p => p.id || p._id));
            const filteredManufacturerProducts = manufacturerProducts.filter(
                p => !recentProductIds.has(p.id || p._id)
            );
            
            // Sort by price (closest to the mean price first)
            const sortedProducts = filteredManufacturerProducts.sort((a, b) => {
                const priceA = parseFloat(a.price || 0);
                const priceB = parseFloat(b.price || 0);
                const diffA = Math.abs(priceA - priceStats.mean);
                const diffB = Math.abs(priceB - priceStats.mean);
                return diffA - diffB;
            });
            
            // Take the first MAX_PRODUCTS
            this.topCategoryData = sortedProducts.slice(0, MAX_PRODUCTS);
            
            console.log(`Found ${this.topCategoryData.length} products for top manufacturer: ${topManufacturer.manufacturer}`);
            
            // Emit event for top manufacturer products
            this.emitter.emit('PRODUCT_TOP_CATEGORY_SUCCESS');
            
        } catch (err) {
            console.warn('Error generating top manufacturer products:', err);
            this.emitter.emit('PRODUCT_TOP_CATEGORY_FAIL');
        }
    }
}

export default ProductStore;