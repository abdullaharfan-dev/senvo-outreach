import { chromium } from 'playwright-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const NETLIFY_URL = 'https://senvo-outreach-demo.netlify.app';

async function testNetlifyDeployment() {
  console.log(`--- TESTING LIVE NETLIFY DEPLOYMENT: ${NETLIFY_URL} ---`);

  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  // 1. Desktop Test (1280x800)
  console.log('\n[1] Testing Desktop Viewport (1280x800)...');
  const desktopCtx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const desktopPage = await desktopCtx.newPage();

  const response = await desktopPage.goto(NETLIFY_URL, { waitUntil: 'networkidle', timeout: 30000 });
  console.log(`HTTP Status: ${response.status()}`);
  const title = await desktopPage.title();
  console.log(`Page Title: ${title}`);

  // Check login card exists
  const hasLoginCard = await desktopPage.locator('h1:has-text("SENVO Outreach")').isVisible();
  console.log(`Login Card Visible on Desktop: ${hasLoginCard ? 'PASS' : 'FAIL'}`);

  // Check desktop horizontal overflow
  const desktopOverflow = await desktopPage.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  console.log(`Desktop horizontal overflow: ${desktopOverflow ? 'FAIL (overflowing)' : 'PASS (no overflow)'}`);

  // Try clicking "Enter Workspace" to inspect backend dependency response
  console.log('Testing login submission against Netlify host...');
  await desktopPage.click('button:has-text("Enter Workspace")');
  await desktopPage.waitForTimeout(2000);
  const errorMessage = await desktopPage.locator('form .bg-rose-500\\/10').textContent().catch(() => null);
  console.log(`Login response message when backend is unproxied: "${errorMessage || 'None'}"`);

  // 2. Mobile Test (375x667)
  console.log('\n[2] Testing Mobile Viewport (375x667)...');
  const mobileCtx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const mobilePage = await mobileCtx.newPage();
  await mobilePage.goto(NETLIFY_URL, { waitUntil: 'networkidle' });

  const mobileLoginVisible = await mobilePage.locator('h1:has-text("SENVO Outreach")').isVisible();
  console.log(`Login Card Visible on Mobile: ${mobileLoginVisible ? 'PASS' : 'FAIL'}`);

  const mobileOverflow = await mobilePage.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  console.log(`Mobile horizontal overflow (375px): ${mobileOverflow ? 'FAIL (overflowing)' : 'PASS (no overflow)'}`);

  // 3. Narrow Mobile Test (320x568)
  console.log('\n[3] Testing Narrowest Mobile Viewport (320x568)...');
  const narrowCtx = await browser.newContext({ viewport: { width: 320, height: 568 } });
  const narrowPage = await narrowCtx.newPage();
  await narrowPage.goto(NETLIFY_URL, { waitUntil: 'networkidle' });

  const narrowOverflow = await narrowPage.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  console.log(`Narrow mobile horizontal overflow (320px): ${narrowOverflow ? 'FAIL (overflowing)' : 'PASS (no overflow)'}`);

  // 4. Test Workspace Navigation when Authenticated via session storage
  console.log('\n[4] Testing Workspace Shell & Module Navigation on Deployed Netlify URL...');
  await desktopPage.evaluate(() => {
    localStorage.setItem(
      'senvo_demo_auth',
      JSON.stringify({
        token: 'demo-token-client',
        user: { email: 'partner@senvo.ie', name: 'Senior Client Partner', role: 'partner' },
      })
    );
  });
  await desktopPage.reload({ waitUntil: 'networkidle' });
  const dashboardHeader = await desktopPage.locator('h1:has-text("Executive Overview")').isVisible();
  console.log(`Authenticated Dashboard loads on Netlify: ${dashboardHeader ? 'PASS' : 'FAIL'}`);

  // Test navigation across modules
  const modules = ['Leads & Segments', 'Campaigns', 'Unified Inbox', 'Qualified Leads', 'Analytics', 'Company Knowledge', 'Integrations', 'Settings'];
  for (const mod of modules) {
    await desktopPage.click(`aside nav button:has-text("${mod}")`);
    await desktopPage.waitForTimeout(500);
    console.log(`Navigated to: ${mod}`);
  }

  // 5. Test Mobile Shell & Module Navigation on Deployed Netlify URL
  console.log('\n[5] Testing Mobile Navigation Drawer on Deployed Netlify URL...');
  await mobilePage.evaluate(() => {
    localStorage.setItem(
      'senvo_demo_auth',
      JSON.stringify({
        token: 'demo-token-client',
        user: { email: 'partner@senvo.ie', name: 'Senior Client Partner', role: 'partner' },
      })
    );
  });
  await mobilePage.reload({ waitUntil: 'networkidle' });
  await mobilePage.click('button[aria-label="Open navigation menu"]');
  const drawerOpen = await mobilePage.locator('.lg\\:hidden nav button:has-text("Leads & Segments")').isVisible();
  console.log(`Mobile navigation drawer opened on Netlify: ${drawerOpen ? 'PASS' : 'FAIL'}`);

  await mobilePage.click('.lg\\:hidden nav button:has-text("Leads & Segments")');
  await mobilePage.waitForTimeout(500);
  const leadsTitle = await mobilePage.locator('h2:has-text("Prospects & Intelligent Segments")').isVisible();
  console.log(`Mobile Leads module loaded on Netlify: ${leadsTitle ? 'PASS' : 'FAIL'}`);

  await browser.close();
  console.log('\n--- LIVE NETLIFY VERIFICATION FINISHED ---');
}

testNetlifyDeployment().catch((err) => {
  console.error('Netlify verification failed:', err);
  process.exit(1);
});
