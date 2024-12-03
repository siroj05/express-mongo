import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config()

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

let client = new MongoClient(uri);
let db

export async function connectToDatabase() {
  if (db) return db
  try {
    await client.connect();
    console.log("OK");
    db = client.db(dbName);
    return db
  } catch (error) {
    console.error("Not OK:", error);
    process.exit(1);
  }
}

export function getDb(){
  if(!db){
    throw new Error("Database belum terhubung. Panggil connectToDatabase() terlebih dahulu.")
  }else return db
}

export function closeConnection(){
  if(client){
    client.close()
    console.log("Koneksi ditutup")
  }
}