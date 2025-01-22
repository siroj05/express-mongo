import jwt from "jsonwebtoken"
import { SECRET_KEY } from "../controllers/usersControllers.js"

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if(!token){
    return res.status(401).json({ message: "Akses ditolak. Token tidak tersedia." });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if(err){
      return res.status(403).json({message : "Token tidak valid."})
    }

    req.user = user
    next();
  })
}