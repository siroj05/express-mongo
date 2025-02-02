import express from 'express'
import { authenticateToken } from '../middleware/middleware.js';

const auth = express.Router()

auth.get("/profile", authenticateToken, (req, res) => {
  res.json({
    user: {
      firstName : req.user.firstName,  
      email : req.user.email,  
      id : req.user.id,  
      success : true
    }
  });
})

export default auth;