import serverless from 'serverless-http';
import app from '../../server/src/app.js';
import { initDb } from '../../server/src/db/database.js';

let dbInitialized = false;

const serverlessHandler = serverless(app);

export const handler = async (event, context) => {
  // Prevent Lambda from hanging if database connections remain in pool
  context.callbackWaitsForEmptyEventLoop = false;

  if (!dbInitialized) {
    try {
      await initDb();
      dbInitialized = true;
    } catch (err) {
      console.error('[Netlify Function] DB initialization error:', err.message);
    }
  }

  // Normalize path if Netlify forwards /.netlify/functions/api/endpoint
  if (event.path && event.path.startsWith('/.netlify/functions/api')) {
    event.path = event.path.replace('/.netlify/functions/api', '/api') || '/';
  }

  return serverlessHandler(event, context);
};
