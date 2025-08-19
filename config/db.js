import mongoose from 'mongoose';
import { config } from './env.js';

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;

export const connectDB = async (retries = MAX_RETRIES) => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error (${MAX_RETRIES - retries + 1}/${MAX_RETRIES}):`, error.message);
    
    if (retries > 0) {
      console.log(`Retrying connection in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectDB(retries - 1);
    } else {
      console.error('Failed to connect to MongoDB after multiple attempts');
      process.exit(1);
    }
  }
};
