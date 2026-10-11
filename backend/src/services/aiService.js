/**
 * JIVEXA Production AI Integration Service
 * Powered by Google Gemini AI (gemini-2.5-flash)
 * Real-Time Token-by-Token Streaming Engine & Clinical Lab Report Analyzer
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const https = require('https');

const SYSTEM_PROMPT = `You are the JIVEXA AI Medical & Health Assistant, a clinical-literacy AI helping users understand health questions, symptoms, and lab reports. You are a health-information assistant, NOT a doctor. You do not diagnose, prescribe medications, or imply physician review has occurred.

CRITICAL INSTRUCTIONS:
1. Write in warm, clear, plain human language (like a knowledgeable nurse-educator).
2. Explain medical terms simply and use clean bullet points.
3. For medical reports or lab values, extract the test name, reported value, and reference range, and flag abnormal parameters for doctor discussion.
4. Keep answers concise, clear, and direct (under 60 words in 2-3 short bullet points).
5. If symptoms suggest a medical emergency (chest pain, severe bleeding, difficulty breathing, stroke symptoms, poisoning, seizures), immediately instruct them to call 108 / 112 or visit the nearest ER.
6. Closing reminder for clinical questions: Always recommend consulting a qualified healthcare professional.`;

// Metrics tracker for monitoring
const aiMetrics = {
  totalRequests: 0,
  geminiSuccesses: 0,
  emergencyDetections: 0,
  errors: 0
};

// Emergency symptom keywords detector
const EMERGENCY_KEYWORDS = [
  'chest pain', 'difficulty breathing', 'shortness of breath', 'severe bleeding',
  'suicidal', 'suicide', 'unconscious', 'stroke', 'heart attack', 'poisoning',
  'choking', 'seizure', 'severe burn', 'head injury', 'sudden weakness', 'paralysis'
];

const detectEmergency = (message) => {
  const text = (message || '').toLowerCase();
  return EMERGENCY_KEYWORDS.some(kw => text.includes(kw));
};

const estimateTokens = (text) => {
  if (!text) return 0;
  return Math.ceil(text.length / 4) + 10;
};

/**
 * Initialize Google Gemini Client with fallback model support
 */
const getGeminiModel = (generationConfig = {}) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in backend environment');
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const genAI = new GoogleGenerativeAI(apiKey);

  return genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 800,
      ...generationConfig
    }
  });
};

/**
 * Format and sanitize conversation history for Google Gemini.
 * Gemini strictly requires:
 * 1. Non-empty text in all parts (cannot be empty string or whitespace).
 * 2. Alternating turns: user -> model -> user -> model -> user.
 * 3. The first turn in contents MUST be role 'user'.
 * 4. The last turn before generation MUST be the current user message (role 'user').
 * 5. Absolutely no empty content or empty parts.
 */
const buildGeminiContents = (userMessage, history = []) => {
  const sanitizedUserMessage = String(userMessage || '').trim();
  if (!sanitizedUserMessage) {
    throw new Error('User message cannot be empty');
  }

  const rawTurns = [];

  if (Array.isArray(history)) {
    for (const h of history) {
      if (!h) continue;

      // Determine role
      let role = null;
      const s = String(h.sender || h.role || '').toLowerCase().trim();
      if (s === 'user') {
        role = 'user';
      } else if (s === 'ai' || s === 'model' || s === 'assistant') {
        role = 'model';
      }

      if (!role) continue;

      // Extract and clean text
      let text = '';
      if (typeof h.text === 'string') {
        text = h.text.trim();
      } else if (typeof h.content === 'string') {
        text = h.content.trim();
      } else if (Array.isArray(h.parts)) {
        text = h.parts.map(p => (typeof p === 'string' ? p : p?.text || '')).join(' ').trim();
      }

      // CRITICAL: Discard any turn with empty text to prevent:
      // "Content with role 'model' cannot follow empty content."
      if (!text) continue;

      rawTurns.push({ role, text });
    }
  }

  // Deduplicate if the last history entry is already identical to the incoming userMessage
  if (rawTurns.length > 0) {
    const last = rawTurns[rawTurns.length - 1];
    if (last.role === 'user' && last.text === sanitizedUserMessage) {
      rawTurns.pop();
    }
  }

  // Keep only the most recent conversation context (up to last 10 turns)
  const recentTurns = rawTurns.slice(-10);

  // Merge consecutive turns of the same role to strictly guarantee alternation
  const alternatingTurns = [];
  for (const turn of recentTurns) {
    if (alternatingTurns.length === 0) {
      // Gemini Rule: Conversation history MUST start with role 'user'
      if (turn.role === 'user') {
        alternatingTurns.push({ role: 'user', text: turn.text });
      }
      // If the first turn is 'model', discard it because it has no preceding user prompt
    } else {
      const prev = alternatingTurns[alternatingTurns.length - 1];
      if (prev.role === turn.role) {
        // Merge consecutive same-role messages
        prev.text += `\n\n${turn.text}`;
      } else {
        alternatingTurns.push({ role: turn.role, text: turn.text });
      }
    }
  }

  // Now append the current userMessage as the final turn
  if (alternatingTurns.length === 0) {
    alternatingTurns.push({ role: 'user', text: sanitizedUserMessage });
  } else {
    const last = alternatingTurns[alternatingTurns.length - 1];
    if (last.role === 'user') {
      // If last turn was user, merge so the final turn is a valid single user turn
      last.text += `\n\n${sanitizedUserMessage}`;
    } else {
      alternatingTurns.push({ role: 'user', text: sanitizedUserMessage });
    }
  }

  // Convert to Gemini API contents format: { role: 'user' | 'model', parts: [{ text }] }
  return alternatingTurns.map(turn => ({
    role: turn.role,
    parts: [{ text: turn.text }]
  }));
};

/**
 * 1. Stream Live Gemini Chat Response (SSE Streaming)
 */
const streamGemini = async (userMessage, history = [], onChunk) => {
  const model = getGeminiModel();
  const contents = buildGeminiContents(userMessage, history);

  const responseStream = await model.generateContentStream({ contents });

  let fullText = '';
  for await (const chunk of responseStream.stream) {
    const chunkText = chunk.text();
    if (chunkText) {
      fullText += chunkText;
      onChunk(chunkText);
    }
  }

  aiMetrics.geminiSuccesses++;
  return {
    provider: 'JIVEXA AI (Google Gemini)',
    text: fullText || 'No response generated.',
    inputTokens: estimateTokens(JSON.stringify(contents)),
    outputTokens: estimateTokens(fullText)
  };
};

/**
 * 2. Real-Time Deep Clinical Document Analyzer with Google Gemini JSON Mode
 */
const analyzeReportWithAI = async (documentText, fileName) => {
  const prompt = `You are JIVEXA Clinical Document Analyzer.
Analyze the following document text extracted from a file named "${fileName}":

--- DOCUMENT TEXT START ---
${(documentText || '').slice(0, 8000)}
--- DOCUMENT TEXT END ---

TASK 1: AUTHENTICITY & SPAM DETECTION
Determine if this document is an authentic clinical medical report (such as blood test, CBC, lipid panel, thyroid profile, HbA1c, liver function test, kidney panel, urine analysis, pathology scan, prescription, or clinical summary).
If it is NOT a valid medical report (e.g. invoice, receipt, meme, non-medical document, random text), set isValidReport: false and provide a helpful invalidReason.

TASK 2: CLINICAL PARAMETER EXTRACTION
If valid, extract ALL clinical test parameters present in the text into structured JSON format.
- Distinguish normal/abnormal strictly based on the reference ranges provided in the text.
- Do NOT fabricate missing report information or ranges.
- Provide plain language, accessible explanations for all findings.

Return ONLY valid JSON matching this EXACT structure:
{
  "isValidReport": true,
  "invalidReason": "",
  "reportTitle": "Complete Blood Count & Lipid Profile",
  "patientName": "Patient",
  "healthScore": 75,
  "scoreStatus": "Requires Attention",
  "summary": "Detailed 1-2 sentence plain language summary of overall report findings.",
  "normalFindings": [
    {
      "name": "Hemoglobin",
      "value": "14.5 g/dL",
      "referenceRange": "13.5 - 17.5 g/dL",
      "status": "Normal",
      "simpleExplanation": "Hemoglobin is in the healthy normal range."
    }
  ],
  "abnormalFindings": [
    {
      "name": "Total Cholesterol",
      "value": "220 mg/dL",
      "referenceRange": "< 200 mg/dL",
      "status": "Abnormal",
      "simpleExplanation": "Slightly elevated cholesterol. Discuss dietary improvements with your doctor."
    }
  ],
  "attentionParameters": [],
  "possibleFactors": ["Dietary habits, genetic factors, or physical activity levels."],
  "questionsForDoctor": [
    "What specific lifestyle changes do you recommend based on these results?",
    "Should we re-test in 3 to 6 months?"
  ],
  "lifestyleRecommendations": [
    "Increase intake of high-fiber foods and omega-3 fatty acids.",
    "Maintain 30 minutes of moderate cardiovascular exercise daily."
  ],
  "disclaimer": "AI-generated clinical literacy summary for educational purposes only. Always consult a licensed healthcare practitioner for medical diagnosis and treatment decisions."
}`;

  try {
    const model = getGeminiModel({
      responseMimeType: 'application/json',
      temperature: 0.1,
      maxOutputTokens: 4096
    });

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    
    // Robust JSON parsing with fallback
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (e) {
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw e;
      }
    }

    aiMetrics.geminiSuccesses++;
    return {
      isValidReport: parsed.isValidReport !== false,
      invalidReason: parsed.invalidReason || '',
      reportTitle: parsed.reportTitle || fileName || 'Medical Lab Report',
      patientName: parsed.patientName || 'Patient',
      healthScore: typeof parsed.healthScore === 'number' ? parsed.healthScore : 80,
      scoreStatus: parsed.scoreStatus || 'Requires Attention',
      summary: parsed.summary || 'Clinical parameters extracted successfully.',
      normalFindings: Array.isArray(parsed.normalFindings) ? parsed.normalFindings : [],
      abnormalFindings: Array.isArray(parsed.abnormalFindings) ? parsed.abnormalFindings : [],
      attentionParameters: Array.isArray(parsed.attentionParameters) ? parsed.attentionParameters : [],
      possibleFactors: Array.isArray(parsed.possibleFactors) ? parsed.possibleFactors : ['Evaluated by JIVEXA Clinical Engine.'],
      questionsForDoctor: Array.isArray(parsed.questionsForDoctor) ? parsed.questionsForDoctor : ['Discuss these findings with your physician.'],
      lifestyleRecommendations: Array.isArray(parsed.lifestyleRecommendations) ? parsed.lifestyleRecommendations : ['Maintain a balanced diet and regular physical activity.'],
      disclaimer: parsed.disclaimer || 'Educational summary only. Consult a doctor for medical advice.',
      analyzedAt: new Date().toLocaleDateString()
    };
  } catch (err) {
    console.error('[Gemini Report Analyzer Error]:', err.message);
    throw new Error(`Google Gemini report analysis failed: ${err.message}`);
  }
};

/**
 * 3. Stream Live AI Response (Primary: Google Gemini)
 */
const streamLiveAiResponse = async (userMessage, history = [], onChunk) => {
  aiMetrics.totalRequests++;

  // 1. Emergency Safety Check Guardrail
  if (detectEmergency(userMessage)) {
    aiMetrics.emergencyDetections++;
    const emergencyText = `🚨 EMERGENCY WARNING: The symptoms you described require immediate emergency care.
• Call 108 / 112 for an ambulance right away.
• Go to the nearest Hospital Emergency Room (ER).
Do not rely on text advice for emergency symptoms.`;

    onChunk(emergencyText);
    return {
      provider: 'JIVEXA Safety Guardrail',
      isEmergency: true,
      text: emergencyText,
      inputTokens: estimateTokens(userMessage),
      outputTokens: 40
    };
  }

  // 2. Primary Engine: Google Gemini (gemini-2.5-flash)
  try {
    return await streamGemini(userMessage, history, onChunk);
  } catch (geminiErr) {
    console.warn('[JIVEXA AI] Google Gemini primary error:', geminiErr.message);
  }

  // 3. Final Error Notice
  aiMetrics.errors++;
  const errorMsg = 'JIVEXA Assistant is temporarily unavailable. Please verify your GEMINI_API_KEY configuration and try again.';
  onChunk(errorMsg);
  return {
    provider: 'JIVEXA Error Notice',
    text: errorMsg,
    inputTokens: estimateTokens(userMessage),
    outputTokens: 15
  };
};

module.exports = {
  streamLiveAiResponse,
  streamGemini,
  buildGeminiContents,
  analyzeReportWithAI,
  detectEmergency,
  aiMetrics,
  SYSTEM_PROMPT
};
