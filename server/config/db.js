const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // const conn = await mongoose.connect(process.env.MONGODB_URI);
    // const conn = await mongoose.connect("mongodb://localhost:27017/voxcampus");
    const conn = await mongoose.connect("mongodb+srv://voxcampus15_db_user:Satyam2711@cluster0.hxa2lbz.mongodb.net/?appName=Cluster0");
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;