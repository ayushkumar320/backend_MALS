import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  college: {
    collegeUniqueId: {
      type: String,
      unique: true,
      sparse: true,
    },
    coursesOffered: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    programsOffered: [
      {
        type: String,
      },
    ],
    classroomOccupancy: {
      type: Number,
      default: 0,
    },
    labOccupancy: {
      type: Number,
      default: 0,
    },
  },
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
