import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function connectDB() {
  try {
    const connect = await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully ', connect.connection.host);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

export default connectDB;
