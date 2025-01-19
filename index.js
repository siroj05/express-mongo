import express from 'express';
import { connectToDatabase, closeConnection } from './db/db.js';
import dotenv from 'dotenv';
import users from './routes/usersRoutes.js';
import post from './routes/postsRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Fungsi untuk menginisialisasi server
async function startServer() {
  try {
    // Hubungkan ke database terlebih dahulu
    await connectToDatabase();
    
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Routes
    app.use('/api', users);
    app.use('/api', post);

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Unhandled error:', err);
      res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });

    // Mulai server setelah database terhubung
    const server = app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });

    // Graceful shutdown handler
    const shutdown = async () => {
      console.log('Received shutdown signal');
      
      // Tutup server terlebih dahulu
      server.close(() => {
        console.log('HTTP server closed');
      });

      try {
        // Kemudian tutup koneksi database
        await closeConnection();
        console.log('Database connection closed');
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    // Handle berbagai sinyal shutdown
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
    process.on('uncaughtException', async (error) => {
      console.error('Uncaught Exception:', error);
      await shutdown();
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Jalankan server
startServer();