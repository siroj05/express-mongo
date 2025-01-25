import express from 'express'
import { getAllUsers, registerUser, LoginUser, logout } from '../controllers/usersControllers.js'

const users = express.Router()

users.get('/users', getAllUsers)
users.post('/register', registerUser)
users.post('/login', LoginUser)
users.post('/logout', logout)

export default users