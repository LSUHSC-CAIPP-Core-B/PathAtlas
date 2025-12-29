import mongoose, { type Mongoose } from 'mongoose';
import {
  COMPLETE_DATABASE_URL,
  DATABASE_NAME,
  DATABASE_PASS,
  DATABASE_URL,
  DATABASE_USER,
} from '../constants';
import { LOGGER } from '../logger';

let connection: Mongoose;

export async function connectDB() {
  try {
    LOGGER.start(`MongoDB connecting to: ${DATABASE_URL}`);
    connection = await mongoose.connect(COMPLETE_DATABASE_URL, {
      auth: {
        password: DATABASE_PASS,
        username: DATABASE_USER,
      },
      dbName: DATABASE_NAME,
    });
    LOGGER.success('MongoDB connected');
  } catch (e) {
    LOGGER.error(e);
    process.exit(1);
  }
}

export async function disconnectDB() {
  LOGGER.log('Disconnecting from database');
  await connection.disconnect();
  process.exit(0);
}
