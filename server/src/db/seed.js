import { v4 as uuidv4 } from 'uuid';
import { run, query, initDb } from './database.js';

export const seedData = async () => {
  console.log('[Seed] Initializing database with Ireland Corporate Services context...');
  await initDb();

  const existingLeads = await query('SELECT COUNT(*) as count FROM leads');
  if (existingLeads[0].count > 0) {
    console.log(`[Seed] Database already seeded with ${existingLeads[0].count} leads. Skipping.`);
    return;
  }

  console.log('[Seed] Seeding SENVO Outreach operational demo database (Ireland Corporate & Professional Services)...');

  const now = new Date().toISOString();

  // 1. Seed Company Knowledge: Ireland Corporate, Tax, Audit, ERP & Recruitment
  const knowledgeEntries = [
    {
      category: 'service',
      title: 'Accounting, Bookkeeping & Payroll Management',
      content: 'Comprehensive statutory accounts preparation, monthly management accounts, and Revenue-compliant Irish payroll processing (including PAYE Modernisation, benefit-in-kind, and BrightPay integration).'
    },
    {
      category: 'service',
      title: 'Audit, CRO & Statutory Compliance',
      content: 'Independent statutory audits, audit exemption assessments under the Companies Act 2014, and complete Companies Registration Office (CRO) compliance including Form B1 annual return filings.'
    },
    {
      category: 'service',
      title: 'Irish Corporation Tax, VAT & Cross-Border Advisory',
      content: 'Corporation tax computations (Form CT1), bi-monthly VAT3 filing via ROS, Reverse Charge mechanism, EU cross-border trading VAT compliance, and Revenue Ireland audit defense support.'
    },
    {
      category: 'service',
      title: 'Company Secretarial & Corporate Governance',
      content: 'Irish company incorporations, statutory registers maintenance, board minute drafting, non-resident director requirements (Section 137 revenue bonds), and registered office address facilities in Dublin.'
    },
    {
      category: 'service',
      title: 'Business Advisory & Fractional CFO',
      content: 'Strategic financial modeling, working capital optimization, cash-flow forecasting, grant claim reporting (Enterprise Ireland / IDA Ireland), and financial due diligence for M&A.'
    },
    {
      category: 'service',
      title: 'IT, Cloud Accounting & ERP Advisory',
      content: 'Independent evaluation, cloud migration, and workflow automation for systems such as Xero, Sage 50/200, NetSuite ERP, and bespoke financial reporting integrations.'
    },
    {
      category: 'service',
      title: 'Specialist Finance & Accounting Recruitment',
      content: 'Targeted sourcing and executive search for qualified accountants (ACA, ACCA, CIMA), financial controllers, tax seniors, and senior corporate finance personnel across Ireland.'
    },
    {
      category: 'claim_boundary',
      title: 'Compliance & Engagement Integrity Guidelines',
      content: 'Strict compliance policy: All tax advisory strictly complies with Revenue Commissioners guidance. We do not promote aggressive tax avoidance schemes. Engagement fees are scoped transparently based on business turnover, transaction volumes, and statutory complexity following a formal discovery review.'
    },
    {
      category: 'faq',
      title: 'Non-Resident Director Requirements (Section 137)',
      content: 'Q: What is required if an Irish company has no EEA resident directors? A: The company must either put in place a Section 137 Non-Resident Director Bond (valid for 2 years) or apply to Revenue for a certificate of real and continuous economic link with the State.'
    },
    {
      category: 'faq',
      title: 'Irish VAT Registration Thresholds',
      content: 'Q: When must an Irish business register for VAT? A: The statutory registration threshold is currently €80,000 for the supply of goods and €40,000 for the supply of services.'
    }
  ];

  for (const k of knowledgeEntries) {
    await run(
      `INSERT INTO company_knowledge (id, category, title, content, approved, updated_at)
       VALUES (?, ?, ?, ?, 1, ?)`,
      [uuidv4(), k.category, k.title, k.content, now]
    );
  }

  // 2. Seed Channel Integration Configurations (All 7 required channels + Bitrix24 CRM)
  const integrations = [
    { channel: 'email', name: 'Microsoft 365 / Outlook Corporate Exchange', mode: 'simulated', caps: ['html_email', 'inbox_sync', 'threading'] },
    { channel: 'linkedin', name: 'LinkedIn Sales Navigator & InMail', mode: 'simulated', caps: ['direct_message', 'inmail', 'lead_form'] },
    { channel: 'whatsapp', name: 'WhatsApp Business API (Simulated)', mode: 'simulated', caps: ['verified_templates', 'two_way_messaging'] },
    { channel: 'facebook', name: 'Meta Business Suite & Messenger', mode: 'simulated', caps: ['messenger_dm', 'instant_form'] },
    { channel: 'instagram', name: 'Instagram Direct Corporate', mode: 'simulated', caps: ['direct_message', 'inbox_routing'] },
    { channel: 'sms', name: 'Enterprise Telco SMS Gateway', mode: 'simulated', caps: ['outbound_sms', 'inbound_replies'] },
    { channel: 'website', name: 'SENVO Corporate Portal Webhook', mode: 'simulated', caps: ['inbound_inquiry_capture', 'instant_triage'] },
    { channel: 'bitrix24', name: 'Bitrix24 CRM REST Connector', mode: 'simulated', caps: ['lead_stage_sync', 'contact_mapping', 'deal_pipeline'] },
  ];

  for (const intg of integrations) {
    await run(
      `INSERT INTO integration_configs (id, channel, name, provider_mode, is_connected, capabilities, last_heartbeat)
       VALUES (?, ?, ?, ?, 1, ?, ?)`,
      [uuidv4(), intg.channel, intg.name, intg.mode, JSON.stringify(intg.caps), now]
    );
  }

  // 3. Seed Realistic Ireland Corporate & SME Leads
  const leads = [
    {
      company_name: 'Apex Logistics Ireland Ltd',
      contact_name: 'Declan Murphy',
      phone: '+353 1 496 1120',
      email: 'dmurphy@apexlogistics.ie',
      industry: 'Freight & Logistics',
      city: 'Dublin 2',
      priority: 'high',
      score: 88,
      status: 'replied'
    },
    {
      company_name: 'Shannon Bioscience DAC',
      contact_name: 'Dr. Fiona Gallagher',
      phone: '+353 91 742 890',
      email: 'fgallagher@shannonbio.ie',
      industry: 'MedTech & Life Sciences',
      city: 'Galway',
      priority: 'high',
      score: 94,
      status: 'qualified'
    },
    {
      company_name: 'Celtic Marine Engineering Ltd',
      contact_name: 'Sean O’Connor',
      phone: '+353 21 489 3341',
      email: 'soconnor@celticmarine.ie',
      industry: 'Marine & Industrial Engineering',
      city: 'Cork',
      priority: 'medium',
      score: 70,
      status: 'in_campaign'
    },
    {
      company_name: 'Horizon Software Technologies Ltd',
      contact_name: 'Ciaran Walsh',
      phone: '+353 1 667 9045',
      email: 'cwalsh@horizontech.io',
      industry: 'B2B Software & SaaS',
      city: 'Dublin 4',
      priority: 'high',
      score: 91,
      status: 'replied'
    },
    {
      company_name: 'Emerald Retail Holdings Ltd',
      contact_name: 'Mairead Kelly',
      phone: '+353 61 312 400',
      email: 'mkelly@emeraldretail.ie',
      industry: 'Retail & Hospitality Group',
      city: 'Limerick',
      priority: 'high',
      score: 86,
      status: 'replied'
    },
    {
      company_name: 'Boyne Valley Food Enterprises DAC',
      contact_name: 'Patrick Dunne',
      phone: '+353 41 983 2100',
      email: 'pdunne@boynevalleyfoods.ie',
      industry: 'Agri-Food & Export',
      city: 'Navan, Co. Meath',
      priority: 'medium',
      score: 68,
      status: 'uncontacted'
    },
    {
      company_name: 'Clare Renewable Energy Solutions Ltd',
      contact_name: 'Aine McCarthy',
      phone: '+353 65 682 9901',
      email: 'amccarthy@clarerenewables.ie',
      industry: 'CleanTech & Energy',
      city: 'Ennis, Co. Clare',
      priority: 'medium',
      score: 64,
      status: 'in_campaign'
    },
    {
      company_name: 'Waterford Precision Components Ltd',
      contact_name: 'Liam Brennan',
      phone: '+353 51 876 543',
      email: 'lbrennan@waterfordprecision.ie',
      industry: 'Advanced Manufacturing',
      city: 'Waterford',
      priority: 'low',
      score: 58,
      status: 'uncontacted'
    },
    {
      company_name: 'Liffey Commercial Advisory Partners',
      contact_name: 'Brendan Byrne',
      phone: '+353 1 829 4410',
      email: 'bbyrne@liffeypartners.ie',
      industry: 'Professional Services',
      city: 'Dublin 1',
      priority: 'high',
      score: 84,
      status: 'replied'
    },
    {
      company_name: 'Atlantic Digital Media Group Ltd',
      contact_name: 'Siobhan Higgins',
      phone: '+353 91 583 220',
      email: 'shiggins@atlanticmedia.ie',
      industry: 'Media & Digital Agency',
      city: 'Galway',
      priority: 'medium',
      score: 62,
      status: 'uncontacted'
    }
  ];

  const leadIdMap = {};

  for (const l of leads) {
    const id = uuidv4();
    leadIdMap[l.company_name] = id;
    await run(
      `INSERT INTO leads (id, company_name, contact_name, email, phone, industry, city, source, priority, score, owner, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Irish Corporate Registry & Inbound', ?, ?, 'Corporate Advisory Team', ?, ?, ?)`,
      [id, l.company_name, l.contact_name, l.email, l.phone, l.industry, l.city, l.priority, l.score, l.status, now, now]
    );
  }

  // 4. Seed Campaigns tailored to Irish Corporate Services
  const campaign1Id = uuidv4();
  const templateBody1 = `Dear {CONTACT_NAME},

As Irish corporate year-end statutory deadlines approach, many mid-market leaders at companies like {BUSINESS_NAME} are reviewing their statutory audit exemption thresholds, CRO Form B1 compliance, and cross-border VAT structures.

SENVO provides end-to-end statutory accounting, Revenue compliance, and company secretarial advisory tailored to Irish trading entities.

Would you be open to a brief 10-minute introductory call next Tuesday or Wednesday to discuss your current compliance schedule?`;

  await run(
    `INSERT INTO campaigns (id, name, channel, template_id, template_body, status, target_audience, total_recipients, sent_count, failed_count, skipped_count, replied_count, created_at, updated_at)
     VALUES (?, 'Irish Corporate Year-End & Statutory Compliance Briefing', 'email', 'IE-CORP-01', ?, 'running', 'Irish Mid-Market Managing Directors & CFOs', 4, 3, 0, 0, 2, ?, ?)`,
    [campaign1Id, templateBody1, now, now]
  );

  const c1Recipients = [
    { lead: 'Apex Logistics Ireland Ltd', status: 'replied', sent: true },
    { lead: 'Celtic Marine Engineering Ltd', status: 'simulated_sent', sent: true },
    { lead: 'Clare Renewable Energy Solutions Ltd', status: 'simulated_sent', sent: true },
    { lead: 'Waterford Precision Components Ltd', status: 'queued', sent: false }
  ];

  for (const rec of c1Recipients) {
    const leadId = leadIdMap[rec.lead];
    const leadObj = leads.find(l => l.company_name === rec.lead);
    const personalized = templateBody1
      .replace('{CONTACT_NAME}', leadObj.contact_name)
      .replace('{BUSINESS_NAME}', leadObj.company_name);

    await run(
      `INSERT INTO campaign_recipients (id, campaign_id, lead_id, personalized_content, status, sent_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), campaign1Id, leadId, personalized, rec.status, rec.sent ? now : null, now]
    );
  }

  const campaign2Id = uuidv4();
  const templateBody2 = `Hi {CONTACT_NAME}, noticed your recent team expansion at {BUSINESS_NAME}. With tech and high-growth firms scaling in Dublin and Galway, ensuring seamless ERP integration (Xero / NetSuite) and securing qualified senior finance talent (Financial Controllers / ACCA seniors) is crucial. Would you be open to exchanging notes on how our advisory practice supports Irish tech entities?`;

  await run(
    `INSERT INTO campaigns (id, name, channel, template_id, template_body, status, target_audience, total_recipients, sent_count, failed_count, skipped_count, replied_count, created_at, updated_at)
     VALUES (?, 'Tech & MedTech Finance Leadership & ERP Connect', 'linkedin', 'IE-TECH-02', ?, 'completed', 'Tech Founders, CFOs & Operations Leads', 3, 3, 0, 0, 1, ?, ?)`,
    [campaign2Id, templateBody2, now, now]
  );

  for (const rec of ['Horizon Software Technologies Ltd', 'Shannon Bioscience DAC', 'Atlantic Digital Media Group Ltd']) {
    const leadId = leadIdMap[rec];
    const leadObj = leads.find(l => l.company_name === rec);
    const personalized = templateBody2
      .replace('{CONTACT_NAME}', leadObj.contact_name)
      .replace('{BUSINESS_NAME}', leadObj.company_name);

    await run(
      `INSERT INTO campaign_recipients (id, campaign_id, lead_id, personalized_content, status, sent_at, created_at)
       VALUES (?, ?, ?, ?, 'simulated_sent', ?, ?)`,
      [uuidv4(), campaign2Id, leadId, personalized, now, now]
    );
  }

  // 5. Seed Conversations across all 7 channels for Unified Inbox
  const convConfigs = [
    {
      lead: 'Apex Logistics Ireland Ltd',
      channel: 'email',
      status: 'review_needed',
      messages: [
        {
          direction: 'outbound',
          sender: 'SENVO Corporate Advisory',
          content: 'Dear Declan, As Irish corporate year-end statutory deadlines approach, many mid-market leaders at companies like Apex Logistics Ireland Ltd are reviewing their statutory audit exemption thresholds, CRO Form B1 compliance, and cross-border VAT structures...',
          mode: 'simulated',
          is_ai: 0
        },
        {
          direction: 'inbound',
          sender: 'Declan Murphy',
          content: 'Hi SENVO Team, We operate UK and EU cross-border freight routes from Dublin Port. Our current auditors take too long on quarterly VAT reconciliations and management accounts. Could you handle our outsourced monthly bookkeeping, VAT3 filings, and prepare statutory audit files? Please let us know availability for a call this Thursday afternoon.',
          mode: 'simulated',
          is_ai: 0
        }
      ],
      ai: {
        intent: 'qualified_demo_request',
        service: 'Outsourced Bookkeeping, VAT3 & Statutory Audit Prep',
        summary: 'Declan Murphy (Apex Logistics) requires outsourced monthly bookkeeping, cross-border VAT3 reconciliations, and statutory audit file preparation due to bottlenecks with incumbent provider.',
        confidence: 0.96,
        reply: 'Dear Declan, Thank you for reaching out. SENVO specializes in logistics and freight sector accounting, including complex post-Brexit cross-border VAT3 reconciliations, postponed accounting mechanisms, and streamlined monthly management accounts. We would be delighted to connect this Thursday at 2:30 PM. I will send a calendar invitation with an outline of our discovery process.',
        action: 'Schedule discovery video meeting with Declan Murphy for Thursday 2:30 PM (Senior Client Partner)',
        human_review: 1
      }
    },
    {
      lead: 'Shannon Bioscience DAC',
      channel: 'website',
      status: 'handed_off',
      messages: [
        {
          direction: 'inbound',
          sender: 'Dr. Fiona Gallagher',
          content: 'Website Inquiry: We are an Enterprise Ireland supported MedTech firm in Galway. We need guidance on R&D Tax Credit claims (Section 766 TCA 1997), grant claim audit verification, and BrightPay payroll for 28 scientists and staff.',
          mode: 'simulated',
          is_ai: 0
        },
        {
          direction: 'outbound',
          sender: 'SENVO AI SDR',
          content: 'Dear Dr. Gallagher, Thank you for contacting SENVO. We have substantial experience with Enterprise Ireland client companies, specialized R&D tax credit technical-financial documentation under Section 766, and compliant Revenue-linked payroll. Our Life Sciences advisory lead has been assigned and will contact you directly.',
          mode: 'simulated',
          is_ai: 1
        }
      ],
      ai: {
        intent: 'enterprise_inquiry',
        service: 'R&D Tax Credit Advisory & Payroll Bureau',
        summary: 'High-value Enterprise Ireland client: 28-person MedTech DAC requiring Section 766 R&D tax credit claim preparation and BrightPay payroll compliance.',
        confidence: 0.98,
        reply: 'Dear Dr. Gallagher, Thank you for contacting SENVO. We have substantial experience with Enterprise Ireland client companies, specialized R&D tax credit technical-financial documentation under Section 766, and compliant Revenue-linked payroll.',
        action: 'Direct Executive Handoff to Tax Director (Life Sciences Practice)',
        human_review: 0
      }
    },
    {
      lead: 'Horizon Software Technologies Ltd',
      channel: 'linkedin',
      status: 'open',
      messages: [
        {
          direction: 'outbound',
          sender: 'SENVO Advisory',
          content: 'Hi Ciaran, noticed your recent team expansion at Horizon Software Technologies. With tech firms scaling in Dublin, ensuring seamless ERP integration and securing qualified senior finance talent is crucial...',
          mode: 'simulated',
          is_ai: 0
        },
        {
          direction: 'inbound',
          sender: 'Ciaran Walsh',
          content: 'Hi, thanks for reaching out. We are actually evaluating a migration from QuickBooks to NetSuite or Sage Intacct for our recurring SaaS revenue, plus we are searching for a Senior Financial Controller with ACA or ACCA qualifications. Do you handle both systems advisory and specialized placement?',
          mode: 'simulated',
          is_ai: 0
        }
      ],
      ai: {
        intent: 'pricing_and_feature_inquiry',
        service: 'IT/ERP Advisory & Specialist Finance Recruitment',
        summary: 'Ciaran Walsh (SaaS CTO/Founder) evaluating QuickBooks to NetSuite/Sage Intacct ERP migration, and requires senior ACA/ACCA Financial Controller recruitment.',
        confidence: 0.94,
        reply: 'Hi Ciaran, yes absolutely. SENVO provides dedicated cloud ERP architecture advisory (including SaaS revenue recognition compliance under IFRS 15) alongside our specialized finance executive search practice for ACA/ACCA senior controllers. We can arrange a 20-minute consultation with both our Systems and Recruitment leads.',
        action: 'Coordinate joint ERP Solutions & Finance Talent introductory call',
        human_review: 1
      }
    },
    {
      lead: 'Emerald Retail Holdings Ltd',
      channel: 'whatsapp',
      status: 'review_needed',
      messages: [
        {
          direction: 'inbound',
          sender: 'Mairead Kelly',
          content: 'Hello, Mairead here from Emerald Retail in Limerick. We have 85 staff across 6 stores. We need a fully managed Irish payroll bureau service to handle PAYE modernization, pension auto-enrollment preparation, and weekly timesheets. What is your onboarding timeline?',
          mode: 'simulated',
          is_ai: 0
        }
      ],
      ai: {
        intent: 'feature_and_timeline_inquiry',
        service: 'Managed Irish Payroll Bureau (85 staff)',
        summary: 'Mairead Kelly requires managed payroll bureau services for 85 multi-branch retail staff, focusing on PAYE modernization and pension compliance.',
        confidence: 0.95,
        reply: 'Hello Mairead! Our managed Irish payroll bureau routinely handles multi-location workforces with weekly/monthly rosters, full Revenue ROS synchronization, and digital employee payslips. Onboarding typically takes 7 to 10 business days with parallel test runs. Would you be free for a brief call tomorrow morning at 10:00 AM?',
        action: 'Schedule payroll scope review call with Mairead Kelly (Limerick Group)',
        human_review: 1
      }
    },
    {
      lead: 'Liffey Commercial Advisory Partners',
      channel: 'facebook',
      status: 'open',
      messages: [
        {
          direction: 'inbound',
          sender: 'Brendan Byrne',
          content: 'Hello, do you provide Dublin registered office address services and company secretarial support for international holding companies establishing an Irish presence?',
          mode: 'simulated',
          is_ai: 0
        }
      ],
      ai: {
        intent: 'corporate_services_inquiry',
        service: 'Company Secretarial & Registered Office Facility',
        summary: 'Inquiry regarding Dublin prime registered office facility and Section 137 director bond support for international corporate structures.',
        confidence: 0.92,
        reply: 'Hello Brendan, yes we provide prime Dublin registered office facilities, complete CRO annual filing administration, statutory register maintenance, and assistance with Section 137 Non-Resident Director Bonds. We would be pleased to share our corporate secretarial schedule.',
        action: 'Provide Company Secretarial service package details to Brendan Byrne',
        human_review: 1
      }
    },
    {
      lead: 'Celtic Marine Engineering Ltd',
      channel: 'sms',
      status: 'waiting_ai',
      messages: [
        {
          direction: 'inbound',
          sender: 'Sean O’Connor',
          content: 'SMS: Sean here from Celtic Marine Cork. Confirming we would like to review our statutory audit exemption status ahead of the October CRO filing. Pls call back.',
          mode: 'simulated',
          is_ai: 0
        }
      ],
      ai: null
    },
    {
      lead: 'Boyne Valley Food Enterprises DAC',
      channel: 'instagram',
      status: 'open',
      messages: [
        {
          direction: 'inbound',
          sender: 'Patrick Dunne',
          content: 'Sent inquiry via IG DM: Looking for grant audit certification services for our upcoming Bord Bia / Enterprise Ireland capital grant claim. Can you assist?',
          mode: 'simulated',
          is_ai: 0
        }
      ],
      ai: null
    }
  ];

  for (const conv of convConfigs) {
    const convId = uuidv4();
    const leadId = leadIdMap[conv.lead];
    if (!leadId) continue;

    await run(
      `INSERT INTO conversations (id, lead_id, channel, status, assigned_owner, last_message_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'AI SDR', ?, ?, ?)`,
      [convId, leadId, conv.channel, conv.status, now, now, now]
    );

    let lastMsgId = null;
    for (const msg of conv.messages) {
      const msgId = uuidv4();
      lastMsgId = msgId;
      await run(
        `INSERT INTO messages (id, conversation_id, direction, sender_name, content, delivery_mode, status, is_ai_generated, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'delivered', ?, ?)`,
        [msgId, convId, msg.direction, msg.sender, msg.content, msg.mode, msg.is_ai, now]
      );
    }

    if (conv.ai) {
      await run(
        `INSERT INTO ai_assessments (id, conversation_id, message_id, lead_id, intent, requested_service, summary, confidence, suggested_reply, suggested_next_action, human_review_required, review_status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?)`,
        [uuidv4(), convId, lastMsgId, leadId, conv.ai.intent, conv.ai.service, conv.ai.summary, conv.ai.confidence, conv.ai.reply, conv.ai.action, conv.ai.human_review, now]
      );
    }
  }

  // 6. Seed Handoffs for Qualified Leads (Bitrix24 CRM Connector Boundary)
  const handoffEntries = [
    {
      lead: 'Shannon Bioscience DAC',
      service: 'R&D Tax Credit Advisory & Payroll Bureau',
      summary: 'High-value Enterprise Ireland client: 28-person MedTech DAC requiring Section 766 R&D tax credit claim preparation and BrightPay payroll compliance.',
      owner: 'Aoife Ní Bhriain (Tax Advisory Partner)',
      action: 'Initiate R&D technical qualification call and statutory filing timetable.'
    },
    {
      lead: 'Apex Logistics Ireland Ltd',
      service: 'Outsourced Bookkeeping, VAT3 & Statutory Audit Prep',
      summary: 'Mid-market freight operator switching providers. Requires outsourced bookkeeping, cross-border VAT3 compliance, and year-end audit support.',
      owner: 'Colm Fitzpatrick (Client Services Director)',
      action: 'Conduct formal discovery call on Thursday at 2:30 PM with Declan Murphy.'
    }
  ];

  for (const h of handoffEntries) {
    const leadId = leadIdMap[h.lead];
    if (!leadId) continue;

    await run(
      `INSERT INTO handoffs (id, lead_id, requested_service, qualification_summary, assigned_owner, next_action, crm_target, crm_sync_status, sync_details, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'Bitrix24', 'prepared_pending_sync', 'Staged payload formatted for Bitrix24 crm.lead.add REST method. Live sync paused in simulation mode.', ?)`,
      [uuidv4(), leadId, h.service, h.summary, h.owner, h.action, now]
    );
  }

  // 7. Seed Activity Log
  const activities = [
    { actor: 'System', action: 'DATABASE_INITIALIZED', entity_type: 'system', details: 'Persistent SQLite database loaded with Irish Corporate Services context.' },
    { actor: 'Corporate Team', action: 'CAMPAIGN_LAUNCHED', entity_type: 'campaign', details: 'Launched campaign: Irish Corporate Year-End & Statutory Compliance Briefing.' },
    { actor: 'AI SDR', action: 'REPLY_CLASSIFIED', entity_type: 'conversation', details: 'Classified inquiry from Declan Murphy (Apex Logistics Ireland Ltd).' },
    { actor: 'AI SDR', action: 'LEAD_QUALIFIED', entity_type: 'lead', details: 'Qualified Shannon Bioscience DAC for R&D tax credit & payroll engagement.' },
    { actor: 'System', action: 'HANDOFF_PREPARED', entity_type: 'handoff', details: 'Prepared Bitrix24 CRM payload for Apex Logistics Ireland Ltd.' },
  ];

  for (const act of activities) {
    await run(
      `INSERT INTO activity_events (id, actor, action, entity_type, details, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [uuidv4(), act.actor, act.action, act.entity_type, act.details, now]
    );
  }

  console.log('[Seed] Database initialization and seeding completed successfully for SENVO Ireland Corporate Services!');
};

// If run directly
if (process.argv[1]?.endsWith('seed.js')) {
  seedData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed] Error during seeding:', err);
      process.exit(1);
    });
}
