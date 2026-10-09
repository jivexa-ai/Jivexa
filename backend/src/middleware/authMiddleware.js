const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { SupabaseDb, isSupabaseConfigured } = require('../services/supabaseDbService');
const { getSupabase } = require('../config/supabase');

const protect = async (req, res, next) => {
  let token;

  // 1. Check for token in Cookies (from httpOnly cookie)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Check for token in Authorization Header (Bearer token format)
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Please login first to access this resource',
      error: 'Not authorized, no token provided'
    });
  }

  try {
    const secretKey = process.env.JWT_SECRET || 'jivexa_health_jwt_secret_key_2026_super_secure_auth_token_string';
    let decoded = null;

    try {
      decoded = jwt.verify(token, secretKey);
    } catch (jwtErr) {
      // If application JWT verification fails, check Supabase Auth access token
      if (isSupabaseConfigured()) {
        const client = getSupabase();
        if (client) {
          const { data: { user: authUser }, error } = await client.auth.getUser(token);
          if (authUser && !error) {
            decoded = { id: authUser.id, email: authUser.email };
          }
        }
      }
      if (!decoded) throw jwtErr;
    }

    if (isSupabaseConfigured()) {
      let user = await SupabaseDb.users.findById(decoded.id);
      if (!user && decoded.email) {
        user = await SupabaseDb.users.findOne({ email: decoded.email });
      }
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User associated with this token no longer exists'
        });
      }
      req.user = user;
    } else if (mongoose.connection.readyState === 1) {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User associated with this token no longer exists'
        });
      }
      req.user = user;
    } else {
      // Memory Store Fallback
      req.user = {
        id: decoded.id,
        _id: decoded.id,
        name: decoded.name || 'Memory User',
        email: decoded.email,
        role: decoded.role || 'PATIENT',
        verified: true,
        usage: { tokenUsed: 0, tokenLimit: 10000 }
      };
    }

    next();
  } catch (error) {
    console.error('[Auth Middleware Verification Error]:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Authentication session expired or invalid. Please login again.',
      error: error.message
    });
  }
};

// Role authorization guard
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'Guest'}' is not authorized to perform this action`
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
