import { query } from './database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function exportAll() {
  const tables = [
    'leads',
    'campaigns',
    'campaign_recipients',
    'conversations',
    'messages',
    'ai_assessments',
    'handoffs',
    'company_knowledge',
    'integration_configs',
    'connected_accounts',
    'activity_events'
  ];

  const exportData = {};

  for (const table of tables) {
    try {
      const rows = await query(`SELECT * FROM ${table}`);
      exportData[table] = rows;
      console.log(`Exported ${table}: ${rows.length} rows`);
    } catch (err) {
      console.warn(`Could not export ${table}: ${err.message}`);
      exportData[table] = [];
    }
  }

  const exportPath = path.join(__dirname, 'seed_snapshot.json');
  fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2), 'utf8');
  console.log(`[Snapshot] Successfully written to ${exportPath}`);
  process.exit(0);
}

exportAll().catch(err => {
  console.error('Export failed:', err);
  process.exit(1);
});
