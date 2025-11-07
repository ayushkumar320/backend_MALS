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
  labCapacity: {
    type: Number,
    default: 60,
    required: true,
  },
  classCapacity: {
    type: Number,
    default: 60,
    required: true,
  },
});

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
