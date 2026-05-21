/**
 * ForensicAI — Multi-Model AI Engine
 * 
 * Model Architecture (3 models, each specialized):
 * ┌──────────────────────────────────────────────────────────────┐
 * │ GEMINI 2.5 FLASH (Google)     — 1M token context            │
 * │ → Deep forensic analysis, NLP queries, report generation    │
 * │ → Best for: large-context case analysis with full dataset   │
 * ├──────────────────────────────────────────────────────────────┤
 * │ LLAMA 3.3 70B (Groq)          — 131K token context          │
 * │ → AI Chatbot assistant, conversational Q&A                  │
 * │ → Best for: instant responses (300+ tok/s), chat memory     │
 * ├──────────────────────────────────────────────────────────────┤
 * │ LLAMA 3.1 8B (Groq)           — 131K token context          │
 * │ → Screen guidance, quick tips, UI hints                     │
 * │ → Best for: ultra-fast micro-responses, low latency         │
 * └──────────────────────────────────────────────────────────────┘
 */
import { GoogleGenAI } from "@google/genai";

// ─── API Keys ───
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

// ─── Initialize Gemini ───
let geminiAI = null;
let isGeminiAvailable = false;

try {
  if (GEMINI_API_KEY) {
    geminiAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    isGeminiAvailable = true;
    console.log("✓ Gemini 2.5 Flash initialized (deep analysis & reports)");
  } else {
    console.warn("⚠ Gemini API key missing — deep analysis will use fallback");
  }
} catch (err) {
  console.error("✗ Gemini initialization failed:", err);
}

// ─── Groq REST API helper (no SDK needed — uses OpenAI-compatible endpoint) ───
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
let isGroqAvailable = !!GROQ_API_KEY;

if (isGroqAvailable) {
  console.log("✓ Groq API initialized (Llama 3.3 70B chat + Llama 3.1 8B guidance)");
} else {
  console.warn("⚠ Groq API key missing — chatbot & guidance will use Gemini fallback");
}

async function callGroq(model, messages, maxTokens = 1024) {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    })
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errBody}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "";
}

// ─── Helper: serialize case data for AI context ───
function buildCaseContext(caseData) {
  if (!caseData) return "No case data loaded.";

  const suspects = (caseData.suspects || [])
    .map(s => `  - ${s.name || "Unknown"} (alias: ${s.alias || "N/A"}, phone: ${s.phone || "N/A"}, role: ${s.role || "N/A"})`)
    .join("\n");

  const timeline = (caseData.timeline || [])
    .map(ev => `  [${ev.timestamp || "Unknown"}] (${ev.type || "unknown"}/${ev.severity || "normal"}) ${ev.actor || "Unknown"} → ${ev.recipient || "None"}: ${ev.content || ""} [via ${ev.channel || "Unknown"}]`)
    .join("\n");

  const anomalies = (caseData.anomalies || [])
    .map(a => `  [${a.risk || "Medium"} Risk - ${a.category || "General"}] ${a.description || ""}\n    Evidence: ${a.evidence || "N/A"}\n    Recommendation: ${a.recommendation || "N/A"}`)
    .join("\n");

  const graph = ((caseData.graph && caseData.graph.links) || [])
    .map(l => `  ${l.source} ↔ ${l.target}: ${l.value || 0} interactions (${l.type || "none"})`)
    .join("\n");

  const uploadedFilesStr = ((caseData.metrics && caseData.metrics.uploadedFiles) || []).join(", ") || "None";
  const totalMessages = (caseData.metrics && caseData.metrics.totalMessages) || 0;
  const totalCalls = (caseData.metrics && caseData.metrics.totalCalls) || 0;
  const flaggedContacts = (caseData.metrics && caseData.metrics.flaggedContacts) || 0;
  const dataHealth = (caseData.metrics && caseData.metrics.dataHealth) || "Unknown";

  return `
CASE: ${caseData.name || "Unnamed Case"}
STATUS: ${caseData.status || "Unknown"}
DESCRIPTION: ${caseData.description || "No description"}
INVESTIGATOR: ${caseData.investigator || "Unknown"}
DATE CREATED: ${caseData.dateCreated || "Unknown"}

METRICS:
  Total Messages: ${totalMessages}
  Total Calls: ${totalCalls}
  Flagged Contacts: ${flaggedContacts}
  Data Health: ${dataHealth}
  Uploaded Files: ${uploadedFilesStr}

SUSPECTS:
${suspects || "  None identified."}

TIMELINE OF EVENTS:
${timeline || "  No timeline events recorded."}

ANOMALIES & FLAGS:
${anomalies || "  No anomalies flagged."}

COMMUNICATION GRAPH:
${graph || "  No network links plotted."}
`.trim();
}

// ═══════════════════════════════════════════════════════════════
// 1. FORENSIC NLP QUERY — powered by Gemini 2.5 Flash (1M context)
//    Reason: needs full case dataset in context for deep analysis
// ═══════════════════════════════════════════════════════════════
export async function analyzeForensicQuery(query, caseData) {
  if (!isGeminiAvailable) {
    return buildFallbackQueryResult(query, caseData);
  }

  const caseContext = buildCaseContext(caseData);

  const prompt = `You are ForensicAI, a specialized digital forensics AI investigator assistant. You analyze mobile device extraction data (Cellebrite UFED exports) to help law enforcement investigators.

CURRENT CASE DATA:
${caseContext}

INVESTIGATOR'S QUERY: "${query}"

Analyze the case data thoroughly and return a JSON response (and ONLY valid JSON, no markdown fences) with this exact structure:
{
  "intent": "Brief description of the detected intent (e.g., 'Identify extortion messages', 'Correlate GPS locations')",
  "translation": "A SQL-like structured query translation showing what the system searched for",
  "summary": "A detailed 2-4 sentence analytical summary of the findings, citing specific evidence, names, timestamps, and data points from the case",
  "confidence": <number 0-100 representing confidence>,
  "sources": ["list of data sources used, e.g. WhatsApp, SMS, GPS Logs"],
  "results": [
    {
      "time": "timestamp string",
      "from": "sender name",
      "to": "recipient name",
      "channel": "communication channel",
      "message": "relevant content/evidence"
    }
  ],
  "suggestions": ["2-3 follow-up investigation queries the investigator should consider"]
}

CRITICAL RULES:
- Search through ALL timeline events and anomalies to find relevant matches
- Results must contain ACTUAL data from the case — never fabricate events that don't exist in the timeline
- Different queries must produce different results based on what's relevant
- If the query asks about locations, return location events; if about messages, return chat events; etc.
- The summary must cite specific names, timestamps, and content from the case data
- Return between 1-6 result rows depending on how many matches exist
- Confidence should reflect how well the query matched available evidence`;

  try {
    const response = await geminiAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text.trim();
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Gemini query error:", err);
    return buildFallbackQueryResult(query, caseData);
  }
}

// ═══════════════════════════════════════════════════════════════
// 2. COMPREHENSIVE REPORT — powered by Gemini 2.5 Flash (1M context)
//    Reason: report generation needs maximum context + structured JSON
// ═══════════════════════════════════════════════════════════════
export async function generateDetailedReport(caseData, queryHistory, appendedItems, username, userRole) {
  if (!isGeminiAvailable) {
    return buildFallbackReport(caseData);
  }

  const caseContext = buildCaseContext(caseData);

  const prompt = `You are ForensicAI, an expert digital forensics report generator. Generate a comprehensive, detailed forensic investigation report based on the case data below.

CASE DATA:
${caseContext}

QUERIES EXECUTED DURING INVESTIGATION: ${queryHistory.length > 0 ? queryHistory.join("; ") : "None recorded"}
EVIDENCE BLOCKS APPENDED: ${appendedItems.length > 0 ? appendedItems.join("; ") : "None appended"}
INVESTIGATING OFFICER: ${username} (${userRole})

Generate a complete forensic report in the following structure. Return ONLY valid JSON (no markdown fences):
{
  "executiveSummary": "3-5 sentence overview of the case, key findings, and critical evidence discovered",
  "suspectProfiles": [
    {
      "name": "suspect name",
      "alias": "alias",
      "role": "their role in the case",
      "riskLevel": "High/Medium/Low",
      "assessment": "2-3 sentence assessment of their involvement and evidence against them"
    }
  ],
  "suspiciousCommunications": [
    {
      "timestamp": "when",
      "from": "sender",
      "to": "recipient",
      "channel": "platform",
      "content": "the message",
      "reason": "why this is suspicious"
    }
  ],
  "suspiciousCallLogs": [
    {
      "timestamp": "when",
      "caller": "who called",
      "receiver": "who received",
      "duration": "call duration",
      "reason": "why this call is suspicious (timing, frequency, context)"
    }
  ],
  "suspiciousKeywords": [
    {
      "keyword": "the flagged word/phrase",
      "context": "the message containing it",
      "speaker": "who said it",
      "severity": "High/Medium/Low",
      "interpretation": "what this likely means in context"
    }
  ],
  "suspiciousMedia": [
    {
      "timestamp": "when",
      "actor": "who",
      "description": "what the media/file is",
      "reason": "why it's suspicious"
    }
  ],
  "suspiciousLocations": [
    {
      "timestamp": "when",
      "person": "who was there",
      "coordinates": "GPS coordinates",
      "location": "readable location name",
      "reason": "why this location is suspicious"
    }
  ],
  "anomalySummary": [
    {
      "category": "type of anomaly",
      "risk": "High/Medium/Low",
      "description": "what was detected",
      "evidence": "supporting evidence",
      "recommendation": "what to do about it"
    }
  ],
  "networkAnalysis": "3-5 sentence analysis of the communication network, who contacted whom, frequency patterns, and relationship dynamics",
  "recommendations": [
    "Specific actionable next step 1",
    "Specific actionable next step 2",
    "Specific actionable next step 3",
    "Specific actionable next step 4",
    "Specific actionable next step 5"
  ],
  "conclusion": "2-3 sentence final conclusion on the case status and strength of evidence"
}

CRITICAL RULES:
- Use ONLY real data from the case — never fabricate events, names, or timestamps not in the data
- Be thorough: include every suspicious communication, call, location, and media event from the timeline
- Identify ALL coded language, threatening words, crypto addresses, delete instructions, etc.
- Analyze call timing patterns (late night calls, calls immediately before/after key events)
- Flag co-location events where multiple suspects appear at the same place
- Note any communication gaps or device status changes (airplane mode, SIM changes)
- The report must be detailed enough to serve as evidence in a court proceeding`;

  try {
    const response = await geminiAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text.trim();
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Gemini report generation error:", err);
    return buildFallbackReport(caseData);
  }
}

// ═══════════════════════════════════════════════════════════════
// 3. AI CHATBOT — powered by Llama 3.3 70B via Groq
//    Reason: ultra-fast inference (300+ tok/s), great for conversation
//    Fallback: Gemini 2.5 Flash if Groq unavailable
// ═══════════════════════════════════════════════════════════════
export async function chatWithAI(message, caseData, conversationHistory) {
  const caseContext = buildCaseContext(caseData);

  const systemPrompt = `You are ForensicAI Assistant, a highly knowledgeable digital forensics AI powered by Llama 3.3 70B. You help law enforcement investigators analyze mobile device extraction data. You are embedded in a forensic analysis dashboard.

CURRENT CASE DATA:
${caseContext}

You can:
- Answer questions about any data in the case (suspects, messages, calls, locations, files)
- Explain suspicious patterns you notice
- Suggest investigation strategies
- Interpret coded language or suspicious behavior
- Provide legal/procedural guidance for evidence handling
- Guide the investigator on how to use the dashboard features

Keep responses focused, professional, and under 200 words. Always reference specific case data when relevant. If asked about data not in the case, say so clearly.`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.slice(-10).map(m => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.text
    })),
    { role: "user", content: message }
  ];

  // Try Groq (Llama 3.3 70B) first — ultra fast
  if (isGroqAvailable) {
    try {
      const response = await callGroq("llama-3.3-70b-versatile", messages, 512);
      return response;
    } catch (err) {
      console.warn("Groq chat failed, falling back to Gemini:", err.message);
    }
  }

  // Fallback: Gemini
  if (isGeminiAvailable) {
    try {
      const historyBlock = conversationHistory
        .slice(-10)
        .map(m => `${m.role === "user" ? "INVESTIGATOR" : "AI"}: ${m.text}`)
        .join("\n");

      const prompt = `${systemPrompt}\n\nCONVERSATION HISTORY:\n${historyBlock || "(No previous messages)"}\n\nINVESTIGATOR'S MESSAGE: "${message}"`;

      const response = await geminiAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      return response.text.trim();
    } catch (err) {
      console.error("Gemini chat fallback also failed:", err);
    }
  }

  return "AI is currently unavailable. Please check your API key configuration in the .env file.";
}

// ═══════════════════════════════════════════════════════════════
// 4. SCREEN GUIDANCE — powered by Llama 3.1 8B via Groq
//    Reason: ultra-low latency, tiny model perfect for 1-line tips
//    Fallback: static tips if unavailable
// ═══════════════════════════════════════════════════════════════
export async function getScreenGuidance(screenName, caseData) {
  if (!caseData) return getStaticGuidance(screenName, caseData);

  const screenDescriptions = {
    dashboard: "Dashboard Overview with case metrics and recent activity",
    case_manager: "Case & Data Manager where UFDR files are uploaded and parsed",
    query: "AI Query Interface for natural language forensic questions",
    timeline: "Evidence Timeline showing all chronological events",
    correlation: "Correlation Map showing communication network between suspects",
    suspicion: "Suspicion & Anomalies screen showing flagged risks",
    report: "Report Builder for the final forensic report"
  };

  const prompt = `You are ForensicAI. The investigator is viewing: ${screenDescriptions[screenName] || screenName}. Case: ${caseData.name}. Provide a single concise tip (under 25 words) relevant to this screen and case. No quotes, just the tip.`;

  // Try Groq (Llama 3.1 8B) first — fastest possible
  if (isGroqAvailable) {
    try {
      const response = await callGroq("llama-3.1-8b-instant", [
        { role: "system", content: "You are a forensic AI assistant. Give ultra-concise tips." },
        { role: "user", content: prompt }
      ], 80);
      return response;
    } catch (err) {
      console.warn("Groq guidance failed:", err.message);
    }
  }

  // Fallback: Gemini
  if (isGeminiAvailable) {
    try {
      const response = await geminiAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      return response.text.trim();
    } catch (err) {
      // silent fallback
    }
  }

  return getStaticGuidance(screenName, caseData);
}

// ═══════════════════════════════════════════════════════════════
// FALLBACK HELPERS — used when all AI models are unavailable
// ═══════════════════════════════════════════════════════════════
function getStaticGuidance(screenName, caseData) {
  const tips = {
    dashboard: `Reviewing ${caseData?.name || "case"}. Check flagged contacts and anomaly counts for priority areas.`,
    case_manager: "Upload UFDR extraction files or select a mock scenario to begin forensic analysis.",
    query: "Ask natural language questions about the case data. Try searching for suspicious messages, locations, or keywords.",
    timeline: "Scan the chronological timeline for suspicious events. Use filters to isolate specific communication types.",
    correlation: "Click on nodes to explore communication patterns between suspects and associates.",
    suspicion: "Review flagged anomalies by risk level. Click 'Verify in Timeline' to see related events.",
    report: "Generate a comprehensive AI report or manually build your forensic analysis document."
  };
  return tips[screenName] || "Navigate the dashboard to investigate the active case.";
}

function buildFallbackQueryResult(query, caseData) {
  const queryLower = query.toLowerCase();
  const matched = caseData.timeline.filter(ev => {
    const text = `${ev.content} ${ev.actor} ${ev.recipient} ${ev.channel} ${ev.type}`.toLowerCase();
    return queryLower.split(/\s+/).some(word => word.length > 2 && text.includes(word));
  });

  const results = matched.slice(0, 5).map(ev => ({
    time: new Date(ev.timestamp).toLocaleString(),
    from: ev.actor,
    to: ev.recipient || "N/A",
    channel: ev.channel,
    message: ev.content
  }));

  return {
    intent: "Keyword search (AI offline — local fallback)",
    translation: `SELECT * FROM events WHERE content MATCH '${query}'`,
    summary: results.length > 0
      ? `Local search found ${results.length} matching event(s) for "${query}" in the case timeline. Review the results below.`
      : `No timeline events matched the query "${query}". Try different keywords or check the anomalies panel.`,
    confidence: results.length > 0 ? 60 : 20,
    sources: [...new Set(matched.map(m => m.channel))],
    results,
    suggestions: ["Try a more specific query", "Check the Suspicion & Anomalies panel"]
  };
}

function buildFallbackReport(caseData) {
  return {
    executiveSummary: `Forensic analysis of ${caseData.name}. ${caseData.description}`,
    suspectProfiles: caseData.suspects.map(s => ({
      name: s.name, alias: s.alias, role: s.role,
      riskLevel: s.role.toLowerCase().includes("suspect") || s.role.toLowerCase().includes("lead") ? "High" : "Medium",
      assessment: `${s.name} (${s.alias}) is identified as ${s.role}.`
    })),
    suspiciousCommunications: caseData.timeline.filter(e => e.severity === "Suspicious" && e.type === "chat").map(e => ({
      timestamp: e.timestamp, from: e.actor, to: e.recipient, channel: e.channel, content: e.content,
      reason: "Flagged as suspicious by extraction analysis."
    })),
    suspiciousCallLogs: caseData.timeline.filter(e => e.type === "call").map(e => ({
      timestamp: e.timestamp, caller: e.actor, receiver: e.recipient, duration: e.content,
      reason: "Call occurred during the investigation window."
    })),
    suspiciousKeywords: [],
    suspiciousMedia: caseData.timeline.filter(e => e.type === "media").map(e => ({
      timestamp: e.timestamp, actor: e.actor, description: e.content,
      reason: "Media/file activity flagged during extraction."
    })),
    suspiciousLocations: caseData.timeline.filter(e => e.type === "location").map(e => ({
      timestamp: e.timestamp, person: e.actor, coordinates: "", location: e.content,
      reason: "Location ping recorded during investigation period."
    })),
    anomalySummary: caseData.anomalies.map(a => ({
      category: a.category, risk: a.risk, description: a.description,
      evidence: a.evidence, recommendation: a.recommendation
    })),
    networkAnalysis: `The communication network involves ${caseData.graph.nodes.length} entities with ${caseData.graph.links.filter(l => l.value > 0).length} active connections.`,
    recommendations: ["Continue monitoring suspect communications.", "Request additional subpoenas for flagged accounts.", "Cross-reference location data with surveillance footage."],
    conclusion: `The case ${caseData.name} contains ${caseData.anomalies.length} flagged anomalies requiring further investigation.`
  };
}

// ═══════════════════════════════════════════════════════════════
// 5. EXTERNAL FILE PARSER & PRESET BUILDER — powered by Gemini 2.5 Flash
//    Reason: needs large context window and schema formatting
// ═══════════════════════════════════════════════════════════════
const GENERALIZED_PRESETS = [
  {
    query: "Identify high-risk keywords (delete, wipe, btc, account, secure)",
    intent: "Detect suspicious messages and actions",
    translation: "SELECT * FROM chat_logs WHERE message LIKE '%delete%' OR message LIKE '%wipe%' OR message LIKE '%btc%' OR message LIKE '%account%'",
    summary: "Scanning timeline for suspicious keywords. Findings listed below.",
    sources: ["Extraction Messages"],
    confidence: 85,
    results: [],
    suggestions: ["Examine timing of delete commands", "Check location logs for coordination"]
  },
  {
    query: "Analyze location co-occurrences and proximity timestamps",
    intent: "Trace GPS and tower location pings",
    translation: "SELECT timestamp, actor, content FROM location_logs WHERE severity = 'Suspicious'",
    summary: "Extracted suspicious location markers matching co-occurrence or liaison coordinates.",
    sources: ["GPS Logs"],
    confidence: 90,
    results: [],
    suggestions: ["Cross-reference with co-located devices", "Analyze timing spikes"]
  },
  {
    query: "Detect anti-forensic activities (airplane mode, Sim changed)",
    intent: "Flag device status changes",
    translation: "SELECT * FROM system_logs WHERE content LIKE '%sim%' OR content LIKE '%airplane%' OR content LIKE '%dark%'",
    summary: "Checking timeline for device status logs, including Airplane mode triggers and SIM card switches.",
    sources: ["Device System Logs"],
    confidence: 95,
    results: [],
    suggestions: ["Verify alternative burner phone IDs", "Examine cellular tower register logs"]
  }
];

export function getCasePresets(caseObj) {
  if (!caseObj) return GENERALIZED_PRESETS;
  if (!caseObj.presets || caseObj.presets.length === 0) {
    const timeline = Array.isArray(caseObj.timeline) ? caseObj.timeline : [];
    return GENERALIZED_PRESETS.map(preset => {
      const queryLower = preset.query.toLowerCase();
      let matchedEvents = [];
      if (queryLower.includes("keyword")) {
        matchedEvents = timeline.filter(e => 
          e.severity === "Suspicious" || 
          /delete|wipe|btc|account|wallet|chase|verify|payment/i.test(e.content || "")
        );
      } else if (queryLower.includes("location")) {
        matchedEvents = timeline.filter(e => e.type === "location");
      } else if (queryLower.includes("anti-forensic") || queryLower.includes("airplane") || queryLower.includes("sim")) {
        matchedEvents = timeline.filter(e => 
          e.type === "media" || 
          e.type === "system" ||
          /sim|airplane|offline|power|wiped/i.test(e.content || "")
        );
      }
      
      if (matchedEvents.length === 0) {
        matchedEvents = timeline.slice(0, 2);
      }

      return {
        ...preset,
        results: matchedEvents.slice(0, 3).map(e => ({
          time: e.timestamp ? new Date(e.timestamp).toLocaleString() : "Unknown Time",
          from: e.actor || "Unknown",
          to: e.recipient || "None",
          channel: e.channel || "Unknown",
          message: e.content || ""
        }))
      };
    });
  }
  return caseObj.presets;
}

export function buildFallbackCustomCase(fileName, fileText) {
  const lines = fileText.split(/\r?\n/).filter(line => line.trim().length > 0);
  const timeline = [];
  const suspectsSet = new Set();
  
  lines.forEach((line, index) => {
    let actor = "User_" + (index % 2 + 1);
    let content = line;
    let type = "chat";
    let channel = "Text Import";
    
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0 && colonIndex < 30) {
      const part1 = line.substring(0, colonIndex).trim();
      const part2 = line.substring(colonIndex + 1).trim();
      const cleanPart1 = part1.replace(/^\[[^\]]+\]/, "").trim();
      if (cleanPart1.length > 0 && cleanPart1.length < 20) {
        actor = cleanPart1;
        content = part2;
      }
    }
    
    suspectsSet.add(actor);
    
    // Categorize event types based on content
    if (/gps|ping|location|coordinates|latitude|longitude/i.test(content)) {
      type = "location";
      channel = "GPS";
    } else if (/call|duration|dialed|missed/i.test(content)) {
      type = "call";
      channel = "Cellular";
    } else if (/download|uploaded|file|jpeg|png|pdf|tar/i.test(content)) {
      type = "media";
      channel = "WhatsApp";
    }
    
    timeline.push({
      id: `ev_custom_${index}`,
      timestamp: new Date(Date.now() - (lines.length - index) * 60000).toISOString(),
      type,
      actor,
      recipient: index % 2 === 0 ? "Associate" : "None",
      content,
      channel,
      severity: /danger|secret|kill|delete|pay|btc|wipe|burner|offshore|ledger/i.test(content) ? "Suspicious" : "Normal"
    });
  });

  const suspects = Array.from(suspectsSet).map((name, i) => ({
    id: `suspect_${i}`,
    name,
    phone: `+1 (555) 019-000${i}`,
    alias: name.toLowerCase().replace(/\s+/g, "_"),
    role: i === 0 ? "Primary Suspect" : "Associate",
    avatar: "👤"
  }));

  const anomalies = timeline.filter(ev => ev.severity === "Suspicious").map((ev, i) => ({
    id: `anom_custom_${i}`,
    risk: "Medium",
    category: "Keyword Match",
    description: `Suspicious activity flagged in message content: "${ev.content.substring(0, 50)}..."`,
    evidence: `${ev.actor}: "${ev.content}"`,
    recommendation: "Review communications around this timestamp.",
    linkedEventId: ev.id
  }));

  if (anomalies.length === 0 && timeline.length > 0) {
    anomalies.push({
      id: "anom_custom_0",
      risk: "Low",
      category: "Data Imported",
      description: "Custom data imported successfully. No automated keyword triggers fired.",
      evidence: `Imported ${lines.length} lines of text.`,
      recommendation: "Perform custom NLP queries to search for specific themes.",
      linkedEventId: "ev_custom_0"
    });
  }

  const nodes = suspects.map(s => ({ id: s.name, type: s.role.toLowerCase() === "primary suspect" ? "suspect" : "associate", count: timeline.filter(e => e.actor === s.name).length }));
  const links = [];
  if (suspects.length > 1) {
    links.push({ source: suspects[0].name, target: suspects[1].name, value: 5, type: "direct" });
  }

  const generatedCase = {
    id: `custom_case_${Date.now()}`,
    name: `Custom Extraction: ${fileName.split(".")[0].replace(/[_-]/g, " ")}`,
    description: `Analyzed timeline extraction imported from raw file '${fileName}' containing ${lines.length} items.`,
    status: "Active - Parsing Completed",
    investigator: "System Parser",
    dateCreated: new Date().toISOString(),
    metrics: {
      totalMessages: timeline.filter(e => e.type === "chat").length,
      totalCalls: timeline.filter(e => e.type === "call").length,
      flaggedContacts: suspects.length,
      dataHealth: "Good (90%)",
      uploadedFiles: [fileName],
      filesCount: lines.length
    },
    suspects,
    anomalies,
    timeline,
    graph: { nodes, links }
  };

  generatedCase.presets = getCasePresets(generatedCase);
  return generatedCase;
}

export async function parseAndStructureCaseWithAI(fileName, fileText) {
  if (!isGeminiAvailable) {
    return buildFallbackCustomCase(fileName, fileText);
  }

  const prompt = `You are ForensicAI, an advanced digital forensics data parser and analyst. 
You are given a raw forensic data file (it could be chat transcripts, CSV server logs, GPS dumps, system reports, or partial extraction logs).
Your task is to parse this data, identify the suspects involved, construct a clean chronological timeline of events, detect and flag any security risks/anomalies, build a communication graph, and define 3 custom presets relevant to searching this specific data.

FILE NAME: ${fileName}
FILE CONTENT:
${fileText.slice(0, 120000)}

Please analyze the file contents carefully and output a single, valid, structured JSON object representing this case.
The JSON must follow this exact structure (do NOT include markdown fences, return ONLY valid raw JSON):
{
  "id": "generated_unique_id",
  "name": "Case Title (e.g., 'Case CaseName: Investigative Focus')",
  "description": "A detailed 2-3 sentence overview of what is contained in this dataset and the apparent activity being investigated.",
  "status": "Active - Flagged",
  "investigator": "System AI Parser",
  "dateCreated": "2026-05-21T00:00:00Z",
  "metrics": {
    "totalMessages": <number of chat messages parsed>,
    "totalCalls": <number of voice/video calls parsed>,
    "flaggedContacts": <number of suspicious contacts/actors identified>,
    "dataHealth": "Good (95%)",
    "uploadedFiles": ["${fileName}"],
    "filesCount": <number of lines or files/records parsed>
  },
  "suspects": [
    {
      "id": "unique_suspect_id",
      "name": "Full Name of person",
      "phone": "Phone Number if found, or N/A",
      "alias": "Alias/Handle if found, or N/A",
      "role": "Role in this case (e.g., Suspect, Associate, Victim)",
      "avatar": "Emoji avatar, e.g. 👤, 👩‍💻, 👨‍💼"
    }
  ],
  "anomalies": [
    {
      "id": "anom_1",
      "risk": "High/Medium/Low",
      "category": "Reason for anomaly (e.g. Coded Language, Location Match, Anti-Forensic, File Sharing)",
      "description": "What was detected, who was involved.",
      "evidence": "Exact quotes or data from the file proving this anomaly.",
      "recommendation": "Suggested investigative follow-up action.",
      "linkedEventId": "id of the timeline event where this occurs"
    }
  ],
  "timeline": [
    {
      "id": "ev_1",
      "timestamp": "ISO-8601 formatted timestamp if found, or sequential timestamps starting at 2026-05-15T09:00:00Z",
      "type": "chat/call/location/media",
      "actor": "Name of the person performing the action (must match names in suspects list)",
      "recipient": "Recipient name (or 'None' if location/media)",
      "content": "Message text or details of the event",
      "channel": "Platform/Channel (e.g., Signal, WhatsApp, GPS, Git Logs, SMS)",
      "severity": "Suspicious/Normal"
    }
  ],
  "graph": {
    "nodes": [
      { "id": "Suspect Name", "type": "suspect/associate/flagged/victim", "count": <number of events they are actor in> }
    ],
    "links": [
      { "source": "Name A", "target": "Name B", "value": <number of direct messages/calls between them>, "type": "relationship type" }
    ]
  },
  "presets": [
    {
      "query": "Suspect-specific query, e.g., 'Trace payments and transfers.'",
      "intent": "Search intent, e.g., 'Identify financial transfer transactions'",
      "translation": "SELECT * FROM transactions WHERE content LIKE '%money%' OR content LIKE '%transfer%'",
      "summary": "1-2 sentence preview of what the data shows",
      "sources": ["e.g. SMS", "WhatsApp"],
      "confidence": 95,
      "results": [
        { "time": "2026-05-15 12:00", "from": "Name", "to": "Name", "channel": "WhatsApp", "message": "The relevant message" }
      ],
      "suggestions": ["Investigative suggestion 1", "Investigative suggestion 2"]
    }
  ]
}

CRITICAL RULES:
1. Identify all unique names/actors from the file and put them in the suspects list.
2. Build the timeline chronologically from the data in the file. Extract as many events as possible (up to 30 keys).
3. If there are no timestamps, assign sequential timestamps so that they order nicely.
4. Flag 2-3 genuine anomalies/risks present in the data (like suspicious keywords, co-locations, deletion coordinates, threatening messages).
5. Build the graph nodes and links to match the communication patterns in the file text.
6. Create 3 relevant presets that fit the actual file content.
7. Ensure the output is valid JSON.`;

  try {
    const response = await geminiAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text.trim();
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned);
    
    if (!parsed.presets || parsed.presets.length === 0) {
      parsed.presets = getCasePresets(parsed);
    }
    
    return parsed;
  } catch (err) {
    console.error("AI parseAndStructureCaseWithAI failed, running fallback:", err);
    return buildFallbackCustomCase(fileName, fileText);
  }
}

// ─── Export availability flags ───
export const isAIAvailable = isGeminiAvailable || isGroqAvailable;
export const aiModelsStatus = {
  gemini: { available: isGeminiAvailable, model: "Gemini 2.5 Flash", role: "Deep Analysis & Reports", tokenLimit: "1M" },
  groqChat: { available: isGroqAvailable, model: "Llama 3.3 70B", role: "AI Chatbot (via Groq)", tokenLimit: "131K" },
  groqGuide: { available: isGroqAvailable, model: "Llama 3.1 8B", role: "Screen Guidance (via Groq)", tokenLimit: "131K" }
};
