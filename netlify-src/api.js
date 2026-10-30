import serverless from 'serverless-http';
import app from '../server/src/app.js';
import { initDb } from '../server/src/db/database.js';

let initialized = false;

const serverlessHandler = serverless(app);

export const handler = async (event, context) => {
  if (!initialized) {
    try {
      await initDb();
      initialized = true;
    } catch (e) {
      console.error('[Lambda] Database init error:', e.message);
    }
  }
  return serverlessHandler(event, context);
};
