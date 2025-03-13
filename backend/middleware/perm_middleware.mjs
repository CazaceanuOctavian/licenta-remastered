import models from '../models/index.mjs';

export default (userType) => {
    return async (req, res, next) => {
      if (req.user.type === userType) {
        next()
      } else {
        res.status(401).json({message : "Forbidden: user does not have necessary permissions"})
      }
    }  
  }