import models from '../../models/index.mjs'

const insertIntoRecentProducts = async (req, res, next) => {
    try {
        const productCode = req.params.pcode;

        if (!productCode) {
            return res.status(400).json({ message: 'Product code is required' });
        }

        // Check if product exists in the database
        const product = await models.Product.findOne({
            product_code: productCode
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Maximum number of recent products to store
        const MAX_RECENT_PRODUCTS = 30;

        // Initialize recentProducts array if it doesn't exist
        if (!req.user.recentProducts) {
            req.user.recentProducts = [];
        }

        // Check if product is already in recent products
        const existingIndex = req.user.recentProducts.findIndex(
            recentProduct => recentProduct.product_code === productCode
        );

        // If product exists in the list, remove it
        if (existingIndex !== -1) {
            req.user.recentProducts.splice(existingIndex, 1);
        }

        // Add product to the beginning of the array with the correct schema structure
        req.user.recentProducts.unshift({
            product_code: productCode
        });

        // Trim the array if it exceeds the maximum size
        if (req.user.recentProducts.length > MAX_RECENT_PRODUCTS) {
            req.user.recentProducts = req.user.recentProducts.slice(0, MAX_RECENT_PRODUCTS);
        }

        // Save the updated user
        await req.user.save();

        return res.status(200).json({
            message: 'Product added to recent products',
            product: product
        });
    } catch (err) {
        next(err);
    }
};

const getRecentProducts = async (req, res, next) => {
    try {
        if (!req.user.recentProducts || req.user.recentProducts.length === 0) {
            return res.status(200).json({
                data: []
            });
        }

        const userProductCodes = req.user.recentProducts.map(product => product.product_code);
    
        // Get products from database
        const recentProducts = await models.Product.find({
            product_code: { $in: userProductCodes }
        });

        // Create a map for quick lookup to maintain the order
        const productMap = {};
        recentProducts.forEach(product => {
            productMap[product.product_code] = product;
        });

        // Reconstruct array in the same order as recentProducts
        const orderedProducts = userProductCodes
            .map(code => productMap[code])
            .filter(product => product !== undefined); // Filter out any products that might not have been found

        return res.status(200).json({
            data: orderedProducts
        });
    } catch (err) {
        next(err);
    }
};

const clearRecentProducts = async (req, res, next) => {
    try {
        // Reset the recentProducts array
        req.user.recentProducts = [];

        // Save the updated user
        await req.user.save();

        return res.status(200).json({
            message: 'Recent products list cleared successfully'
        });
    } catch (err) {
        next(err);
    }
};

const removeProductFromRecentList = async (req, res, next) => {
    try {
        const productCode = req.params.pcode;
        
        if (!productCode) {
            return res.status(400).json({ message: 'Product code is required' });
        }

        // Check if the product is in the user's recent list
        const productIndex = req.user.recentProducts.findIndex(
            product => product.product_code === productCode
        );

        if (productIndex === -1) {
            return res.status(400).json({ message: 'Product not in recent list' });
        }

        // Remove the product from the recentProducts array
        req.user.recentProducts.splice(productIndex, 1);

        // Save the updated user document
        await req.user.save();

        return res.status(200).json({ 
            message: 'Product removed from recent list',
            productCode: productCode
        });
    } catch (err) {
        next(err);
    }
};

const checkProductInRecentList = async (req, res, next) => {
    try {
        const productCode = req.params.pcode;
        
        if (!productCode) {
            return res.status(400).json({ message: 'Product code is required' });
        }

        const productInRecentList = req.user.recentProducts && req.user.recentProducts.some(
            product => product.product_code === productCode
        );

        if (!productInRecentList) {
            return res.status(200).json({ message: 'not_exists' });
        }

        return res.status(200).json({ message: 'exists' });
    } catch (err) {
        next(err);
    }
};

export default {
    insertIntoRecentProducts,
    getRecentProducts,
    clearRecentProducts,
    removeProductFromRecentList,
    checkProductInRecentList
}