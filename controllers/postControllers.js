// posts-controller.js
import { createPosts } from "../model/posts-model.js";

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
      post: result
    });
  } catch (error) {
    console.error('Error in create post controller:', error);
    res.status(500).json({
      message: 'Failed to create post',
      error: error.message
    });
  }
};