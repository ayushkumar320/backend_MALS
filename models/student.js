import mongoose from 'mongoose';
import SelectedCourse from './selectedcourse.js';
const studentSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  Program: {
    type: String,
    required: true,
  },
  feedback: {
    type: String,
    maxlength: 100,
  },
  selectedCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SelectedCourse',
  }],
});
const Student = mongoose.model('Student', studentSchema);
export default Student;
