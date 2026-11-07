/**
 * DANASI OPPORTUNITY HUB — Full-Stack Server Entry Point
 * Founder: NDAYIZEYE Samuel
 * 
 * Express server hosting secure /api endpoints with cookie parsing and Cloud Firestore persistence.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { apiRouter } from './src/backend/routes.ts';
import { db } from './src/backend/db.ts';
import { syncManager } from './src/backend/sync/SyncManager.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  // Trust proxy for accurate client IP resolution
  app.set('trust proxy', 1);

  // JSON request body parser & cookie parser for HTTP-only cookies
  app.use(express.json());
  app.use(cookieParser());

  // Initialize Firestore database connection and seed migrations before mounting routes
  let dbInitialized = false;
  try {
    await db.init();
    dbInitialized = true;
  } catch (err) {
    console.error('[DANASI SERVER] Failed to initialize Firestore during startup:', err);
  }

  app.use('/api', (req, res, next) => {
    if (!dbInitialized) {
      return res.status(503).json({
        error: 'Service Unavailable: Database initialization failed or in progress.'
      });
    }
    next();
  });

  // Mount API router
  app.use('/api', apiRouter);

  // Start background job data synchronization scheduler
  syncManager.startScheduler();

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[DANASI OPPORTUNITY HUB] Server listening at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('[DANASI OPPORTUNITY HUB] Failed to start server:', err);
  process.exit(1);
});
