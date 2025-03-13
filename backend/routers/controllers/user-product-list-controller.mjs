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
            savedProductCode.equals(product.product_code)
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

export default {
    saveProductToUserList
}