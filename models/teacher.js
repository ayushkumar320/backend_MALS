import mongoose from 'mongoose';

const techerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  workingHourse: {
    type: Number,
    required: true,
  },
});

export default mongoose.model('Teacher', techerSchema);
