import jwt from 'jsonwebtoken';
import Student from '../models/student.js';
import dotenv from 'dotenv';
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
export const studentAuthentication = async (req, res, next) => {
  try {
    const token = req.header('Authorization').split(' ')[1];
    const decoded = jwt.verify(token, jwtSecret);
    const student = await Student.findOne({_id: decoded._id});
    if (!student) {
      throw new Error('Student not found');
    }
    req.student = student;
    next();
  } catch (error) {
    res.status(401).json({error: 'Unauthorized Access'});
  }
};
