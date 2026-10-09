const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const { SupabaseDb, isSupabaseConfigured } = require('../services/supabaseDbService');
const { getSupabase } = require('../config/supabase');
const { signupSchema, loginSchema, updateProfileSchema } = require('../validators/userValidators');
const { resendVerificationEmail } = require('../services/emailService');
const { 
  createOTPEntry, 
  verifyOTPEntry, 
  maskEmail, 
  generateRoleId, 
  OTP_RESEND_COOLDOWN_SECONDS 
} = require('../services/otpService');

const JWT_SECRET = process.env.JWT_SECRET || 'jivexa_health_jwt_secret_key_2026_super_secure_auth_token_string';
const MAX_FAILED_LOGINS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15-minute lockout

// TEMPORARILY DISABLED FOR LAUNCH
// Re-enable OTP after launch by setting OTP_ENABLED=true in backend/.env.
const isOtpEnabled = () => {
  return process.env.OTP_ENABLED === 'true';
};

// Helper to generate signed JWT token
const generateToken = (id, email, role, name, roleId) => {
  if (!JWT_SECRET) {
    throw new Error('JWT secret key is not configured in backend environment');
  }
  return jwt.sign(
    { id, email, role, name, roleId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Cookie configuration options
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

// Memory fallback store if local MongoDB connection is disconnected
const inMemoryUsers = [];

// @desc    Register a new user (Signup & Dispatch Email OTP)
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);
    if (!validationResult.success) {
      const issues = validationResult.error.issues || validationResult.error.errors || [];
      const firstError = issues[0]?.message || 'Invalid input data';
      return res.status(400).json({
        success: false,
        error: firstError,
        message: firstError,
        details: issues
      });
    }

    const { name, age, email, password, role } = validationResult.data;
    const userRole = (role || 'PATIENT').toUpperCase();

    // Generate Prefix-Based Unique Distinguishable Role ID
    const roleId = generateRoleId(userRole);

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      const existingUser = await SupabaseDb.users.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'An account with this email already exists. Please log in.',
          message: 'An account with this email already exists. Please log in.'
        });
      }

      // 1. Create account via Supabase Auth admin (pre-confirmed, zero verification email sent)
      let authUserId = null;
      let authErrorMsg = null;

      try {
        const { data: adminUserData, error: adminError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            name,
            role: userRole
          }
        });

        if (adminError) {
          authErrorMsg = adminError.message;
          // If already in auth.users, try to link or update password
          if (adminError.message?.toLowerCase().includes('already') || adminError.message?.toLowerCase().includes('registered')) {
            const { data: listData } = await supabase.auth.admin.listUsers();
            const existingAuth = listData?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
            if (existingAuth) {
              authUserId = existingAuth.id;
              await supabase.auth.admin.updateUserById(authUserId, {
                password,
                email_confirm: true,
                user_metadata: { name, role: userRole }
              }).catch(() => {});
            }
          }
        } else if (adminUserData?.user) {
          authUserId = adminUserData.user.id;
        }
      } catch (adminErr) {
        authErrorMsg = adminErr.message;
      }

      if (!authUserId) {
        // Fallback: create native Supabase Auth user via signUp
        try {
          const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name, role: userRole }
            }
          });
          if (signUpData?.user) {
            authUserId = signUpData.user.id;
            // Confirm immediately
            if (supabase.auth?.admin?.updateUserById) {
              await supabase.auth.admin.updateUserById(authUserId, { email_confirm: true }).catch(() => {});
            }
          } else if (signUpErr) {
            console.warn('[Supabase Auth SignUp Fallback Warning]:', signUpErr.message);
          }
        } catch (signUpException) {
          console.warn('[Supabase Auth Exception]:', signUpException.message);
        }
      }

      if (!authUserId) {
        // Generate consistent UUID if Supabase Auth user ID was unavailable
        authUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      }

      // 2. Hash password with bcrypt (12 rounds) for local security & public.users
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 3. Save user profile in public.users
      const userProfilePayload = {
        id: authUserId,
        roleId,
        name,
        age: age !== undefined ? age : 28,
        email,
        phone: req.body.phone || req.body.phoneNumber || '',
        healthId: req.body.healthId || `HID-${Math.floor(100000 + Math.random() * 900000)}`,
        password: hashedPassword,
        role: userRole,
        emailVerified: true,
        verified: true,
        twoFactorEnabled: false,
        accountStatus: 'ACTIVE',
        usage: { tokenUsed: 0, tokenLimit: 10000 }
      };

      if (req.body.nmcRegistrationNumber || req.body.professionalDetails) {
        userProfilePayload.professionalDetails = req.body.professionalDetails || {
          nmcRegistrationNumber: req.body.nmcRegistrationNumber,
          stateMedicalCouncil: req.body.stateMedicalCouncil || 'State Medical Council',
          qualifications: req.body.qualifications || 'MBBS',
          specialty: req.body.specialty || 'General Medicine'
        };
      }
      if (req.body.vehicleNumber || req.body.vehicleDetails) {
        userProfilePayload.vehicleDetails = req.body.vehicleDetails || {
          vehicleNumber: req.body.vehicleNumber,
          category: req.body.category || 'Basic Life Support',
          permitNumber: req.body.permitNumber || `PERMIT-${Date.now()}`
        };
      }
      if (req.body.drugLicenseNumber || req.body.licenseDetails) {
        userProfilePayload.licenseDetails = req.body.licenseDetails || {
          pharmacyName: req.body.pharmacyName || name,
          drugLicenseNumber: req.body.drugLicenseNumber,
          gstin: req.body.gstin || '29AAACJ1234F1Z5'
        };
      }

      const userRecord = await SupabaseDb.users.create(userProfilePayload);

      // 4. Generate JWT auth token & set HTTP-only cookie
      const token = generateToken(
        userRecord._id || userRecord.id,
        userRecord.email,
        userRecord.role,
        userRecord.name,
        userRecord.roleId
      );

      res.cookie('token', token, getCookieOptions());

      return res.status(201).json({
        success: true,
        requireEmailConfirmation: false,
        requireOtp: false,
        token,
        email,
        message: 'Account created successfully!',
        user: userRecord.toAuthJSON ? userRecord.toAuthJSON() : userRecord
      });
    }

    // Fallback: Inactive OTP / direct activation
    let otpEntry = null;
    if (isOtpEnabled()) {
      otpEntry = await createOTPEntry('signup_verification');
    }

    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        if (existingUser.emailVerified) {
          return res.status(409).json({
            success: false,
            error: 'An account with this email already exists. Please log in.',
            message: 'An account with this email already exists. Please log in.'
          });
        }

        if (isOtpEnabled() && otpEntry) {
          // Account exists but is unverified: check cooldown and refresh OTP
          if (existingUser.otpDetails?.resendAvailableAt) {
            const now = new Date();
            const availableAt = new Date(existingUser.otpDetails.resendAvailableAt);
            if (now < availableAt) {
              const remainingSeconds = Math.ceil((availableAt.getTime() - now.getTime()) / 1000);
              return res.status(429).json({
                success: false,
                error: `Please wait ${remainingSeconds} seconds before requesting another code.`,
                remainingSeconds
              });
            }
          }

          existingUser.name = name;
          existingUser.password = password; // Will be hashed by pre-save hook
          existingUser.role = userRole;
          existingUser.age = age;
          existingUser.phone = req.body.phone || req.body.phoneNumber || existingUser.phone;
          existingUser.healthId = req.body.healthId || existingUser.healthId;
          existingUser.otpDetails = {
            codeHash: otpEntry.otpHash,
            purpose: 'signup_verification',
            expiresAt: otpEntry.expiresAt,
            resendAvailableAt: otpEntry.resendAvailableAt,
            attempts: 0
          };

          await existingUser.save();
          const emailRes = await sendOTPEmail(email, otpEntry.plainOtp, name, userRole);

          return res.status(200).json({
            success: true,
            requireOtp: true,
            email: existingUser.email,
            maskedEmail: maskEmail(existingUser.email),
            message: "We've sent a verification code to your email.",
            previewUrl: emailRes.previewUrl
          });
        } else {
          // Launch mode: OTP disabled, activate user directly
          existingUser.name = name;
          existingUser.password = password;
          existingUser.role = userRole;
          existingUser.age = age;
          existingUser.emailVerified = true;
          existingUser.verified = true;
          existingUser.accountStatus = 'ACTIVE';
          existingUser.otpDetails = undefined;
          await existingUser.save();

          return res.status(200).json({
            success: true,
            requireOtp: false,
            requireEmailConfirmation: false,
            email: existingUser.email,
            message: 'Account updated and activated successfully.',
            user: existingUser.toAuthJSON ? existingUser.toAuthJSON() : existingUser
          });
        }
      }

      // Create new user in MongoDB
      const newUserObj = {
        roleId,
        name,
        age,
        email,
        phone: req.body.phone || req.body.phoneNumber || '',
        healthId: req.body.healthId || '',
        password,
        role: userRole,
        emailVerified: !isOtpEnabled(),
        verified: !isOtpEnabled(),
        twoFactorEnabled: false,
        accountStatus: isOtpEnabled() ? 'PENDING_EMAIL_VERIFICATION' : 'ACTIVE'
      };

      if (isOtpEnabled() && otpEntry) {
        newUserObj.otpDetails = {
          codeHash: otpEntry.otpHash,
          purpose: 'signup_verification',
          expiresAt: otpEntry.expiresAt,
          resendAvailableAt: otpEntry.resendAvailableAt,
          attempts: 0
        };
      }

      if (req.body.nmcRegistrationNumber) {
        newUserObj.professionalDetails = {
          nmcRegistrationNumber: req.body.nmcRegistrationNumber,
          stateMedicalCouncil: req.body.stateMedicalCouncil || 'State Medical Council',
          qualifications: req.body.qualifications || 'MBBS',
          specialty: req.body.specialty || 'General Medicine'
        };
      }
      if (req.body.vehicleNumber) {
        newUserObj.vehicleDetails = {
          vehicleNumber: req.body.vehicleNumber,
          category: req.body.category || 'Basic Life Support',
          permitNumber: req.body.permitNumber || `PERMIT-${Date.now()}`
        };
      }
      if (req.body.drugLicenseNumber) {
        newUserObj.licenseDetails = {
          pharmacyName: req.body.pharmacyName || name,
          drugLicenseNumber: req.body.drugLicenseNumber,
          gstin: req.body.gstin || '29AAACJ1234F1Z5'
        };
      }

      const user = await User.create(newUserObj);

      if (isOtpEnabled() && otpEntry) {
        const emailRes = await sendOTPEmail(email, otpEntry.plainOtp, name, userRole);
        return res.status(201).json({
          success: true,
          requireOtp: true,
          email: user.email,
          maskedEmail: maskEmail(user.email),
          message: "We've sent a verification code to your email.",
          previewUrl: emailRes.previewUrl
        });
      }

      return res.status(201).json({
        success: true,
        requireOtp: false,
        requireEmailConfirmation: false,
        email: user.email,
        message: 'Account registered successfully.',
        user: user.toAuthJSON ? user.toAuthJSON() : user
      });
    } else {
      // Memory Store Fallback
      const existingUser = inMemoryUsers.find((u) => u.email === email);
      if (existingUser) {
        if (existingUser.emailVerified) {
          return res.status(409).json({
            success: false,
            error: 'An account with this email already exists. Please log in.',
            message: 'An account with this email already exists. Please log in.'
          });
        }
        existingUser.name = name;
        const salt = await bcrypt.genSalt(12);
        existingUser.password = await bcrypt.hash(password, salt);
        existingUser.role = userRole;

        if (isOtpEnabled() && otpEntry) {
          existingUser.otpDetails = {
            codeHash: otpEntry.otpHash,
            purpose: 'signup_verification',
            expiresAt: otpEntry.expiresAt,
            resendAvailableAt: otpEntry.resendAvailableAt,
            attempts: 0
          };
          const emailRes = await sendOTPEmail(email, otpEntry.plainOtp, name, userRole);
          return res.status(200).json({
            success: true,
            requireOtp: true,
            email: existingUser.email,
            maskedEmail: maskEmail(existingUser.email),
            message: "We've sent a verification code to your email.",
            previewUrl: emailRes.previewUrl
          });
        }

        existingUser.emailVerified = true;
        existingUser.verified = true;
        existingUser.accountStatus = 'ACTIVE';
        existingUser.otpDetails = undefined;

        return res.status(200).json({
          success: true,
          requireOtp: false,
          requireEmailConfirmation: false,
          email: existingUser.email,
          message: 'Account updated successfully.',
          user: existingUser
        });
      }

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      const memUser = {
        _id: newUserId,
        id: newUserId,
        roleId,
        name,
        age,
        email,
        password: hashedPassword,
        role: userRole,
        emailVerified: !isOtpEnabled(),
        verified: !isOtpEnabled(),
        twoFactorEnabled: false,
        accountStatus: isOtpEnabled() ? 'PENDING_EMAIL_VERIFICATION' : 'ACTIVE',
        professionalDetails: req.body.nmcRegistrationNumber ? { nmcRegistrationNumber: req.body.nmcRegistrationNumber } : undefined,
        vehicleDetails: req.body.vehicleNumber ? { vehicleNumber: req.body.vehicleNumber } : undefined,
        licenseDetails: req.body.drugLicenseNumber ? { drugLicenseNumber: req.body.drugLicenseNumber } : undefined,
        createdAt: new Date().toISOString()
      };

      if (isOtpEnabled() && otpEntry) {
        memUser.otpDetails = {
          codeHash: otpEntry.otpHash,
          purpose: 'signup_verification',
          expiresAt: otpEntry.expiresAt,
          resendAvailableAt: otpEntry.resendAvailableAt,
          attempts: 0
        };
      }

      inMemoryUsers.push(memUser);

      if (isOtpEnabled() && otpEntry) {
        const emailRes = await sendOTPEmail(email, otpEntry.plainOtp, name, userRole);
        return res.status(201).json({
          success: true,
          requireOtp: true,
          email: memUser.email,
          maskedEmail: maskEmail(memUser.email),
          message: "We've sent a verification code to your email.",
          previewUrl: emailRes.previewUrl
        });
      }

      return res.status(201).json({
        success: true,
        requireOtp: false,
        requireEmailConfirmation: false,
        email: memUser.email,
        message: 'Account created successfully.',
        user: memUser
      });
    }
  } catch (error) {
    console.error('[Backend Auth Signup Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server authentication error'
    });
  }
};

// @desc    Dispatch or Resend Email Verification (via Supabase Auth)
// @route   POST /api/auth/send-otp, POST /api/auth/resend-verification, POST /api/auth/resend-otp
// @access  Public / Private
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email address is required to send verification email' });
    }

    // TEMPORARILY DISABLED FOR LAUNCH
    // Re-enable OTP after launch by setting OTP_ENABLED=true in backend/.env.
    if (!isOtpEnabled() && !req.path.includes('verification')) {
      if (isSupabaseConfigured()) {
        const resendResult = await resendVerificationEmail(email);
        return res.status(resendResult.success ? 200 : 400).json(resendResult);
      }
      return res.status(200).json({
        success: true,
        otpDisabled: true,
        message: 'OTP dispatch is temporarily inactive for launch.'
      });
    }

    if (isSupabaseConfigured()) {
      const resendResult = await resendVerificationEmail(email);
      if (!resendResult.success) {
        return res.status(400).json({
          success: false,
          error: resendResult.error || 'Failed to dispatch verification email',
          message: resendResult.error || 'Failed to dispatch verification email'
        });
      }

      return res.status(200).json({
        success: true,
        message: `Verification email dispatched to ${maskEmail(email)}. Please check your inbox.`,
        maskedEmail: maskEmail(email)
      });
    }

    let targetUser = null;
    if (mongoose.connection.readyState === 1) {
      targetUser = await User.findOne({ email });
    } else {
      targetUser = inMemoryUsers.find((u) => u.email === email);
    }

    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'No account registered with this email address' });
    }

    if (isOtpEnabled()) {
      // Rate limiting: check resend cooldown
      if (targetUser.otpDetails?.resendAvailableAt) {
        const now = new Date();
        const availableAt = new Date(targetUser.otpDetails.resendAvailableAt);
        if (now < availableAt) {
          const remainingSeconds = Math.ceil((availableAt.getTime() - now.getTime()) / 1000);
          return res.status(429).json({
            success: false,
            error: `Please wait ${remainingSeconds} seconds before requesting a new code.`,
            remainingSeconds
          });
        }
      }

      const otpEntry = await createOTPEntry('signup_verification');

      targetUser.otpDetails = {
        codeHash: otpEntry.otpHash,
        purpose: 'signup_verification',
        expiresAt: otpEntry.expiresAt,
        resendAvailableAt: otpEntry.resendAvailableAt,
        attempts: 0
      };

      if (mongoose.connection.readyState === 1) {
        await targetUser.save();
      }
    }

    await resendVerificationEmail(targetUser.email);

    return res.status(200).json({
      success: true,
      message: `Verification email dispatched to ${maskEmail(targetUser.email)}`,
      maskedEmail: maskEmail(targetUser.email)
    });
  } catch (error) {
    console.error('[Send OTP Error]:', error);
    return res.status(500).json({ success: false, error: error.message || 'Error sending verification email' });
  }
};

// @desc    Verify Email / OTP (Supabase Auth / Custom Fallback)
// @route   POST /api/auth/verify-otp, POST /api/auth/check-verification
// @access  Public / Private
const verifyOTP = async (req, res) => {
  try {
    // TEMPORARILY DISABLED FOR LAUNCH
    // Re-enable OTP after launch by setting OTP_ENABLED=true in backend/.env.
    if (!isOtpEnabled()) {
      return res.status(410).json({
        success: false,
        otpDisabled: true,
        error: 'OTP verification is disabled for launch. Please verify your account via the email confirmation link sent to your inbox.',
        message: 'OTP verification is disabled for launch. Please verify your account via the email confirmation link sent to your inbox.'
      });
    }

    const { email, code, token: inputToken, purpose = 'signup_verification' } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email address is required' });
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      let targetUser = await SupabaseDb.users.findOne({ email });
      if (!targetUser) {
        return res.status(404).json({ success: false, error: 'User account not found' });
      }

      // If code/token passed, attempt verification via Supabase Auth
      const otpCode = code || inputToken;
      if (otpCode) {
        // TEMPORARILY DISABLED FOR LAUNCH
        // Re-enable OTP after launch by setting OTP_ENABLED=true.
        if (isOtpEnabled()) {
          const { error } = await supabase.auth.verifyOtp({
            email: email.trim().toLowerCase(),
            token: otpCode.trim(),
            type: 'signup'
          });
          if (error && !error.message?.toLowerCase().includes('already')) {
            return res.status(400).json({ success: false, error: error.message });
          }
        }
      }

      targetUser.emailVerified = true;
      targetUser.verified = true;
      targetUser.otpDetails = undefined;

      if (targetUser.id && supabase.auth?.admin?.updateUserById) {
        try {
          await supabase.auth.admin.updateUserById(targetUser.id, { email_confirm: true });
        } catch (adminErr) {
          // non-fatal admin sync
        }
      }

      if (!targetUser.roleId) {
        targetUser.roleId = generateRoleId(targetUser.role);
      }

      if (targetUser.role === 'PATIENT') {
        targetUser.accountStatus = 'ACTIVE';
      } else if (targetUser.role === 'DOCTOR') {
        targetUser.accountStatus = targetUser.professionalDetails?.nmcRegistrationNumber ? 'VERIFIED' : 'PENDING_DOCUMENT_REVIEW';
      } else if (targetUser.role === 'AMBULANCE_PARTNER') {
        targetUser.accountStatus = targetUser.vehicleDetails?.vehicleNumber ? 'VERIFIED' : 'PENDING_DOCUMENT_REVIEW';
      } else if (targetUser.role === 'PHARMACY') {
        targetUser.accountStatus = targetUser.licenseDetails?.drugLicenseNumber ? 'VERIFIED' : 'PENDING_DOCUMENT_REVIEW';
      } else {
        targetUser.accountStatus = 'ACTIVE';
      }

      await targetUser.save();

      const token = generateToken(
        targetUser._id || targetUser.id,
        targetUser.email,
        targetUser.role,
        targetUser.name,
        targetUser.roleId
      );

      res.cookie('token', token, getCookieOptions());

      const userAuthData = targetUser.toAuthJSON ? targetUser.toAuthJSON() : {
        id: targetUser.id || targetUser._id,
        roleId: targetUser.roleId,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        emailVerified: true,
        verified: true,
        accountStatus: targetUser.accountStatus
      };

      return res.status(200).json({
        success: true,
        message: `🎉 Email verified successfully! Unique Role ID: ${targetUser.roleId}`,
        token,
        user: userAuthData
      });
    }

    let targetUser = null;
    if (isSupabaseConfigured()) {
      targetUser = await SupabaseDb.users.findOne({ email });
    } else if (mongoose.connection.readyState === 1) {
      targetUser = await User.findOne({ email });
    } else {
      targetUser = inMemoryUsers.find((u) => u.email === email);
    }

    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'User account not found' });
    }

    // Verify code via crypto otpService with purpose validation
    // TEMPORARILY DISABLED FOR LAUNCH
    // Re-enable OTP after launch by setting OTP_ENABLED=true.
    if (isOtpEnabled()) {
      const verification = await verifyOTPEntry(targetUser.otpDetails, code, purpose);
      if (!verification.valid) {
        if (targetUser.otpDetails) {
          targetUser.otpDetails.attempts = (targetUser.otpDetails.attempts || 0) + 1;
          if (isSupabaseConfigured() || mongoose.connection.readyState === 1) await targetUser.save();
        }
        return res.status(400).json({
          success: false,
          reason: verification.reason,
          error: verification.message
        });
      }
    }

    // OTP Verified Successfully! Clear OTP & update state
    targetUser.emailVerified = true;
    targetUser.verified = true;
    targetUser.otpDetails = undefined; // Single-use invalidation

    if (!targetUser.roleId) {
      targetUser.roleId = generateRoleId(targetUser.role);
    }

    // Transition role-based state machine
    if (targetUser.role === 'PATIENT') {
      targetUser.accountStatus = 'ACTIVE';
    } else if (targetUser.role === 'DOCTOR') {
      targetUser.accountStatus = targetUser.professionalDetails?.nmcRegistrationNumber ? 'VERIFIED' : 'PENDING_DOCUMENT_REVIEW';
    } else if (targetUser.role === 'AMBULANCE_PARTNER') {
      targetUser.accountStatus = targetUser.vehicleDetails?.vehicleNumber ? 'VERIFIED' : 'PENDING_DOCUMENT_REVIEW';
    } else if (targetUser.role === 'PHARMACY') {
      targetUser.accountStatus = targetUser.licenseDetails?.drugLicenseNumber ? 'VERIFIED' : 'PENDING_DOCUMENT_REVIEW';
    } else {
      targetUser.accountStatus = 'ACTIVE';
    }

    if (isSupabaseConfigured() || mongoose.connection.readyState === 1) {
      await targetUser.save();
    }

    const token = generateToken(
      targetUser._id || targetUser.id,
      targetUser.email,
      targetUser.role,
      targetUser.name,
      targetUser.roleId
    );

    res.cookie('token', token, getCookieOptions());

    const userAuthData = targetUser.toAuthJSON ? targetUser.toAuthJSON() : {
      id: targetUser.id || targetUser._id,
      roleId: targetUser.roleId,
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
      emailVerified: true,
      verified: true,
      accountStatus: targetUser.accountStatus
    };

    return res.status(200).json({
      success: true,
      message: `🎉 Email verified successfully! Unique Role ID: ${targetUser.roleId}`,
      token,
      user: userAuthData
    });
  } catch (error) {
    console.error('[Verify OTP Error]:', error);
    return res.status(500).json({ success: false, error: error.message || 'Server error verifying OTP' });
  }
};

// @desc    Submit Stage 2 Professional/Business Verification Credentials
// @route   POST /api/auth/submit-verification
// @access  Private / Public
const submitRoleVerification = async (req, res) => {
  try {
    const { email, nmcRegistrationNumber, stateMedicalCouncil, vehicleNumber, category, drugLicenseNumber, gstin } = req.body;

    let targetUser = null;
    if (isSupabaseConfigured()) {
      targetUser = await SupabaseDb.users.findOne({ email });
    } else if (mongoose.connection.readyState === 1) {
      targetUser = await User.findOne({ email });
    } else {
      targetUser = inMemoryUsers.find((u) => u.email === email);
    }

    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'User account not found' });
    }

    if (targetUser.role === 'DOCTOR' && nmcRegistrationNumber) {
      targetUser.professionalDetails = {
        nmcRegistrationNumber,
        stateMedicalCouncil: stateMedicalCouncil || 'State Medical Council',
        verifiedAt: new Date()
      };
      targetUser.accountStatus = 'VERIFIED';
    } else if (targetUser.role === 'AMBULANCE_PARTNER' && vehicleNumber) {
      targetUser.vehicleDetails = {
        vehicleNumber,
        category: category || 'ICU Ambulance',
        verifiedAt: new Date()
      };
      targetUser.accountStatus = 'VERIFIED';
    } else if (targetUser.role === 'PHARMACY' && drugLicenseNumber) {
      targetUser.licenseDetails = {
        pharmacyName: targetUser.name,
        drugLicenseNumber,
        gstin: gstin || '29AAACJ1234F1Z5',
        verifiedAt: new Date()
      };
      targetUser.accountStatus = 'VERIFIED';
    }

    if (isSupabaseConfigured() || mongoose.connection.readyState === 1) {
      await targetUser.save();
    }

    return res.json({
      success: true,
      message: '🎉 Credentials submitted and account verified!',
      roleId: targetUser.roleId,
      accountStatus: targetUser.accountStatus
    });
  } catch (error) {
    console.error('[Submit Verification Error]:', error);
    return res.status(500).json({ success: false, error: error.message || 'Error submitting verification credentials' });
  }
};

// @desc    Authenticate user & get JWT token (Login with Brute-Force Protection & 2FA)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      const issues = validationResult.error.issues || validationResult.error.errors || [];
      const firstError = issues[0]?.message || 'Invalid input data';
      return res.status(400).json({
        success: false,
        error: firstError,
        message: firstError
      });
    }

    const { email, password } = validationResult.data;

    let user = null;
    let isMatch = false;

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      let user = await SupabaseDb.users.findOne({ email });

      // Check account lockout
      if (user && user.isLocked()) {
        const remainingMins = Math.ceil((user.lockUntil.getTime() - Date.now()) / (60 * 1000));
        return res.status(423).json({
          success: false,
          error: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${remainingMins} minutes.`
        });
      }

      // 1. Authenticate via native Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (authError) {
        const errMsg = authError.message || '';
        // If Supabase reports email is not confirmed, sync admin confirmation if local profile is active
        if (errMsg.toLowerCase().includes('email not confirmed')) {
          if (user && user.id && supabase.auth?.admin?.updateUserById) {
            supabase.auth.admin.updateUserById(user.id, { email_confirm: true }).catch(() => {});
          }
        }

        // Check fallback password match in public.users if user profile exists
        let isLocalMatch = false;
        if (user) {
          isLocalMatch = await user.matchPassword(password);
        }

        if (!isLocalMatch) {
          if (user) {
            user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
            if (user.failedLoginAttempts >= MAX_FAILED_LOGINS) {
              user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
              await user.save();
              return res.status(423).json({
                success: false,
                error: 'Account locked due to 5 consecutive failed login attempts. Please try again in 15 minutes.'
              });
            }
            await user.save();
          }
          return res.status(401).json({
            success: false,
            error: 'Invalid email or password credentials',
            message: 'Invalid email or password credentials'
          });
        }

        if (!user.emailVerified && user.accountStatus !== 'ACTIVE') {
          return res.status(403).json({
            success: false,
            requireEmailConfirmation: false,
            requireOtp: false,
            email,
            error: 'Account is pending activation. Please contact support.',
            message: 'Account is pending activation. Please contact support.'
          });
        }
      }

      // If Supabase auth succeeded, retrieve or create profile in public.users
      if (!user) {
        user = await SupabaseDb.users.findOne({ email });
      }

      if (!user && authData?.user) {
        const newRoleId = generateRoleId('PATIENT');
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);
        user = await SupabaseDb.users.create({
          id: authData.user.id,
          roleId: newRoleId,
          name: authData.user.user_metadata?.name || 'User',
          email: authData.user.email,
          password: hashedPassword,
          role: authData.user.user_metadata?.role || 'PATIENT',
          emailVerified: true,
          verified: true,
          accountStatus: 'ACTIVE'
        });
      }

      if (!user) {
        return res.status(404).json({ success: false, error: 'User profile not found' });
      }

      // Ensure verified status updated
      user.emailVerified = true;
      user.verified = true;
      user.failedLoginAttempts = 0;
      user.lockUntil = undefined;
      if (user.accountStatus === 'PENDING_EMAIL_VERIFICATION') {
        if (user.role === 'PATIENT') {
          user.accountStatus = 'ACTIVE';
        } else if (user.role === 'DOCTOR') {
          user.accountStatus = user.professionalDetails?.nmcRegistrationNumber ? 'VERIFIED' : 'PENDING_DOCUMENT_REVIEW';
        } else if (user.role === 'AMBULANCE_PARTNER') {
          user.accountStatus = user.vehicleDetails?.vehicleNumber ? 'VERIFIED' : 'PENDING_DOCUMENT_REVIEW';
        } else if (user.role === 'PHARMACY') {
          user.accountStatus = user.licenseDetails?.drugLicenseNumber ? 'VERIFIED' : 'PENDING_DOCUMENT_REVIEW';
        } else {
          user.accountStatus = 'ACTIVE';
        }
      }
      if (!user.roleId) {
        user.roleId = generateRoleId(user.role);
      }
      await user.save();

      const token = generateToken(
        user._id || user.id,
        user.email,
        user.role,
        user.name,
        user.roleId
      );

      res.cookie('token', token, getCookieOptions());

      return res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        token,
        supabaseAccessToken: authData?.session?.access_token || undefined,
        user: user.toAuthJSON ? user.toAuthJSON() : user
      });
    } else if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email });
      if (!user) {
        // Enumeration protection: return generic error
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password credentials',
          message: 'Invalid email or password credentials'
        });
      }

      // Check Brute-Force Lockout
      if (user.isLocked()) {
        const remainingMins = Math.ceil((user.lockUntil.getTime() - Date.now()) / (60 * 1000));
        return res.status(423).json({
          success: false,
          error: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${remainingMins} minutes.`
        });
      }

      isMatch = await user.matchPassword(password);

      if (!isMatch) {
        // Increment failed attempt counter & check lock threshold
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
        if (user.failedLoginAttempts >= MAX_FAILED_LOGINS) {
          user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
          await user.save();
          return res.status(423).json({
            success: false,
            error: 'Account locked due to 5 consecutive failed login attempts. Please try again in 15 minutes.'
          });
        }
        await user.save();
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password credentials',
          message: 'Invalid email or password credentials'
        });
      }

      // Reset failed attempts on password success
      user.failedLoginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();

    } else {
      user = inMemoryUsers.find((u) => u.email === email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password credentials',
          message: 'Invalid email or password credentials'
        });
      }
      isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password credentials',
          message: 'Invalid email or password credentials'
        });
      }
    }

    // Check account activation
    if (!user.emailVerified && user.accountStatus !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        requireOtp: false,
        requireEmailConfirmation: false,
        email: user.email,
        error: 'Account is pending activation. Please contact support.',
        message: 'Account is pending activation. Please contact support.'
      });
    }

    if (!user.roleId) {
      user.roleId = generateRoleId(user.role);
      if (isSupabaseConfigured() || mongoose.connection.readyState === 1) await user.save();
    }

    const token = generateToken(
      user._id || user.id,
      user.email,
      user.role,
      user.name,
      user.roleId
    );

    res.cookie('token', token, getCookieOptions());

    const userAuthData = user.toAuthJSON ? user.toAuthJSON() : {
      id: user.id || user._id,
      roleId: user.roleId,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: true,
      verified: true,
      accountStatus: user.accountStatus,
      avatarUrl: user.avatarUrl || user.professionalDetails?.avatarUrl || user.usage?.avatarUrl || '',
      createdAt: user.createdAt || user.created_at,
      updatedAt: user.updatedAt || user.updated_at
    };

    return res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      token,
      user: userAuthData
    });
  } catch (error) {
    console.error('[Backend Auth Login Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server authentication error'
    });
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Public / Private
const logoutUser = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  return res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    const userData = req.user.toAuthJSON ? req.user.toAuthJSON() : {
      id: req.user.id || req.user._id,
      roleId: req.user.roleId,
      name: req.user.name,
      age: req.user.age,
      email: req.user.email,
      role: req.user.role,
      emailVerified: req.user.emailVerified,
      verified: req.user.verified,
      accountStatus: req.user.accountStatus,
      avatarUrl: req.user.avatarUrl || req.user.professionalDetails?.avatarUrl || req.user.usage?.avatarUrl || '',
      createdAt: req.user.createdAt || req.user.created_at,
      updatedAt: req.user.updatedAt || req.user.updated_at
    };

    return res.json({
      success: true,
      user: userData
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Error fetching user profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const validationResult = updateProfileSchema.safeParse(req.body);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]?.message || 'Invalid profile update data';
      return res.status(400).json({
        success: false,
        error: firstError,
        message: firstError
      });
    }

    const { name, age, email } = validationResult.data;

    if (isSupabaseConfigured()) {
      const user = await SupabaseDb.users.findById(req.user.id || req.user._id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      if (name) user.name = name;
      if (age !== undefined) user.age = age;
      if (email) user.email = email;

      await user.save();

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: user.toAuthJSON()
      });
    } else if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      if (name) user.name = name;
      if (age !== undefined) user.age = age;
      if (email) user.email = email;

      await user.save();

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: user.toAuthJSON()
      });
    } else {
      const userIndex = inMemoryUsers.findIndex((u) => u.id === req.user.id);
      if (userIndex !== -1) {
        if (name) inMemoryUsers[userIndex].name = name;
        if (age !== undefined) inMemoryUsers[userIndex].age = age;
        if (email) inMemoryUsers[userIndex].email = email;
      }
      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          ...req.user,
          name: name || req.user.name,
          age: age !== undefined ? age : req.user.age,
          email: email || req.user.email
        }
      });
    }
  } catch (error) {
    console.error('[Update Profile Error]:', error);
    return res.status(500).json({ success: false, error: error.message || 'Server error updating profile' });
  }
};

// @desc    Upload / Update profile photo in Supabase Storage
// @route   POST /api/auth/profile-photo
// @access  Private
const uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { image, mimeType } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, error: 'Image data is required' });
    }

    let base64Data = image;
    let detectedMime = mimeType;
    if (typeof image === 'string' && image.startsWith('data:')) {
      const match = image.match(/^data:([a-zA-Z0-9\/+-]+);base64,(.+)$/);
      if (match) {
        detectedMime = match[1];
        base64Data = match[2];
      }
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!detectedMime || !allowedMimeTypes.includes(detectedMime.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image format. Allowed formats: JPG, JPEG, PNG, WEBP.'
      });
    }

    const buffer = Buffer.from(base64Data, 'base64');
    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (buffer.length > maxSize) {
      return res.status(400).json({
        success: false,
        error: 'Image size exceeds maximum limit of 5MB.'
      });
    }

    let ext = 'jpg';
    if (detectedMime.includes('png')) ext = 'png';
    else if (detectedMime.includes('webp')) ext = 'webp';
    else if (detectedMime.includes('jpeg') || detectedMime.includes('jpg')) ext = 'jpg';

    // User-scoped file path inside profile-photos bucket: `${userId}/avatar.${ext}`
    const fileName = `avatar.${ext}`;
    const filePath = `${userId}/${fileName}`;

    const client = getSupabase();
    let publicUrl = '';

    if (client) {
      const uploadRes = await client.storage.from('profile-photos').upload(filePath, buffer, {
        contentType: detectedMime,
        upsert: true
      });

      if (uploadRes.error) {
        console.error('[Supabase Storage Upload Error]:', uploadRes.error);
        return res.status(500).json({
          success: false,
          error: `Storage upload failed: ${uploadRes.error.message}`
        });
      }

      const { data: urlData } = client.storage.from('profile-photos').getPublicUrl(filePath);
      // Append cache-busting timestamp so browser reloads fresh avatar immediately
      publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    } else {
      publicUrl = `data:${detectedMime};base64,${base64Data}`;
    }

    // Persist in database
    if (isSupabaseConfigured()) {
      const user = await SupabaseDb.users.findById(userId);
      if (user) {
        user.avatarUrl = publicUrl;
        user.professionalDetails = { ...(user.professionalDetails || {}), avatarUrl: publicUrl, avatarPath: filePath };
        user.usage = { ...(user.usage || {}), avatarUrl: publicUrl, avatarPath: filePath };
        await user.save();
      }

      const healthIdRecord = await SupabaseDb.healthIds.findOne({ userId });
      if (healthIdRecord) {
        healthIdRecord.healthProfile = { ...(healthIdRecord.healthProfile || {}), avatarUrl: publicUrl };
        const hClient = getSupabase();
        if (hClient) {
          await hClient
            .from('health_ids')
            .update({ health_profile: healthIdRecord.healthProfile, updated_at: new Date().toISOString() })
            .eq('user_id', String(userId));
        }
      }
    } else if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(userId)) {
      await User.findByIdAndUpdate(userId, {
        avatarUrl: publicUrl,
        'professionalDetails.avatarUrl': publicUrl
      });
    } else {
      const memUser = inMemoryUsers.find((u) => u.id === userId || u._id === userId);
      if (memUser) {
        memUser.avatarUrl = publicUrl;
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully',
      avatarUrl: publicUrl,
      path: filePath
    });
  } catch (error) {
    console.error('[Upload Profile Photo Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error processing profile photo'
    });
  }
};

// @desc    Remove profile photo from Supabase Storage & user profile
// @route   DELETE /api/auth/profile-photo
// @access  Private
const removeProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const client = getSupabase();
    if (client) {
      const { data: files } = await client.storage.from('profile-photos').list(userId);
      if (files && files.length > 0) {
        const filePaths = files.map((f) => `${userId}/${f.name}`);
        await client.storage.from('profile-photos').remove(filePaths);
      }
    }

    if (isSupabaseConfigured()) {
      const user = await SupabaseDb.users.findById(userId);
      if (user) {
        user.avatarUrl = '';
        if (user.professionalDetails) delete user.professionalDetails.avatarUrl;
        if (user.usage) delete user.usage.avatarUrl;
        await user.save();
      }

      const healthIdRecord = await SupabaseDb.healthIds.findOne({ userId });
      if (healthIdRecord && healthIdRecord.healthProfile) {
        delete healthIdRecord.healthProfile.avatarUrl;
        const hClient = getSupabase();
        if (hClient) {
          await hClient
            .from('health_ids')
            .update({ health_profile: healthIdRecord.healthProfile, updated_at: new Date().toISOString() })
            .eq('user_id', String(userId));
        }
      }
    } else if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(userId)) {
      await User.findByIdAndUpdate(userId, {
        avatarUrl: '',
        $unset: { 'professionalDetails.avatarUrl': 1 }
      });
    } else {
      const memUser = inMemoryUsers.find((u) => u.id === userId || u._id === userId);
      if (memUser) {
        memUser.avatarUrl = '';
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Profile photo removed successfully'
    });
  } catch (error) {
    console.error('[Remove Profile Photo Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error removing profile photo'
    });
  }
};

module.exports = {
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
};
