import express from 'express'
import controllers from './controllers/index.mjs'
import middleware from '../middleware/index.mjs'

const apiRouter = express.Router()

//PRODUCTS
apiRouter.get('/products', controllers.product.getAllProductsFiltered)

//USERS
apiRouter.get('/users', 
            middleware.authMiddleware, 
            middleware.permMiddleware('admin'), 
            controllers.user.fetchAllUsers)

apiRouter.post('/users/userProductList/:pcode', middleware.authMiddleware, controllers.userList.saveProductToUserList)

export default apiRouter
