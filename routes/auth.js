import express from 'express'
import { authenticateToken } from '../middleware/middleware.js';

const auth = express.Router()

auth.get("/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Akses berhasil.",
    user: req.user, // Data user diambil dari token
  });
})

export default auth;