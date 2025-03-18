import models from '../models/index.mjs';

export default async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: Missing token' });
    }
    
    const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
  
    const user = await models.User.findOne({ token: cleanToken });
    
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    
    req.user = user;
    
    next();
  } catch (err) {
    next(err);
  }
};