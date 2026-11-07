import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { apiRouter } from '../src/backend/routes.ts';
import { db } from '../src/backend/db.ts';

dotenv.config();

const app: Express = express();

app.use(express.json());
app.use(cookieParser());

// Initialize DB on serverless invocation BEFORE mounting routes
let dbInitialized = false;
app.use(async (_req, res, next) => {
  if (!dbInitialized) {
    try {
      await db.init();
      dbInitialized = true;
    } catch (err) {
      console.error('[Vercel Serverless] Failed to initialize DB:', err);
      return res.status(503).json({ error: 'Service temporarily unavailable. Database initialization failed.' });
    }
  }
  next();
});

// Mount the API Router under /api
app.use('/api', apiRouter);

export default app;
