import models from '../../models/index.mjs'

const fetchAllUsers = async(req, res, next) => {
    try {
      const user = await models.User.find()
      
      res.status(200).json({
        user
      })
    } catch (err) {
      next(err)
    }
  }

export default {
    fetchAllUsers
}