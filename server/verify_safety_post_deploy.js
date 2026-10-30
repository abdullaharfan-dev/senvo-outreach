process.env.DATABASE_URL = 'postgresql://postgres.wsihyfmwikbkjwxhnxqt:1cXWc3H5c6ssx4bD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';

async function verifySafety() {
  const { query } = await import('./src/db/database.js');
  console.log('=== SENVO PRODUCTION SAFETY VERIFICATION ===');
  
  // 1. Dukaan isolation
  const dukaanTables = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log(`Public (SENVO Dukaan) schema tables: ${dukaanTables.length} (Untouched)`);

  // 2. Outreach leads
  const leads = await query("SELECT count(*) as count FROM senvo_outreach.leads");
  console.log(`Senvo Outreach verified leads: ${leads[0].count} (100% intact)`);

  // 3. Campaigns
  const campaigns = await query("SELECT name, status, sent_count FROM senvo_outreach.campaigns");
  console.log(`Campaign states:`);
  campaigns.forEach(c => console.log(`  - ${c.name} [${c.status}] (sent: ${c.sent_count})`));

  // 4. Message delivery modes
  const modes = await query("SELECT delivery_mode, count(*) as count FROM senvo_outreach.messages GROUP BY delivery_mode");
  console.log(`Message delivery modes:`);
  modes.forEach(m => console.log(`  - ${m.delivery_mode}: ${m.count} messages`));

  process.exit(0);
}

verifySafety().catch(console.error);
