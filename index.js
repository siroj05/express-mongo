import express from 'express';
import { connectToDatabase } from './db/db.js'
import dotenv from 'dotenv';
import users from './routes/usersRoutes.js'

dotenv.config()
const app = express();
const port = process.env.PORT || 3000;

// Middleware untuk menghubungkan ke database sebelum menangani permintaan
app.use(async (req, res, next) => {
  await connectToDatabase();
  next();
});

// route
app.use('/api', users)

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

process.on('SIGINT', () => {
  closeConnection();
  process.exit();
});