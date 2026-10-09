/**
 * JIVEXA Enterprise High-Availability AI Controller
 * Handles SSE chat streaming, rate limiting, and real-time deep report analysis.
 */

const { streamLiveAiResponse, analyzeReportWithAI, aiMetrics } = require('../services/aiService');
const { getUserUsage, checkTokenLimit, recordTokenUsage, upgradeSubscription, FREE_TIER_TOKEN_LIMIT } = require('../services/tokenUsageService');

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
  const userId = req.user?.id || req.body.userId || 'anonymous_user';
  const { message, history } = req.body;

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
    const aiResult = await streamLiveAiResponse(message, history || [], (chunk) => {
      if (isResponseActive && !res.writableEnded) {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }
    });

    // Record token usage
    const updatedUsage = recordTokenUsage(userId, aiResult.inputTokens, aiResult.outputTokens);

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

module.exports = {
  handleChatRequest,
  handleAnalyzeReport,
  getUserUsageStats,
  upgradeUserPro,
  getAdminAiMetrics
};
