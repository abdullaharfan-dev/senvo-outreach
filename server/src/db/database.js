import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const getDirname = () => {
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch {
    return process.cwd();
  }
};
const __dirname = getDirname();

const DATABASE_URL = process.env.DATABASE_URL;
export const isPostgres = Boolean(DATABASE_URL && (DATABASE_URL.startsWith('postgres://') || DATABASE_URL.startsWith('postgresql://')));

let sqliteDb = null;
let pgPool = null;

if (isPostgres) {
  console.log('[DB] Connecting to managed cloud PostgreSQL database (senvo_outreach schema)...');
  pgPool = new pg.Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
  });

  pgPool.on('error', (err) => {
    console.error('[DB] Unexpected error on idle PostgreSQL client:', err);
  });

  // Strict isolation: ensure all queries run within senvo_outreach schema
  pgPool.on('connect', async (client) => {
    try {
      await client.query('CREATE SCHEMA IF NOT EXISTS senvo_outreach;');
      await client.query('SET search_path TO senvo_outreach;');
    } catch (e) {
      console.warn('[DB] Setting search_path to senvo_outreach warning:', e.message);
    }
  });
}

const getSqlite = async () => {
  if (sqliteDb) return sqliteDb;
  const { default: sqlite3Module } = await import('sqlite3');
  const dataDir = process.env.DATA_DIR || path.resolve(__dirname, '../../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'senvo_outreach.db');
  console.log(`[DB] Using persistent SQLite database at: ${dbPath}`);

  return new Promise((resolve, reject) => {
    const dbInstance = new sqlite3Module.Database(dbPath, (err) => {
      if (err) {
        console.error('[DB] Failed to connect to SQLite:', err.message);
        reject(err);
      } else {
        console.log('[DB] Connected successfully to SQLite database.');
        dbInstance.run('PRAGMA foreign_keys = ON;');
        dbInstance.run('PRAGMA journal_mode = WAL;');
        sqliteDb = dbInstance;
        resolve(dbInstance);
      }
    });
  });
};

/**
 * Convert SQLite ? placeholders to PostgreSQL $1, $2, ...
 */
const convertPlaceholders = (sql) => {
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
};

/**
 * Universal query runner: returns array of row objects
 */
export const query = async (sql, params = []) => {
  if (isPostgres) {
    const pgSql = convertPlaceholders(sql);
    const result = await pgPool.query(pgSql, params);
    return result.rows;
  } else {
    const db = await getSqlite();
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }
};

/**
 * Universal get runner: returns single row object or undefined
 */
export const get = async (sql, params = []) => {
  if (isPostgres) {
    const pgSql = convertPlaceholders(sql);
    const result = await pgPool.query(pgSql, params);
    return result.rows[0];
  } else {
    const db = await getSqlite();
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }
};

/**
 * Universal mutation runner: returns { changes, lastID }
 */
export const run = async (sql, params = []) => {
  if (isPostgres) {
    const pgSql = convertPlaceholders(sql);
    const result = await pgPool.query(pgSql, params);
    return { changes: result.rowCount, lastID: null };
  } else {
    const db = await getSqlite();
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }
};

/**
 * Initialize schema and load seed snapshot if database is empty
 */
export const initDb = async () => {
  if (isPostgres) {
    console.log('[DB] Ensuring PostgreSQL schema senvo_outreach exists...');
    await run(`CREATE SCHEMA IF NOT EXISTS senvo_outreach;`);
    await run(`SET search_path TO senvo_outreach;`);

    // Verify if leads table exists in senvo_outreach
    const tableCheck = await query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'senvo_outreach' AND table_name = 'leads'
    `);

    if (tableCheck.length === 0) {
      console.log('[DB] Initializing isolated tables in senvo_outreach schema...');
      await run(`
        CREATE TABLE IF NOT EXISTS senvo_outreach.leads (
          id TEXT PRIMARY KEY,
          company_name TEXT NOT NULL,
          contact_name TEXT,
          email TEXT,
          phone TEXT,
          industry TEXT,
          city TEXT,
          source TEXT DEFAULT 'Manual / Import',
          priority TEXT CHECK(priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
          score INTEGER DEFAULT 50,
          owner TEXT DEFAULT 'Sales Team',
          status TEXT CHECK(status IN ('uncontacted', 'in_campaign', 'replied', 'qualified', 'unqualified')) DEFAULT 'uncontacted',
          custom_fields TEXT DEFAULT '{}',
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL
        );
      `);
      await run(`
        CREATE TABLE IF NOT EXISTS senvo_outreach.campaigns (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          channel TEXT NOT NULL,
          template_id TEXT,
          template_body TEXT NOT NULL,
          status TEXT CHECK(status IN ('draft', 'running', 'paused', 'completed')) DEFAULT 'draft',
          target_audience TEXT DEFAULT 'All Eligible Leads',
          total_recipients INTEGER DEFAULT 0,
          sent_count INTEGER DEFAULT 0,
          failed_count INTEGER DEFAULT 0,
          skipped_count INTEGER DEFAULT 0,
          replied_count INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL
        );
      `);
      await run(`
        CREATE TABLE IF NOT EXISTS senvo_outreach.campaign_recipients (
          id TEXT PRIMARY KEY,
          campaign_id TEXT NOT NULL REFERENCES senvo_outreach.campaigns(id) ON DELETE CASCADE,
          lead_id TEXT NOT NULL REFERENCES senvo_outreach.leads(id) ON DELETE CASCADE,
          personalized_content TEXT NOT NULL,
          status TEXT CHECK(status IN ('queued', 'simulated_sent', 'failed', 'skipped', 'replied')) DEFAULT 'queued',
          error_message TEXT,
          sent_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL,
          CONSTRAINT uq_cr_campaign_lead UNIQUE(campaign_id, lead_id)
        );
      `);
      await run(`
        CREATE TABLE IF NOT EXISTS senvo_outreach.conversations (
          id TEXT PRIMARY KEY,
          lead_id TEXT NOT NULL REFERENCES senvo_outreach.leads(id) ON DELETE CASCADE,
          channel TEXT NOT NULL,
          status TEXT CHECK(status IN ('open', 'waiting_ai', 'review_needed', 'closed', 'handed_off')) DEFAULT 'open',
          assigned_owner TEXT DEFAULT 'Declan O''Sullivan',
          last_message_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL
        );
      `);
      await run(`
        CREATE TABLE IF NOT EXISTS senvo_outreach.messages (
          id TEXT PRIMARY KEY,
          conversation_id TEXT NOT NULL REFERENCES senvo_outreach.conversations(id) ON DELETE CASCADE,
          direction TEXT CHECK(direction IN ('inbound', 'outbound')) NOT NULL,
          sender_name TEXT NOT NULL,
          content TEXT NOT NULL,
          delivery_mode TEXT CHECK(delivery_mode IN ('simulated', 'live')) DEFAULT 'simulated',
          status TEXT CHECK(status IN ('delivered', 'read', 'pending_review', 'failed')) DEFAULT 'delivered',
          is_ai_generated INTEGER DEFAULT 0,
          metadata TEXT DEFAULT '{}',
          created_at TIMESTAMPTZ NOT NULL
        );
      `);
      await run(`
        CREATE TABLE IF NOT EXISTS senvo_outreach.ai_assessments (
          id TEXT PRIMARY KEY,
          conversation_id TEXT NOT NULL REFERENCES senvo_outreach.conversations(id) ON DELETE CASCADE,
          message_id TEXT,
          lead_id TEXT NOT NULL REFERENCES senvo_outreach.leads(id) ON DELETE CASCADE,
          intent TEXT NOT NULL,
          requested_service TEXT,
          summary TEXT NOT NULL,
          confidence REAL DEFAULT 0.90,
          suggested_reply TEXT,
          suggested_next_action TEXT,
          human_review_required INTEGER DEFAULT 0,
          review_status TEXT CHECK(review_status IN ('pending', 'approved', 'rejected', 'modified')) DEFAULT 'pending',
          raw_response TEXT,
          created_at TIMESTAMPTZ NOT NULL
        );
      `);
      await run(`
        CREATE TABLE IF NOT EXISTS senvo_outreach.handoffs (
          id TEXT PRIMARY KEY,
          lead_id TEXT NOT NULL REFERENCES senvo_outreach.leads(id) ON DELETE CASCADE,
          conversation_id TEXT,
          requested_service TEXT,
          qualification_summary TEXT NOT NULL,
          assigned_owner TEXT NOT NULL,
          next_action TEXT NOT NULL,
          crm_target TEXT DEFAULT 'Bitrix24',
          crm_sync_status TEXT CHECK(crm_sync_status IN ('prepared_pending_sync', 'sync_failed', 'synced')) DEFAULT 'prepared_pending_sync',
          sync_details TEXT DEFAULT 'Payload formatted for Bitrix24 Lead REST API. Live sync disabled in demo mode.',
          created_at TIMESTAMPTZ NOT NULL
        );
      `);
      await run(`
        CREATE TABLE IF NOT EXISTS senvo_outreach.company_knowledge (
          id TEXT PRIMARY KEY,
          category TEXT NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          approved INTEGER DEFAULT 1,
          updated_at TIMESTAMPTZ NOT NULL
        );
      `);
      await run(`
        CREATE TABLE IF NOT EXISTS senvo_outreach.integration_configs (
          id TEXT PRIMARY KEY,
          channel TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          provider_mode TEXT CHECK(provider_mode IN ('simulated', 'live')) DEFAULT 'simulated',
          is_connected INTEGER DEFAULT 1,
          capabilities TEXT DEFAULT '[]',
          last_heartbeat TIMESTAMPTZ NOT NULL
        );
      `);
      await run(`
        CREATE TABLE IF NOT EXISTS senvo_outreach.connected_accounts (
          id TEXT PRIMARY KEY,
          channel TEXT NOT NULL,
          account_name TEXT NOT NULL,
          account_identifier TEXT NOT NULL,
          auth_type TEXT CHECK(auth_type IN ('oauth2', 'api_key', 'webhook', 'smtp_graph')) DEFAULT 'oauth2',
          connection_status TEXT CHECK(connection_status IN ('connected_simulated', 'connected_live', 'disconnected', 'auth_required', 'error')) DEFAULT 'connected_simulated',
          environment TEXT CHECK(environment IN ('sandbox_simulation', 'production')) DEFAULT 'sandbox_simulation',
          permissions_granted TEXT DEFAULT '[]',
          token_expires_at TIMESTAMPTZ,
          rate_limit_info TEXT,
          compliance_notes TEXT,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL
        );
      `);
      await run(`
        CREATE TABLE IF NOT EXISTS senvo_outreach.activity_events (
          id TEXT PRIMARY KEY,
          actor TEXT DEFAULT 'System',
          action TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id TEXT,
          details TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL
        );
      `);
      console.log('[DB] senvo_outreach PostgreSQL tables created.');
      await restoreFromSnapshot();
    } else {
      console.log('[DB] senvo_outreach schema verified and existing.');
    }
  } else {
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      const statements = schemaSql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        await run(statement);
      }
      console.log('[DB] SQLite database schema initialized successfully.');
    }
  }

  // Check if database needs seeding from snapshot
  try {
    const leadCheck = await query('SELECT COUNT(*) as count FROM leads');
    const count = Number(leadCheck[0]?.count || 0);
    if (count === 0) {
      await restoreFromSnapshot();
    }
  } catch (e) {
    // Schema may be pending
  }
};

/**
 * Restore complete demonstration data from seed_snapshot.json
 */
export const restoreFromSnapshot = async () => {
  const snapshotPath = path.join(__dirname, 'seed_snapshot.json');
  if (!fs.existsSync(snapshotPath)) {
    console.log('[Snapshot] No snapshot file found.');
    return;
  }

  console.log('[Snapshot] Restoring complete demo dataset from seed_snapshot.json...');
  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));

  const tables = [
    'company_knowledge',
    'integration_configs',
    'connected_accounts',
    'leads',
    'campaigns',
    'campaign_recipients',
    'conversations',
    'messages',
    'ai_assessments',
    'handoffs',
    'activity_events'
  ];

  for (const table of tables) {
    const rows = snapshot[table];
    if (rows && Array.isArray(rows) && rows.length > 0) {
      for (const row of rows) {
        const columns = Object.keys(row);
        const values = Object.values(row);
        const placeholders = columns.map(() => '?').join(', ');
        const colList = columns.join(', ');

        try {
          if (isPostgres) {
            await run(`INSERT INTO senvo_outreach.${table} (${colList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`, values);
          } else {
            await run(`INSERT OR IGNORE INTO ${table} (${colList}) VALUES (${placeholders})`, values);
          }
        } catch {
          // Continue
        }
      }
      console.log(`[Snapshot] Restored ${rows.length} rows into ${table}`);
    }
  }
  console.log('[Snapshot] Demo dataset successfully restored.');
};

export default { query, get, run, initDb, restoreFromSnapshot, isPostgres };
