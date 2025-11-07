import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db/connectDB.js';
import adminRoutes from './routes/admin.route.js';
import studentRoutes from './routes/student.route.js';
import teacherRoutes from './routes/teacher.route.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use('/admin', adminRoutes);
app.use('/students', studentRoutes);
app.use('/teachers', teacherRoutes);

app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Backend MALS API is running',
    version: '1.0.0',
    endpoints: {
      admin: {
        base: '/admin',
        routes: [
          {
            method: 'POST',
            path: '/admin/register',
            description: 'Register a new admin',
            auth: false,
          },
          {
            method: 'POST',
            path: '/admin/login',
            description: 'Admin login',
            auth: false,
          },
          {
            method: 'POST',
            path: '/admin/courses',
            description: 'Create a new course',
            auth: true,
          },
          {
            method: 'POST',
            path: '/admin/:adminId/college',
            description: 'Register a college',
            auth: true,
          },
          {
            method: 'GET',
            path: '/admin/:adminId',
            description: 'Get admin profile',
            auth: true,
          },
          {
            method: 'GET',
            path: '/admin/feedbacks/list',
            description: 'Get all student feedbacks',
            auth: true,
          },
        ],
      },
      students: {
        base: '/students',
        routes: [
          {
            method: 'POST',
            path: '/students/register',
            description: 'Register a new student',
            auth: false,
          },
          {
            method: 'POST',
            path: '/students/login',
            description: 'Student login',
            auth: false,
          },
          {
            method: 'GET',
            path: '/students/:studentId',
            description: 'Get student profile',
            auth: true,
          },
          {
            method: 'PATCH',
            path: '/students/:studentId',
            description: 'Update student profile',
            auth: true,
          },
          {
            method: 'POST',
            path: '/students/:studentId/feedback',
            description: 'Submit student feedback',
            auth: true,
          },
          {
            method: 'POST',
            path: '/students/:studentId/courses',
            description: 'Select courses for student',
            auth: true,
          },
          {
            method: 'GET',
            path: '/students/:studentId/courses',
            description: 'Get student selected courses',
            auth: true,
          },
        ],
      },
      teachers: {
        base: '/teachers',
        routes: [
          {
            method: 'POST',
            path: '/teachers/register',
            description: 'Register a new teacher',
            auth: false,
          },
          {
            method: 'POST',
            path: '/teachers/login',
            description: 'Teacher login',
            auth: false,
          },
          {
            method: 'GET',
            path: '/teachers/:teacherId',
            description: 'Get teacher profile',
            auth: true,
          },
          {
            method: 'PATCH',
            path: '/teachers/:teacherId',
            description: 'Update teacher profile',
            auth: true,
          },
          {
            method: 'GET',
            path: '/teachers/:teacherId/courses',
            description: 'Get teacher courses',
            auth: true,
          },
        ],
      },
    },
    note: 'Routes marked with auth: true require authentication token in Authorization header',
  });
});

app.use((req, res) => {
  res.status(404).json({message: 'Route not found'});
});

try {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
} catch (err) {
  console.error(
    'Failed to start server due to DB connection error. Exiting.',
    err
  );
  process.exit(1);
}
