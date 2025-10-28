// server.ts
import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { connectDB } from './config/database';
import { config } from './config/env';
import logger from './utils/logger.utils';
import setupSocket from './utils/socket';

const PORT = config.port || 8000;

(async () => {
  try {
    logger.info(' Starting server...');

    // 1️⃣ Connect to MongoDB
    await connectDB();
    logger.info('MongoDB connected*********ted');

    // 2️⃣ Create HTTP + Socket.IO server
    const server = http.createServer(app);
    const allowedOrigins = [
      "https://your-project-name.vercel.app",
      "http://localhost:3000",
      process.env.FRONTEND_URL,
    ].filter(Boolean); 
    const io = new Server(server, {
      cors: {
        origin: function (origin, callback) {
          // Allow requests with no origin (like mobile apps / curl)
          if (!origin) return callback(null, true);
    
          if (allowedOrigins.includes(origin)) {
            return callback(null, true);
          } else {
            return callback(new Error("Not allowed by CORS"));
          }
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
      },
    });

    // 3️⃣ Setup Socket.IO listeners (notifications, validations, etc.)
    setupSocket(io);
    logger.info(' Socket.IO setup complete');

    // 4️⃣ Start Express HTTP server
    server.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
    });
  } catch (err: any) {
    logger.error(' Startup error:', err.message);
    process.exit(1);
  }
})();
