import jwt from 'jsonwebtoken';
import Teacher from '../models/teacher.js';
import dotenv from 'dotenv';
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
export const teacherAuthentication = async (req, res, next) => {
  try {
    const token = req.header('Authorization').split(' ')[1];
    const decoded = jwt.verify(token, jwtSecret);
    const teacher = await Teacher.findOne({_id: decoded._id});
    if (!teacher) {
      throw new Error('Teacher not found');
    }
    req.teacher = teacher;
    next();
  } catch (error) {
    res.status(401).json({error: 'Unauthorized Access'});
  }
};
