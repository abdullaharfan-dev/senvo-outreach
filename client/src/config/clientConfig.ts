/**
 * SENVO Outreach — Reusable Client Configuration Engine
 * 
 * Supports dynamic configuration across diverse corporate clients and industries.
 * Default profile: Irish Corporate Advisory Practice (Dublin, Cork, Galway)
 */

export interface ClientService {
  id: string;
  name: string;
  category: string;
  targetAudience: string;
  typicalFee: string;
  valueProp: string;
  statutoryReference?: string;
  keyBenefits: string[];
}

export interface IcpCriterion {
  id: string;
  label: string;
  weight: number;
  description: string;
  qualifyingSignals: string[];
}

export interface TargetSegmentConfig {
  id: string;
  name: string;
  badge: string;
  description: string;
  estimatedProspects: number;
  recommendedChannel: string;
  keyPainPoint: string;
  messagingAngle: string;
  relevantServiceId: string;
}

export interface DemoConversationTurn {
  sender: 'prospect' | 'ai' | 'partner';
  senderName: string;
  timestamp: string;
  content: string;
  intent?: string;
  confidence?: number;
  knowledgeReference?: string;
  isAiGenerated?: boolean;
}

export interface DemoScenario {
  id: string;
  title: string;
  category: 'service_enquiry' | 'eligibility' | 'pricing' | 'more_info' | 'competitor' | 'meeting' | 'handoff';
  categoryLabel: string;
  prospectCompany: string;
  prospectContact: string;
  channel: string;
  summary: string;
  turns: DemoConversationTurn[];
  suggestedNextAction: string;
  qualificationImpact: string;
}

export interface ImplementationTask {
  id: string;
  week: 1 | 2 | 3 | 4;
  weekTitle: string;
  title: string;
  description: string;
  owner: string;
  status: 'planned' | 'in_progress' | 'completed';
  dueDate: string;
  deliverable: string;
  notes?: string;
}

export interface ClientConfig {
  id: string;
  clientName: string;
  tagline: string;
  industry: string;
  jurisdiction: string;
  geography: string;
  brandAccentColor: string;
  partnerLead: {
    name: string;
    role: string;
    email: string;
    jurisdictionNote: string;
  };
  services: ClientService[];
  icpCriteria: IcpCriterion[];
  targetSegments: TargetSegmentConfig[];
  messagingTone: {
    formality: 'high' | 'executive' | 'conversational';
    complianceStandard: string;
    disclaimer: string;
  };
  scenarios: DemoScenario[];
  implementationTasks: ImplementationTask[];
}

/**
 * Primary Configured Client Profile: Irish Corporate Advisory Practice
 */
export const defaultClientConfig: ClientConfig = {
  id: 'senvo-ireland-advisory',
  clientName: 'SENVO Corporate & Statutory Advisory Practice',
  tagline: 'Enterprise Corporate Secretarial, Audit Exemption & Statutory Governance',
  industry: 'Corporate Advisory, Accounting & Compliance',
  jurisdiction: 'Republic of Ireland (Companies Act 2014)',
  geography: 'Dublin • Cork • Galway • Limerick',
  brandAccentColor: '#2563eb',
  partnerLead: {
    name: "Declan O'Sullivan",
    role: 'Client Services Lead & Senior Advisory Partner',
    email: 'partner@senvo.ie',
    jurisdictionNote: 'Licensed Statutory Practice • Dublin 2 & Cork City'
  },
  services: [
    {
      id: 'statutory-cro',
      name: 'Statutory CRO Compliance & Annual Return Governance',
      category: 'Corporate Secretarial',
      targetAudience: 'Irish private limited companies (LTD/DAC) with multi-director governance',
      typicalFee: '€2,400 – €4,800 / year',
      valueProp: 'Automated 56-day Annual Return Date (ARD) monitoring and CORE electronic filings to eliminate late filing penalties and loss of audit exemption.',
      statutoryReference: 'Section 343 & 344 Companies Act 2014',
      keyBenefits: [
        'Guaranteed zero late filing penalties (€100 base + €3/day up to €1,200 cap)',
        'Protection against automatic 2-year audit exemption forfeiture',
        'Direct electronic CORE submission with partner digital signatures'
      ]
    },
    {
      id: 'audit-exemption',
      name: 'Section 358 Statutory Audit Exemption Certification',
      category: 'Statutory Audit & Assurance',
      targetAudience: 'Small and micro Irish corporate entities meeting Section 350 criteria',
      typicalFee: '€3,200 – €6,500 / year',
      valueProp: 'Complete eligibility evaluation and independent accountant compilation report eliminating costly full statutory audit overhead while ensuring bank compliance.',
      statutoryReference: 'Sections 350, 358 & 364 Companies Act 2014',
      keyBenefits: [
        'Turnover threshold qualification (<€12,000,000)',
        'Balance sheet total qualification (<€6,000,000)',
        'Average employee headcount qualification (<50 employees)',
        'Certified compilation balance sheet accepted by Irish commercial banks'
      ]
    },
    {
      id: 'rd-tax-credit',
      name: 'Section 766 R&D Tax Credit & Grant Audit Briefing',
      category: 'Fiscal Structuring',
      targetAudience: 'Enterprise software, life sciences and engineering firms incurring eligible scientific R&D expenditures',
      typicalFee: '8% – 12% of claim value or fixed advisory retainer',
      valueProp: 'Robust 30% corporation tax credit claim substantiation under Finance Act 2023 with audit-ready technical time-tracking documentation.',
      statutoryReference: 'Section 766, 766A & 766C TCA 1997',
      keyBenefits: [
        'Enhanced 30% payable corporation tax credit yield',
        'Revenue Commissioners audit defense dossier preparation',
        'Direct cash refund installment structuring for pre-revenue entities'
      ]
    },
    {
      id: 'cross-border-vat',
      name: 'Cross-Border EU/UK Port VAT3 & Customs Postponed Accounting',
      category: 'Trade & Tax',
      targetAudience: 'Freight, logistics, and trading businesses importing via Dublin, Rosslare, and Shannon ports',
      typicalFee: '€1,800 – €3,600 / quarter',
      valueProp: 'Cash-flow neutral Postponed VAT Accounting (PVA) implementation on Revenue AIS customs entries with bi-monthly VAT3 reconciliation.',
      statutoryReference: 'VAT Consolidation Act 2010 & Revenue PVA Scheme',
      keyBenefits: [
        'Eliminates upfront 23% import VAT payment at maritime ports',
        'Automated AIS customs declaration to VAT3 Box T1/T2 reconciliation',
        'Zero risk of VIES intra-community reporting discrepancies'
      ]
    }
  ],
  icpCriteria: [
    {
      id: 'financial-scale',
      label: 'Turnover & Commercial Scale',
      weight: 35,
      description: 'Annual turnover between €1.5M and €40M with demonstrable operating cash flow and payroll liabilities.',
      qualifyingSignals: [
        'Reported turnover exceeds €1.5M threshold',
        'Active employee headcount between 10 and 150',
        'Multi-director board structure'
      ]
    },
    {
      id: 'statutory-nexus',
      label: 'Irish Legal Nexus & Registry Status',
      weight: 25,
      description: 'Incorporated under Companies Registration Office (CRO) Ireland with active trading status and registered Irish office.',
      qualifyingSignals: [
        'Valid 6-digit CRO registration number verified',
        'Physical office in Dublin, Cork, Galway, Limerick or Shannon',
        'Current on past CRO annual returns or approaching ARD window'
      ]
    },
    {
      id: 'nace-industry-fit',
      label: 'NACE Sector Compatibility',
      weight: 20,
      description: 'High-value sectors requiring recurring statutory compliance: ICT, Advanced Engineering, Logistics, Life Sciences, and Specialized Services.',
      qualifyingSignals: [
        'NACE Code 6201/6202 (Computer Programming & Consultancy)',
        'NACE Code 4941/5229 (Freight Transport & Logistics)',
        'NACE Code 7022 (Business & Management Consultancy)',
        'NACE Code 7219 (Other Research & Experimental Development)'
      ]
    },
    {
      id: 'decision-maker-reach',
      label: 'Executive Accessibility & Reach',
      weight: 20,
      description: 'Identified C-suite or Board decision maker (Managing Director, Finance Director, Founder) with verified corporate email and phone.',
      qualifyingSignals: [
        'Direct C-suite email address verified with zero bounce risk',
        'Mobile or direct landline accessible',
        'Active executive LinkedIn presence in Ireland'
      ]
    }
  ],
  targetSegments: [
    {
      id: 'irish-tech-saas',
      name: 'High-Growth Irish Software & Tech (SaaS)',
      badge: 'Tier 1 Priority',
      description: 'Irish technology companies developing proprietary software with eligible R&D activities and expanding headcount.',
      estimatedProspects: 340,
      recommendedChannel: 'Email + LinkedIn Multichannel',
      keyPainPoint: 'Claiming the 30% R&D tax credit without triggering arduous Revenue technical audits or documentation gaps.',
      messagingAngle: 'Section 766 Revenue substantiation audit defense and non-dilutive innovation cash flow.',
      relevantServiceId: 'rd-tax-credit'
    },
    {
      id: 'freight-logistics-port',
      name: 'Cross-Border Freight & Port Logistics',
      badge: 'High Value',
      description: 'Supply chain and haulage operators navigating Post-Brexit customs declarations through Dublin and Rosslare ports.',
      estimatedProspects: 215,
      recommendedChannel: 'WhatsApp + Phone Sequence',
      keyPainPoint: 'Upfront VAT cash-flow drain and customs clearance delays during port inspection periods.',
      messagingAngle: 'Postponed VAT Accounting (PVA) cash neutralization and automated Revenue AIS reconciliation.',
      relevantServiceId: 'cross-border-vat'
    },
    {
      id: 'midmarket-corporate-secretarial',
      name: 'Mid-Market Irish Companies (Audit Exemption Candidates)',
      badge: 'Volume High Yield',
      description: 'Profitable Irish private companies with <€12M turnover paying excessive fees for traditional Big 4 audits.',
      estimatedProspects: 580,
      recommendedChannel: 'Executive Email Sequence',
      keyPainPoint: 'High annual audit bills when the business qualifies for statutory Section 358 exemption.',
      messagingAngle: 'Transition from costly statutory audit to certified compilation balance sheets under Section 358.',
      relevantServiceId: 'audit-exemption'
    }
  ],
  messagingTone: {
    formality: 'executive',
    complianceStandard: 'Institute of Certified Public Accountants in Ireland / Law Society Guidance',
    disclaimer: 'Initial discussions are confidential and exploratory. Statutory advisory mandates are executed under formal engagement letter.'
  },
  scenarios: [
    {
      id: 'scenario-audit-exemption-eligibility',
      title: 'Section 358 Statutory Audit Exemption Eligibility',
      category: 'eligibility',
      categoryLabel: 'Eligibility & Criteria',
      prospectCompany: 'Connacht Financial Technology Ltd',
      prospectContact: 'Eamon Walsh (Managing Director)',
      channel: 'email',
      summary: 'Prospect inquires whether their €6.8M turnover fintech firm can legally opt out of a full statutory audit for the upcoming fiscal year.',
      turns: [
        {
          sender: 'prospect',
          senderName: 'Eamon Walsh',
          timestamp: '10:14 AM',
          content: 'Hi Declan, our current auditors quoted €18,500 for our 2026 audit. Our turnover was roughly €6.8M with 34 staff. A peer mentioned we might qualify for an audit exemption under Irish law. Can we legally dispense with the audit?',
          intent: 'eligibility_inquiry',
          isAiGenerated: false
        },
        {
          sender: 'ai',
          senderName: 'SENVO Advisory Co-Pilot',
          timestamp: '10:15 AM',
          content: 'Hello Eamon. Yes, under Section 358 of the Irish Companies Act 2014, private limited companies are eligible for statutory audit exemption if they satisfy at least two of the following three conditions: (1) Turnover does not exceed €12,000,000, (2) Balance sheet total does not exceed €6,000,000, and (3) Average number of employees does not exceed 50.\n\nWith €6.8M turnover and 34 staff, Connacht Financial Technology comfortably satisfies the statutory criteria, provided your past two CRO Annual Returns (Form B1) were filed strictly on time. We can prepare a certified compilation balance sheet that satisfies your lenders at a fraction of that audit quote. Would you like a 15-minute briefing with Declan this Thursday to verify your exact filing status?',
          intent: 'eligibility_confirmed_propose_meeting',
          confidence: 0.96,
          knowledgeReference: 'Section 358 Companies Act 2014 • Qualifying Thresholds',
          isAiGenerated: true
        }
      ],
      suggestedNextAction: 'Review Connacht CRO filing record on CORE and confirm Thursday 2:30 PM Zoom consultation.',
      qualificationImpact: 'High Intent • Potential €4,500 Annual Statutory Retainer'
    },
    {
      id: 'scenario-rd-tax-credit-substantiation',
      title: 'Section 766 R&D Tax Credit Claim Defense',
      category: 'service_enquiry',
      categoryLabel: 'Service Enquiry',
      prospectCompany: 'Kinsale Spirits Group Ltd',
      prospectContact: 'Liam Higgins (Operations Director)',
      channel: 'whatsapp',
      summary: 'Prospect asks how SENVO supports technical documentation for distilling fermentation sensor R&D expenditure claims.',
      turns: [
        {
          sender: 'prospect',
          senderName: 'Liam Higgins',
          timestamp: '11:32 AM',
          content: 'Morning Declan. We invested around €140k developing automated distillation temperature sensors. We want to claim the 30% R&D credit but Revenue audited a neighbouring craft distillery last month and clawed back €40k. Can your team ensure our claim is audit-proof before submission?',
          intent: 'technical_scope_inquiry',
          isAiGenerated: false
        },
        {
          sender: 'ai',
          senderName: 'SENVO Advisory Co-Pilot',
          timestamp: '11:33 AM',
          content: 'Good morning Liam. Revenue Commissioners audits in the agri-tech and food processing sectors primarily scrutinize the "scientific uncertainty" and technical timesheet logs required under Section 766 TCA 1997.\n\nOur statutory practice builds an audit-ready dossier before filing: (1) We map your sensor development against the statutory definition of systematic investigative activity, (2) We substantiate direct qualifying payroll and consumable costs, and (3) We prepare the Section 766C cash credit installment schedule. On a €140k qualifying spend, your net 30% benefit is €42,000.\n\nWould you be open to Declan reviewing your draft technical project summary next week?',
          intent: 'value_articulation_and_meeting_offer',
          confidence: 0.94,
          knowledgeReference: 'Section 766 TCA 1997 • Revenue Guidelines on Scientific Uncertainty',
          isAiGenerated: true
        }
      ],
      suggestedNextAction: 'Dispatch Section 766 Technical Documentation Template to Liam Higgins.',
      qualificationImpact: 'High Intent • Eligible for €42,000 Cash Tax Credit'
    },
    {
      id: 'scenario-pricing-objection-fixed-fee',
      title: 'Pricing Objection: Fixed Fee vs Hourly Advisory Retainer',
      category: 'pricing',
      categoryLabel: 'Pricing Objection',
      prospectCompany: 'Galway Biomass Renewable Energy DAC',
      prospectContact: 'Ronan Burke (Finance Controller)',
      channel: 'email',
      summary: 'Prospect objects that traditional accounting advisory billing is opaque and asks how SENVO charges for ongoing CRO and board secretarial compliance.',
      turns: [
        {
          sender: 'prospect',
          senderName: 'Ronan Burke',
          timestamp: '2:15 PM',
          content: 'Declan, our board is tired of open-ended hourly legal/accounting bills where a single phone call costs €250. How does SENVO structure compliance fees for a DAC company?',
          intent: 'pricing_structure_objection',
          isAiGenerated: false
        },
        {
          sender: 'ai',
          senderName: 'SENVO Advisory Co-Pilot',
          timestamp: '2:16 PM',
          content: 'Understood Ronan, and your board is right to challenge hourly billing models. At SENVO, we operate on 100% transparent, fixed-annual statutory agreements with zero hourly clock charges.\n\nFor an Irish Designated Activity Company (DAC), our corporate secretarial governance retainer includes: (1) All statutory CRO B1 filings, (2) Maintenance of your Register of Beneficial Ownership (RBO), (3) Annual General Meeting minutes and board resolutions, and (4) Unlimited ad-hoc compliance inquiries by your finance team. You receive a guaranteed flat fee of €250/month with zero surprises.\n\nCan I send you our standard DAC Fixed-Fee Schedule to present to your board?',
          intent: 'address_pricing_objection_fixed_fee_proposal',
          confidence: 0.95,
          knowledgeReference: 'SENVO Transparent Retainer Policy • Companies Act 2014 Part 16 DAC Regulations',
          isAiGenerated: true
        }
      ],
      suggestedNextAction: 'Forward DAC Fixed-Fee Statutory Governance Schedule to Ronan Burke.',
      qualificationImpact: 'High Intent • Resolved Commercial Pricing Friction'
    },
    {
      id: 'scenario-meeting-confirmed-handoff',
      title: 'Confirmed Meeting Interest & Partner Handoff',
      category: 'meeting',
      categoryLabel: 'Meeting Interest',
      prospectCompany: 'Munster Agricultural Logistics Ltd',
      prospectContact: 'Cathal O’Donnell (Managing Director)',
      channel: 'email',
      summary: 'Managing Director confirms willingness to discuss Postponed VAT Accounting and cross-border haulage documentation with Declan O’Sullivan.',
      turns: [
        {
          sender: 'prospect',
          senderName: 'Cathal O’Donnell',
          timestamp: '4:22 PM',
          content: 'Hi Declan, the PVA postponement sounds very relevant for our Cork and Rosslare ferry entries. I am free Thursday at 3:00 PM for a 20-minute Zoom call. Does that work for you?',
          intent: 'meeting_confirmation',
          isAiGenerated: false
        },
        {
          sender: 'ai',
          senderName: 'SENVO Advisory Co-Pilot',
          timestamp: '4:23 PM',
          content: 'Splendid Cathal. Thursday at 3:00 PM is reserved in Declan’s calendar. We have prepared an agenda specifically focusing on: (1) Neutralizing 23% import VAT on your Rosslare container manifests, (2) Linking your Revenue AIS declarations with bi-monthly VAT3 returns, and (3) Structuring an automated filing workflow.\n\nDeclan will send your direct Zoom link shortly. Staging this conversation for Senior Partner Declan O’Sullivan now.',
          intent: 'stage_for_partner_handoff',
          confidence: 0.98,
          knowledgeReference: 'Revenue Postponed Accounting Scheme • Rosslare Port Manifest Guidelines',
          isAiGenerated: true
        }
      ],
      suggestedNextAction: 'Review Rosslare customs volume data and dispatch Zoom calendar invite for Thursday 3:00 PM.',
      qualificationImpact: 'Fully Qualified • Staged for Bitrix24 Partner Pipeline'
    }
  ],
  implementationTasks: [
    // Week 1
    {
      id: 'task-w1-1',
      week: 1,
      weekTitle: 'Discovery, Client Configuration & ICP Setup',
      title: 'Statutory Service Catalogue & Pricing Matrix Setup',
      description: 'Formalize corporate advisory service definitions, statutory fee bands, and Companies Act references.',
      owner: "Declan O'Sullivan (Partner Lead)",
      status: 'completed',
      dueDate: 'Day 3',
      deliverable: 'Approved Service Catalogue & Fee Schedule',
      notes: 'Configured CRO compliance, Section 358 audit exemption, Section 766 R&D credit, and PVA trade modules.'
    },
    {
      id: 'task-w1-2',
      week: 1,
      weekTitle: 'Discovery, Client Configuration & ICP Setup',
      title: 'Ideal Customer Profile (ICP) Scoring Rules Configuration',
      description: 'Calibrate scoring weights across turnover scale (35%), CRO legal nexus (25%), NACE industry (20%), and decision-maker access (20%).',
      owner: 'SENVO Intelligence Team',
      status: 'completed',
      dueDate: 'Day 5',
      deliverable: 'Automated 100-Point Scoring Engine',
      notes: 'Calibrated specifically for Irish mid-market corporate advisory prospects.'
    },
    {
      id: 'task-w1-3',
      week: 1,
      weekTitle: 'Discovery, Client Configuration & ICP Setup',
      title: 'Approved Statutory Knowledge Base Ingestion',
      description: 'Ground AI Co-Pilot with Revenue Commissioners publications, CRO filing guidelines, and statutory FAQ matrix.',
      owner: 'Compliance Advisory Specialist',
      status: 'completed',
      dueDate: 'Day 7',
      deliverable: 'Grounding Knowledge Base with 8 Approved Policies',
      notes: 'Revenue Tax & Duty Manuals and CRO Form B1 compliance documentation loaded.'
    },
    // Week 2
    {
      id: 'task-w2-1',
      week: 2,
      weekTitle: 'Prospect Discovery, Enrichment & Campaign Architecture',
      title: 'Verified Irish Corporate Registry Ingestion (CRO)',
      description: 'Filter active Irish corporate records with €1.5M–€40M revenue across Dublin, Cork, Galway, and Limerick clusters.',
      owner: 'Data Operations Lead',
      status: 'in_progress',
      dueDate: 'Day 10',
      deliverable: 'Initial Verified Directory of 1,200 Irish Entities',
      notes: 'Cross-verifying CRO incorporation dates and active director filings.'
    },
    {
      id: 'task-w2-2',
      week: 2,
      weekTitle: 'Prospect Discovery, Enrichment & Campaign Architecture',
      title: 'Multi-Channel Outreach Sequences & Personalization Tags',
      description: 'Author executive first-touch emails, follow-up sequences, and LinkedIn InMail variations tailored to each target segment.',
      owner: 'Content Strategy Partner',
      status: 'in_progress',
      dueDate: 'Day 12',
      deliverable: '3 Segment Sequences with 9 Content Variations',
      notes: 'Drafting high-formality executive tone focusing on statutory filing risks.'
    },
    {
      id: 'task-w2-3',
      week: 2,
      weekTitle: 'Prospect Discovery, Enrichment & Campaign Architecture',
      title: 'Sandbox Dispatch & Simulation Validation',
      description: 'Run simulation-only campaign dispatches to test recipient personalization tags and delivery queues with zero external transmission.',
      owner: 'Platform Engineering Lead',
      status: 'planned',
      dueDate: 'Day 14',
      deliverable: 'Simulated Sandbox Dispatch Test Run (100 Recipients)',
      notes: 'Strict simulation safeguards active: delivery_mode = simulated.'
    },
    // Week 3
    {
      id: 'task-w3-1',
      week: 3,
      weekTitle: 'AI Conversation Workflows, Qualification & CRM Integration',
      title: 'Multi-Turn Intent Triage & Suggestion Calibration',
      description: 'Validate Gemini AI intent classification across service requests, Section 358 eligibility objections, and consultation bookings.',
      owner: 'AI Systems Specialist',
      status: 'planned',
      dueDate: 'Day 17',
      deliverable: 'Intent Classification Accuracy Benchmark (>95%)',
      notes: 'Configured fallback rule engine for guaranteed response availability.'
    },
    {
      id: 'task-w3-2',
      week: 3,
      weekTitle: 'AI Conversation Workflows, Qualification & CRM Integration',
      title: 'Human Co-Pilot Approval & Review Protocol',
      description: 'Define partner sign-off rules for staged AI draft responses before simulated dispatch.',
      owner: "Declan O'Sullivan (Partner Lead)",
      status: 'planned',
      dueDate: 'Day 19',
      deliverable: 'Partner Review SOP & One-Click Staging Workflow',
      notes: 'Ensures no automated response is delivered without partner visibility.'
    },
    {
      id: 'task-w3-3',
      week: 3,
      weekTitle: 'AI Conversation Workflows, Qualification & CRM Integration',
      title: 'Bitrix24 REST API Pipeline Gateway Staging',
      description: 'Format high-intent prospect payloads into Bitrix24 crm.lead.add JSON schema with statutory custom fields.',
      owner: 'Integration Architect',
      status: 'planned',
      dueDate: 'Day 21',
      deliverable: 'Staged CRM Handoff Schema & Gateway Health Check',
      notes: 'Validates automated transition from qualification to partner diary.'
    },
    // Week 4
    {
      id: 'task-w4-1',
      week: 4,
      weekTitle: 'Performance Review, Optimization & Next Steps',
      title: 'Conversion Funnel & Channel Efficiency Audit',
      description: 'Analyze multi-channel response rates, lead-quality distribution, and meeting conversion velocity from sandbox audit logs.',
      owner: 'Senior Practice Analyst',
      status: 'planned',
      dueDate: 'Day 24',
      deliverable: 'Executive Performance Funnel & Attribution Report',
      notes: 'Compares Email, LinkedIn and WhatsApp response engagement.'
    },
    {
      id: 'task-w4-2',
      week: 4,
      weekTitle: 'Performance Review, Optimization & Next Steps',
      title: 'Partner Advisory Handoff & Discovery Meeting Review',
      description: 'Conduct live partner review of qualified corporate leads, statutory scope summaries, and suggested consultation agendas.',
      owner: "Declan O'Sullivan (Partner Lead)",
      status: 'planned',
      dueDate: 'Day 27',
      deliverable: 'Partner Readiness Sign-Off & Client Onboarding Queue',
      notes: 'Reviewing 20-minute Zoom consultation agenda templates.'
    },
    {
      id: 'task-w4-3',
      week: 4,
      weekTitle: 'Performance Review, Optimization & Next Steps',
      title: 'Production Ramp & Phased Scale Architecture',
      description: 'Finalize quarterly expansion roadmap for additional Irish business sectors (Life Sciences, MedTech, Agri-food exports).',
      owner: 'Steering Committee',
      status: 'planned',
      dueDate: 'Day 30',
      deliverable: 'Quarterly Commercial Expansion Roadmap',
      notes: 'Pre-requisite: Explicit partner approval before live outbound transition.'
    }
  ]
};

/**
 * In-memory client configuration store with localStorage caching
 */
let currentClientConfig: ClientConfig = (() => {
  try {
    const saved = localStorage.getItem('senvo_client_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.id) return parsed;
    }
  } catch {}
  return defaultClientConfig;
})();

export const getClientConfig = (): ClientConfig => currentClientConfig;

export const updateClientConfig = (newConfig: ClientConfig): void => {
  currentClientConfig = newConfig;
  try {
    localStorage.setItem('senvo_client_config', JSON.stringify(newConfig));
  } catch {}
};

export const resetClientConfig = (): ClientConfig => {
  currentClientConfig = defaultClientConfig;
  try {
    localStorage.removeItem('senvo_client_config');
  } catch {}
  return defaultClientConfig;
};
