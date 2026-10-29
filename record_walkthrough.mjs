import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const recordingsDir = path.resolve('recordings');

if (!fs.existsSync(recordingsDir)) {
  fs.mkdirSync(recordingsDir, { recursive: true });
}

async function runWalkthrough() {
  console.log('[Walkthrough] Launching Chrome for automated demo recording...');
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: {
      dir: recordingsDir,
      size: { width: 1280, height: 800 },
    },
  });

  const page = await context.newPage();
  console.log('[Walkthrough] Navigating to SENVO Outreach at http://localhost:3001...');
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 1. Overview Module
  console.log('[Walkthrough] Demonstrating Overview Module...');
  await page.waitForTimeout(3000);

  // 2. Leads Module
  console.log('[Walkthrough] Demonstrating Leads Module...');
  await page.click('button:has-text("Leads")');
  await page.waitForTimeout(2000);
  // Click first lead to view profile
  await page.click('text=Apex Logistics Ireland Ltd');
  await page.waitForTimeout(2500);
  await page.click('text=Close Drawer');
  await page.waitForTimeout(1000);

  // 3. Campaigns Module
  console.log('[Walkthrough] Demonstrating Campaigns Module...');
  await page.click('button:has-text("Campaigns")');
  await page.waitForTimeout(2500);
  // Start simulated campaign
  const startBtn = await page.$('text=Start Simulated Send');
  if (startBtn) {
    console.log('[Walkthrough] Triggering Start Simulated Send...');
    await startBtn.click();
    await page.waitForTimeout(3500);
  }

  // 4. Unified Inbox Module
  console.log('[Walkthrough] Demonstrating Unified Inbox Module...');
  await page.click('button:has-text("Unified Inbox")');
  await page.waitForTimeout(2500);

  // Filter channels
  console.log('[Walkthrough] Demonstrating Channel Filter Tabs...');
  await page.click('button:has-text("Email / Outlook")');
  await page.waitForTimeout(1500);
  await page.click('button:has-text("LinkedIn")');
  await page.waitForTimeout(1500);
  await page.click('button:has-text("WhatsApp")');
  await page.waitForTimeout(1500);
  await page.click('button:has-text("All Channels")');
  await page.waitForTimeout(1500);

  // Select first conversation
  await page.click('text=Apex Logistics Ireland Ltd');
  await page.waitForTimeout(2000);

  // Demonstrate Simulate Inbound Lead Modal
  console.log('[Walkthrough] Triggering Simulate Incoming Lead...');
  await page.click('text=Simulate Incoming Lead');
  await page.waitForTimeout(2000);

  // Select Preset 2 (R&D Tax Credit Advisory)
  console.log('[Walkthrough] Applying MedTech R&D Tax Credit scenario...');
  await page.click('text=R&D Tax Credit Advisory (MedTech Galway)');
  await page.waitForTimeout(1500);

  // Click Inject Inbound Reply
  await page.click('button:has-text("Inject Inbound Reply")');
  console.log('[Walkthrough] Inbound reply injected. Waiting for Gemini AI evaluation...');
  await page.waitForTimeout(6000);

  // Show AI Intelligence Card and Draft
  console.log('[Walkthrough] Demonstrating Gemini AI Assessment and Draft Reply...');
  await page.waitForTimeout(3000);

  // Click Load to Composer
  const loadBtn = await page.$('text=Load to Composer');
  if (loadBtn) {
    await loadBtn.click();
    await page.waitForTimeout(1500);
  }

  // 5. Qualified Leads Module
  console.log('[Walkthrough] Demonstrating Qualified Leads Module & Bitrix24 Staged Handoff...');
  await page.click('button:has-text("Qualified Leads")');
  await page.waitForTimeout(2500);
  // Expand CRM Payload
  await page.click('text=View CRM Payload');
  await page.waitForTimeout(3000);

  // 6. Analytics Module
  console.log('[Walkthrough] Demonstrating Analytics Module...');
  await page.click('button:has-text("Analytics")');
  await page.waitForTimeout(2500);

  // 7. Company Knowledge Module
  console.log('[Walkthrough] Demonstrating Company Knowledge Module...');
  await page.click('button:has-text("Company Knowledge")');
  await page.waitForTimeout(2500);
  await page.click('button:has-text("Compliance & Claim Boundaries")');
  await page.waitForTimeout(2000);

  // 8. Integrations Module
  console.log('[Walkthrough] Demonstrating Integrations Module...');
  await page.click('button:has-text("Integrations")');
  await page.waitForTimeout(2500);

  // 9. Settings Module
  console.log('[Walkthrough] Demonstrating Settings Module...');
  await page.click('button:has-text("Settings")');
  await page.waitForTimeout(2500);

  // Finish video recording
  console.log('[Walkthrough] Finalizing recording and saving video file...');
  await page.close();
  await context.close();
  await browser.close();

  // Find generated video file
  const files = fs.readdirSync(recordingsDir).filter((f) => f.endsWith('.webm'));
  if (files.length > 0) {
    const videoFile = path.join(recordingsDir, files[files.length - 1]);
    const finalDest = path.join(recordingsDir, 'senvo_outreach_walkthrough.webm');
    fs.copyFileSync(videoFile, finalDest);
    console.log(`[Walkthrough] Video recording completed successfully!`);
    console.log(`[Walkthrough] Output video saved at: ${finalDest}`);
    console.log(`[Walkthrough] File size: ${(fs.statSync(finalDest).size / 1024 / 1024).toFixed(2)} MB`);
  }
}

runWalkthrough().catch((err) => {
  console.error('[Walkthrough Error]:', err);
  process.exit(1);
});
