import models from '../models/index.mjs'

export default async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    const user = await models.User.findOne({
      where: {
        token: req.headers.authorization
      }
    })
    req.user = user
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}
