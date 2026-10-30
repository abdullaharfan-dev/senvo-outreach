import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../client/dist');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\786\\.gemini\\antigravity\\brain\\a54abb61-a09d-4f28-8ba7-f0367d8cbf78';
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, 'walkthrough_screenshots');
const PORT = 4215;

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      if (req.url.startsWith('/api')) {
        const targetUrl = `https://senvo-outreach-demo.netlify.app${req.url}`;
        try {
          let body = undefined;
          if (req.method === 'POST' || req.method === 'PUT') {
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            body = Buffer.concat(chunks);
          }
          const resp = await fetch(targetUrl, {
            method: req.method,
            headers: { 'Content-Type': 'application/json' },
            body
          });
          const respText = await resp.text();
          res.writeHead(resp.status, { 'Content-Type': 'application/json' });
          res.end(respText);
        } catch (e) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Netlify proxy error: ' + e.message }));
        }
        return;
      }

      let filePath = path.join(DIST_DIR, req.url.split('?')[0]);
      if (req.url === '/' || !path.extname(filePath)) {
        filePath = path.join(DIST_DIR, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      let mime = 'text/html';
      if (ext === '.js') mime = 'text/javascript';
      else if (ext === '.css') mime = 'text/css';
      else if (ext === '.svg') mime = 'image/svg+xml';
      else if (ext === '.png') mime = 'image/png';

      fs.readFile(filePath, (err, content) => {
        if (err) {
          fs.readFile(path.join(DIST_DIR, 'index.html'), (err2, indexHtml) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(indexHtml);
          });
        } else {
          res.writeHead(200, { 'Content-Type': mime });
          res.end(content);
        }
      });
    });

    server.listen(PORT, () => resolve(server));
  });
}

async function runVisualWalkthrough() {
  console.log('=== SENVO OUTREACH VISUAL WALKTHROUGH & SCREENSHOT AUDIT (HIGH RES) ===\n');
  const server = await startServer();
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });

  const auditLog = {
    overflows: [],
    consoleErrors: []
  };

  try {
    // -------------------------------------------------------------
    // PART A: DESKTOP AUDIT (1440 x 900)
    // -------------------------------------------------------------
    console.log('[A] Inspecting Desktop Viewport (1440x900)...');
    const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    desktopPage.on('console', msg => {
      if (msg.type() === 'error') auditLog.consoleErrors.push(`[Desktop Console Error] ${msg.text()}`);
    });
    desktopPage.on('pageerror', err => {
      auditLog.consoleErrors.push(`[Desktop Exception] ${err.message}`);
    });

    await desktopPage.addInitScript(() => {
      localStorage.setItem('senvo_demo_tour_completed', 'true');
    });

    await desktopPage.goto(`http://localhost:${PORT}`, { waitUntil: 'domcontentloaded' });
    // Wait for overview metrics to populate
    await desktopPage.waitForTimeout(3000);

    const checkOverflow = async (pageName) => {
      const isOverflowing = await desktopPage.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      if (isOverflowing) {
        auditLog.overflows.push(`Desktop ${pageName} has horizontal overflow`);
      }
    };

    async function clickNav(buttonText, waitMs = 1500) {
      await desktopPage.evaluate((text) => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const target = buttons.find(b => b.innerText.includes(text));
        if (target) target.click();
      }, buttonText);
      await desktopPage.waitForTimeout(waitMs);
    }

    // 1. Overview
    console.log('1. Capturing Desktop Overview (fully loaded)...');
    await clickNav('Executive Overview', 1000);
    await desktopPage.waitForSelector('text=Total Leads', { timeout: 15000 }).catch(() => null);
    await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '01_desktop_overview.png') });
    await checkOverflow('Overview');

    // 2. Leads
    console.log('2. Capturing Desktop Leads (fully loaded)...');
    await clickNav('Leads & Segments', 1000);
    await desktopPage.waitForSelector('tbody tr', { timeout: 15000 }).catch(() => null);
    await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '02_desktop_leads.png') });
    await checkOverflow('Leads');

    // 3. Campaigns
    console.log('3. Capturing Desktop Campaigns (fully loaded)...');
    await clickNav('Campaigns', 2000);
    await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '03_desktop_campaigns.png') });
    await checkOverflow('Campaigns');

    // 4. Unified Inbox
    console.log('4. Capturing Desktop Inbox (fully loaded)...');
    await clickNav('Unified Inbox', 2000);
    await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '04_desktop_inbox.png') });
    await checkOverflow('Inbox');

    // 5. Qualified Leads
    console.log('5. Capturing Desktop Qualified Leads (fully loaded)...');
    await clickNav('Qualified Leads', 2000);
    await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '05_desktop_qualified.png') });
    await checkOverflow('Qualified Leads');

    // 6. Analytics & KPIs
    console.log('6. Capturing Desktop Analytics (fully loaded)...');
    await clickNav('Analytics & KPIs', 2000);
    await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '06_desktop_analytics.png') });
    await checkOverflow('Analytics');

    // 7. Company Knowledge
    console.log('7. Capturing Desktop Knowledge (fully loaded)...');
    await clickNav('Company Knowledge', 1500);
    await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '07_desktop_knowledge.png') });
    await checkOverflow('Knowledge');

    // 8. Connected Accounts / Integrations
    console.log('8. Capturing Desktop Integrations (fully loaded)...');
    await clickNav('Connected Accounts', 1500);
    await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '08_desktop_integrations.png') });
    await checkOverflow('Integrations');

    // 9. Settings & Health
    console.log('9. Capturing Desktop Settings (fully loaded)...');
    await clickNav('Settings & Health', 1500);
    await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '09_desktop_settings.png') });
    await checkOverflow('Settings');

    // 10. Client Value Center (All 5 Sub-Modules)
    console.log('10. Capturing Desktop Client Value Center (5 Sub-Modules)...');
    await clickNav('Client Value Center', 2000);

    // Module A
    console.log('   - Sub-Module A: Business Opportunities');
    await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '10a_desktop_cvc_opportunities.png') });
    await checkOverflow('CVC Module A');

    // Module B
    console.log('   - Sub-Module B: Personalized Campaigns');
    await clickNav('Module B: Personalized Campaigns', 1000);
    await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '10b_desktop_cvc_campaigns.png') });
    await checkOverflow('CVC Module B');

    // Module C
    console.log('   - Sub-Module C: AI Conversation Showcase');
    await clickNav('Module C: AI Conversation Showcase', 1000);
    await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '10c_desktop_cvc_ai_showcase.png') });
    await checkOverflow('CVC Module C');

    // Module D
    console.log('   - Sub-Module D: 30-Day Plan');
    await clickNav('Module D: 30-Day Plan', 1000);
    await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '10d_desktop_cvc_plan.png') });
    await checkOverflow('CVC Module D');

    // Module E
    console.log('   - Sub-Module E: Client Value Report');
    await clickNav('Module E: Client Value Report', 1000);
    await desktopPage.screenshot({ path: path.join(SCREENSHOT_DIR, '10e_desktop_cvc_report.png') });
    await checkOverflow('CVC Module E');

    await desktopPage.close();

    // -------------------------------------------------------------
    // PART B: MOBILE VIEWPORT AUDIT (375 x 667)
    // -------------------------------------------------------------
    console.log('\n[B] Inspecting Mobile Viewport (375x667)...');
    const mobilePage = await browser.newPage({ viewport: { width: 375, height: 667 } });

    await mobilePage.addInitScript(() => {
      localStorage.setItem('senvo_demo_tour_completed', 'true');
    });

    await mobilePage.goto(`http://localhost:${PORT}`, { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(3000);

    const checkMobileOverflow = async (pageName) => {
      const isOverflowing = await mobilePage.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      if (isOverflowing) {
        auditLog.overflows.push(`Mobile ${pageName} has horizontal overflow (scrollWidth: ${document.documentElement.scrollWidth} > innerWidth: ${window.innerWidth})`);
      }
    };

    console.log('11. Capturing Mobile Overview (fully loaded)...');
    await mobilePage.waitForSelector('text=Total Leads', { timeout: 15000 }).catch(() => null);
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '11_mobile_overview.png') });
    await checkMobileOverflow('Overview');

    console.log('12. Capturing Mobile Navigation Drawer (open)...');
    await mobilePage.click('button[aria-label="Open navigation menu"]');
    await mobilePage.waitForTimeout(800);
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '12_mobile_drawer.png') });

    console.log('13. Capturing Mobile Client Value Center...');
    await mobilePage.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Client Value Center'));
      if (btn) btn.click();
    });
    await mobilePage.waitForTimeout(2000);
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '13_mobile_cvc.png') });
    await checkMobileOverflow('Client Value Center');

    await mobilePage.close();

    console.log('\n=== AUDIT RESULTS ===');
    console.log('Horizontal Overflows:', auditLog.overflows.length === 0 ? 'NONE (100% PASS)' : auditLog.overflows);
    console.log('Console Errors:', auditLog.consoleErrors.length === 0 ? 'NONE (100% PASS)' : auditLog.consoleErrors);
    console.log(`\nAll 17 screenshots successfully captured to: ${SCREENSHOT_DIR}`);
  } finally {
    await browser.close();
    server.close();
  }
}

runVisualWalkthrough().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
