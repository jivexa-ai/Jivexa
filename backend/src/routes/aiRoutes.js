const express = require('express');
const router = express.Router();
const { 
  handleChatRequest, 
  handleAnalyzeReport,
  getUserUsageStats, 
  upgradeUserPro, 
  getAdminAiMetrics,
  getConversations,
  getConversationById,
  saveConversation,
  deleteConversation,
  clearAllConversations
} = require('../controllers/aiController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

// Streaming SSE Chat Endpoint (identifies user if authenticated)
router.post('/chat', optionalProtect, handleChatRequest);

// Real-Time Clinical Report Analyzer & Spam Detection Endpoint
router.post('/analyze-report', handleAnalyzeReport);

// Token Usage & Subscription Status
router.get('/usage', optionalProtect, getUserUsageStats);

// Upgrade to Pro Subscription
router.post('/upgrade', optionalProtect, upgradeUserPro);

// Admin Metrics & Monitoring
router.get('/metrics', getAdminAiMetrics);

// Persistent Conversation History Endpoints (Protected by Auth)
router.get('/conversations', protect, getConversations);
router.get('/conversations/:id', protect, getConversationById);
router.post('/conversations', protect, saveConversation);
router.delete('/conversations/:id', protect, deleteConversation);
router.delete('/conversations', protect, clearAllConversations);

module.exports = router;
