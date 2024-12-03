import { getDb } from "../db/db.js";

export const getAllUsers = async (req, res) => {
  const db = getDb()
  try {
    const collection = db.collection('users');
    const result = await collection.find({}).toArray();
    res.json(result);
  } catch (error) {
    console.error("Error saat mengambil data:", error);
    res.status(500).send("Terjadi kesalahan server");
  }
}