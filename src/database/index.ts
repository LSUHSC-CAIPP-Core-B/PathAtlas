import mongoose, { type Mongoose } from 'mongoose';
import { DATABASE_NAME, DATABASE_URL } from '../constants';

let connection: Mongoose;

export async function connectDB() {
  console.log(`MongoDB connecting to: ${DATABASE_URL}`);
  connection = await mongoose.connect(DATABASE_URL, { dbName: DATABASE_NAME });
  console.log('MongoDB connected');
}

export async function disconnectDB() {
  console.log('Disconnecting from database');
  await connection.disconnect();
  process.exit(0);
}
