import express from 'express'
import { getAllUsers, registerUser, LoginUser } from '../controllers/usersControllers.js'

const users = express.Router()

users.get('/users', getAllUsers)
users.post('/register', registerUser)
users.post('/login', LoginUser)

export default users