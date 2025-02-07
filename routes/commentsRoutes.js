import express from "express";
import { handleCreateComment } from "../controllers/commentControllers.js";

const comment = express.Router()

comment.post("/comment", handleCreateComment)

export default comment