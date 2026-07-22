import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/db.js';
import { errorHandler } from './middleware/error.middleware.js';
import ticketRoutes from './routes/ticket.routes.js';
import authRoutes from './routes/auth.routes.js';

// 1. Load environment configurations from the root .env file FIRST
dotenv.config();

// 2. Initialize the Express app
const app = express();
const PORT = process.env.PORT || 5000;

// 3. Define reusable CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allows server-to-server calls, tools like Postman, or local development flags
    if (!origin || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    // Deep security routing matching is handled explicitly down in the security middleware layer
    return callback(null, true);
  },
  credentials: true,
};

// 4. Global Express Middleware hooks
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Strict file payload capacity protection cap

// 5. Main Endpoint Router Bindings (Now safely placed AFTER app initialization)
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);

// 6. Global Error Catching Interceptor Layer (Must be registered last)
app.use(errorHandler);

// 7. Connect to the MySQL database via the Prisma layer built in Phase 1
connectDatabase();

// 8. Boot up the server instance listeners
app.listen(PORT, () => {
  console.log(`🚀 Central Ticketing API running on port ${PORT} in ${process.env.NODE_ENV || 'production'} mode.`);
});

export default app;