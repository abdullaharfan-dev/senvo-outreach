# SENVO Outreach
## Phase 1 — Architecture & Foundation Specification

**Status:** Architecture approved  
**Phase:** 1 — Product Foundation  
**Next milestone:** Phase 1 documentation and acceptance criteria finalized  
**Implementation status:** Not started  
**Scope:** Foundation only. No build prompt or implementation authorization is included.

---

## 1. Product objective

SENVO Outreach is an AI-powered outreach and client-response management platform for businesses managing lead lists, multi-channel campaigns, incoming inquiries, qualification and team handoffs.

The initial client requirements cover LinkedIn, Facebook, Instagram, WhatsApp, Outlook/email, SMS and website inquiries.

The product must provide one unified operational workspace, company-specific AI responses, campaign management, response classification, qualified-lead routing and a future path to approved integrations.

The initial public demo must be interactive, persistent, professionally branded and safe to demonstrate without contacting real prospects.

---

## 2. Approved architectural decisions

| Area | Agreed decision |
|---|---|
| Frontend | React + TypeScript |
| Database | Supabase / PostgreSQL |
| Server-side operations | Supabase server-side functions |
| Authentication | Supabase Auth with a controlled demo user and future role support |
| AI provider | Configurable server-side AI provider |
| AI context | Relevant lead fields, recent conversation and approved company knowledge only |
| AI failure | Block AI-dependent actions when the provider is unavailable or output is invalid |
| Outbound behaviour | Automatic simulated send, with review available |
| Demo access | Password-protected demo account |
| Demo data | Supplied sample leads with sensitive fields minimized; fictional conversations |
| Hosting | Managed frontend hosting plus Supabase backend and server-side functions |
| Channel integrations | Simulated adapters for the demo; real integrations are separate future work |

The architecture should remain modular and maintainable. Separate microservices are not required.

---

## 3. Application modules

The persistent navigation will include:

1. **Overview** — campaign activity, replies, qualified leads, errors and pending actions.
2. **Leads** — spreadsheet import, column mapping, validation, duplicate review, segmentation, priority and lead details.
3. **Campaigns** — audience selection, channel selection, approved templates, personalization, preview and campaign execution.
4. **Unified Inbox** — channel filters, conversations, message history, AI replies, classification and review.
5. **Qualified Leads** — requested service, qualification summary, owner, next action and CRM handoff status.
6. **Analytics** — campaign and response performance calculated from persisted records.
7. **Company Knowledge** — approved services, FAQs, business rules, policies and response guidance.
8. **Integrations** — connection status, provider configuration and integration capabilities.
9. **Settings** — account, workspace, permissions and application configuration.

All modules must use shared application services and a consistent data model.

---

## 4. Technical architecture

**Frontend layer**
- Reusable UI components and design tokens.
- Module-level views with consistent navigation and interaction patterns.
- Client-side input validation and useful feedback states.

**Application service layer**
- Lead management.
- Campaign orchestration.
- Conversation and message management.
- AI generation and classification.
- Qualification and handoffs.
- Activity logging and reporting.

**AI service**
- Configurable provider behind a shared interface.
- Server-side credential management.
- Structured output validation.
- Bounded retries and actionable error handling.
- No fabricated AI output when the provider fails.

**Channel adapter layer**
- Consistent interfaces for simulated sending, inbound events and status reporting.
- Explicit separation between simulation and real integrations.
- Provider-specific capabilities and permissions checked before future live use.

**Persistence layer**
- Supabase/PostgreSQL as the source of truth for application records.
- Supabase Auth for identity.
- Database access policies and workspace boundaries.
- Persistent campaign and conversation state.

This is a logical separation of responsibilities, not a mandate to deploy each layer independently.

---

## 5. Core data model

| Entity | Responsibility |
|---|---|
| `leads` | Company, contact details, source, priority, score and owner |
| `campaigns` | Audience, channel, template, schedule and lifecycle status |
| `campaign_recipients` | Campaign-to-lead relationship, personalized content and delivery outcome |
| `conversations` | Lead, channel, assigned owner and conversation status |
| `messages` | Direction, content, timestamps, status and delivery mode |
| `ai_assessments` | Intent, requested service, summary, confidence and review status |
| `handoffs` | Qualified lead, owner, next action and CRM synchronization status |
| `company_knowledge` | Services, FAQs, approved claims and business rules |
| `integration_configs` | Provider configuration, connection status and enabled capabilities |
| `activity_events` | Actor, action, affected entity, timestamp and outcome |

### Data integrity requirements

- Use stable identifiers for entities and relationships.
- Detect duplicate imports and provide a review mechanism.
- Track each campaign recipient independently.
- Store AI-generated drafts separately from message-delivery records.
- Preserve important activity history.
- Represent delivery mode and delivery status explicitly.
- Support future workspace separation and role-based permissions.
- Keep demo seed data separate from future client production data.

---

## 6. Supported channel categories

The product must represent all seven categories:

- LinkedIn
- Facebook
- Instagram
- WhatsApp
- Outlook/email
- SMS
- Website inquiries

Website inquiries are primarily an inbound source, not an assumed outbound messaging channel.

For the initial demo, channel operations are simulated. No real external message may be sent. The interface and stored records must distinguish simulated activity from actual delivery.

Bitrix24 is a future integration boundary. Preparing a handoff must not be reported as a successful CRM synchronization.

---

## 7. End-to-end business workflow

1. Import and validate leads.
2. Review duplicates and preserve useful source information.
3. Segment eligible prospects.
4. Create a campaign using approved messaging and personalization.
5. Generate the relevant content.
6. Record simulated delivery outcomes.
7. Introduce a fictional incoming response.
8. Generate an AI reply using approved company knowledge.
9. Classify intent and determine the requested service.
10. Create or update the qualified-lead record.
11. Assign an owner and next action.
12. Prepare the CRM handoff and record its actual status.

The workflow must be demonstrable end to end using persisted data.

---

## 8. AI and privacy requirements

Each AI request may include only the relevant lead fields, recent conversation and approved company knowledge needed for the current task.

The structured AI result should support:
- Reply text.
- Intent classification.
- Requested service.
- Qualification summary.
- Suggested next action.
- Human-review recommendation.

If the AI provider fails, times out or returns invalid output, AI-dependent actions must stop. The application must explain the failure and provide an appropriate recovery path.

A scripted fallback must never be presented as a genuine AI-generated reply.

---

## 9. Security and safeguards

- Keep AI provider secrets and privileged database credentials server-side.
- Enforce database access policies and workspace boundaries.
- Use authenticated access for the protected demo.
- Minimize sensitive fields imported from the supplied spreadsheet.
- Avoid unnecessary personal information in AI requests and logs.
- Prevent duplicate simulated sends when operations are retried.
- Maintain an activity history for significant actions.
- Provide clear error and status reporting.
- Keep real outbound integrations disabled in the demo.
- Design future production integrations to support permissions, rate limits, suppression checks and applicable privacy and direct-marketing requirements.

---

## 10. UI/UX direction

The interface must resemble established B2B SaaS software.

- Persistent dark-navy sidebar and clean, light working canvas.
- SENVO branding.
- Consistent typography, spacing, forms, buttons, tables and status indicators.
- Information-rich layouts with useful filters, search and contextual detail panels.
- Unified inbox with conversation list, message thread and lead context.
- Functional empty, loading, success and error states.
- Responsive layouts and accessible interaction states.
- Metrics calculated from persisted data rather than hardcoded counters.
- No unnecessary decorative cards, excessive whitespace or misleading live-status indicators.

---

## 11. Deployment assumptions

The intended deployment is managed frontend hosting with Supabase and server-side functions, accessed through a password-protected demo account.

Before implementation, verify:
- Supabase project and credential availability.
- AI provider access, model availability and budget.
- Hosting and deployment permissions.
- Authentication and database access policies.
- Demo-data seeding and reset strategy.
- Server-side error handling and rate limits.
- Future integration capabilities and permissions.

The architecture does not imply that production integrations are already available.

---

## 12. Phase 1 acceptance criteria

Phase 1 is accepted when the following requirements are documented and agreed. Actual software behaviour will be verified during later implementation and QA.

### A. Product scope and navigation
- [ ] All nine modules and their responsibilities are defined.
- [ ] All seven channel categories are included.
- [ ] Inbound website inquiries are distinguished from outbound messaging channels.

### B. Architecture and boundaries
- [ ] Frontend, application services, AI service, channel adapters and persistence have clear responsibilities.
- [ ] The architecture supports future integration replacement without coupling the UI to individual providers.
- [ ] A modular application is the agreed starting approach.

### C. Data model
- [ ] All ten core entities and their responsibilities are documented.
- [ ] Lead, campaign, recipient, conversation, message and handoff relationships are defined.
- [ ] Duplicate handling, stable identifiers, delivery modes and activity history requirements are documented.

### D. AI behaviour
- [ ] The AI provider is configurable and called server-side.
- [ ] AI context is minimized to relevant fields, recent conversation and approved knowledge.
- [ ] Structured outputs and validation are required.
- [ ] AI failure blocks AI-dependent actions without fabricated fallback responses.

### E. Simulation boundary
- [ ] All seven channel categories are represented in the demo architecture.
- [ ] Simulated delivery is distinct from actual delivery in stored data and UI.
- [ ] Demo operations cannot send real outbound messages.
- [ ] Bitrix24 handoff status cannot imply a successful sync without evidence.

### F. Security and authentication
- [ ] Supabase Auth and the controlled demo account are the agreed approach.
- [ ] Workspace access boundaries and future role support are documented.
- [ ] Server-side secret handling and data-minimization requirements are defined.
- [ ] Demo data is isolated from future production data.

### G. UI/UX standards
- [ ] SENVO visual direction and persistent navigation are documented.
- [ ] Common interaction and status patterns are defined.
- [ ] Search, filters, detail panels, error states and responsive behaviour are included in the requirements.

### H. Deployment and handoff
- [ ] Managed frontend hosting and Supabase deployment are the agreed approach.
- [ ] Required credentials and configuration dependencies are listed.
- [ ] Demo seeding, reset and failure-handling requirements are documented.
- [ ] Implementation and runtime verification are explicitly reserved for later phases.

---

## 13. Phase control

**Phase 1:** Architecture and foundation documentation.  
**Phase 1 exit:** The written foundation, boundaries, dependencies and acceptance criteria have been reviewed and approved.  
**Next phase:** To be separately authorized by the user.  

No implementation prompt, code changes, deployment or Phase 2 work is authorized by this document.

**Final status:** Architecture approved; documentation and acceptance criteria prepared for final review.
