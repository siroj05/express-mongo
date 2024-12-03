import express from 'express'
import { getAllUsers } from '../controllers/usersControllers.js'

const users = express.Router()

users.get('/users', getAllUsers)

export default users