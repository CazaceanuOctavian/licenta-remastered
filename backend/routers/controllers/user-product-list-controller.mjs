import models from '../../models/index.mjs'

const saveProductToUserList = async (req, res, next) => {
    try {
        const product = await models.Product.findOne({
            product_code : req.params.pcode
        })

        if(!product) {
            return res.status(404).json({message : 'Product not found'})
        } 

        const productAlreadySaved = req.user.savedProducts.some(savedProductCode => 
            savedProductCode.toString() === product.product_code.toString()
        );

        if (productAlreadySaved) {
            return res.status(400).json({
                message: 'Product already in saved list'
            });
        }

        req.user.savedProducts.push(product.product_code)

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

        const savedProducts = await models.Product.find({
            product_code: { $in: req.user.savedProducts }
        });

        return res.status(200).json({
            products: savedProducts
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

        const productInUserList = req.user.savedProducts.some(savedProductCode => 
            savedProductCode.toString() === productCode.toString()
        );

        if (!productInUserList) {
            return res.status(400).json({ message: 'Product not in user list' });
        }

        req.user.savedProducts = req.user.savedProducts.filter(savedProductCode => 
            savedProductCode.toString() !== productCode.toString()
        );

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

        const productInUserList = req.user.savedProducts.some(savedProductCode => 
            savedProductCode.toString() === productCode.toString()
        );

        if (!productInUserList) {
            return res.status(404).json({message: 'Product does not exist'})
        }

        return res.status(200).json({message: 'Product exists'})
    } catch (err) {
        next(err)
    }
}

export default {
    saveProductToUserList,
    getUserListProducts,
    deleteProductFromUserList,
    checkProductInUserList
}