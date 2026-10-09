const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateProfile,
  sendOTP,
  verifyOTP,
  submitRoleVerification,
  uploadProfilePhoto,
  removeProfilePhoto
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public Auth & Email Verification routes
router.post('/signup', registerUser);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/send-otp', sendOTP);
router.post('/resend-otp', sendOTP);
router.post('/resend-verification', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/check-verification', verifyOTP);
router.post('/submit-verification', submitRoleVerification);

// Protected Auth routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/profile-photo', protect, uploadProfilePhoto);
router.delete('/profile-photo', protect, removeProfilePhoto);

module.exports = router;
