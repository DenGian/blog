import "server-only";
import mongoose from "mongoose";
import { getServerEnv } from "./env";
interface MongooseCache {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}
const globalWithMongoose = globalThis as typeof globalThis & {
  __journalMongoose?: MongooseCache;
};
const cache = globalWithMongoose.__journalMongoose ?? {
  connection: null,
  promise: null,
};
globalWithMongoose.__journalMongoose = cache;
export async function connectDatabase(): Promise<typeof mongoose> {
  if (cache.connection) return cache.connection;
  if (!cache.promise) {
    const env = getServerEnv();
    cache.promise = mongoose.connect(env.MONGODB_URI, {
      dbName: env.MONGODB_DATABASE,
      bufferCommands: false,
      autoIndex: false,
      serverSelectionTimeoutMS: 8_000,
    });
  }
  try {
    cache.connection = await cache.promise;
    return cache.connection;
  } catch {
    cache.promise = null;
    throw new Error("Database connection failed.");
  }
}
