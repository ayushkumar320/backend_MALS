import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Teacher from '../models/teacher.js';
import Course from '../models/course.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

const normalizeTeacherResponse = (teacher) => ({
  id: teacher._id,
  username: teacher.username,
  name: teacher.name,
  experience: teacher.experience,
  department: teacher.department,
  workingHour: teacher.workingHour,
});

const generateToken = (teacherId) =>
  jwt.sign({ _id: teacherId }, JWT_SECRET, {
    expiresIn: '24h',
  });

export const registerTeacher = async (req, res) => {
  try {
    const { username, password, name, experience, department, workingHour } = req.body;

    if (!username || !password || !name || experience === undefined || !department || workingHour === undefined) {
      return res.status(400).json({ message: 'All required teacher fields must be provided' });
    }

    const existingTeacher = await Teacher.findOne({ username });
    if (existingTeacher) {
      return res.status(409).json({ message: 'Teacher with this username already exists' });
    }

    if (typeof experience !== 'number' || experience < 0) {
      return res.status(400).json({ message: 'Experience must be a non-negative number' });
    }

    if (typeof workingHour !== 'number' || workingHour <= 0) {
      return res.status(400).json({ message: 'Working hour must be a positive number' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await Teacher.create({
      username,
      password: hashedPassword,
      name,
      experience,
      department,
      workingHour,
    });

    const token = generateToken(teacher._id);

    return res.status(201).json({
      message: 'Teacher registered successfully',
      token,
      teacher: normalizeTeacherResponse(teacher),
    });
  } catch (error) {
    console.error('Error registering teacher:', error);
    return res.status(500).json({ message: 'Failed to register teacher' });
  }
};

export const loginTeacher = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const teacher = await Teacher.findOne({ username });
    if (!teacher) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, teacher.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(teacher._id);

    return res.status(200).json({
      message: 'Login successful',
      token,
      teacher: normalizeTeacherResponse(teacher),
    });
  } catch (error) {
    console.error('Error logging in teacher:', error);
    return res.status(500).json({ message: 'Failed to login teacher' });
  }
};

export const getTeacherProfile = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await Teacher.findById(teacherId).select('-password');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    return res.status(200).json({ teacher });
  } catch (error) {
    console.error('Error fetching teacher profile:', error);
    return res.status(500).json({ message: 'Failed to fetch teacher profile' });
  }
};

export const updateTeacherProfile = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { username, password, name, experience, department, workingHour } = req.body;

    const updatePayload = {};

    if (username) {
      const usernameExists = await Teacher.findOne({ username, _id: { $ne: teacherId } });
      if (usernameExists) {
        return res.status(409).json({ message: 'Username already in use' });
      }
      updatePayload.username = username;
    }

    if (password) {
      updatePayload.password = await bcrypt.hash(password, 10);
    }

    if (name) {
      updatePayload.name = name;
    }

    if (experience !== undefined) {
      if (typeof experience !== 'number' || experience < 0) {
        return res.status(400).json({ message: 'Experience must be a non-negative number' });
      }
      updatePayload.experience = experience;
    }

    if (department) {
      updatePayload.department = department;
    }

    if (workingHour !== undefined) {
      if (typeof workingHour !== 'number' || workingHour <= 0) {
        return res.status(400).json({ message: 'Working hour must be a positive number' });
      }
      updatePayload.workingHour = workingHour;
    }

    const teacher = await Teacher.findByIdAndUpdate(teacherId, updatePayload, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    return res.status(200).json({
      message: 'Teacher profile updated successfully',
      teacher,
    });
  } catch (error) {
    console.error('Error updating teacher profile:', error);
    return res.status(500).json({ message: 'Failed to update teacher profile' });
  }
};

export const getTeacherCourses = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const courses = await Course.find({ instructor: teacherId }).populate('instructor', 'username name');

    return res.status(200).json({ courses });
  } catch (error) {
    console.error('Error fetching teacher courses:', error);
    return res.status(500).json({ message: 'Failed to fetch teacher courses' });
  }
};
