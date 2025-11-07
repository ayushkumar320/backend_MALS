import jwt from 'jsonwebtoken';
import Admin from '../models/admin.js';
import dotenv from 'dotenv';
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
export const adminAuthentication = async (req, res, next) => {
  try {
    const token = req.header('Authorization').split(' ')[1];
    const decoded = jwt.verify(token, jwtSecret);
    const admin = await Admin.findOne({_id: decoded._id});
    if (!admin) {
      throw new Error('Admin not found');
    }
    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({error: 'Unauthorized Access'});
  }
};
