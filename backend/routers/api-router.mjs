import express from 'express'
import controllers from './controllers/index.mjs'
import middleware from '../middleware/index.mjs'

const apiRouter = express.Router()

//PRODUCTS
apiRouter.get('/products', controllers.product.getAllProductsFiltered)
apiRouter.get('/products/views', controllers.product.getProductsByViews)
//PRODUCTS VIEWS & IMPRESSIONS
apiRouter.put('/products/:pid/views', controllers.product.incrementProductViews)
apiRouter.put('/products/:pid/impressions', controllers.product.incrementProductImpressions)
//USER PRODUCT LIST
apiRouter.post('/users/userProductList/:pcode', middleware.authMiddleware, controllers.userList.saveProductToUserList)
apiRouter.delete('/users/userProductList/:pcode', middleware.authMiddleware, controllers.userList.deleteProductFromUserList)
apiRouter.get('/users/userProductList', middleware.authMiddleware, controllers.userList.getUserListProducts)
apiRouter.get('/users/userProductList/:pcode', middleware.authMiddleware, controllers.userList.checkProductInUserList)
//USER PRODUCT LIST --> MAIL NOTIFICATION SERVICE 
apiRouter.post('/users/userProductList/mailing/:pcode', middleware.authMiddleware, controllers.userList.addProcutToNotificationService)
apiRouter.delete('/users/userProductList/mailing/:pcode', middleware.authMiddleware, controllers.userList.removeProductFromNotificationService)
//USER RECENTS LIST 
apiRouter.post('/users/recentProductList/:pcode', middleware.authMiddleware, controllers.userRecentProductList.insertIntoRecentProducts)
apiRouter.get('/users/recentProductList', middleware.authMiddleware, controllers.userRecentProductList.getRecentProducts)
//USERS
apiRouter.get('/users', 
            middleware.authMiddleware, 
            middleware.permMiddleware('admin'), 
            controllers.user.fetchAllUsers)


export default apiRouter
