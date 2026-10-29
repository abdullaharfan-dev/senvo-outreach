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
    viewport: { width: 1366, height: 820 },
    recordVideo: {
      dir: recordingsDir,
      size: { width: 1366, height: 820 },
    },
  });

  const page = await context.newPage();
  page.on('dialog', (dialog) => {
    console.log(`[Walkthrough Dialog] Accepted: ${dialog.message()}`);
    dialog.accept();
  });
  console.log('[Walkthrough] Navigating to SENVO Outreach at http://localhost:3001...');
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 1. Overview Module
  console.log('[Walkthrough] Demonstrating Executive Overview...');
  await page.waitForTimeout(3000);

  // 2. Leads Module - Directory & Guided Import
  console.log('[Walkthrough] Navigating to Leads Management...');
  await page.click('button:has-text("Leads")');
  await page.waitForTimeout(2000);

  // Open Guided Import Wizard
  console.log('[Walkthrough] Opening Guided Multi-Step Lead Import Wizard...');
  const importBtn = await page.$('button:has-text("Guided Lead Import")');
  if (importBtn) {
    await importBtn.click();
    await page.waitForTimeout(1500);

    // Click "Load Sample Corporate File"
    console.log('[Walkthrough] Loading Irish Corporate Sample File...');
    const loadSampleBtn = await page.$('text=Load Sample Corporate File');
    if (loadSampleBtn) {
      await loadSampleBtn.click();
      await page.waitForTimeout(1500);
    }

    // Step 2: Map & Validate
    console.log('[Walkthrough] Proceeding to Column Mapping & Field Validation...');
    const proceedMapBtn = await page.$('button:has-text("Proceed to Field Mapping")');
    if (proceedMapBtn) {
      await proceedMapBtn.click();
      await page.waitForTimeout(1500);
    }

    // Step 3: Run Validation & Segmentation
    console.log('[Walkthrough] Running Validation & Deduplication...');
    const runValidateBtn = await page.$('button:has-text("Run Validation & Segmentation")');
    if (runValidateBtn) {
      await runValidateBtn.click();
      await page.waitForTimeout(2000);
    }

    // Step 4: Commit Approved Leads
    console.log('[Walkthrough] Committing Validated Leads into SQLite...');
    const commitBtn = await page.$('button:has-text("Commit")');
    if (commitBtn) {
      await commitBtn.click();
      await page.waitForTimeout(2000);
    }

    // Close Wizard
    const finishBtn = await page.$('button:has-text("View in Leads Directory")');
    if (finishBtn) {
      await finishBtn.click();
      await page.waitForTimeout(1500);
    }
    // Ensure import modal is dismissed
    await page.waitForSelector('.fixed.inset-0', { state: 'detached', timeout: 3000 }).catch(async () => {
      const closeX = await page.$('button:has(svg.lucide-x)');
      if (closeX) await closeX.click();
      await page.waitForTimeout(1000);
    });
  }

  // Switch to Dynamic Segments Tab
  console.log('[Walkthrough] Exploring Dynamic Channel Segments...');
  const segsTab = await page.$('button:has-text("Dynamic Segments")');
  if (segsTab) {
    await segsTab.click();
    await page.waitForTimeout(2500);

    // Click "Launch Campaign" on Corporate Email Ready segment
    console.log('[Walkthrough] Transitioning from Segment to Campaign Builder...');
    const launchFromSegBtn = await page.$('button:has-text("Launch Campaign")');
    if (launchFromSegBtn) {
      await launchFromSegBtn.click();
      await page.waitForTimeout(2000);
    }
  }

  // 3. Campaigns Module
  console.log('[Walkthrough] Navigating through 4-Step Campaign Builder...');
  // Fill campaign name in Step 1
  const nameInput = await page.$('input[placeholder*="Compliance Briefing"]');
  if (nameInput) {
    console.log('[Walkthrough] Entering Campaign Name...');
    await nameInput.fill('Q4 Irish Corporate Compliance & Statutory Audit Briefing');
    await page.waitForTimeout(1000);
  }

  const toTemplateBtn = await page.$('button:has-text("Proceed to Template")');
  if (toTemplateBtn) {
    await toTemplateBtn.click();
    await page.waitForTimeout(1500);
  }

  const toPreviewBtn = await page.$('button:has-text("Preview Real Lead Personalization")');
  if (toPreviewBtn) {
    await toPreviewBtn.click();
    await page.waitForTimeout(1500);

    // Toggle Sample Lead
    const toggleLeadBtn = await page.$('button:has-text("Toggle Sample Lead")');
    if (toggleLeadBtn) {
      await toggleLeadBtn.click();
      await page.waitForTimeout(1200);
      await toggleLeadBtn.click();
      await page.waitForTimeout(1200);
    }
  }

  const toReviewBtn = await page.$('button:has-text("Final Review & Launch")');
  if (toReviewBtn) {
    await toReviewBtn.click();
    await page.waitForTimeout(1500);
  }

  // Launch Campaign
  console.log('[Walkthrough] Launching Campaign with Live SQLite Queue...');
  const confirmLaunchBtn = await page.$('button:has-text("Confirm & Launch Campaign")');
  if (confirmLaunchBtn) {
    await confirmLaunchBtn.click();
    await page.waitForTimeout(2000);
    // Wait for modal backdrop to detach
    await page.waitForSelector('.fixed.inset-0', { state: 'detached', timeout: 3000 }).catch(async () => {
      const closeBuilderX = await page.$('.fixed.inset-0 button');
      if (closeBuilderX) await closeBuilderX.click();
    });
    await page.waitForTimeout(2000); // Wait for background async queue to dispatch
  }

  // Monitor live campaign recipient progress
  console.log('[Walkthrough] Monitoring Live Recipient Dispatch Status...');
  await page.waitForTimeout(3000);

  // 4. Unified Inbox Module
  console.log('[Walkthrough] Demonstrating Unified Inbox & Gemini AI Triage...');
  await page.click('button:has-text("Unified Inbox")');
  await page.waitForTimeout(2000);

  // Filter channels
  console.log('[Walkthrough] Testing Channel Filters (Email, LinkedIn, WhatsApp)...');
  await page.click('button:has-text("Email / Outlook")');
  await page.waitForTimeout(1200);
  await page.click('button:has-text("LinkedIn")');
  await page.waitForTimeout(1200);
  await page.click('button:has-text("WhatsApp")');
  await page.waitForTimeout(1200);
  await page.click('button:has-text("All Channels")');
  await page.waitForTimeout(1500);

  // Select first conversation
  await page.click('text=Apex Logistics Ireland Ltd');
  await page.waitForTimeout(2000);

  // Show AI Intelligence Card and Draft
  console.log('[Walkthrough] Demonstrating Gemini AI Assessment and Draft Reply...');
  const loadBtn = await page.$('button:has-text("Load to Editor")');
  if (loadBtn) {
    await loadBtn.click();
    await page.waitForTimeout(1500);
  }

  // Send Reply
  const sendReplyBtn = await page.$('button:has-text("Send Recommended Reply")');
  if (sendReplyBtn) {
    await sendReplyBtn.click();
    await page.waitForTimeout(2000);
  }

  // Qualify Lead & Stage CRM
  console.log('[Walkthrough] Qualifying lead and staging for Bitrix24 CRM...');
  const qualifyBtn = await page.$('button:has-text("Qualify & Stage CRM Handoff")');
  if (qualifyBtn) {
    await qualifyBtn.click();
    await page.waitForTimeout(2000);
  }

  // 5. Qualified Leads Module
  console.log('[Walkthrough] Demonstrating Qualified Leads Module & Bitrix24 Staged Handoff...');
  await page.click('button:has-text("Qualified Leads")');
  await page.waitForTimeout(2500);

  // Expand CRM Payload
  const crmPayloadBtn = await page.$('text=View CRM Payload');
  if (crmPayloadBtn) {
    await crmPayloadBtn.click();
    await page.waitForTimeout(3000);
  }

  // 6. Analytics Module
  console.log('[Walkthrough] Demonstrating Analytics Module...');
  await page.click('button:has-text("Analytics")');
  await page.waitForTimeout(2500);

  // 7. Company Knowledge Module
  console.log('[Walkthrough] Demonstrating Irish Company Knowledge & Statutory Grounding...');
  await page.click('button:has-text("Company Knowledge")');
  await page.waitForTimeout(2500);
  await page.click('button:has-text("Compliance & Claim Boundaries")');
  await page.waitForTimeout(2000);

  // 8. Integrations Module
  console.log('[Walkthrough] Demonstrating Channel Adapters & Bitrix24 Gateway...');
  await page.click('button:has-text("Integrations")');
  await page.waitForTimeout(2500);

  // 9. Settings Module
  console.log('[Walkthrough] Demonstrating Settings & Testing Sandbox Tools...');
  await page.click('button:has-text("Settings")');
  await page.waitForTimeout(2000);

  // Test live AI Call
  const testAiBtn = await page.$('button:has-text("Test Live AI Call")');
  if (testAiBtn) {
    console.log('[Walkthrough] Executing Test Live AI Call from Settings...');
    await testAiBtn.click();
    await page.waitForTimeout(3000);
  }

  // Finish video recording
  console.log('[Walkthrough] Finalizing recording and saving video file...');
  await page.close();
  await context.close();
  await browser.close();

  // Find generated video file and save to canonical path
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
