import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Admin from '../models/admin.js';
import Course from '../models/course.js';
import Teacher from '../models/teacher.js';
import Student from '../models/student.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

const normalizeAdminResponse = (admin) => ({
  id: admin._id,
  username: admin.username,
  college: admin.college || null,
});

const generateToken = (adminId) =>
  jwt.sign({_id: adminId}, JWT_SECRET, {
    expiresIn: '24h',
  });

export const registerAdmin = async (req, res) => {
  try {
    const {username, password} = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({message: 'Username and password are required'});
    }

    const existingAdmin = await Admin.findOne({username});
    if (existingAdmin) {
      return res
        .status(409)
        .json({message: 'Admin with this username already exists'});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      username,
      password: hashedPassword,
    });

    const token = generateToken(admin._id);

    return res.status(201).json({
      message: 'Admin registered successfully',
      token,
      admin: normalizeAdminResponse(admin),
    });
  } catch (error) {
    console.error('Error registering admin:', error);
    return res.status(500).json({message: 'Failed to register admin'});
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const {username, password} = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({message: 'Username and password are required'});
    }

    const admin = await Admin.findOne({username});
    if (!admin) {
      return res.status(401).json({message: 'Invalid credentials'});
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({message: 'Invalid credentials'});
    }

    const token = generateToken(admin._id);

    return res.status(200).json({
      message: 'Login successful',
      token,
      admin: normalizeAdminResponse(admin),
    });
  } catch (error) {
    console.error('Error logging in admin:', error);
    return res.status(500).json({message: 'Failed to login admin'});
  }
};

export const createCourse = async (req, res) => {
  try {
    const {courseName, courseCode, description, credits, instructor} = req.body;

    if (!courseName || !courseCode || !description || !credits || !instructor) {
      return res.status(400).json({message: 'All course fields are required'});
    }

    if (typeof credits !== 'number' || credits <= 0) {
      return res
        .status(400)
        .json({message: 'Credits must be a positive number'});
    }

    const teacherExists = await Teacher.findById(instructor);
    if (!teacherExists) {
      return res.status(404).json({message: 'Instructor not found'});
    }

    const course = await Course.create({
      courseName,
      courseCode,
      description,
      credits,
      instructor,
    });

    return res.status(201).json({
      message: 'Course created successfully',
      course,
    });
  } catch (error) {
    console.error('Error creating course:', error);
    return res.status(500).json({message: 'Failed to create course'});
  }
};


export const getAdminProfile = async (req, res) => {
  try {
    const {adminId} = req.params;

    const admin = await Admin.findById(adminId)
      .select('-password')
      .populate('college.coursesOffered', 'courseName courseCode credits');

    if (!admin) {
      return res.status(404).json({message: 'Admin not found'});
    }

    return res.status(200).json({admin});
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return res.status(500).json({message: 'Failed to fetch admin profile'});
  }
};

export const getStudentFeedbacks = async (_req, res) => {
  try {
    const studentsWithFeedback = await Student.find({
      feedback: {$exists: true, $ne: null, $ne: ''},
    })
      .select('username feedback')
      .lean();

    return res.status(200).json({
      feedbacks: studentsWithFeedback.map((student) => ({
        studentId: student._id,
        studentName: student.username,
        feedback: student.feedback,
      })),
    });
  } catch (error) {
    console.error('Error fetching student feedbacks:', error);
    return res.status(500).json({message: 'Failed to fetch student feedbacks'});
  }
};

export const registerCollege = async (req, res) => {
  try {
    const {adminId} = req.params;
    const {
      collegeUniqueId,
      coursesOffered,
      programsOffered,
      classroomOccupancy,
      labOccupancy,
    } = req.body;

    if (!collegeUniqueId) {
      return res
        .status(400)
        .json({message: 'College unique ID is required'});
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({message: 'Admin not found'});
    }

    if (admin.college && admin.college.collegeUniqueId) {
      const existingAdmin = await Admin.findOne({
        'college.collegeUniqueId': collegeUniqueId,
        _id: {$ne: adminId},
      });
      if (existingAdmin) {
        return res
          .status(409)
          .json({message: 'College with this unique ID already exists'});
      }
    }

    if (coursesOffered && Array.isArray(coursesOffered)) {
      const validCourses = await Course.find({
        _id: {$in: coursesOffered},
      });
      if (validCourses.length !== coursesOffered.length) {
        return res
          .status(400)
          .json({message: 'One or more course IDs are invalid'});
      }
    }

    if (
      classroomOccupancy !== undefined &&
      (typeof classroomOccupancy !== 'number' || classroomOccupancy < 0)
    ) {
      return res
        .status(400)
        .json({message: 'Classroom occupancy must be a non-negative number'});
    }

    if (
      labOccupancy !== undefined &&
      (typeof labOccupancy !== 'number' || labOccupancy < 0)
    ) {
      return res
        .status(400)
        .json({message: 'Lab occupancy must be a non-negative number'});
    }

    const updateData = {
      'college.collegeUniqueId': collegeUniqueId,
      ...(coursesOffered && {'college.coursesOffered': coursesOffered}),
      ...(programsOffered && {'college.programsOffered': programsOffered}),
      ...(classroomOccupancy !== undefined && {
        'college.classroomOccupancy': classroomOccupancy,
      }),
      ...(labOccupancy !== undefined && {'college.labOccupancy': labOccupancy}),
    };

    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      {$set: updateData},
      {new: true, runValidators: true}
    )
      .select('-password')
      .populate('college.coursesOffered', 'courseName courseCode credits');

    return res.status(200).json({
      message: 'College registered/updated successfully',
      admin: updatedAdmin,
    });
  } catch (error) {
    console.error('Error registering college:', error);
    if (error.code === 11000) {
      return res
        .status(409)
        .json({message: 'College with this unique ID already exists'});
    }
    return res.status(500).json({message: 'Failed to register college'});
  }
};
