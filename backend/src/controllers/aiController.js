/**
 * JIVEXA Enterprise High-Availability AI Controller
 * Handles SSE chat streaming, rate limiting, and real-time deep report analysis.
 */

const { streamLiveAiResponse, analyzeReportWithAI, aiMetrics } = require('../services/aiService');
const { getUserUsage, checkTokenLimit, recordTokenUsage, upgradeSubscription, FREE_TIER_TOKEN_LIMIT } = require('../services/tokenUsageService');
const { MongoDb } = require('../services/mongoDbService');
const User = require('../models/User');

// Helper to extract user-declared names (e.g., "mera naam Mayank hai", "merar name mayank hai...", "my name is Mayank")
const extractNameFromText = (text) => {
  if (!text || typeof text !== 'string') return null;
  const clean = text.trim();

  // If it's a question inquiring about their name, DO NOT extract a name
  const questionWords = /\b(kya|what|kaun|who|batao|bataiye|tell|know|pata|yaad|remember|check)\b/i;
  if (clean.includes('?') || questionWords.test(clean)) {
    return null;
  }

  // Common patterns for declaring one's name in Hindi / Hinglish / English
  const patterns = [
    /(?:mera|merar|mari|mere)\s+(?:naam|name)\s+(?:hai\s+)?([A-Za-z]{2,20}(?:\s+[A-Za-z]{2,20})?)/i,
    /(?:my\s+name\s+is|i\s+am|im|call\s+me)\s+([A-Za-z]{2,20}(?:\s+[A-Za-z]{2,20})?)/i,
    /(?:main|mai)\s+([A-Za-z]{2,20})\s+(?:hoon|hu)/i,
    /(?:naam|name)\s*[:=]\s*([A-Za-z]{2,20}(?:\s+[A-Za-z]{2,20})?)/i
  ];

  const stopWords = new Set([
    'hai', 'hu', 'hoon', 'kya', 'batao', 'doctor', 'patient', 'jivexa', 'ai', 'fever', 'cough',
    'headache', 'pain', 'hello', 'namaste', 'test', 'report', 'here', 'please', 'sir', 'madam',
    'ok', 'okay', 'yes', 'no', 'not', 'the', 'is', 'a', 'an', 'this', 'that'
  ]);

  for (const regex of patterns) {
    const match = clean.match(regex);
    if (match && match[1]) {
      let candidate = match[1].trim();
      candidate = candidate.replace(/\s+(?:hai|hu|hoon)$/i, '').replace(/[.,!?;:]+$/, '').trim();
      const parts = candidate.split(/\s+/);
      const validParts = parts.filter(p => !stopWords.has(p.toLowerCase()) && /^[A-Za-z]{2,20}$/.test(p));
      if (validParts.length > 0) {
        return validParts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
      }
    }
  }

  return null;
};

// Per-user rate limiting memory map (max 10 requests / minute)
const rateLimitMap = new Map();
const MAX_REQUESTS_PER_MINUTE = 10;

const checkRateLimit = (userId) => {
  const now = Date.now();
  const id = userId || 'anonymous_user';
  if (!rateLimitMap.has(id)) {
    rateLimitMap.set(id, []);
  }

  const timestamps = rateLimitMap.get(id).filter(t => now - t < 60000);
  if (timestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    return false; // Rate limit exceeded
  }

  timestamps.push(now);
  rateLimitMap.set(id, timestamps);
  return true;
};

/**
 * Streaming SSE AI Chat Controller (Zero-Crash Guarded)
 */
const handleChatRequest = async (req, res) => {
  let user = req.user || null;
  const passedUserId = req.body.userId;
  if (!user && passedUserId && passedUserId !== 'anonymous_user') {
    try {
      user = await User.findOne({ _id: String(passedUserId) });
    } catch (e) {}
  }

  const userId = user ? String(user._id || user.id) : (passedUserId || 'anonymous_user');
  const userProfile = user ? {
    id: String(user._id),
    name: user.name,
    age: user.age || null,
    role: user.role || 'PATIENT'
  } : null;

  const { message, history, conversationId } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  // 1. Rate Limiting Check
  if (!checkRateLimit(userId)) {
    return res.status(429).json({
      error: 'Too many requests. Please wait a moment before sending another message.',
      rateLimited: true
    });
  }

  // 2. Token Limit Check (1,000 Token Cap)
  const limitCheck = checkTokenLimit(userId);
  if (!limitCheck.allowed) {
    return res.status(403).json({
      limitReached: true,
      error: limitCheck.message,
      tokensUsed: limitCheck.usage.tokensUsedThisPeriod,
      maxTokens: FREE_TIER_TOKEN_LIMIT
    });
  }

  // 3. Name Extraction & Account Identity Sync
  if (user && userProfile) {
    const declaredName = extractNameFromText(message);
    if (declaredName) {
      userProfile.name = declaredName;
      try {
        await User.findByIdAndUpdate(user._id, { name: declaredName });
        user.name = declaredName;
      } catch (nameErr) {
        console.warn('[AI Controller] Name update warning:', nameErr.message);
      }
    }
  }

  // 4. Cross-Conversation Memory Retrieval (strictly scoped to this authenticated user)
  let crossConversationContext = '';
  if (user && userId && userId !== 'anonymous_user') {
    try {
      const pastConvs = await MongoDb.conversations.find({ userId: String(userId) });
      const otherConvs = pastConvs.filter(c => String(c._id) !== String(conversationId));

      // If user profile name is generic or missing, search past conversations
      const isGenericName = !userProfile.name || ['patient', 'user', 'guest', 'anonymous'].includes(userProfile.name.toLowerCase().trim());
      if (isGenericName) {
        for (const past of otherConvs) {
          const fromTitle = extractNameFromText(past.title);
          if (fromTitle) {
            userProfile.name = fromTitle;
            await User.findByIdAndUpdate(user._id, { name: fromTitle }).catch(() => {});
            break;
          }
          if (Array.isArray(past.messages)) {
            for (const m of past.messages) {
              if (m.sender === 'user' && m.text) {
                const fromMsg = extractNameFromText(m.text);
                if (fromMsg) {
                  userProfile.name = fromMsg;
                  await User.findByIdAndUpdate(user._id, { name: fromMsg }).catch(() => {});
                  break;
                }
              }
            }
            if (userProfile.name && !['patient', 'user', 'guest', 'anonymous'].includes(userProfile.name.toLowerCase().trim())) {
              break;
            }
          }
        }
      }

      // Build structured, token-efficient cross-conversation memory snippet
      if (otherConvs.length > 0) {
        const summaries = [];
        for (const c of otherConvs.slice(0, 5)) {
          const title = c.title || 'Previous Consultation';
          const userMsgs = (c.messages || [])
            .filter(m => m.sender === 'user' && m.text)
            .slice(-2)
            .map(m => m.text)
            .join(' | ');
          if (userMsgs) {
            summaries.push(`- Session "${title}": User noted "${userMsgs.slice(0, 120)}"`);
          } else {
            summaries.push(`- Session "${title}"`);
          }
        }
        if (summaries.length > 0) {
          crossConversationContext = `PRIOR SESSIONS CONTEXT (Other consultations under this user account):\n${summaries.join('\n')}`;
        }
      }
    } catch (memErr) {
      console.warn('[AI Controller] Cross-conversation memory retrieval notice:', memErr.message);
    }
  }

  // Setup Server-Sent Events (SSE) streaming headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();

  let isResponseActive = true;
  res.on('close', () => {
    isResponseActive = false;
  });

  try {
    const aiResult = await streamLiveAiResponse(
      message,
      history || [],
      (chunk) => {
        if (isResponseActive && !res.writableEnded) {
          res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        }
      },
      userProfile,
      crossConversationContext
    );

    // Record token usage
    const updatedUsage = recordTokenUsage(userId, aiResult.inputTokens, aiResult.outputTokens);

    // Auto-persist conversation turn in MongoDB if user is authenticated and conversationId is present
    if (user && conversationId && aiResult.text) {
      try {
        const convId = String(conversationId);
        const existingConv = await MongoDb.conversations.findOne({ _id: convId, userId: String(user._id) });
        const userMsgObj = {
          id: `msg_user_${Date.now()}`,
          sender: 'user',
          text: message.trim(),
          timestamp: new Date()
        };
        const aiMsgObj = {
          id: `msg_ai_${Date.now()}`,
          sender: 'ai',
          text: aiResult.text,
          timestamp: new Date(),
          provider: aiResult.provider || 'JIVEXA AI (Google Gemini)',
          isEmergency: Boolean(aiResult.isEmergency)
        };
        const title = existingConv?.title && existingConv.title !== 'New Conversation'
          ? existingConv.title
          : (message.trim().slice(0, 32) + (message.trim().length > 32 ? '...' : ''));
        const updatedMessages = existingConv ? [...existingConv.messages, userMsgObj, aiMsgObj] : [userMsgObj, aiMsgObj];
        await MongoDb.conversations.upsert(convId, user._id, {
          title,
          messages: updatedMessages
        });
      } catch (saveErr) {
        console.warn('[AI Controller Auto-Persist Notice]:', saveErr.message);
      }
    }

    // Send final payload with token usage details
    if (isResponseActive && !res.writableEnded) {
      res.write(`data: ${JSON.stringify({ 
        done: true, 
        provider: aiResult.provider,
        tokensUsed: updatedUsage.tokensUsedThisPeriod,
        subscriptionStatus: updatedUsage.subscriptionStatus,
        isEmergency: aiResult.isEmergency || false
      })}\n\n`);
      res.end();
    }
  } catch (error) {
    console.error('[JIVEXA AI Controller Error]', error.message);
    aiMetrics.errors++;
    if (isResponseActive && !res.writableEnded) {
      res.write(`data: ${JSON.stringify({ 
        error: 'JIVEXA Assistant is temporarily unavailable, please try again in a moment.',
        done: true 
      })}\n\n`);
      res.end();
    }
  }
};

/**
 * Real-Time Deep Clinical Document Analyzer & Fake/Spam Report Detector Endpoint
 */
const handleAnalyzeReport = async (req, res) => {
  const documentText = req.body.documentText || req.body.reportText || req.body.text;
  const fileName = req.body.fileName || req.body.reportType || 'Medical_Report.pdf';
  if (!documentText || typeof documentText !== 'string') {
    return res.status(400).json({ error: 'Document text content is required' });
  }

  try {
    const analysisResult = await analyzeReportWithAI(documentText, fileName || 'Medical_Report.pdf');
    res.json(analysisResult);
  } catch (err) {
    console.error('[AI Report Analyzer Controller Error]', err.message);
    res.status(500).json({
      error: 'Failed to analyze report using AI engine',
      details: err.message
    });
  }
};

/**
 * Get User Token Usage & Subscription Status
 */
const getUserUsageStats = (req, res) => {
  const userId = req.user?.id || req.query.userId || 'anonymous_user';
  const usage = getUserUsage(userId);
  res.json({
    userId,
    tokensUsedThisPeriod: usage.tokensUsedThisPeriod,
    maxTokens: FREE_TIER_TOKEN_LIMIT,
    subscriptionStatus: usage.subscriptionStatus,
    periodResetDate: usage.periodResetDate
  });
};

/**
 * Upgrade to Pro Subscription
 */
const upgradeUserPro = (req, res) => {
  const userId = req.user?.id || req.body.userId || 'anonymous_user';
  const usage = upgradeSubscription(userId);
  res.json({
    success: true,
    message: 'Upgraded to JIVEXA Pro successfully! Unlimited AI Health Assistant access unlocked.',
    usage
  });
};

/**
 * Get Admin AI Metrics & System Logs
 */
const getAdminAiMetrics = (req, res) => {
  res.json({
    metrics: aiMetrics,
    serverTime: new Date().toISOString()
  });
};

/**
 * Persistent Conversation History Handlers
 */
const getConversations = async (req, res) => {
  try {
    const userId = String(req.user._id || req.user.id);
    const list = await MongoDb.conversations.find({ userId });
    return res.json({
      success: true,
      count: list.length,
      conversations: list.map(c => c.toJSON ? c.toJSON() : c)
    });
  } catch (error) {
    console.error('[AI Controller Get Conversations Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch conversations' });
  }
};

const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = String(req.user._id || req.user.id);
    const conv = await MongoDb.conversations.findOne({ _id: String(id), userId });
    if (!conv) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }
    return res.json({
      success: true,
      conversation: conv.toJSON ? conv.toJSON() : conv
    });
  } catch (error) {
    console.error('[AI Controller Get Conversation Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch conversation' });
  }
};

const saveConversation = async (req, res) => {
  try {
    const userId = String(req.user._id || req.user.id);
    const { id, title, messages } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Conversation ID is required' });
    }
    const conv = await MongoDb.conversations.upsert(id, userId, {
      title: title || 'New Conversation',
      messages: Array.isArray(messages) ? messages : []
    });

    // Check if title or any user message declares user's name
    const fromTitle = extractNameFromText(title);
    if (fromTitle) {
      await User.findByIdAndUpdate(userId, { name: fromTitle }).catch(() => {});
    } else if (Array.isArray(messages)) {
      for (const m of messages) {
        if (m && m.sender === 'user' && m.text) {
          const fromMsg = extractNameFromText(m.text);
          if (fromMsg) {
            await User.findByIdAndUpdate(userId, { name: fromMsg }).catch(() => {});
            break;
          }
        }
      }
    }

    return res.json({
      success: true,
      conversation: conv.toJSON ? conv.toJSON() : conv
    });
  } catch (error) {
    console.error('[AI Controller Save Conversation Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to save conversation' });
  }
};

const deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = String(req.user._id || req.user.id);
    const deleted = await MongoDb.conversations.deleteById(id, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Conversation not found or not owned by user' });
    }
    return res.json({ success: true, message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('[AI Controller Delete Conversation Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete conversation' });
  }
};

const clearAllConversations = async (req, res) => {
  try {
    const userId = String(req.user._id || req.user.id);
    const result = await MongoDb.conversations.deleteMany({ userId });
    return res.json({
      success: true,
      message: 'All chat history cleared successfully',
      deletedCount: result.deletedCount || 0
    });
  } catch (error) {
    console.error('[AI Controller Clear History Error]:', error);
    return res.status(500).json({ success: false, error: 'Failed to clear chat history' });
  }
};

module.exports = {
  handleChatRequest,
  handleAnalyzeReport,
  getUserUsageStats,
  upgradeUserPro,
  getAdminAiMetrics,
  getConversations,
  getConversationById,
  saveConversation,
  deleteConversation,
  clearAllConversations,
  extractNameFromText
};
