import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { apiRouter } from '../src/backend/routes.ts';
import { db } from '../src/backend/db.ts';

dotenv.config();

const app: Express = express();

app.use(express.json());
app.use(cookieParser());

// Trust Vercel's reverse proxy for reliable IP extraction
app.set('trust proxy', 1);

// Thread-safe initialization promise lock to prevent concurrent initialization race conditions
let dbInitPromise: Promise<void> | null = null;
let dbInitialized = false;

app.use(async (_req, res, next) => {
  if (dbInitialized) {
    return next();
  }

  if (!dbInitPromise) {
    dbInitPromise = db.init()
      .then(() => {
        dbInitialized = true;
      })
      .catch((err) => {
        dbInitPromise = null; // Allow retry on subsequent request
        throw err;
      });
  }

  try {
    await dbInitPromise;
    next();
  } catch (err) {
    console.error('[Vercel Serverless] Database initialization failure:', err);
    return res.status(503).json({
      error: 'Service Temporarily Unavailable: Database connection could not be established. Please retry shortly.'
    });
  }
});

// Mount the API Router under /api
app.use('/api', apiRouter);

export default app;
