import { MongoClient, Db, MongoClientOptions } from "mongodb";

const globalForMongo = globalThis as unknown as { __mongo?: { client: MongoClient; db: Db } };

export async function connectMongo(url?: string, dbName = "team_task_manager") {
  const mongoUrl = url ?? process.env.MONGO_URL;
  if (!mongoUrl) return null;

  if (globalForMongo.__mongo) return globalForMongo.__mongo;

  const opts: MongoClientOptions = {
    maxPoolSize: 10,
    // fail fast in development to avoid long UI waits when Atlas is unreachable
    serverSelectionTimeoutMS: 2000,
    connectTimeoutMS: 2000,
  };
  const client = new MongoClient(mongoUrl, opts);
  try {
    await client.connect();
    const db = client.db(dbName);
    globalForMongo.__mongo = { client, db };
    return globalForMongo.__mongo;
  } catch (error) {
    console.warn("MongoDB connection failed, continuing without MongoDB:", error);
    try {
      await client.close();
    } catch (_) {}
    return null;
  }
}

export function getMongoDb() {
  return globalForMongo.__mongo?.db ?? null;
}

export function getCollection(name: string) {
  const db = getMongoDb();
  return db ? db.collection(name) : null;
}

export default connectMongo;
