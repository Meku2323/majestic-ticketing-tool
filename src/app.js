import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDatabase } from './config/db.js';
import { errorHandler } from './middleware/error.middleware.js';
import ticketRoutes from './routes/ticket.routes.js';
import authRoutes from './routes/auth.routes.js';

// 1. GENERATE ES MODULE DIRECTORY CONSTANTS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. LOAD CONFIGURATIONS FIRST
dotenv.config();

// 3. INITIALIZE THE EXPRESS APPLICATION INSTANCE
const app = express();
const PORT = process.env.PORT || 5000;

// 4. CONNECT TO MYSQL DATABASE WORKSPACE
connectDatabase();

// 5. DEFINE CORS GATEWAY ROUTINES
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
};

// 6. ATTACH GLOBAL MIDDLEWARES
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// 🛡️ ABSOLUTE PATH SHIELD: Maps directly to C:\wedgets\public regardless of run cache context
app.use(express.static(path.join(__dirname, '../public'))); 

// 7. MAIN SYSTEM ROUTER BINDINGS
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

// 8. GLOBAL ERROR INTERCEPTOR LAYER (Must be registered last)
app.use(errorHandler);

// 9. BOOT UP SYSTEM LISTENERS
app.listen(PORT, () => {
  console.log(`🚀 Central Ticketing API running on port ${PORT} in ${process.env.NODE_ENV || 'production'} mode.`);
});

export default app;
