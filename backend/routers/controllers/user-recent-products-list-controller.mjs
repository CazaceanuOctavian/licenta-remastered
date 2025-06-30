import models from '../../models/index.mjs'

// In your backend API file

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

        const MAX_RECENT_PRODUCTS = 30;

        await models.User.updateOne(
            { _id: req.user._id },
            [
                {
                    $set: {
                        // Step 1: Remove all existing occurrences of the product
                        recentProducts: {
                            $filter: {
                                input: "$recentProducts",
                                as: "item",
                                cond: { $ne: ["$$item.product_code", productCode] }
                            }
                        }
                    }
                },
                {
                    $set: {
                        // Step 2: Add the product to the beginning and slice the array
                        recentProducts: {
                            $slice: [
                                {
                                    $concatArrays: [
                                        [{ product_code: productCode }],
                                        "$recentProducts"
                                    ]
                                },
                                MAX_RECENT_PRODUCTS
                            ]
                        }
                    }
                }
            ]
        );

        return res.status(200).json({
            message: 'Product added to recent products',
            product: product // You can keep returning the product if the frontend uses it
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