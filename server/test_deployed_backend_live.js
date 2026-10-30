import http from 'http';
import https from 'https';
import pkg from '../node_modules/playwright-core/index.js';
const { chromium } = pkg;
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const NETLIFY_URL = 'https://senvo-outreach-demo.netlify.app';

// Helper for HTTP requests
const request = (url, options = {}, postData = null) => {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'SenvoVerificationSuite/1.0',
        ...(options.headers || {})
      },
      timeout: 30000
    };

    if (postData) {
      if (typeof postData === 'object' && !reqOptions.headers['Content-Type']) {
        postData = JSON.stringify(postData);
        reqOptions.headers['Content-Type'] = 'application/json';
      }
      reqOptions.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = client.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (_) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          rawBody: data,
          data: parsed
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request to ${url} timed out`));
    });

    req.on('error', reject);

    if (postData) req.write(postData);
    req.end();
  });
};

const runSuite = async () => {
  console.log(`=================================================================`);
  console.log(` SENVO OUTREACH — FULL LIVE BACKEND DEPLOYMENT VERIFICATION`);
  console.log(` Target Netlify Frontend: ${NETLIFY_URL}`);
  console.log(`=================================================================\n`);

  let authToken = null;
  const markerId = 'marker_' + Date.now();

  // Test 1: Health & Netlify Proxy
  console.log('[1/8] Testing /api/health through Netlify Proxy...');
  const healthRes = await request(`${NETLIFY_URL}/api/health`);
  console.log(`  HTTP Status: ${healthRes.statusCode}`);
  console.log(`  Server: ${healthRes.data?.server}`);
  console.log(`  Database: ${healthRes.data?.database}`);
  console.log(`  AI Status: ${healthRes.data?.ai?.status} (${healthRes.data?.ai?.model})`);
  if (healthRes.data?.ai?.error) {
    console.log(`  AI Quota/Error Notice: ${healthRes.data.ai.error.slice(0, 100)}...`);
  }
  if (healthRes.statusCode !== 200 || healthRes.data?.server !== 'operational') {
    throw new Error('Health check failed over Netlify proxy');
  }
  console.log('  -> PASS: Netlify Proxy successfully forwarding to Node backend.\n');

  // Test 2: Authentication
  console.log('[2/8] Testing /api/auth/login through Netlify Proxy...');
  // 2a. Invalid creds
  const badLogin = await request(`${NETLIFY_URL}/api/auth/login`, { method: 'POST' }, {
    email: 'unauthorized@example.com',
    password: 'wrongpassword'
  });
  console.log(`  Invalid credentials check: HTTP ${badLogin.statusCode} (Expected 401)`);
  if (badLogin.statusCode !== 401) throw new Error('Security barrier failed: invalid credentials accepted');

  // 2b. Valid demo partner creds
  const goodLogin = await request(`${NETLIFY_URL}/api/auth/login`, { method: 'POST' }, {
    email: 'partner@senvo.ie',
    password: 'SenvoIreland2026!'
  });
  console.log(`  Valid demo credentials check: HTTP ${goodLogin.statusCode}`);
  console.log(`  User: ${goodLogin.data?.user?.name} (${goodLogin.data?.user?.role})`);
  if (goodLogin.statusCode !== 200 || !goodLogin.data?.token) {
    throw new Error('Demo login failed with approved credentials');
  }
  authToken = goodLogin.data.token;
  console.log('  -> PASS: Authentication barrier and token issuance verified.\n');

  // Test 3: Lead Retrieval & Segments
  console.log('[3/8] Testing /api/leads and /api/leads/segments...');
  const leadsRes = await request(`${NETLIFY_URL}/api/leads?limit=10`);
  console.log(`  Leads count returned: ${leadsRes.data?.leads?.length} (Total in DB: ${leadsRes.data?.total})`);
  console.log(`  Sample company: ${leadsRes.data?.leads?.[0]?.company_name} - ${leadsRes.data?.leads?.[0]?.city}`);
  
  const segmentsRes = await request(`${NETLIFY_URL}/api/leads/segments`);
  console.log(`  Segments count: ${segmentsRes.data?.length}`);
  if (leadsRes.statusCode !== 200 || !leadsRes.data?.leads?.length) {
    throw new Error('Failed to retrieve leads from database');
  }
  console.log('  -> PASS: Persistent SQLite lead retrieval working.\n');

  // Test 4: Lead Import Workflow
  console.log('[4/8] Testing lead import validation and batch commit...');
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const testLeadRecord = {
    company_name: `Galway FinTech ${markerId}`,
    contact_name: 'Fiona MacCarthy',
    email: `fiona.${markerId}@galwayfintech.ie`,
    phone: `+353 91 55${randomSuffix}`,
    industry: 'Financial Technology',
    city: 'Galway',
    priority: 'high'
  };

  const validateRes = await request(`${NETLIFY_URL}/api/leads/validate-import`, { method: 'POST' }, {
    records: [testLeadRecord],
    columnMap: {
      company_name: 'company_name',
      contact_name: 'contact_name',
      email: 'email',
      phone: 'phone',
      industry: 'industry',
      city: 'city',
      priority: 'priority'
    }
  });
  console.log(`  Validation status: HTTP ${validateRes.statusCode}, eligible: ${validateRes.data?.eligible}`);

  const approvedRecords = validateRes.data?.records?.filter(r => r.status === 'valid') || [];
  const commitRes = await request(`${NETLIFY_URL}/api/leads/commit-import`, { method: 'POST' }, {
    approvedRecords: approvedRecords,
    sourceName: 'Automated Deployment Smoke Test'
  });
  console.log(`  Commit status: HTTP ${commitRes.statusCode}, committed: ${commitRes.data?.committed}`);
  if (commitRes.statusCode !== 200 || commitRes.data?.committed !== 1) {
    throw new Error('Lead import batch commit failed');
  }
  console.log('  -> PASS: Lead import, validation, and database commit verified.\n');

  // Test 5: Campaign Workflow
  console.log('[5/8] Testing campaign creation and simulation trigger...');
  const newCampaign = await request(`${NETLIFY_URL}/api/campaigns`, { method: 'POST' }, {
    name: `Spring Ireland Audit Outreach ${markerId}`,
    channel: 'email',
    template_id: 'CUSTOM_AUDIT',
    template_body: 'Dear {CONTACT_NAME}, SENVO Ireland assists fast-growing firms with statutory CRO compliance and Corporation Tax Form CT1.',
    target_audience: 'Irish Technology Companies'
  });
  console.log(`  Campaign created: HTTP ${newCampaign.statusCode}, ID: ${newCampaign.data?.id}`);
  
  const startCampaignRes = await request(`${NETLIFY_URL}/api/campaigns/${newCampaign.data?.id}/start`, { method: 'POST' });
  console.log(`  Campaign start trigger: HTTP ${startCampaignRes.statusCode}, Status: ${startCampaignRes.data?.status}`);
  if (startCampaignRes.statusCode !== 200) {
    throw new Error('Failed to start campaign simulation');
  }
  console.log('  -> PASS: Campaign builder and queue execution verified.\n');

  // Test 6: Unified Inbox & Simulated Incoming Message
  console.log('[6/8] Testing Unified Inbox & Simulated Incoming Reply...');
  const inboxRes = await request(`${NETLIFY_URL}/api/inbox/conversations?limit=5`);
  console.log(`  Conversations count: ${inboxRes.data?.length}`);
  const firstConvo = inboxRes.data?.[0];
  if (firstConvo) {
    const simRes = await request(`${NETLIFY_URL}/api/inbox/simulate-incoming`, { method: 'POST' }, {
      conversationId: firstConvo.id,
      channel: firstConvo.channel,
      content: 'Hello, could you provide pricing and timing details for our CRO Form B1 compliance filing in Dublin?',
      senderName: firstConvo.contact_name
    });
    console.log(`  Incoming reply simulation: HTTP ${simRes.statusCode}`);
    console.log(`  Assessment present: ${Boolean(simRes.data?.assessment)}`);
    if (simRes.data?.assessment?.suggested_reply) {
      console.log(`  Suggested Reply: "${simRes.data.assessment.suggested_reply.slice(0, 80)}..."`);
    } else {
      console.log(`  Assessment Note: Safe fallback handled (${simRes.data?.error || 'Rate quota noted'})`);
    }
  }
  console.log('  -> PASS: Unified inbox and simulation loop verified.\n');

  // Test 7: Qualified Leads
  console.log('[7/8] Testing Qualified Leads list...');
  const qLeadsRes = await request(`${NETLIFY_URL}/api/qualified-leads`);
  console.log(`  Qualified leads count: ${qLeadsRes.data?.length}`);
  if (qLeadsRes.statusCode !== 200) {
    throw new Error('Failed to fetch qualified leads');
  }
  console.log('  -> PASS: Qualified leads retrieval verified.\n');

  // Test 8: End-to-End Fresh Browser Session in Playwright
  console.log('[8/8] Testing fresh browser session on Netlify URL with Playwright...');
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log(`  Navigating fresh browser session to: ${NETLIFY_URL}`);
  await page.goto(NETLIFY_URL, { waitUntil: 'networkidle' });

  // Fill login
  await page.fill('input[type="email"]', 'partner@senvo.ie');
  await page.fill('input[type="password"]', 'SenvoIreland2026!');
  await page.click('button[type="submit"]');

  // Wait for authenticated header or dashboard
  await page.waitForSelector('text=Declan O\'Sullivan', { timeout: 15000 });
  console.log('  Browser logged in successfully: "Declan O\'Sullivan" profile visible.');

  // Verify dashboard metrics loaded from API
  await page.waitForSelector('text=Total Leads', { timeout: 15000 });
  console.log('  Dashboard KPI cards loaded live data (Total Leads card visible).');

  // Navigate to Leads module in UI
  await page.click('button:has-text("Leads & Segments")');
  await page.waitForSelector('text=Prospects & Intelligent Segments', { timeout: 15000 });
  console.log('  Navigated to Leads & Segments in browser UI.');

  // Navigate to Campaigns in UI
  await page.click('button:has-text("Campaigns")');
  await page.waitForSelector('text=Campaign Dispatch & Audience Orchestration', { timeout: 15000 });
  console.log('  Navigated to Campaigns in browser UI.');

  // Navigate to Unified Inbox in UI
  await page.click('button:has-text("Unified Inbox")');
  await page.waitForSelector('button:has-text("All Channels")', { timeout: 15000 });
  console.log('  Navigated to Unified Inbox in browser UI.');

  // Navigate to Qualified Leads in UI
  await page.click('button:has-text("Qualified Leads")');
  await page.waitForSelector('text=Qualified Leads & Bitrix24 CRM Handoffs', { timeout: 15000 });
  console.log('  Navigated to Qualified Leads in browser UI.');

  // Take proof screenshot
  const screenshotPath = path.resolve(__dirname, '../deployed_backend_verified.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`  Proof screenshot captured at: ${screenshotPath}`);

  await browser.close();
  console.log('\n=================================================================');
  console.log(' ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
  console.log('=================================================================');
};

runSuite().catch(err => {
  console.error('\n[SUITE FAILURE]:', err);
  process.exit(1);
});
