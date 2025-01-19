// posts-model.js
import { getDb } from '../db/db.js';

export async function createPosts(postData) {
  const db = getDb();
  const posts = db.collection('posts');
  
  try {
    const result = await posts.insertOne(postData);
    const savedPost = await posts.findOne({ _id: result.insertedId });
    return {
      title: savedPost.title,
      content: savedPost.content,
      cover: savedPost.cover,
      userId: savedPost.userId,
      success : true
    };
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}