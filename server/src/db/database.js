import sqlite3 from 'sqlite3';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;
const isPostgres = Boolean(DATABASE_URL && (DATABASE_URL.startsWith('postgres://') || DATABASE_URL.startsWith('postgresql://')));

let sqliteDb = null;
let pgPool = null;

if (isPostgres) {
  console.log('[DB] Connecting to managed cloud PostgreSQL database...');
  pgPool = new pg.Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
  });

  pgPool.on('error', (err) => {
    console.error('[DB] Unexpected error on idle PostgreSQL client:', err);
  });
} else {
  // Persistent SQLite database path
  const dataDir = process.env.DATA_DIR || path.resolve(__dirname, '../../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'senvo_outreach.db');
  console.log(`[DB] Using persistent SQLite database at: ${dbPath}`);

  sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('[DB] Failed to connect to SQLite:', err.message);
    } else {
      console.log('[DB] Connected successfully to SQLite database.');
    }
  });

  sqliteDb.serialize(() => {
    sqliteDb.run('PRAGMA foreign_keys = ON;');
    sqliteDb.run('PRAGMA journal_mode = WAL;');
  });
}

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
    return new Promise((resolve, reject) => {
      sqliteDb.all(sql, params, (err, rows) => {
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
    return new Promise((resolve, reject) => {
      sqliteDb.get(sql, params, (err, row) => {
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
    return new Promise((resolve, reject) => {
      sqliteDb.run(sql, params, function (err) {
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
    console.log('[DB] Initializing PostgreSQL schema...');
    // Create tables in PostgreSQL syntax if not exist
    await run(`
      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR(64) PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        contact_name VARCHAR(255),
        phone VARCHAR(64),
        email VARCHAR(255),
        industry VARCHAR(128),
        city VARCHAR(128) DEFAULT 'Dublin',
        country VARCHAR(64) DEFAULT 'Ireland',
        priority VARCHAR(32) DEFAULT 'medium',
        score INT DEFAULT 50,
        status VARCHAR(32) DEFAULT 'new',
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      );
    `);
    await run(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        channel VARCHAR(64) NOT NULL,
        status VARCHAR(32) DEFAULT 'draft',
        template_id VARCHAR(64),
        template_body TEXT,
        target_audience VARCHAR(128),
        total_recipients INT DEFAULT 0,
        sent_count INT DEFAULT 0,
        delivered_count INT DEFAULT 0,
        replied_count INT DEFAULT 0,
        qualified_count INT DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      );
    `);
    await run(`
      CREATE TABLE IF NOT EXISTS campaign_recipients (
        id VARCHAR(64) PRIMARY KEY,
        campaign_id VARCHAR(64) REFERENCES campaigns(id) ON DELETE CASCADE,
        lead_id VARCHAR(64) REFERENCES leads(id) ON DELETE CASCADE,
        status VARCHAR(32) DEFAULT 'queued',
        delivery_mode VARCHAR(32) DEFAULT 'simulated',
        personalized_content TEXT,
        error_reason TEXT,
        sent_at TIMESTAMPTZ,
        delivered_at TIMESTAMPTZ,
        replied_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL
      );
    `);
    await run(`
      CREATE TABLE IF NOT EXISTS conversations (
        id VARCHAR(64) PRIMARY KEY,
        lead_id VARCHAR(64) REFERENCES leads(id) ON DELETE CASCADE,
        channel VARCHAR(64) NOT NULL,
        status VARCHAR(32) DEFAULT 'open',
        assigned_owner VARCHAR(128) DEFAULT 'Declan O''Sullivan',
        last_message_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      );
    `);
    await run(`
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(64) PRIMARY KEY,
        conversation_id VARCHAR(64) REFERENCES conversations(id) ON DELETE CASCADE,
        direction VARCHAR(16) NOT NULL,
        sender_name VARCHAR(128),
        content TEXT NOT NULL,
        delivery_mode VARCHAR(32) DEFAULT 'simulated',
        status VARCHAR(32) DEFAULT 'delivered',
        is_ai_generated INT DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL
      );
    `);
    await run(`
      CREATE TABLE IF NOT EXISTS ai_assessments (
        id VARCHAR(64) PRIMARY KEY,
        conversation_id VARCHAR(64) REFERENCES conversations(id) ON DELETE CASCADE,
        message_id VARCHAR(64) REFERENCES messages(id) ON DELETE CASCADE,
        lead_id VARCHAR(64) REFERENCES leads(id) ON DELETE CASCADE,
        intent VARCHAR(64),
        requested_service VARCHAR(128),
        summary TEXT,
        confidence NUMERIC DEFAULT 0.0,
        suggested_reply TEXT,
        suggested_next_action TEXT,
        human_review_required INT DEFAULT 0,
        review_status VARCHAR(32) DEFAULT 'approved',
        raw_response TEXT,
        created_at TIMESTAMPTZ NOT NULL
      );
    `);
    await run(`
      CREATE TABLE IF NOT EXISTS handoffs (
        id VARCHAR(64) PRIMARY KEY,
        lead_id VARCHAR(64) REFERENCES leads(id) ON DELETE CASCADE,
        target_system VARCHAR(64) DEFAULT 'bitrix24',
        handoff_status VARCHAR(32) DEFAULT 'staged',
        assigned_to VARCHAR(128),
        payload TEXT,
        sync_attempts INT DEFAULT 0,
        synced_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL
      );
    `);
    await run(`
      CREATE TABLE IF NOT EXISTS company_knowledge (
        id VARCHAR(64) PRIMARY KEY,
        category VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        approved INT DEFAULT 1,
        updated_at TIMESTAMPTZ NOT NULL
      );
    `);
    await run(`
      CREATE TABLE IF NOT EXISTS integration_configs (
        id VARCHAR(64) PRIMARY KEY,
        channel VARCHAR(64) NOT NULL,
        name VARCHAR(128) NOT NULL,
        provider_mode VARCHAR(32) DEFAULT 'simulated',
        is_connected INT DEFAULT 1,
        capabilities TEXT,
        last_heartbeat TIMESTAMPTZ
      );
    `);
    await run(`
      CREATE TABLE IF NOT EXISTS connected_accounts (
        id VARCHAR(64) PRIMARY KEY,
        channel VARCHAR(64) NOT NULL,
        account_name VARCHAR(255) NOT NULL,
        account_identifier VARCHAR(255) NOT NULL,
        auth_type VARCHAR(64) DEFAULT 'oauth2',
        connection_status VARCHAR(64) DEFAULT 'connected_simulated',
        environment VARCHAR(64) DEFAULT 'sandbox_simulation',
        permissions_granted TEXT DEFAULT '[]',
        token_expires_at TIMESTAMPTZ,
        rate_limit_info TEXT,
        compliance_notes TEXT,
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      );
    `);
    await run(`
      CREATE TABLE IF NOT EXISTS activity_events (
        id VARCHAR(64) PRIMARY KEY,
        actor VARCHAR(128) NOT NULL,
        action VARCHAR(128) NOT NULL,
        entity_type VARCHAR(64),
        entity_id VARCHAR(64),
        details TEXT,
        created_at TIMESTAMPTZ NOT NULL
      );
    `);
    console.log('[DB] PostgreSQL schema verified.');
  } else {
    const schemaPath = path.join(__dirname, 'schema.sql');
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

  // Check if database needs seeding from snapshot
  const leadCheck = await query('SELECT COUNT(*) as count FROM leads');
  const count = Number(leadCheck[0]?.count || 0);
  if (count === 0) {
    await restoreFromSnapshot();
  }
};

/**
 * Restore complete demonstration data from seed_snapshot.json
 */
export const restoreFromSnapshot = async () => {
  const snapshotPath = path.join(__dirname, 'seed_snapshot.json');
  if (!fs.existsSync(snapshotPath)) {
    console.log('[Snapshot] No snapshot file found. Relying on default seed.');
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
            await run(`INSERT INTO ${table} (${colList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`, values);
          } else {
            await run(`INSERT OR IGNORE INTO ${table} (${colList}) VALUES (${placeholders})`, values);
          }
        } catch (err) {
          // Continue if any row fails
        }
      }
      console.log(`[Snapshot] Restored ${rows.length} rows into ${table}`);
    }
  }
  console.log('[Snapshot] Demo dataset successfully restored.');
};

export default { query, get, run, initDb, restoreFromSnapshot, isPostgres };
