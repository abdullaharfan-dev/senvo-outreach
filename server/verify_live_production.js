import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\786\\.gemini\\antigravity\\brain\\a54abb61-a09d-4f28-8ba7-f0367d8cbf78';
const LIVE_SCREENSHOT_DIR = path.join(ARTIFACT_DIR, 'live_production_screenshots');
const LIVE_URL = 'https://senvo-outreach-demo.netlify.app';

if (!fs.existsSync(LIVE_SCREENSHOT_DIR)) {
  fs.mkdirSync(LIVE_SCREENSHOT_DIR, { recursive: true });
}

async function verifyLiveProduction() {
  console.log('=== STARTING LIVE PRODUCTION VERIFICATION ===');
  console.log('Target Production URL:', LIVE_URL);

  // 1. Live API Benchmark (Cold & Warm)
  console.log('\n[1/5] Testing Live Production APIs...');
  const endpoints = ['/api/health', '/api/overview', '/api/leads', '/api/campaigns', '/api/accounts', '/api/inbox/conversations'];

  for (const ep of endpoints) {
    const t0 = performance.now();
    const res = await fetch(`${LIVE_URL}${ep}`);
    const elapsed = (performance.now() - t0).toFixed(2);
    console.log(`  ${ep} -> HTTP ${res.status} in ${elapsed}ms`);
  }

  console.log('\n--- Measuring Live /api/overview Latency (Cold & Warm) ---');
  for (let i = 1; i <= 3; i++) {
    const t0 = performance.now();
    const res = await fetch(`${LIVE_URL}/api/overview`);
    const elapsed = (performance.now() - t0).toFixed(2);
    const data = await res.json();
    console.log(`  Run #${i}: ${elapsed}ms (Total leads: ${data.summary.total_leads}, Funnel: ${data.funnel.length} stages)`);
  }

  // 2. Headless Browser Verification
  console.log('\n[2/5] Launching Browser for Live UI Walkthrough...');
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  try {
    // Navigate to live site
    console.log('Navigating to live production site...');
    const tNav = Date.now();
    await page.goto(LIVE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Total Leads Registered', { timeout: 15000 });
    const liveRenderTime = Date.now() - tNav;
    console.log(`✓ Live Executive Overview rendered in ${liveRenderTime}ms`);

    // Verify login screen was bypassed
    const hasLogin = await page.$('input[type="password"]');
    console.log(`✓ Direct demo access (No login screen): ${!hasLogin}`);
    await page.screenshot({ path: path.join(LIVE_SCREENSHOT_DIR, '01_live_overview.png') });

    // 3. Test Navigation Modules
    console.log('\n[3/5] Testing Primary Navigation Modules...');
    const modules = [
      { name: 'Leads', selector: 'button:has-text("Leads & Segments")', verifyText: 'Lead Intelligence & Prospect Directory' },
      { name: 'Campaigns', selector: 'button:has-text("Campaigns")', verifyText: 'Campaign Dispatch & Audience Orchestration' },
      { name: 'Inbox', selector: 'button:has-text("Unified Inbox")', verifyText: 'All Channels' },
      { name: 'Qualified Leads', selector: 'button:has-text("Qualified Leads")', verifyText: 'Meeting Conversion Workspace & Bitrix24 CRM Handoffs' },
      { name: 'Analytics', selector: 'button:has-text("Analytics & KPIs")', verifyText: 'Executive Performance & Conversion Analytics' },
      { name: 'Knowledge', selector: 'button:has-text("Company Knowledge")', verifyText: 'Approved Company Knowledge & Compliance Grounding' },
      { name: 'Integrations', selector: 'button:has-text("Connected Accounts")', verifyText: 'Connected Accounts & Integration Gateways' },
      { name: 'Settings', selector: 'button:has-text("Settings & Health")', verifyText: 'System Configuration & Platform Diagnostics' },
    ];

    for (const mod of modules) {
      await page.click(mod.selector);
      await page.waitForSelector(`text=${mod.verifyText}`, { timeout: 10000 });
      console.log(`  ✓ Module [${mod.name}] verified live`);
    }

    // 4. Test Client Value Center & All 5 Sub-Modules
    console.log('\n[4/5] Testing Client Value Center & Commercial Value Model...');
    await page.click('button:has-text("Client Value Center")');
    await page.waitForSelector('text=Client Value Center', { timeout: 10000 });
    console.log('  ✓ Client Value Center container loaded');

    // Sub-Module A: Business Opportunities
    await page.waitForSelector('text=Verified Corporate Prospects', { timeout: 10000 });
    console.log('  ✓ Module A: Business Opportunities verified');

    // Sub-Module B: Personalized Campaigns
    await page.click('button:has-text("Module B")');
    await page.waitForSelector('text=Personalized Multi-Touch Outreach Sequence Preview', { timeout: 10000 });
    console.log('  ✓ Module B: Personalized Campaigns verified');

    // Sub-Module C: AI Conversation Showcase
    await page.click('button:has-text("Module C")');
    await page.waitForSelector('text=Interactive AI Conversation Scenarios', { timeout: 10000 });
    console.log('  ✓ Module C: AI Conversation Showcase verified');

    // Sub-Module D: 30-Day Plan
    await page.click('button:has-text("Module D")');
    await page.waitForSelector('text=30-Day Client Onboarding & Advisory Activation Roadmap', { timeout: 10000 });
    console.log('  ✓ Module D: 30-Day Plan verified');

    // Sub-Module E: Commercial Opportunity Model
    console.log('Opening Module E: Commercial Opportunity Model...');
    await page.click('button:has-text("Module E")');
    await page.waitForSelector('text=Commercial Opportunity & Value Model', { timeout: 10000 });
    console.log('  ✓ Module E: Commercial Opportunity Model loaded successfully!');

    // Base Case Screenshot
    await page.screenshot({ path: path.join(LIVE_SCREENSHOT_DIR, '02_live_cvc_model_base_case.png'), fullPage: true });

    // Test Conservative Scenario
    await page.click('button:has-text("conservative")');
    await page.waitForTimeout(400);
    console.log('  ✓ Switched to Conservative Scenario');
    await page.screenshot({ path: path.join(LIVE_SCREENSHOT_DIR, '03_live_cvc_model_conservative.png'), fullPage: true });

    // Test Ambitious Scenario
    await page.click('button:has-text("ambitious")');
    await page.waitForTimeout(400);
    console.log('  ✓ Switched to Ambitious Scenario');
    await page.screenshot({ path: path.join(LIVE_SCREENSHOT_DIR, '04_live_cvc_model_ambitious.png'), fullPage: true });

    // Test Scenario Matrix View
    await page.click('button:has-text("Scenario Matrix")');
    await page.waitForSelector('text=Comparative Scenario Matrix', { timeout: 5000 });
    console.log('  ✓ Comparative Scenario Matrix view verified');
    await page.screenshot({ path: path.join(LIVE_SCREENSHOT_DIR, '05_live_cvc_model_scenario_matrix.png'), fullPage: true });

    // Test Executive Report Canvas
    await page.click('button:has-text("Executive Report Canvas")');
    await page.waitForSelector('text=Executive Strategy & Commercial Valuation Canvas', { timeout: 5000 });
    console.log('  ✓ Executive Report Canvas view verified');
    await page.screenshot({ path: path.join(LIVE_SCREENSHOT_DIR, '06_live_cvc_model_executive_report.png'), fullPage: true });

    // 5. Test Mobile Viewport (375x667)
    console.log('\n[5/5] Testing Mobile Responsiveness on Live Production...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.click('button:has-text("Interactive Model")');
    await page.waitForTimeout(400);

    const isHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log(`  ✓ Mobile horizontal overflow check: ${isHorizontalOverflow ? 'FAIL (Overflow)' : 'PASS (No overflow)'}`);
    await page.screenshot({ path: path.join(LIVE_SCREENSHOT_DIR, '07_live_cvc_model_mobile.png'), fullPage: true });

    console.log('\n=== LIVE PRODUCTION VERIFICATION COMPLETE ===');
    console.log(`Console Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('Console Errors found:', consoleErrors);
    }
  } catch (err) {
    console.error('Error during live verification:', err);
  } finally {
    await browser.close();
  }
}

verifyLiveProduction().catch(console.error);
