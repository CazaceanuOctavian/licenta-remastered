import express from 'express'
import controllers from './controllers/index.mjs'
import middleware from '../middleware/index.mjs'

const apiRouter = express.Router()

//PRODUCTS
apiRouter.get('/products', controllers.product.getAllProductsFiltered)

//USER PRODUCT LIST
apiRouter.post('/users/userProductList/:pcode', middleware.authMiddleware, controllers.userList.saveProductToUserList)
apiRouter.delete('/users/userProductList/:pcode', middleware.authMiddleware, controllers.userList.deleteProductFromUserList)
apiRouter.get('/users/userProductList', middleware.authMiddleware, controllers.userList.getUserListProducts)
apiRouter.get('/users/userProductList/:pcode', middleware.authMiddleware, controllers.userList.checkProductInUserList)
//USER PRODUCT LIST --> MAIL NOTIFICATION SERVICE 
apiRouter.post('/users/userProductList/mailing/:pcode', middleware.authMiddleware, controllers.userList.addProcutToNotificationService)
apiRouter.delete('/users/userProductList/mailing/:pcode', middleware.authMiddleware, controllers.userList.removeProductFromNotificationService)

//USERS
apiRouter.get('/users', 
            middleware.authMiddleware, 
            middleware.permMiddleware('admin'), 
            controllers.user.fetchAllUsers)


export default apiRouter
