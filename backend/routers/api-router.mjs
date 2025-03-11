import express from 'express'
import controllers from './controllers/index.mjs'

const apiRouter = express.Router()

apiRouter.get('/products', controllers.product.getAllProducts)


export default apiRouter
