// posts-controller.js
import { createPosts } from "../model/posts-model.js";
import { getDb } from "../db/db.js";
export const handleCreatePost = async (req, res) => {
  const { cover, title, content, userId } = req.body;

  try {
    // Validasi input
    if (!cover || !title || !content || !userId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const result = await createPosts({ cover, title, content, userId });
   
    res.status(201).json({
      message: 'Post created successfully',
      success : true,
      post: result
    });
  } catch (error) {
    console.error('Error in create post controller:', error);
    res.status(500).json({
      message: 'Failed to create post',
      success : false,
      error: error.message
    });
  }
};

export const getPosts = async (req, res) => {
  const db = getDb()
  try {
    const collection = db.collection('posts');
    const result = await collection.find({}).toArray();
    res.json(result);
  } catch (error) {
    console.error("Error saat mengambil data:", error);
    res.status(500).send("Terjadi kesalahan server");
  }
}