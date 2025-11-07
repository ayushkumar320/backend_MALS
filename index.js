import connectDB from './db/connectDB.js';
import express from 'express';
import Teacher from './models/teacher.js';
import Admin from './models/admin.js';
import Student from './models/student.js';
import SelectedCourse from './models/selectedcourse.js';
import Course from './models/course.js';

import cors from 'cors';
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

try {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
} catch (err) {
  console.error('Failed to start server due to DB connection error. Exiting.');
  process.exit(1);
}
