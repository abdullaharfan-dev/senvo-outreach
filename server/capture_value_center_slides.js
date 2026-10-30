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
const PORT = 4198;

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
          res.end(JSON.stringify({ error: e.message }));
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

async function captureAllTabs() {
  const server = await startServer();
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.addInitScript(() => {
    localStorage.setItem('senvo_demo_tour_completed', 'true');
  });

  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Navigate to Client Value Center
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Client Value Center'));
    if (btn) btn.click();
  });
  await page.waitForTimeout(1000);

  // 1. Module A
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'value_center_module_a.png') });
  console.log('Saved Module A screenshot');

  // 2. Module B
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Module B: Personalized Campaigns'));
    if (btn) btn.click();
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'value_center_module_b.png') });
  console.log('Saved Module B screenshot');

  // 3. Module C
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Module C: AI Conversation Showcase'));
    if (btn) btn.click();
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'value_center_module_c.png') });
  console.log('Saved Module C screenshot');

  // 4. Module D
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Module D: 30-Day Plan'));
    if (btn) btn.click();
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'value_center_module_d.png') });
  console.log('Saved Module D screenshot');

  // 5. Module E
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Module E: Client Value Report'));
    if (btn) btn.click();
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'value_center_module_e.png') });
  console.log('Saved Module E screenshot');

  await browser.close();
  server.close();
  console.log('All 5 module screenshots successfully captured!');
}

captureAllTabs().catch(console.error);
