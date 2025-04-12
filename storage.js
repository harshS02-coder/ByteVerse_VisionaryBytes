import { MongoClient, ServerApiVersion } from "mongodb";
import { Capsule } from "./capsule.js";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI not set");

let collection;

async function connectDB() {
  try {
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      tls: true, // <--- Ensure TLS is explicitly enabled
    });

    await client.connect();
    const db = client.db("timecapsule");
    collection = db.collection("capsules");
    console.log("Connected to MongoDB Atlas");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    throw err;
  }
}

export async function initStorage() {
  await connectDB();
}

export class CapsuleStorage {
  constructor() {}

  async load() {
    this.capsules = await collection.find({}).toArray();
  }

  async addCapsule(capsule) {
    const capsuleData = {
      id: capsule.id,
      message: capsule.message,
      unlockDate: capsule.unlockDate.toISOString(),
      password: capsule.password,
      filePath: capsule.filePath,
      createdAt: capsule.createdAt.toISOString(),
    };
    await collection.insertOne(capsuleData);
  }

  getCapsuleFromData(data) {
    const capsule = new Capsule(
      data.message,
      data.unlockDate,
      data.password,
      data.filePath
    );
    capsule.id = data.id;
    capsule.createdAt = new Date(data.createdAt);
    return capsule;
  }

  async getCapsule(id) {
    const data = await collection.findOne({ id });
    if (!data) return null;
    return this.getCapsuleFromData(data);
  }
}
