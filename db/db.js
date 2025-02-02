import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

let client = null;
let db = null;

export async function connectToDatabase() {
  // Jika sudah terhubung, return instance database yang ada
  if (db) {
    console.log("Using existing database connection");
    return db;
  }

  try {
    // Buat client baru jika belum ada
    if (!client) {
      client = new MongoClient(uri, {
        connectTimeoutMS: 10000, // 10 detik timeout untuk koneksi
        socketTimeoutMS: 45000,  // 45 detik timeout untuk operasi
        serverSelectionTimeoutMS: 10000, // 10 detik timeout untuk pemilihan server
      });
    }

    // Hubungkan ke MongoDB
    await client.connect();
    console.log("Successfully connected to MongoDB.");
    
    // Dapatkan instance database
    db = client.db(dbName);
    
    // Tambahkan handler untuk cleanup saat aplikasi ditutup
    process.on('SIGINT', closeConnection);
    process.on('SIGTERM', closeConnection);

    return db;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    // Bersihkan state jika koneksi gagal
    client = null;
    db = null;
    throw error; // Re-throw error untuk handling di level aplikasi
  }
}

export function getDb() {
  if (!db) {
    throw new Error(
      "Database connection not established. Call connectToDatabase() first."
    );
  }
  return db;
}

export async function closeConnection() {
  try {
    if (client) {
      await client.close();
      console.log("Database connection closed successfully");
      // Reset state
      client = null;
      db = null;
    }
  } catch (error) {
    console.error("Error closing database connection:", error);
    throw error;
  }
}

// Optional: Tambahkan fungsi untuk mengecek health database
export async function checkDatabaseHealth() {
  try {
    const database = getDb();
    await database.command({ ping: 1 });
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}