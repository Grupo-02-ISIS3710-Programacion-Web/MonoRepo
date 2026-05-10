import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer;

export const startInMemoryMongo = async (): Promise<string> => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  return uri;
};

export const stopInMemoryMongo = async (): Promise<void> => {
  await mongoose.disconnect();
  await mongod.stop();
};

export const clearInMemoryMongo = async (): Promise<void> => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};
