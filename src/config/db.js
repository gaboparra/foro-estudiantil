import mongoose from "mongoose";
import logger from "./logger.js";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("MongoDB connected");
  } catch (error) {
    logger.error("Error connecting to MongoDB", { message: error.message });
    process.exit(1);
  }
};

export default connectDB;
