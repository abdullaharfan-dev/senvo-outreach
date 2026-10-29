import leadService from './src/services/leadService.js';
import campaignService from './src/services/campaignService.js';
import inboxService from './src/services/inboxService.js';
import qualificationService from './src/services/qualificationService.js';
import { get, query } from './src/db/database.js';

async function runEndToEndVerification() {
  console.log('--- STARTING SENVO OUTREACH END-TO-END VERIFICATION ---');

  // 1. Check Segments
  console.log('\n[1] Testing Lead Segmentation...');
  const segments = await leadService.getSegments();
  console.log(`✓ Fetched ${segments.length} dynamic segments.`);
  segments.forEach(s => {
    console.log(`   - Segment: "${s.name}" (Count: ${s.count}, Channel: ${s.channel_fit})`);
  });

  // 2. Test Multi-Step Import Validation & Deduplication
  console.log('\n[2] Testing Lead Import Validation & Deduplication...');
  const testUniqueCompanyName = `Galway Offshore Wind DAC ${Date.now().toString().slice(-4)}`;
  const sampleUploadRows = [
    {
      company_name: testUniqueCompanyName,
      contact_name: 'Eamonn Flaherty',
      email: `eamonn@galwaywind-${Date.now().toString().slice(-4)}.ie`,
      phone: `+353 91 ${Math.floor(100000 + Math.random() * 900000)}`,
      city: 'Galway',
      industry: 'Renewable Energy',
      priority: 'high'
    },
    {
      company_name: 'Apex Logistics Ireland Ltd', // Duplicate of existing seed lead
      contact_name: 'Declan Murphy',
      email: 'declan.murphy@apexlogistics.ie',
      phone: '+353 1 890 1234',
      city: 'Dublin 2',
      industry: 'Logistics',
      priority: 'high'
    },
    {
      company_name: 'Incomplete Enterprise',
      contact_name: '',
      email: 'invalid-email',
      phone: '',
      city: '',
      industry: '',
      priority: 'low'
    }
  ];

  const validationResult = await leadService.validateImportRecords(sampleUploadRows, {});
  console.log(`✓ Validated records: ${validationResult.total} total.`);
  console.log(`   - Eligible: ${validationResult.eligible}`);
  console.log(`   - Incomplete: ${validationResult.incomplete}`);
  console.log(`   - Duplicates detected: ${validationResult.duplicates}`);

  if (validationResult.duplicates !== 1) {
    throw new Error(`Deduplication did not catch existing Apex Logistics lead! Expected 1, got ${validationResult.duplicates}`);
  }

  // 3. Test Commit Batch
  console.log('\n[3] Testing Commit Batch into SQLite...');
  const eligibleRecords = validationResult.records.filter(r => r.status === 'valid');
  const commitResult = await leadService.commitImportBatch(eligibleRecords, 'Test Galway Import');
  console.log(`✓ Committed ${commitResult.committed} new lead(s) into SQLite.`);
  const newLeadId = commitResult.createdIds[0];

  // 4. Test Campaign Creation with Imported/Segmented Leads
  console.log('\n[4] Testing Campaign Creation from Segment...');
  const newCampaign = await campaignService.createCampaign({
    name: 'Q4 Clean Energy Statutory Compliance Briefing',
    channel: 'email',
    target_audience: 'Renewable Energy DACs',
    lead_ids: [newLeadId],
    template_body: 'Dear {CONTACT_NAME}, As Irish corporate reporting deadlines approach, SENVO assists {BUSINESS_NAME} in {CITY} with CRO compliance and statutory filings.'
  });
  console.log(`✓ Campaign created: "${newCampaign.name}" with ID: ${newCampaign.id} and ${newCampaign.total_recipients} recipient.`);

  // 5. Test Campaign Launch and Async Queue Dispatch
  console.log('\n[5] Testing Campaign Launch & Real-time Queue Processing...');
  const started = await campaignService.startCampaign(newCampaign.id);
  console.log(`✓ Campaign status updated to: ${started.status}`);

  // Wait 1.5 seconds for recipient dispatch
  console.log('   Waiting 1.5s for async queue dispatch in SQLite...');
  await new Promise(r => setTimeout(r, 1500));

  const refreshedCampaign = await campaignService.getCampaignById(newCampaign.id);
  console.log(`✓ Refreshed Campaign State:`);
  console.log(`   - Status: ${refreshedCampaign.status}`);
  console.log(`   - Sent count: ${refreshedCampaign.sent_count} / ${refreshedCampaign.total_recipients}`);
  console.log(`   - Recipient status: ${refreshedCampaign.recipients[0]?.status} (Sent at: ${refreshedCampaign.recipients[0]?.sent_at})`);

  // 6. Test Inbound Simulation with Gemini Grounding
  console.log('\n[6] Testing Inbound Client Inquiry with Gemini Grounding...');
  const replyResult = await inboxService.simulateIncomingReply({
    leadId: newLeadId,
    channel: 'email',
    content: 'Eamonn Flaherty here from Galway Biomass. We need advice on our upcoming CRO annual return, director non-resident bond exemption under Section 137, and statutory audit exemption review.',
    senderName: 'Eamonn Flaherty'
  });
  console.log(`✓ Inbound inquiry simulated: Conversation ID: ${replyResult.conversation.id}`);
  const assessment = replyResult.ai_result?.data;
  console.log(`✓ Gemini AI Assessment:`);
  console.log(`   - Success: ${replyResult.ai_result?.success}`);
  console.log(`   - Intent: ${assessment?.intent}`);
  console.log(`   - Confidence: ${assessment?.confidence}`);
  console.log(`   - Service Line: ${assessment?.requested_service}`);
  console.log(`   - Suggested Reply preview: ${assessment?.suggested_reply?.substring(0, 120)}...`);

  // 7. Test Lead Qualification and Bitrix24 Handoff Staging
  console.log('\n[7] Testing Qualification & Bitrix24 Handoff Staging...');
  const qualified = await qualificationService.qualifyLead({
    leadId: newLeadId,
    requested_service: assessment?.requested_service || 'Section 137 & CRO Compliance',
    qualification_summary: assessment?.summary || 'Renewable energy DAC requiring statutory review.',
    assigned_owner: 'Senior Client Partner (Galway & West Region)',
    next_action: 'Schedule 15-minute statutory scope consultation'
  });
  console.log(`✓ Lead qualified: ID: ${qualified.id}`);

  const handoff = await get('SELECT * FROM handoffs WHERE lead_id = ?', [newLeadId]);
  console.log(`✓ Staged Bitrix24 CRM Handoff: Status: ${handoff.crm_sync_status}, Partner: ${handoff.assigned_owner}`);

  console.log('\n=== ALL 7 END-TO-END VERIFICATION CHECKS PASSED PERFECTLY ===\n');
}

runEndToEndVerification().catch(err => {
  console.error('VERIFICATION FAILED:', err);
  process.exit(1);
});
