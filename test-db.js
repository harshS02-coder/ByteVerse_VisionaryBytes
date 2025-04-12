import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected successfully!");
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    await client.close();
  }
}

testConnection();
