import express from "express";
import { handleCreatePost, getPosts } from "../controllers/postControllers.js";

const post = express.Router();

post.post("/createPost", handleCreatePost);
post.get("/posts", getPosts);

export default post;
