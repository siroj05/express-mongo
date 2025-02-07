import { getDb } from "../db/db.js";

export async function createCommentModel(commentData) {
  const db = getDb()
  const comments = db.collection('comments')

  try {
    const result = await comments.insertOne(commentData)

    return {message : 'Success', status : true}

  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
}