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
    LOGGER.info(`MongoDB connecting to: ${DATABASE_URL}`);
    LOGGER.start(`Connecting to MongoDB...`);
    connection = await mongoose.connect(COMPLETE_DATABASE_URL, {
      auth: {
        password: DATABASE_PASS,
        username: DATABASE_USER,
      },
      dbName: DATABASE_NAME,
    });
    LOGGER.success('Connected to MongoDB!');
  } catch (e) {
    LOGGER.error(e);
    process.exit(1);
  }
}

export async function disconnectDB() {
  LOGGER.start('Disconnecting from MongoDB...');
  await connection.disconnect();
  LOGGER.success('Disconnected from MongoDB!');
  process.exit(0);
}
