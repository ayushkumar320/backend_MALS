import mongoose from 'mongoose';
import Student from './student.js';
const option = {
  discriminatorKey: 'courseType',
};

const SelectedCourseSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    major1: {
      type: String,
      required: true,
    },
    major2: {
      type: String,
      required: true,
    },
    minor1: {
      type: String,
      required: true,
    },
    minor2: {
      type: String,
      required: true,
    },
    lab1: {
      type: String,
      required: true,
    },
    lab2: {
      type: String,
      required: true,
    },
  },
  option
);
const SelectedCourse = mongoose.model('SelectedCourse', SelectedCourseSchema);
export default SelectedCourse;