import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Student from '../models/student.js';
import SelectedCourse from '../models/selectedcourse.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

const normalizeStudentResponse = (student) => ({
  id: student._id,
  username: student.username,
  age: student.age,
  gender: student.gender,
  program: student.Program,
  feedback: student.feedback ?? null,
  selectedCourses: student.selectedCourses ?? [],
});

const generateToken = (studentId) =>
  jwt.sign({ _id: studentId }, JWT_SECRET, {
    expiresIn: '24h',
  });

export const registerStudent = async (req, res) => {
  try {
    const { username, password, age, gender, Program, feedback } = req.body;

    if (!username || !password || !age || !gender || !Program) {
      return res.status(400).json({ message: 'All required student fields must be provided' });
    }

    const existingStudent = await Student.findOne({ username });
    if (existingStudent) {
      return res.status(409).json({ message: 'Student with this username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await Student.create({
      username,
      password: hashedPassword,
      age,
      gender,
      Program,
      ...(feedback && { feedback }),
    });

    const token = generateToken(student._id);

    return res.status(201).json({
      message: 'Student registered successfully',
      token,
      student: normalizeStudentResponse(student),
    });
  } catch (error) {
    console.error('Error registering student:', error);
    return res.status(500).json({ message: 'Failed to register student' });
  }
};

export const loginStudent = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const student = await Student.findOne({ username });
    if (!student) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(student._id);

    return res.status(200).json({
      message: 'Login successful',
      token,
      student: normalizeStudentResponse(student),
    });
  } catch (error) {
    console.error('Error logging in student:', error);
    return res.status(500).json({ message: 'Failed to login student' });
  }
};

export const getStudentProfile = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId).select('-password').populate('selectedCourses');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    return res.status(200).json({ student });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return res.status(500).json({ message: 'Failed to fetch student profile' });
  }
};

export const updateStudentProfile = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { username, password, age, gender, Program, feedback } = req.body;

    const updatePayload = {};

    if (username) {
      const usernameExists = await Student.findOne({ username, _id: { $ne: studentId } });
      if (usernameExists) {
        return res.status(409).json({ message: 'Username already in use' });
      }
      updatePayload.username = username;
    }
    if (password) {
      updatePayload.password = await bcrypt.hash(password, 10);
    }
    if (age !== undefined) {
      if (typeof age !== 'number' || age <= 0) {
        return res.status(400).json({ message: 'Age must be a positive number' });
      }
      updatePayload.age = age;
    }
    if (gender) {
      updatePayload.gender = gender;
    }
    if (Program) {
      updatePayload.Program = Program;
    }
    if (feedback !== undefined) {
      if (feedback && feedback.length > 100) {
        return res.status(400).json({ message: 'Feedback cannot exceed 100 characters' });
      }
      updatePayload.feedback = feedback;
    }

    const student = await Student.findByIdAndUpdate(studentId, updatePayload, {
      new: true,
      runValidators: true,
    }).select('-password').populate('selectedCourses');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    return res.status(200).json({
      message: 'Student profile updated successfully',
      student,
    });
  } catch (error) {
    console.error('Error updating student profile:', error);
    return res.status(500).json({ message: 'Failed to update student profile' });
  }
};

export const submitStudentFeedback = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { feedback } = req.body;

    if (!feedback) {
      return res.status(400).json({ message: 'Feedback is required' });
    }

    if (feedback.length > 100) {
      return res.status(400).json({ message: 'Feedback cannot exceed 100 characters' });
    }

    const student = await Student.findByIdAndUpdate(
      studentId,
      { feedback },
      { new: true, runValidators: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    return res.status(200).json({
      message: 'Feedback submitted successfully',
      student,
    });
  } catch (error) {
    console.error('Error submitting student feedback:', error);
    return res.status(500).json({ message: 'Failed to submit feedback' });
  }
};

export const selectStudentCourses = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { major1, major2, minor1, minor2, lab1, lab2 } = req.body;

    if (!major1 || !major2 || !minor1 || !minor2 || !lab1 || !lab2) {
      return res.status(400).json({ message: 'All course selections are required' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const selectedCourse = await SelectedCourse.create({
      studentId,
      major1,
      major2,
      minor1,
      minor2,
      lab1,
      lab2,
    });

    student.selectedCourses.push(selectedCourse._id);
    await student.save();

    return res.status(201).json({
      message: 'Courses selected successfully',
      selectedCourse,
    });
  } catch (error) {
    console.error('Error selecting student courses:', error);
    return res.status(500).json({ message: 'Failed to select courses' });
  }
};

export const getStudentSelectedCourses = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId).populate('selectedCourses');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    return res.status(200).json({
      selectedCourses: student.selectedCourses,
    });
  } catch (error) {
    console.error('Error fetching student selected courses:', error);
    return res.status(500).json({ message: 'Failed to fetch selected courses' });
  }
};
