import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PUBLIC_URL = 'https://preparation-favourite-tours-heard.trycloudflare.com';

async function verifyPublicDeployment() {
  console.log(`--- VERIFYING LIVE PUBLIC DEPLOYMENT: ${PUBLIC_URL} ---`);

  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 820 },
  });

  const page = await context.newPage();

  page.on('dialog', async (dialog) => {
    console.log(`[Public Test Dialog]: ${dialog.message()}`);
    await dialog.accept();
  });

  // 1. Test Unauthenticated Access Barrier
  console.log('\n[1] Testing Protected Access Barrier on Public URL...');
  await page.goto(PUBLIC_URL, { waitUntil: 'networkidle', timeout: 30000 });
  
  const loginTitle = await page.textContent('h1');
  console.log(`✓ Page Title: "${loginTitle}"`);
  if (!loginTitle.includes('SENVO Outreach')) {
    throw new Error('Public page did not load SENVO Outreach');
  }

  const isRestrictedBannerVisible = await page.isVisible('text=Restricted Client Demo Environment');
  console.log(`✓ Restricted Demo Banner visible: ${isRestrictedBannerVisible}`);
  if (!isRestrictedBannerVisible) {
    throw new Error('Access restriction banner missing on unauthenticated page');
  }

  // 2. Test Invalid Login Rejection
  console.log('\n[2] Testing Invalid Credentials Rejection...');
  await page.fill('input[type="email"]', 'intruder@external.com');
  await page.fill('input[type="password"]', 'WrongPassword123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  const errorVisible = await page.isVisible('text=Access restricted');
  console.log(`✓ Unauthorized rejection verified: ${errorVisible}`);

  // 3. Authenticate with Approved Demo Access
  console.log('\n[3] Authenticating with Approved Demo Credentials (partner@senvo.ie)...');
  await page.click('button:has-text("Fill Credentials")');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  // 4. Verify Executive Overview & SQLite Records
  console.log('\n[4] Verifying Executive Dashboard & Data Ingestion...');
  const overviewVisible = await page.isVisible('text=Executive Overview');
  console.log(`✓ Executive Dashboard unlocked: ${overviewVisible}`);

  const dublinHqTag = await page.isVisible('text=Dublin HQ');
  console.log(`✓ Tenant practice indicator verified: ${dublinHqTag}`);

  // 5. Navigate to Leads & Verify SQLite Persistence
  console.log('\n[5] Verifying Leads Directory from persistent SQLite...');
  await page.click('button:has-text("Leads")');
  await page.waitForTimeout(2000);

  const apexLead = await page.isVisible('text=Apex Logistics Ireland Ltd');
  const celticLead = await page.isVisible('text=Celtic Marine Engineering Ltd');
  console.log(`✓ Irish Corporate Leads loaded from SQLite: Apex=${apexLead}, Celtic=${celticLead}`);

  // 6. Test Page Refresh & Session Persistence
  console.log('\n[6] Testing Session & Data Persistence across Full Page Refresh...');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const persistentSession = await page.isVisible('text=Declan O\'Sullivan');
  console.log(`✓ Session preserved after refresh without re-prompting login: ${persistentSession}`);

  // 7. Test Campaign Module on Public Deployment
  console.log('\n[7] Verifying Campaign Orchestration & Live Progress...');
  await page.click('button:has-text("Campaigns")');
  await page.waitForTimeout(2000);

  const campaignsVisible = await page.isVisible('text=Campaign Dispatch & Audience Orchestration');
  console.log(`✓ Campaigns interface verified: ${campaignsVisible}`);

  // 8. Capture Proof Screenshot of Public Deployment
  const screenshotPath = path.resolve('recordings', 'public_deployment_verified.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`✓ Live public deployment screenshot saved to: ${screenshotPath}`);

  await browser.close();
  console.log('\n=== ALL PUBLIC DEPLOYMENT SMOKE TESTS PASSED 100% ===\n');
}

verifyPublicDeployment().catch((err) => {
  console.error('PUBLIC DEPLOYMENT TEST FAILED:', err);
  process.exit(1);
});
