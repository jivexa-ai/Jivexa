const express = require('express');
const router = express.Router();
const { 
  handleChatRequest, 
  handleAnalyzeReport,
  getUserUsageStats, 
  upgradeUserPro, 
  getAdminAiMetrics 
} = require('../controllers/aiController');

// Streaming SSE Chat Endpoint
router.post('/chat', handleChatRequest);

// Real-Time Clinical Report Analyzer & Spam Detection Endpoint
router.post('/analyze-report', handleAnalyzeReport);

// Token Usage & Subscription Status
router.get('/usage', getUserUsageStats);

// Upgrade to Pro Subscription
router.post('/upgrade', upgradeUserPro);

// Admin Metrics & Monitoring
router.get('/metrics', getAdminAiMetrics);

module.exports = router;
