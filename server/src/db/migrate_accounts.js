import { run, query } from './database.js';
import { v4 as uuidv4 } from 'uuid';

export const migrateAndSeedAccounts = async () => {
  await run(`
    CREATE TABLE IF NOT EXISTS connected_accounts (
      id TEXT PRIMARY KEY,
      channel TEXT NOT NULL,
      account_name TEXT NOT NULL,
      account_identifier TEXT NOT NULL,
      auth_type TEXT DEFAULT 'oauth2',
      connection_status TEXT DEFAULT 'connected_simulated',
      environment TEXT DEFAULT 'sandbox_simulation',
      permissions_granted TEXT DEFAULT '[]',
      token_expires_at TEXT,
      rate_limit_info TEXT,
      compliance_notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  const existing = await query('SELECT COUNT(*) as count FROM connected_accounts');
  if (existing[0].count === 0) {
    const now = new Date().toISOString();
    const accounts = [
      {
        channel: 'email',
        account_name: "Declan O'Sullivan (Primary Corporate Mailbox)",
        account_identifier: 'declan.osullivan@senvo.ie',
        auth_type: 'oauth2',
        connection_status: 'connected_simulated',
        environment: 'sandbox_simulation',
        permissions_granted: JSON.stringify(['Mail.ReadWrite', 'Mail.Send', 'User.Read', 'offline_access']),
        token_expires_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        rate_limit_info: '10,000 emails/day • Max 30 requests/sec',
        compliance_notes: 'Verified Microsoft 365 tenant. Custom Ireland corporate domain with DKIM, SPF & DMARC alignment active.'
      },
      {
        channel: 'email',
        account_name: 'Advisory Desk & Intake',
        account_identifier: 'advisory@senvo.ie',
        auth_type: 'oauth2',
        connection_status: 'connected_simulated',
        environment: 'sandbox_simulation',
        permissions_granted: JSON.stringify(['Mail.ReadWrite', 'Mail.Send']),
        token_expires_at: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
        rate_limit_info: '5,000 emails/day',
        compliance_notes: 'Dedicated statutory inquiry mailbox with auto-categorization enabled.'
      },
      {
        channel: 'linkedin',
        account_name: "Declan O'Sullivan (Executive Outreach)",
        account_identifier: 'linkedin.com/in/declan-osullivan-senvo',
        auth_type: 'oauth2',
        connection_status: 'connected_simulated',
        environment: 'sandbox_simulation',
        permissions_granted: JSON.stringify(['r_liteprofile', 'w_member_social', 'r_messages', 'w_messages']),
        token_expires_at: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString(),
        rate_limit_info: '100 connection requests/week • 50 InMails/month',
        compliance_notes: 'Member API compliance: Recipient interaction or 1st-degree connection required for direct messaging. Automated spam strictly prohibited.'
      },
      {
        channel: 'linkedin',
        account_name: 'SENVO Ireland Corporate Practice',
        account_identifier: 'linkedin.com/company/senvo-ireland',
        auth_type: 'oauth2',
        connection_status: 'connected_simulated',
        environment: 'sandbox_simulation',
        permissions_granted: JSON.stringify(['r_organization_social', 'w_organization_social', 'rw_organization_admin']),
        token_expires_at: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString(),
        rate_limit_info: 'Sponsored Messaging & Lead Gen Forms active',
        compliance_notes: 'Organization page connector for verified B2B corporate updates and content syndication.'
      },
      {
        channel: 'whatsapp',
        account_name: 'SENVO Dublin Client Desk',
        account_identifier: '+353 1 902 4410',
        auth_type: 'api_key',
        connection_status: 'connected_simulated',
        environment: 'sandbox_simulation',
        permissions_granted: JSON.stringify(['whatsapp_business_messaging', 'whatsapp_business_management']),
        token_expires_at: null,
        rate_limit_info: 'Tier 2 (10,000 business-initiated conversations/24hr)',
        compliance_notes: 'Meta Cloud API: 24-hour customer service window enforced. Outbound initiates require pre-approved Revenue & CRO template messages.'
      },
      {
        channel: 'facebook',
        account_name: 'SENVO Corporate Services Page',
        account_identifier: 'facebook.com/senvo.ireland',
        auth_type: 'oauth2',
        connection_status: 'connected_simulated',
        environment: 'sandbox_simulation',
        permissions_granted: JSON.stringify(['pages_messaging', 'pages_read_engagement', 'pages_manage_metadata']),
        token_expires_at: new Date(Date.now() + 45 * 24 * 3600 * 1000).toISOString(),
        rate_limit_info: 'Standard Messenger Platform rate limit',
        compliance_notes: 'Meta 24-hour messaging policy: standard replies within 24 hours of prospect inquiry.'
      },
      {
        channel: 'instagram',
        account_name: '@senvo_ireland (Professional)',
        account_identifier: '@senvo_ireland',
        auth_type: 'oauth2',
        connection_status: 'connected_simulated',
        environment: 'sandbox_simulation',
        permissions_granted: JSON.stringify(['instagram_basic', 'instagram_manage_messages']),
        token_expires_at: new Date(Date.now() + 45 * 24 * 3600 * 1000).toISOString(),
        rate_limit_info: 'Instagram Business Direct Messaging quota',
        compliance_notes: 'Direct messaging permitted only when prospects initiate contact, story replies, or mention the account.'
      },
      {
        channel: 'sms',
        account_name: 'SENVO Ireland SMS Direct Gateway',
        account_identifier: 'Alpha Sender: SENVO',
        auth_type: 'api_key',
        connection_status: 'connected_simulated',
        environment: 'sandbox_simulation',
        permissions_granted: JSON.stringify(['sms.send', 'sms.delivery_reports']),
        token_expires_at: null,
        rate_limit_info: '50 SMS/second via Irish Telco aggregator',
        compliance_notes: 'Irish ComReg & GDPR compliance: Alpha sender ID registered. Marketing SMS strictly requires explicit opt-in and standard STOP command.'
      },
      {
        channel: 'website',
        account_name: 'SENVO Corporate Website Inbound Intake',
        account_identifier: 'senvo.ie/corporate-advisory',
        auth_type: 'webhook',
        connection_status: 'connected_simulated',
        environment: 'sandbox_simulation',
        permissions_granted: JSON.stringify(['inbound.webhooks', 'lead.ingest']),
        token_expires_at: null,
        rate_limit_info: 'Unlimited inbound webhook requests (Rate-limited at 100/min per IP)',
        compliance_notes: 'INBOUND ONLY: Website inquiries act as an intake capture source. Outbound responses route automatically via Email or SMS.'
      }
    ];

    for (const acc of accounts) {
      await run(
        `INSERT INTO connected_accounts (id, channel, account_name, account_identifier, auth_type, connection_status, environment, permissions_granted, token_expires_at, rate_limit_info, compliance_notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), acc.channel, acc.account_name, acc.account_identifier, acc.auth_type, acc.connection_status, acc.environment, acc.permissions_granted, acc.token_expires_at, acc.rate_limit_info, acc.compliance_notes, now, now]
      );
    }
    console.log('[Accounts] Seeded default connected accounts for SENVO Ireland.');
  }
};

// Run if called directly
if (process.argv[1]?.endsWith('migrate_accounts.js')) {
  migrateAndSeedAccounts()
    .then(() => {
      console.log('Migration and seeding successful.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
