import { chromium } from 'playwright-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const LOCAL_URL = 'http://localhost:3001';

async function testMobile() {
  console.log('--- STARTING QUICK MOBILE VIEWPORT CHECK ---');

  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  // 0. Narrow Mobile Check (320px)
  console.log('\n[0] Checking Narrowest Mobile Screen (320px)...');
  const narrowContext = await browser.newContext({ viewport: { width: 320, height: 568 } });
  const narrowPage = await narrowContext.newPage();
  narrowPage.on('dialog', async (d) => await d.accept());
  await narrowPage.goto(LOCAL_URL, { waitUntil: 'networkidle' });
  const narrowLoginOverflow = await narrowPage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  console.log(`320px Login horizontal overflow: ${narrowLoginOverflow ? 'FAIL' : 'PASS'}`);
  await narrowPage.click('button:has-text("Enter Workspace")');
  await narrowPage.waitForSelector('h1:has-text("Executive Overview")', { timeout: 10000 });
  const narrowOverviewOverflow = await narrowPage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  console.log(`320px Overview horizontal overflow: ${narrowOverviewOverflow ? 'FAIL' : 'PASS'}`);
  await narrowContext.close();

  // Mobile Viewport: 375x667 (iPhone SE / standard mobile)
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 667 },
  });
  const page = await mobileContext.newPage();

  page.on('dialog', async (d) => await d.accept());

  // 1. Login Screen Mobile Check
  console.log('\n[1] Checking Login Screen on Mobile (375px)...');
  await page.goto(LOCAL_URL, { waitUntil: 'networkidle' });
  const loginOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  console.log(`Login horizontal overflow: ${loginOverflow ? 'FAIL (overflowing)' : 'PASS (no overflow)'}`);

  // Authenticate
  await page.click('button:has-text("Enter Workspace")');
  await page.waitForSelector('h1:has-text("Executive Overview")', { timeout: 10000 });
  console.log('Logged in successfully on mobile.');

  // 2. Dashboard Mobile Check
  console.log('\n[2] Checking Dashboard (Overview) on Mobile...');
  const overviewOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  console.log(`Overview horizontal overflow: ${overviewOverflow ? 'FAIL (overflowing)' : 'PASS (no overflow)'}`);

  // Verify hamburger menu opens drawer
  console.log('Testing mobile menu drawer...');
  await page.click('button[aria-label="Open navigation menu"]');
  await page.waitForSelector('.lg\\:hidden nav button:has-text("Leads & Segments")', { timeout: 5000 });
  console.log('Mobile navigation drawer opened.');

  // 3. Leads Module Mobile Check
  console.log('\n[3] Checking Leads Management on Mobile...');
  await page.click('.lg\\:hidden nav button:has-text("Leads & Segments")');
  await page.waitForSelector('h2:has-text("Prospects & Intelligent Segments")', { timeout: 5000 });

  const leadsOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  console.log(`Leads horizontal overflow: ${leadsOverflow ? 'FAIL (overflowing)' : 'PASS (no overflow)'}`);

  // Check mobile lead cards rendered
  const mobileCardsCount = await page.locator('.block.md\\:hidden .cursor-pointer').count();
  console.log(`Mobile lead cards found: ${mobileCardsCount}`);

  // Test opening a lead card profile
  if (mobileCardsCount > 0) {
    await page.locator('.block.md\\:hidden .cursor-pointer').first().click();
    await page.waitForSelector('span:has-text("Corporate Prospect Profile")', { timeout: 5000 });
    console.log('Lead detail slide-over opened cleanly on mobile.');
    await page.click('button:has-text("Close Profile")');
  }

  // 4. Campaign Builder Mobile Check
  console.log('\n[4] Checking Campaigns & Builder on Mobile...');
  await page.click('button[aria-label="Open navigation menu"]');
  await page.click('.lg\\:hidden nav button:has-text("Campaigns")');
  await page.waitForSelector('h2:has-text("Campaign Dispatch")', { timeout: 5000 });

  // Open Campaign Builder
  await page.click('button:has-text("New Campaign Builder")');
  await page.waitForSelector('h3:has-text("Guided Campaign Builder")', { timeout: 5000 });
  const builderOverflow = await page.evaluate(() => {
    const modal = document.querySelector('.max-w-2xl');
    return modal ? modal.scrollWidth > window.innerWidth : false;
  });
  console.log(`Campaign builder modal fits viewport: ${builderOverflow ? 'FAIL (wider than viewport)' : 'PASS (fits cleanly)'}`);
  // Close builder
  await page.locator('.max-w-2xl button').first().click();

  // 5. Unified Inbox Mobile Check
  console.log('\n[5] Checking Unified Inbox on Mobile...');
  await page.click('button[aria-label="Open navigation menu"]');
  await page.click('.lg\\:hidden nav button:has-text("Unified Inbox")');
  await page.waitForSelector('input[placeholder*="Filter by company"]', { timeout: 5000 });

  // Check conversation list visible on mobile
  const convItems = await page.locator('.w-full.lg\\:w-80 .cursor-pointer').count();
  console.log(`Inbox conversations visible on mobile list: ${convItems}`);

  if (convItems > 0) {
    // Tap first conversation to go to chat view
    await page.locator('.w-full.lg\\:w-80 .cursor-pointer').first().click();
    await page.waitForSelector('button[aria-label="Back to Conversations"]', { timeout: 5000 });
    console.log('Chat thread opened with mobile "Threads" back button visible.');

    // Tap AI Insights button
    await page.click('button:has-text("AI Insights")');
    await page.waitForSelector('button:has-text("Back to Thread")', { timeout: 5000 });
    console.log('AI Insights detail panel opened on mobile with back button.');

    // Return to chat
    await page.click('button:has-text("Back to Thread")');
    await page.waitForSelector('button[aria-label="Back to Conversations"]', { timeout: 5000 });
    console.log('Successfully navigated back to chat.');

    // Return to list
    await page.click('button[aria-label="Back to Conversations"]');
    await page.waitForSelector('input[placeholder*="Filter by company"]', { timeout: 5000 });
    console.log('Successfully navigated back to conversation list.');
  }

  // 6. Desktop Check (1280x800)
  console.log('\n[6] Checking Desktop Viewport (1280px) preservation...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const desktopPage = await desktopContext.newPage();
  desktopPage.on('dialog', async (d) => await d.accept());
  await desktopPage.goto(LOCAL_URL, { waitUntil: 'networkidle' });
  await desktopPage.click('button:has-text("Enter Workspace")');
  await desktopPage.waitForSelector('h1:has-text("Executive Overview")', { timeout: 10000 });

  // Verify desktop persistent sidebar is visible
  const desktopSidebarVisible = await desktopPage.locator('aside.hidden.lg\\:flex').isVisible();
  console.log(`Desktop sidebar visible: ${desktopSidebarVisible ? 'PASS' : 'FAIL'}`);

  // Navigate to Inbox on desktop
  await desktopPage.click('aside nav button:has-text("Unified Inbox")');
  await desktopPage.waitForSelector('input[placeholder*="Filter by company"]', { timeout: 5000 });

  // Verify desktop has columns visible simultaneously
  const listCol = await desktopPage.locator('.w-full.lg\\:w-80.xl\\:w-96.border-r').isVisible();
  const chatCol = await desktopPage.locator('.flex-1.flex.flex-col.bg-slate-50\\/50').isVisible();
  const detailsCol = await desktopPage.locator('.w-full.lg\\:w-80.xl\\:w-96.border-l').isVisible();
  console.log(`Desktop 3-column layout active: list=${listCol}, chat=${chatCol}, details=${detailsCol}`);

  await browser.close();
  console.log('\n--- QUICK MOBILE VIEWPORT CHECK COMPLETED SUCCESSFULLY ---');
}

testMobile().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
