import { getDb } from "../db/db.js";
import { ObjectId } from "mongodb";
import { createCommentModel } from "../model/comment-model.js";

// create comment
export const handleCreateComment = async (req, res) => {
  let {userId : user, postId : post, comment} = req.body
  const userId = new ObjectId(user)
  const postId = new ObjectId(post)

  try {
    if(!user || !post || !comment) return res.status(400).json({message : "All fields are required"})
    
    const result = await createCommentModel({
      userId,
      postId,
      comment,
      createdAt : new Date()
    })

    res.status(201).json({
      message : result
    })
  } catch (error) {
    console.error("Error in create comment controller:", error);
    res.status(500).json({
      message: "Failed to create comment",
      success: false,
      error: error.message,
    });
  }
}