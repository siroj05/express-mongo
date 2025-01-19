import express from "express";
import { handleCreatePost } from "../controllers/postControllers.js";

const post = express.Router();

post.post("/createPost", handleCreatePost);

export default post;
