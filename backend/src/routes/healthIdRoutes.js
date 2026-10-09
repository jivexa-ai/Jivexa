const express = require('express');
const router = express.Router();
const { createHealthId, getMyHealthId, searchHealthId } = require('../controllers/healthIdController');
const { protect } = require('../middleware/authMiddleware');

// Health ID Management Routes
router.post('/', protect, createHealthId);
router.get('/me', protect, getMyHealthId);
router.get('/my', protect, getMyHealthId);
router.get('/search', searchHealthId);
router.get('/:healthId', searchHealthId);

module.exports = router;
