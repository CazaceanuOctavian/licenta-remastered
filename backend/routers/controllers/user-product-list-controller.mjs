import models from '../../models/index.mjs'

const saveProductToUserList = async (req, res, next) => {
    try {
        const product = await models.Product.findOne({
            product_code : req.params.pcode
        })

        if(!product) {
            return res.status(404).json({message : 'Product not found'})
        } 

        const productAlreadySaved = req.user.savedProducts.some(savedProduct => 
            savedProduct.product_code && 
            savedProduct.product_code.toString() === product.product_code.toString()
        );

        if (productAlreadySaved) {
            return res.status(400).json({
                message: 'Product already in saved list'
            });
        }

        // Push an object with product_code and email_notification fields
        req.user.savedProducts.push({
            product_code: product.product_code,
            email_notification: false
        })

        await req.user.save()

        return res.status(200).json({
            message: 'Product added to saved list',
            product: product
        });

    } catch (err) {
        next(err)
    }
}

const getUserListProducts = async (req, res, next) => {
    try {
        if (!req.user.savedProducts || req.user.savedProducts.length === 0) {
            return res.status(200).json({
                products: []
            });
        }

        const userProductCodes = req.user.savedProducts.map(product => product.product_code);
    
        const savedProducts = await models.Product.find({
            product_code: { $in: userProductCodes }
        });

        return res.status(200).json({
            data: savedProducts
        });
    } catch (err) {
        next(err);
    }
}

const deleteProductFromUserList = async (req, res, next) => {
    try {
        const productCode = req.params.pcode;
        
        if (!productCode) {
            return res.status(400).json({ message: 'Product code is required' });
        }

        // Extract product codes from the user's saved products
        const userProductCodes = req.user.savedProducts.map(product => product.product_code);

        // Check if the product is in the user's saved list
        const productInUserList = userProductCodes.some(savedProductCode => 
            // Compare strings directly instead of using toString()
            savedProductCode === productCode
        );

        if (!productInUserList) {
            return res.status(400).json({ message: 'Product not in user list' });
        }

        // Filter out the product with the matching product_code
        req.user.savedProducts = req.user.savedProducts.filter(product => 
            product.product_code !== productCode
        );

        // Save the updated user document
        await req.user.save();

        return res.status(200).json({ 
            message: 'Product removed from saved list',
            productCode: productCode
        });
    } catch (err) {
        next(err);
    }
}

const checkProductInUserList = async (req, res, next) => {
    try {
        const productCode = req.params.pcode;
        
        if(!productCode) {
            return res.status(400).json({message: 'Product code is required'})
        }

        const userProductCodes = req.user.savedProducts.map(product => product.product_code);

        const productInUserList = userProductCodes.some(savedProductCode => 
            savedProductCode.toString() === productCode.toString()
        );

        if (!productInUserList) {
            return res.status(200).json({message: 'not_exists'})
        }

        return res.status(200).json({message: 'exists'})
    } catch (err) {
        next(err)
    }
}

const updateMailNotificationState = async (req, res, next) => {
    try {
        const productCode = req.params.pcode;

        if (!productCode) {
            return res.status(400).json({ message: 'Product code is required' });
        }

        const userProductCodes = req.user.savedProducts.map(product => product.product_code);

        const productInUserList = userProductCodes.some(savedProductCode => 
            savedProductCode.toString() === productCode.toString()
        );
        
        if (!productInUserList) {
            return res.status(404).json({ message: 'Product is not in user list' });
        }

        const productIndex = req.user.savedProducts.findIndex(product => 
            product.product_code.toString() === productCode.toString()
        );

        // Update the email_notification to true
        req.user.savedProducts[productIndex].email_notification = true;

        // Save the updated user
        await req.user.save();

        return res.status(200).json({
            message: 'Notification preference updated successfully',
            product: req.user.savedProducts[productIndex]
        });

    } catch (err) {
        next(err);
    }
};

export default {
    saveProductToUserList,
    getUserListProducts,
    deleteProductFromUserList,
    checkProductInUserList,
    updateMailNotificationState
}