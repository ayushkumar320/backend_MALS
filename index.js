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
  res.status(200).json({message: 'Backend MALS API is running'});
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
