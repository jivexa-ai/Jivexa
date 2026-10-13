/**
 * JIVEXA Production AI Integration Service
 * Powered by Google Gemini AI (gemini-2.5-flash)
 * Real-Time Token-by-Token Streaming Engine & Clinical Lab Report Analyzer
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const https = require('https');

const SYSTEM_PROMPT = `You are JIVEXA Health AI, an intelligent, empathetic, and professional healthcare information assistant.

OPERATIONAL GUIDELINES BY QUERY TYPE:

1. GREETINGS & CASUAL CONVERSATION:
- When the user sends greetings ("Hi", "Hello", "Namaste", "Good morning") or casual conversational messages:
  * Respond naturally, warmly, and politely in the user's language (Hindi, Hinglish, or English).
  * DO NOT provide medical advice, symptoms triage, clinical bullet points, or medical disclaimers on simple greetings.

2. IDENTITY & ROLE ("Tum kaun ho?", "Who are you?", "What can you do?"):
- When the user asks about your identity or capabilities:
  * Explain clearly and simply that you are JIVEXA Health AI, an intelligent healthcare information assistant.
  * State that you help patients understand symptoms, lab test reports, prescription details, and wellness guidance.
  * Clarify that you provide educational guidance and are not a substitute for a licensed doctor.
  * DO NOT prescribe medications or claim to provide official medical diagnoses.

3. USER NAME & MEMORY ("mera naam kya hai", "what is my name?"):
- When the user asks for their name:
  * If the verified user profile provides their name or the user stated their name in earlier messages, address or confirm it warmly (e.g., "Aapka naam [Name] hai" / "Your name is [Name]").
  * If the name was NEVER provided in the verified profile or conversation history, honestly and politely state that you do not know their name yet (e.g., "Aapne abhi tak apna naam nahi bataya hai. Aapka naam kya hai?").
  * NEVER invent, guess, or fabricate a name.
  * DO NOT attach medical advice, clinical checklists, or care pathways to name questions.

4. MISSING CONTEXT & AMBIGUOUS QUERIES ("Explain key reference ranges for this condition.", "Is this normal?", "What medicine should I take?"):
- When the user asks for reference ranges, treatment, or interpretation of "this condition" or "this report" but no condition, lab test, or report has been mentioned in the conversation:
  * DO NOT guess a random disease or generate generic care templates.
  * Directly and politely ask the user which specific condition, symptom, or lab test they would like information about.

5. HEALTH & MEDICAL QUESTIONS ("Fever mein kya karna chahiye?", "What causes headache?", "How to manage diabetes?"):
- Provide accurate, evidence-based educational healthcare guidance in clean, clear language.
- Provide relevant, practical self-care steps, warning signs to monitor, and when to consult a doctor.
- Mention hydration, rest, or doctor visits ONLY when directly relevant to the specific condition (e.g. fever or acute viral illness), NOT as a rigid boilerplate template.
- Keep the response concise, compassionate, and helpful.
- Append a brief, separate 1-line note at the end: "*Note: This is educational healthcare information. Please consult a qualified doctor for medical diagnosis and prescriptions.*"

6. EMERGENCY SERVICES (108 / 112):
- Mention 108 / 112 or ER emergency services ONLY when the user's symptoms clearly indicate a medical emergency (such as severe chest pain, shortness of breath, heavy bleeding, stroke symptoms, loss of consciousness, or poisoning).
- DO NOT mention emergency services for non-emergency or informational queries.

7. NO UNRELATED APPENDED QUESTIONS:
- Do NOT append lists of suggested questions or unrelated prompts to your response.`;

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
 * Initialize Google Gemini Client with fallback model support and user profile context
 */
const getGeminiModel = (generationConfig = {}, userProfile = null) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in backend environment');
  }

  const modelName = generationConfig.model || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const genAI = new GoogleGenerativeAI(apiKey);

  let systemInstruction = SYSTEM_PROMPT;

  if (userProfile && userProfile.name) {
    systemInstruction += `\n\nAUTHENTICATED USER IDENTITY:
- The authenticated user's name is "${userProfile.name}".
- When the user asks for their name or greets you, warmly acknowledge and address them by "${userProfile.name}".`;
  }

  const cleanConfig = { ...generationConfig };
  delete cleanConfig.model;

  return genAI.getGenerativeModel({
    model: modelName,
    systemInstruction,
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 800,
      ...cleanConfig
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

      // Determine role from any frontend or standard convention
      let role = null;
      const s = String(h.sender || h.role || h.author || '').toLowerCase().trim();
      if (s === 'user' || s === 'human' || s === 'patient') {
        role = 'user';
      } else if (s === 'ai' || s === 'model' || s === 'assistant' || s === 'bot') {
        role = 'model';
      }

      if (!role) continue;

      // Extract and clean text across possible schema formats
      let text = '';
      if (typeof h.text === 'string') {
        text = h.text.trim();
      } else if (typeof h.content === 'string') {
        text = h.content.trim();
      } else if (typeof h.message === 'string') {
        text = h.message.trim();
      } else if (Array.isArray(h.parts)) {
        text = h.parts.map(p => (typeof p === 'string' ? p : p?.text || '')).join(' ').trim();
      }

      // Discard empty text turns
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

  // Keep up to 20 recent turns for rich conversational memory
  const recentTurns = rawTurns.slice(-20);

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

  // Append the current userMessage as the final turn
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
const streamGemini = async (userMessage, history = [], onChunk, userProfile = null) => {
  const candidateModels = [
    process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    'gemini-3-flash-preview',
    'gemini-3.1-flash-lite'
  ];
  const uniqueModels = [...new Set(candidateModels)];

  let lastError = null;

  for (const modelName of uniqueModels) {
    try {
      const model = getGeminiModel({ model: modelName }, userProfile);
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

      if (fullText) {
        aiMetrics.geminiSuccesses++;
        return {
          provider: `JIVEXA AI (${modelName})`,
          text: fullText,
          inputTokens: estimateTokens(JSON.stringify(contents)),
          outputTokens: estimateTokens(fullText)
        };
      }
    } catch (err) {
      lastError = err;
      console.warn(`[Gemini Engine] Model ${modelName} error:`, err.message);
    }
  }

  throw lastError || new Error('All Gemini candidate models failed to respond.');
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
const streamLiveAiResponse = async (userMessage, history = [], onChunk, userProfile = null) => {
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
    return await streamGemini(userMessage, history, onChunk, userProfile);
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
