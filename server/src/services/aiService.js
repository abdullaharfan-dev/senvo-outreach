import https from 'https';
import { query } from '../db/database.js';

// Environment variable for Gemini API key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

/**
 * Raw HTTP call to Gemini Generative Language API
 */
const callGeminiRaw = (payload) => {
  return new Promise((resolve, reject) => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '') {
      return reject(new Error('GEMINI_API_KEY is not configured on the server.'));
    }

    const postData = JSON.stringify(payload);
    const req = https.request(
      {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
        timeout: 15000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsed = JSON.parse(data);
              resolve(parsed);
            } catch (err) {
              reject(new Error(`Failed to parse Gemini response JSON: ${err.message}`));
            }
          } else {
            let errorMsg = `Gemini API returned HTTP ${res.statusCode}`;
            try {
              const errObj = JSON.parse(data);
              if (errObj.error?.message) {
                errorMsg += `: ${errObj.error.message}`;
              }
            } catch (_) {}
            reject(new Error(errorMsg));
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Gemini API request timed out after 15 seconds.'));
    });

    req.on('error', (err) => {
      reject(new Error(`Network error calling Gemini API: ${err.message}`));
    });

    req.write(postData);
    req.end();
  });
};

/**
 * Generate AI assessment, intent classification, and suggested reply for an incoming message
 * Context is strictly minimized: only relevant lead fields, recent 5 conversation turns, and approved knowledge.
 */
export const assessIncomingMessage = async ({ lead, recentMessages, incomingMessage }) => {
  // Fetch approved company knowledge from SQLite
  const knowledgeRows = await query('SELECT category, title, content FROM company_knowledge WHERE approved = 1');
  const knowledgeText = knowledgeRows
    .map((k) => `[${k.category.toUpperCase()}] ${k.title}: ${k.content}`)
    .join('\n');

  // Format minimized conversation history
  const historyText = recentMessages
    .slice(-5)
    .map((m) => `${m.direction === 'inbound' ? 'Prospect' : 'SENVO'}: ${m.content}`)
    .join('\n');

  const systemPrompt = `You are the SENVO Outreach AI SDR & Client Response Assistant.
SENVO provides Ireland-focused businesses with comprehensive professional corporate services:
- Statutory Accounting, Bookkeeping & Payroll Management (BrightPay, PAYE Modernisation)
- Audit & Statutory CRO Compliance (Companies Act 2014, Form B1)
- Corporation Tax (Form CT1), VAT3 filing, and cross-border EU VAT advisory
- Corporate Services, Company Secretarial & Section 137 Non-Resident Director Bonds
- Business Advisory, Fractional CFO & Grant Reporting (Enterprise Ireland / IDA)
- IT, Cloud Accounting & ERP Advisory (Xero, Sage, NetSuite)
- Specialist Recruitment for qualified finance and corporate personnel (ACA, ACCA, CIMA)

APPROVED COMPANY KNOWLEDGE & COMPLIANCE RULES:
${knowledgeText}

CRITICAL RULES:
1. Adhere strictly to the approved company knowledge. Do not promise unsupported services or speculate on tax avoidance schemes.
2. Do not invent pricing, revenue figures, case studies, or unverified cost-saving statistics.
3. Keep the tone professional, consultative, and executive-level for Irish managing directors, CFOs, and business owners.
4. Provide a structured, valid JSON object strictly adhering to the schema below.

JSON SCHEMA:
{
  "intent": "string (one of: interested, pricing_inquiry, objection, demo_request, not_interested, out_of_scope)",
  "requested_service": "string (the specific SENVO product or feature requested, e.g. 'Retail POS Billing & Khata')",
  "summary": "string (concise 1-2 sentence executive summary of the lead's inquiry and situation)",
  "confidence": number between 0.0 and 1.0,
  "suggested_reply": "string (professional, polite response addressing their question directly and suggesting a 10-minute demo or next step)",
  "suggested_next_action": "string (actionable next step for sales team or SDR)",
  "human_review_required": boolean (true if high-value enterprise, complex objection, or low confidence; false if straightforward)
}`;

  const userPrompt = `PROSPECT INFORMATION:
- Company Name: ${lead.company_name}
- Industry: ${lead.industry || 'Retail'}
- City: ${lead.city || 'Pakistan'}

RECENT CONVERSATION HISTORY:
${historyText || '(No previous history)'}

NEW INCOMING MESSAGE FROM PROSPECT:
"${incomingMessage}"

Analyze this message, classify the intent, extract requested services, and generate a compliant suggested reply in JSON.`;

  try {
    const geminiResponse = await callGeminiRaw({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const candidate = geminiResponse.candidates?.[0];
    if (!candidate || !candidate.content?.parts?.[0]?.text) {
      throw new Error('Gemini returned an empty candidate or missing text part.');
    }

    const rawJson = candidate.content.parts[0].text;
    const parsed = JSON.parse(rawJson);

    // Validate essential structured fields
    if (!parsed.intent || !parsed.suggested_reply || !parsed.summary) {
      throw new Error('Gemini response missing essential fields (intent, suggested_reply, or summary).');
    }

    return {
      success: true,
      data: {
        intent: parsed.intent,
        requested_service: parsed.requested_service || 'Corporate Accounting & Advisory Services',
        summary: parsed.summary,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.9,
        suggested_reply: parsed.suggested_reply,
        suggested_next_action: parsed.suggested_next_action || 'Follow up with live demo',
        human_review_required: Boolean(parsed.human_review_required),
        raw_response: rawJson,
      },
    };
  } catch (err) {
    console.error('[AI Service Error]:', err.message);
    // Explicitly do not fabricate a fake AI reply! Return honest error state.
    return {
      success: false,
      error: `Gemini AI assessment failed: ${err.message}`,
      canProceedWithoutAi: true,
    };
  }
};

/**
 * Health check for the AI provider
 */
export const checkAiHealth = async () => {
  try {
    const res = await callGeminiRaw({
      contents: [{ role: 'user', parts: [{ text: 'Respond with JSON: {"status": "ok"}' }] }],
      generationConfig: { responseMimeType: 'application/json' },
    });
    return {
      status: 'operational',
      model: GEMINI_MODEL,
      authenticated: true,
    };
  } catch (err) {
    return {
      status: 'unavailable',
      model: GEMINI_MODEL,
      error: err.message,
      authenticated: Boolean(GEMINI_API_KEY),
    };
  }
};

export default { assessIncomingMessage, checkAiHealth };
