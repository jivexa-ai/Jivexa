/**
 * JIVEXA Token Usage & Subscription Management Service
 * Tracks token consumption per user and enforces subscription caps.
 */

// In-memory store for user token usage (backed by database sync)
const userUsageStore = new Map();

// Default free tier limit
const FREE_TIER_TOKEN_LIMIT = 1000;

/**
 * Get or initialize user usage record
 */
const getUserUsage = (userId) => {
  const id = userId || 'anonymous_user';
  if (!userUsageStore.has(id)) {
    userUsageStore.set(id, {
      userId: id,
      tokensUsedThisPeriod: 0,
      subscriptionStatus: 'free', // 'free' or 'active'
      periodResetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      requestHistory: []
    });
  }
  return userUsageStore.get(id);
};

/**
 * Check if user is allowed to make an AI request
 */
const checkTokenLimit = (userId) => {
  const usage = getUserUsage(userId);
  if (usage.subscriptionStatus === 'active') {
    return { allowed: true, usage };
  }
  
  if (usage.tokensUsedThisPeriod >= FREE_TIER_TOKEN_LIMIT) {
    return { 
      allowed: false, 
      reason: 'FREE_LIMIT_REACHED',
      message: "You've reached your free 1,000 token limit — upgrade to JIVEXA Pro for unlimited access.",
      usage 
    };
  }

  return { allowed: true, usage };
};

/**
 * Record tokens consumed after an API request
 */
const recordTokenUsage = (userId, inputTokens, outputTokens) => {
  const usage = getUserUsage(userId);
  const total = Math.max(1, inputTokens + outputTokens);
  usage.tokensUsedThisPeriod += total;
  usage.requestHistory.push({
    timestamp: new Date().toISOString(),
    inputTokens,
    outputTokens,
    total
  });
  return usage;
};

/**
 * Upgrade user to Pro subscription
 */
const upgradeSubscription = (userId) => {
  const usage = getUserUsage(userId);
  usage.subscriptionStatus = 'active';
  return usage;
};

module.exports = {
  getUserUsage,
  checkTokenLimit,
  recordTokenUsage,
  upgradeSubscription,
  FREE_TIER_TOKEN_LIMIT
};
