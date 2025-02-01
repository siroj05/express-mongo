import express from "express";
import { handleCreatePost, getAllPosts, getPostByUserId, deletePost, detailPost  } from "../controllers/postControllers.js";

const post = express.Router();

post.post("/createPost", handleCreatePost);
post.get("/posts", getAllPosts);
post.get("/post/:userId", getPostByUserId);
post.delete("/deletePost/:postId", deletePost);
post.get("/detailPost/:postId", detailPost);

export default post;
