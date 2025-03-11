import models from "../../models/index.mjs"

const getAllProducts = async (req, res, next) => {
    try {
        const products = await models.Product.find()

        if (products) {
            return res.status(200).json({
                products
            })
        }
    } catch (err) {
      next(err)
    }
  }

export default {
    getAllProducts
}