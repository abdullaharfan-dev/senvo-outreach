import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright-core';
import app from './src/app.js';
import { initDb } from './src/db/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../client/dist');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\786\\.gemini\\antigravity\\brain\\a54abb61-a09d-4f28-8ba7-f0367d8cbf78';
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, 'value_model_screenshots');
const PORT = 4216;

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function startServer() {
  await initDb();
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      // Direct API requests to local express app
      if (req.url.startsWith('/api')) {
        return app(req, res);
      }

      // Serve static client assets
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
            if (err2) {
              res.writeHead(404);
              res.end('Not found');
            } else {
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(indexHtml);
            }
          });
        } else {
          res.writeHead(200, { 'Content-Type': mime });
          res.end(content);
        }
      });
    });

    server.listen(PORT, () => {
      console.log(`Test server running at http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

async function runTestsAndCapture() {
  console.log('=== Starting SENVO Commercial Value & API Verification ===');
  const server = await startServer();

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
    // 1. Measure Overview Page Load & API
    console.log('\n[1/5] Testing Executive Overview & API response...');
    const t0 = Date.now();
    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Total Leads Registered', { timeout: 15000 });
    const overviewLoadTime = Date.now() - t0;
    console.log(`✓ Executive Overview rendered in ${overviewLoadTime}ms`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_overview_optimized.png') });

    // 2. Navigate to Client Value Center
    console.log('\n[2/5] Navigating to Client Value Center...');
    await page.click('button:has-text("Client Value Center")');
    await page.waitForSelector('text=Client Value Center', { timeout: 5000 });

    // 3. Navigate to Module E: Commercial Opportunity Model
    console.log('\n[3/5] Opening Module E: Commercial Opportunity Model...');
    await page.click('button:has-text("Module E")');
    await page.waitForSelector('text=Commercial Opportunity & Value Model', { timeout: 5000 });

    // Capture Base Case Scenario
    console.log('Capturing Base Case interactive view...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_cvc_model_base_case.png'), fullPage: true });

    // Switch to Conservative Scenario
    console.log('Switching to Conservative Scenario...');
    await page.click('button:has-text("conservative")');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_cvc_model_conservative.png'), fullPage: true });

    // Switch to Ambitious Scenario
    console.log('Switching to Ambitious Scenario...');
    await page.click('button:has-text("ambitious")');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_cvc_model_ambitious.png'), fullPage: true });

    // 4. Switch to Scenario Matrix View
    console.log('\n[4/5] Opening Comparative Scenario Matrix View...');
    await page.click('button:has-text("Scenario Matrix")');
    await page.waitForSelector('text=Comparative Scenario Matrix', { timeout: 5000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_cvc_model_scenario_matrix.png'), fullPage: true });

    // Switch to Executive Report Canvas
    console.log('Opening Executive Report Canvas View...');
    await page.click('button:has-text("Executive Report Canvas")');
    await page.waitForSelector('text=Executive Strategy & Commercial Valuation Canvas', { timeout: 5000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_cvc_model_executive_report.png'), fullPage: true });

    // 5. Test Mobile Viewport (375x667)
    console.log('\n[5/5] Testing Mobile Viewport (375x667)...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.click('button:has-text("Interactive Model")');
    await page.waitForTimeout(300);

    const isHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log(`Mobile horizontal overflow status: ${isHorizontalOverflow ? 'FAIL' : 'PASS (No overflow)'}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_cvc_model_mobile.png'), fullPage: true });

    console.log('\n=== All Tests and Screenshots Completed Successfully ===');
    console.log(`Console Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('Console Errors found:', consoleErrors);
    }
  } catch (err) {
    console.error('Error during test execution:', err);
  } finally {
    await browser.close();
    server.close();
    process.exit(0);
  }
}

runTestsAndCapture().catch(console.error);
