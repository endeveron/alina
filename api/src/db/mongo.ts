import mongoose, { ConnectOptions } from 'mongoose';

import logger from '../helpers/logger';

// Types
export type MongoDBConnectionResult = string | null;

// Configuration
const getConnectionConfig = (): { uri: string; options: ConnectOptions } => {
  const uri = process.env.DB_CONNECTION_STRING;

  if (!uri) {
    throw new Error('DB_CONNECTION_STRING environment variable is not defined');
  }

  // MongoDB connection options
  const options: ConnectOptions = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
    retryWrites: true,
  };

  return { uri, options };
};

// Connection function
const connect = async (): Promise<MongoDBConnectionResult> => {
  try {
    const { uri, options } = getConnectionConfig();
    await mongoose.connect(uri, options);
    logger.info(`MongoDB connected`);
    return null;
  } catch (error) {
    const errMsg = `MongoDB connection failed`;
    console.error(error);
    return errMsg;
  }
};

// Disconnection function
const disconnect = async (): Promise<MongoDBConnectionResult> => {
  try {
    await mongoose.disconnect();
    logger.info(`MongoDB disconnected`);
    return null;
  } catch (error) {
    const errMsg = `Failed to disconnect from MongoDB`;
    console.error(error);
    return errMsg;
  }
};

// Public API
export const mongoDb = {
  connect,
  disconnect,
  isConnected: (): boolean => {
    return mongoose.connection.readyState === 1;
  },
  getConnectionState: (): string => {
    const states: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
      99: 'uninitialized',
    };

    return states[mongoose.connection.readyState] || 'unknown';
  },
};
