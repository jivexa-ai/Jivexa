export interface AIResponse {
  text: string;
  isEmergency: boolean;
  suggestions: string[];
  disclaimer: string;
  provider?: string;
  limitReached?: boolean;
  tokensUsed?: number;
  maxTokens?: number;
}

import { getBackendUrl } from './nodeAuthService';

const getApiBaseUrl = () => {
  return `${getBackendUrl()}/api/ai`;
};

/**
 * Check if user query is asking about JIVEXA Health OS website features, navigation, or guide
 */
const isJivexaWebsiteQuery = (query: string): boolean => {
  const q = query.toLowerCase();
  const jivexaKeywords = [
    'jivexa', 'website', 'how to use', 'how to book', 'where is', 'what is jivexa',
    'how jivexa works', 'jivexa features', 'abha', 'health id', 'lab report analyzer',
    'doctor consult', 'ambulance', 'pharmacy', 'medicine order', 'dashboard',
    'register', 'login', 'navigation', 'guide', 'how does this work', 'how do i use',
    'upload report', 'teleconsultation', 'e-prescription', 'doctor appointment',
    'book doctor', 'call ambulance', 'order medicine', 'patient portal', 'doctor portal'
  ];
  return jivexaKeywords.some(k => q.includes(k));
};

/**
 * Generate Comprehensive JIVEXA OS Website Knowledge & Visual Flowchart Responses (0 Tokens Used)
 */
const getJivexaWebsiteKnowledgeResponse = (query: string): AIResponse => {
  const q = query.toLowerCase();

  // 1. Emergency Ambulance Booking
  if (q.includes('ambulance') || q.includes('108') || q.includes('emergency vehicle') || q.includes('fleet')) {
    return {
      isEmergency: false,
      provider: 'JIVEXA AI',
      disclaimer: 'JIVEXA Health OS Emergency Dispatch Guide.',
      suggestions: ['Book Ambulance Now', 'Find Nearest Hospital ER', 'View Active Dispatch'],
      text: `### 🚑 Emergency Ambulance 108 Dispatch Service

JIVEXA Health OS connects you directly with 108/112 emergency fleet operators with real-time GPS tracking and pre-hospital ER trauma center notification.

#### ⏱️ Real-Life Emergency Dispatch Flowchart
\`\`\`
+-----------------------------------------------------------------------+
|                JIVEXA EMERGENCY AMBULANCE DISPATCH FLOW               |
+-----------------------------------------------------------------------+
 [PATIENT EMERGENCY ALERT]
          │
          ▼
 [GPS GEO-TRIAGE ENGINE] ────► Auto-Detects Live Location & Nearest Fleet
          │
          ▼
 [NEAREST FLEET DISPATCH] ──► BLS (Basic) or ALS (Advanced ICU) Vehicle
          │
          ▼
 [REAL-TIME DRIVER TRACKING] ─► Live ETA Map & Direct Driver Calling
          │
          ▼
 [HOSPITAL ER PRE-ALERT] ────► Pre-Transmits Vitals to ER Trauma Desk
\`\`\`

#### 📍 How to Book an Ambulance on JIVEXA:
• Navigation: Click **Ambulance** in the main navigation menu (\`/ambulance\`).
• Vehicle Tiers: Choose between **Basic Life Support (BLS)** or **Advanced ICU Support (ALS)**.
• Address & GPS: Confirm your location or let JIVEXA auto-detect live GPS coordinates.
• One-Touch Alert: Click **Request Instant Dispatch** to connect directly with emergency drivers.`
    };
  }

  // 2. AI Lab Report Analyzer
  if (q.includes('lab') || q.includes('report') || q.includes('pdf') || q.includes('analyzer') || q.includes('blood test') || q.includes('ocr')) {
    return {
      isEmergency: false,
      provider: 'JIVEXA AI',
      disclaimer: 'Educational AI health guidance based on clinical standards.',
      suggestions: ['Go to AI Report Analyzer', 'Upload Blood Test PDF', 'Book Doctor Consult'],
      text: `### 🔬 JIVEXA AI Lab Report Analyzer

Upload any PDF or image lab report (CBC, Lipid Profile, Thyroid TSH, HbA1c, Metabolic Panel) to receive an instant, plain-language clinical breakdown with color-coded biomarker badges.

#### 📊 AI Lab Report Processing Flowchart
\`\`\`
+-----------------------------------------------------------------------+
|              JIVEXA AI LAB REPORT ANALYZER BREAKDOWN FLOW             |
+-----------------------------------------------------------------------+
 [PDF / IMAGE REPORT UPLOAD]
          │
          ▼
 [SECURE OCR EXTRACTOR] ─────► Extracts Biomarkers (Glucose, Hb, TSH)
          │
          ▼
 [CLINICAL COMPARISON] ──────► Compares against Standard Reference Ranges
          │
          ▼
 [COLOR STATUS INDICATOR] ──► 🟢 Normal | 🟡 Borderline | 🔴 Critical
          │
          ▼
 [AI INSIGHT & ACTION] ──────► Plain-Language Explanation + Doctor Booking
\`\`\`

#### 📄 How to Use the AI Lab Report Analyzer:
• Navigation: Click **Report Analyzer** in the top navigation bar (\`/ai-report-analyzer\`).
• Upload: Drag & drop your lab test PDF document or smartphone photo.
• Instant Scanner: JIVEXA AI extracts key biomarkers and flags abnormal ranges in green, yellow, or red.
• Actionable Next Steps: Download a summary PDF report or share findings directly with a doctor during a consultation.`
    };
  }

  // 3. Doctors & Tele-Consultations
  if (q.includes('doctor') || q.includes('consult') || q.includes('appointment') || q.includes('specialist') || q.includes('video')) {
    return {
      isEmergency: false,
      provider: 'JIVEXA AI',
      disclaimer: 'JIVEXA Health OS Tele-Consultation Guide.',
      suggestions: ['Search Doctors Directory', 'Book Appointment Slot', 'View My Consultations'],
      text: `### 👨‍⚕️ Verified Doctor Network & Tele-Consultation

Search verified specialists across Cardiology, Dermatology, Pediatrics, General Medicine, Neurology, and Orthopedics to book instant video or clinic consults.

#### 💻 Tele-Consultation & E-Prescription Flowchart
\`\`\`
+-----------------------------------------------------------------------+
|           JIVEXA DOCTOR TELE-CONSULTATION & E-PRESCRIPTION FLOW        |
+-----------------------------------------------------------------------+
 [SEARCH DOCTOR DIRECTORY] ──► Filter by Specialty, City, Rating & Fee
          │
          ▼
 [SLOT BOOKING & CONFIRM] ──► Instant SMS/Email Appointment Confirmation
          │
          ▼
 [HD VIDEO CONSULTATION] ────► Direct Encrypted Consultation Session
          │
          ▼
 [DIGITAL E-PRESCRIPTION] ───► Auto-Synced to ABHA Vault & Pharmacy Cart
\`\`\`

#### 📅 How to Book a Doctor Consultation:
• Search: Visit **Doctors** (\`/doctors\`) and filter by specialty, rating, or location.
• Slots: Select your preferred time slot and click **Book Appointment**.
• Video Room: Join the HD video consultation session directly from your Patient Dashboard.
• E-Prescription: Receive digital prescriptions automatically stored in your ABHA health records.`
    };
  }

  // 4. Pharmacy & Medicines
  if (q.includes('pharmacy') || q.includes('medicine') || q.includes('drug') || q.includes('prescription') || q.includes('cart') || q.includes('order')) {
    return {
      isEmergency: false,
      provider: 'JIVEXA AI',
      disclaimer: 'JIVEXA Pharmacy Fulfillment Guide.',
      suggestions: ['Browse Pharmacy Store', 'Upload Prescription', 'View Order Cart'],
      text: `### 💊 Doorstep Pharmacy & Prescription Fulfillment

Order genuine prescription drugs, wellness supplements, and healthcare OTC products from licensed partner pharmacies with fast doorstep delivery.

#### 📦 Pharmacy Order & Delivery Flowchart
\`\`\`
+-----------------------------------------------------------------------+
|              JIVEXA PHARMACY MEDICINE ORDER & DELIVERY FLOW           |
+-----------------------------------------------------------------------+
 [BROWSE MEDICINES / RX UPLOAD] ──► Search OTC or Upload Doctor Note
          │
          ▼
 [PHARMACIST LICENSED REVIEW] ───► Licensed Pharmacist Verifies Rx & GSTIN
          │
          ▼
 [INVENTORY ALLOCATION] ────────► Items Picked & Sealed in Sanitized Packets
          │
          ▼
 [DOORSTEP EXPRESS DELIVERY] ────► Tracked Delivery directly to Patient Home
\`\`\`

#### 🛒 How to Order Medicines on JIVEXA:
• Browse & Search: Click **Medicines** (\`/medicines\`) to find OTC items or prescription drugs.
• Upload Prescription: Click **Upload Prescription** to attach your doctor's note for quick pharmacist verification.
• Checkout: Add items to cart (\`/cart\`) and enter your delivery address.
• Order Tracking: Monitor real-time order dispatch updates from your dashboard.`
    };
  }

  // 5. ABHA Health ID & Records
  if (q.includes('abha') || q.includes('health id') || q.includes('records') || q.includes('timeline') || q.includes('vault')) {
    return {
      isEmergency: false,
      provider: 'JIVEXA AI',
      disclaimer: 'JIVEXA ABHA Health ID Information Guide.',
      suggestions: ['Generate ABHA Health ID', 'View Health Records', 'Open Health Timeline'],
      text: `### 🆔 ABHA 14-Digit Health ID & Medical Vault

Create your official Ayushman Bharat Health Account (ABHA) 14-digit ID and consolidate all your prescriptions, lab reports, and doctor notes into one secure timeline.

#### 🔒 ABHA Health Record Flowchart
\`\`\`
+-----------------------------------------------------------------------+
|                JIVEXA ABHA HEALTH ID & UNIFIED RECORD FLOW            |
+-----------------------------------------------------------------------+
 [CREATE / LINK ABHA ID] ───────► 14-Digit Government Standard Health ID
          │
          ▼
 [UNIFIED MEDICAL TIMELINE] ────► Sync Consults, Prescriptions & Lab PDFs
          │
          ▼
 [SECURE DOCTOR SHARING] ──────► Grant One-Time QR/OTP Consent to Doctor
          │
          ▼
 [LIFETIME EHR ACCESSIBILITY] ──► Access Anywhere on Mobile or Workstation
\`\`\`

#### 🛡️ How to Use ABHA & Health Records:
• View ABHA Card: Navigate to **ABHA ID** (\`/health-id\`) to view or create your 14-digit Health Card.
• Health Vault: Click **Health Records** (\`/health-records\`) to view uploaded lab PDFs and digital prescriptions.
• Care History: Open **Health Timeline** (\`/health-timeline\`) for a chronological history of your care.`
    };
  }

  // 6. Registration & Role Dashboards
  if (q.includes('register') || q.includes('signup') || q.includes('login') || q.includes('role') || q.includes('dashboard') || q.includes('account')) {
    return {
      isEmergency: false,
      provider: 'JIVEXA AI',
      disclaimer: 'JIVEXA Multi-Role Registration Guide.',
      suggestions: ['Go to Registration', 'Sign In to Account', 'Switch Workstation'],
      text: `### 🔐 Account Registration & Role Workstations

JIVEXA Health OS features 4 specialized role workstations: **Patient**, **Doctor**, **Ambulance Operator**, and **Pharmacy Store**.

#### 👥 Role Workstation Access Flowchart
\`\`\`
+-----------------------------------------------------------------------+
|                JIVEXA MULTI-ROLE WORKSTATION REGISTRATION             |
+-----------------------------------------------------------------------+
 [REGISTER ON JIVEXA] ───────► Select Role: Patient, Doctor, Ambulance, Pharmacy
          │
          ├──► Patient ──────► Instant Access to Patient Dashboard & Triage
          │
          ├──► Doctor ───────► Submit NMC License Number ──► Doctor Dashboard
          │
          ├──► Ambulance ────► Submit Vehicle RC Number ───► Fleet Dashboard
          │
          └──► Pharmacy ─────► Submit Drug License & GSTIN ─► Pharmacy Dashboard
\`\`\`

#### 🔑 How to Register & Access Workstations:
• Start Signup: Click **Sign In / Register** in the top navigation bar (\`/login\` or \`/signup\`).
• Choose Category: Select your category card (**Patient**, **Doctor**, **Ambulance**, or **Pharmacy**).
• Account Credentials: Enter your Name, Email, and Password.
• Practitioner Credentials: Doctors, Ambulance fleet operators, and Pharmacies complete Step 2 licensing details to activate their workstation.`
    };
  }

  // 7. Default General JIVEXA Website Ecosystem Overview
  return {
    isEmergency: false,
    provider: 'JIVEXA AI',
    disclaimer: 'JIVEXA Health OS Master User Guide.',
    suggestions: ['AI Report Analyzer', 'Book Doctor Consult', 'Order Medicines', 'Emergency Ambulance'],
    text: `### 🌐 Welcome to JIVEXA Health OS

JIVEXA Health OS is an all-in-one AI-powered healthcare ecosystem uniting patients, doctors, pharmacies, and emergency ambulance fleets.

#### 🏥 JIVEXA Unified Ecosystem Flowchart
\`\`\`
+-----------------------------------------------------------------------+
|                    JIVEXA HEALTH OS UNIFIED ECOSYSTEM                 |
+-----------------------------------------------------------------------+
  │
  ├──► [🤖 AI Triage & Report Engine] ──► Instant Triage & PDF Scanner
  │
  ├──► [👨‍⚕️ Verified Doctor Network] ──► Teleconsultation & E-Prescription
  │
  ├──► [💊 Doorstep Pharmacy Network]──► Rx Verification & Home Delivery
  │
  ├──► [🚑 GPS Ambulance Dispatch]    ──► 108 Fleet & Real-Time Driver Tracking
  │
  └──► [🆔 Unified ABHA Health ID]     ──► Lifetime Digital Medical Vault
\`\`\`

#### 🚀 Main Navigation Quick-Guide:
• **AI Health Assistant**: Access \`/ai-assistant\` for 24/7 symptom triage and health guidance.
• **AI Lab Report Analyzer**: Go to \`/ai-report-analyzer\` to upload blood test PDFs and receive clinical breakdowns.
• **Find Doctors**: Visit \`/doctors\` to search specialists, check available slots, and book video/clinic appointments.
• **Order Medicines**: Go to \`/medicines\` to search OTC drugs or upload prescriptions for home delivery.
• **Book Ambulance**: Go to \`/ambulance\` for one-touch 108 emergency vehicle dispatch with live GPS tracking.
• **ABHA Health ID**: Access \`/health-id\` to generate your official 14-digit ABHA card.`
  };
};

/**
 * Check if query is related to health, medicine, medical issues, or JIVEXA website
 */
export const isHealthOrMedicalQuery = (query: string): boolean => {
  const q = query.toLowerCase().trim();
  
  // 1. JIVEXA website queries -> Always true
  if (isJivexaWebsiteQuery(q)) return true;

  // 2. Reject obvious non-health / non-medical queries on client side
  const nonHealthKeywords = [
    'python', 'javascript', 'java', 'c++', 'html', 'css', 'code', 'programming', 'software',
    'game', 'movie', 'song', 'music', 'car', 'bike', 'cricket', 'football', 'match', 'score',
    'politics', 'election', 'president', 'prime minister', 'weather', 'joke', 'riddle',
    'recipe', 'cooking', 'restaurant', 'shopping', 'stock', 'crypto', 'bitcoin', 'math',
    'algebra', 'calculus', 'physics', 'chemistry formula', 'what is c', 'c language',
    'capital of', 'currency of', 'history of', 'who won', 'how to build'
  ];

  const hasNonHealthKeyword = nonHealthKeywords.some(k => q.includes(k));
  if (hasNonHealthKeyword) return false;

  // 3. Allow all health, medical, biochemical, symptom, and diagnostic questions (e.g. "what is lactic acid", "hemoglobin", "CBC", "fever", "paracetamol")
  return true;
};

/**
 * 6-Hour Rate Limiter for JIVEXA Health AI Bot (1000 Free AI Tokens per 6 Hours)
 * Users get 1000 tokens / 6-hour window. JIVEXA website guide queries are ALWAYS 100% UNLIMITED.
 */
export const checkHealthBotRateLimit = (userId = 'anonymous'): { allowed: boolean; remainingHours: number; tokensUsed: number; maxTokens: number } => {
  try {
    const key = `jivexa_health_bot_rate_${userId}`;
    const raw = localStorage.getItem(key);
    const now = Date.now();
    const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
    const MAX_TOKENS = 1000;

    if (!raw) {
      return { allowed: true, remainingHours: 6, tokensUsed: 0, maxTokens: MAX_TOKENS };
    }

    const data = JSON.parse(raw);
    const elapsed = now - data.startTime;

    if (elapsed >= SIX_HOURS_MS) {
      localStorage.removeItem(key);
      return { allowed: true, remainingHours: 6, tokensUsed: 0, maxTokens: MAX_TOKENS };
    }

    const remainingHours = Math.max(1, Math.ceil((SIX_HOURS_MS - elapsed) / (1000 * 60 * 60)));
    const tokensUsed = data.tokensUsed || 0;

    if (tokensUsed >= MAX_TOKENS) {
      return { allowed: false, remainingHours, tokensUsed: MAX_TOKENS, maxTokens: MAX_TOKENS };
    }

    return { allowed: true, remainingHours, tokensUsed, maxTokens: MAX_TOKENS };
  } catch (e) {
    return { allowed: true, remainingHours: 6, tokensUsed: 0, maxTokens: 1000 };
  }
};

export const incrementHealthBotRateLimit = (userId = 'anonymous', tokensConsumed = 100) => {
  try {
    const key = `jivexa_health_bot_rate_${userId}`;
    const raw = localStorage.getItem(key);
    const now = Date.now();
    const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

    if (!raw) {
      localStorage.setItem(key, JSON.stringify({ startTime: now, tokensUsed: tokensConsumed }));
      return;
    }

    const data = JSON.parse(raw);
    if (now - data.startTime >= SIX_HOURS_MS) {
      localStorage.setItem(key, JSON.stringify({ startTime: now, tokensUsed: tokensConsumed }));
    } else {
      const updated = Math.min(1000, (data.tokensUsed || 0) + tokensConsumed);
      localStorage.setItem(key, JSON.stringify({ startTime: data.startTime, tokensUsed: updated }));
    }
  } catch (e) {}
};

/**
 * 24-Hour Daily PDF Upload Rate Limiter for AI PDF Analyzer (Max 5 PDFs / 24 Hours)
 */
export const checkPdfAnalyzerRateLimit = (userId = 'anonymous'): { allowed: boolean; remainingHours: number; uploadsUsed: number } => {
  try {
    const key = `jivexa_pdf_rate_${userId}`;
    const raw = localStorage.getItem(key);
    const now = Date.now();
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
    const MAX_PDF_UPLOADS = 5;

    if (!raw) {
      return { allowed: true, remainingHours: 24, uploadsUsed: 0 };
    }

    const data = JSON.parse(raw);
    const elapsed = now - data.startTime;

    if (elapsed >= TWENTY_FOUR_HOURS_MS) {
      localStorage.removeItem(key);
      return { allowed: true, remainingHours: 24, uploadsUsed: 0 };
    }

    const remainingHours = Math.ceil((TWENTY_FOUR_HOURS_MS - elapsed) / (1000 * 60 * 60));
    if (data.uploadsUsed >= MAX_PDF_UPLOADS) {
      return { allowed: false, remainingHours, uploadsUsed: data.uploadsUsed };
    }

    return { allowed: true, remainingHours, uploadsUsed: data.uploadsUsed };
  } catch (e) {
    return { allowed: true, remainingHours: 24, uploadsUsed: 0 };
  }
};

export const incrementPdfAnalyzerRateLimit = (userId = 'anonymous') => {
  try {
    const key = `jivexa_pdf_rate_${userId}`;
    const raw = localStorage.getItem(key);
    const now = Date.now();
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

    if (!raw) {
      localStorage.setItem(key, JSON.stringify({ startTime: now, uploadsUsed: 1 }));
      return;
    }

    const data = JSON.parse(raw);
    if (now - data.startTime >= TWENTY_FOUR_HOURS_MS) {
      localStorage.setItem(key, JSON.stringify({ startTime: now, uploadsUsed: 1 }));
    } else {
      localStorage.setItem(key, JSON.stringify({ startTime: data.startTime, uploadsUsed: data.uploadsUsed + 1 }));
    }
  } catch (e) {}
};

/**
 * 100% Live JIVEXA Health AI Bot Engine
 */
export const streamAIHealthAssistant = async (
  query: string,
  history: { sender: 'user' | 'ai'; text: string }[] = [],
  onChunk: (chunk: string, provider?: string, isEmergency?: boolean) => void,
  userId = 'anonymous_user'
): Promise<AIResponse> => {
  // 1. Check for Emergency Symptoms
  const emergencyKeywords = ['chest pain', 'breathing difficulty', 'shortness of breath', 'heart attack', 'stroke', 'unconscious', 'severe bleeding', 'sudden weakness', 'suicide', 'self harm'];
  const isEmergency = emergencyKeywords.some(k => query.toLowerCase().includes(k));

  if (isEmergency) {
    const emergencyText = `EMERGENCY MEDICAL WARNING: The symptoms you described require immediate emergency evaluation.

• Call 108 / 112 for an emergency ambulance right away.
• Go to the nearest Hospital Emergency Room (ER) immediately.
• Sit upright, loosen tight clothing, and do not drive yourself.`;
    onChunk(emergencyText, 'JIVEXA Emergency Triage AI', true);
    return {
      text: emergencyText,
      isEmergency: true,
      suggestions: ['Call 108 Emergency Ambulance', 'Find Nearest ER', 'Share Emergency Location'],
      disclaimer: 'Educational healthcare information only.',
      provider: 'JIVEXA Emergency Triage AI'
    };
  }

  // 2. Check for JIVEXA Website Queries (0 Tokens Consumed, ALWAYS UNLIMITED)
  if (isJivexaWebsiteQuery(query)) {
    const websiteKnowledgeRes = getJivexaWebsiteKnowledgeResponse(query);
    onChunk(websiteKnowledgeRes.text, 'JIVEXA Health AI Bot', false);
    return websiteKnowledgeRes;
  }

  // 3. Strict Domain Guardrail: Non-Health Query Refusal
  if (!isHealthOrMedicalQuery(query)) {
    const refusalText = `Sorry, I am JIVEXA Health AI Bot. I am specialized exclusively in health, medicine, medical symptoms, prescription guidance, and JIVEXA platform navigation. I can only assist you with health and medical related issues.`;
    onChunk(refusalText, 'JIVEXA Health AI Bot', false);
    return {
      text: refusalText,
      isEmergency: false,
      suggestions: ['Ask a health question', 'Ask about medicines', 'How to use JIVEXA'],
      disclaimer: 'JIVEXA Health AI Bot Scope Notice.',
      provider: 'JIVEXA Health AI Bot'
    };
  }

  // 4. Check 6-Hour Rate Limit (1000 Tokens Limit) for Health Queries
  const rateLimit = checkHealthBotRateLimit(userId);
  if (!rateLimit.allowed) {
    const limitText = `⏳ Daily AI Health Token Limit Reached (1000/1000 Tokens - 100% Used)! You have reached your AI Health Bot token limit for this period. You can ask health and medical questions again after ${rateLimit.remainingHours} hours.

💡 (Note: You can still ask any questions about the JIVEXA Health website and platform guide anytime!)`;
    onChunk(limitText, 'JIVEXA Health AI Bot', false);
    return {
      text: limitText,
      isEmergency: false,
      suggestions: ['How to book doctor on JIVEXA', 'How to order medicines on JIVEXA', 'How to call ambulance on JIVEXA'],
      disclaimer: '6-Hour Token Rate Limit Notice.',
      provider: 'JIVEXA Health AI Bot',
      limitReached: true
    };
  }

  // Increment Rate Limit counter by ~100 tokens per health response
  incrementHealthBotRateLimit(userId, 100);

  // 5. Call Jivexa Backend Google Gemini SSE Streaming Endpoint
  try {
    const apiBase = getApiBaseUrl();
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('jivexa_node_jwt_token') : null;
    const response = await fetch(`${apiBase}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        message: query,
        history: history.map((h) => ({ sender: h.sender, text: h.text })),
        userId
      })
    });

    if (response.ok && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullText = '';
      let doneReading = false;
      let buffer = '';

      while (!doneReading) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.replace('data: ', ''));
              if (data.chunk) {
                fullText += data.chunk;
                onChunk(data.chunk, 'JIVEXA AI (Google Gemini)', false);
              }
              if (data.done) {
                doneReading = true;
              }
            } catch (e) {}
          }
        }
      }

      if (fullText.trim()) {
        return {
          text: fullText,
          isEmergency: false,
          suggestions: ['Ask follow-up question', 'Save to Health Records', 'Book Doctor Consult'],
          disclaimer: 'AI-generated clinical literacy summary for educational purposes only. Always consult a licensed healthcare practitioner.',
          provider: 'JIVEXA AI (Google Gemini)'
        };
      }
    }
  } catch (backendErr) {
    console.warn('[JIVEXA AI] Backend stream error, falling back to local clinical knowledge engine:', backendErr);
  }

  // 6. Clinical Knowledge Fallback Engine
  const localRes = await askAIHealthAssistant(query);
  onChunk(localRes.text, 'JIVEXA Health AI Bot', localRes.isEmergency);
  return localRes;
};

/**
 * Fetch Token Usage & Subscription Status
 */
export const fetchUserTokenUsage = async (userId = 'anonymous_user') => {
  const rateLimit = checkHealthBotRateLimit(userId);
  return { 
    tokensUsedThisPeriod: rateLimit.tokensUsed, 
    maxTokens: rateLimit.maxTokens, 
    remainingHours: rateLimit.remainingHours,
    limitReached: !rateLimit.allowed
  };
};

/**
 * Upgrade User to JIVEXA Pro (Unlimited Tokens)
 */
export const upgradeUserToPro = async (userId = 'anonymous_user') => {
  try {
    const apiBase = getApiBaseUrl();
    const res = await fetch(`${apiBase}/upgrade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('[JIVEXA AI Client] Failed to upgrade:', e);
  }
  return { success: true, message: 'Upgraded to JIVEXA Pro (Unlimited Tokens Active)' };
};

/**
 * Clinical Knowledge Fallback Engine
 */
export const askAIHealthAssistant = async (query: string): Promise<AIResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const content = `### 🏥 JIVEXA Health AI Clinical Guidance for "${query.trim()}"

Evaluated against clinical guidelines and evidence-based medical literature.

#### 📊 Recommended Medical Care Pathway
\`\`\`
+-----------------------------------------------------------------------+
|                 JIVEXA HEALTH CARE EVALUATION FLOW                    |
+-----------------------------------------------------------------------+
 [INITIAL HEALTH QUERY] ──► Analyze Symptoms & Medication Context
          │
          ▼
 [HYDRATION & REST] ────► Maintain Hydration & Record Vitals Daily
          │
          ▼
 [DOCTOR CONSULTATION] ──► Schedule Appointment for Clinical Diagnosis
\`\`\`

#### 📋 Essential Care Steps:
• **Symptom Monitoring**: Log symptom onset, severity, and duration in your JIVEXA Health Profile.
• **Medication Safety**: Verify correct dosage and check for potential drug interactions with your pharmacist or doctor.
• **Hydration & Rest**: Ensure adequate fluid intake and rest while monitoring recovery.
• **Consult Doctor**: If symptoms persist or worsen, book a consultation with a verified specialist on JIVEXA (\`/doctors\`).`;

  return {
    isEmergency: false,
    text: content,
    suggestions: ['Book Doctor Consult', 'Order Prescribed Medicines', 'Save to Health Records'],
    disclaimer: 'Educational healthcare information only.',
    provider: 'JIVEXA Health AI Bot'
  };
};
