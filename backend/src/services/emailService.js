const { getSupabase, isSupabaseConfigured } = require('../config/supabase');

/**
 * Resend Email Verification via Supabase Auth Email Service
 * Replaces legacy Brevo SMTP delivery with native Supabase Auth verification.
 */
const resendVerificationEmail = async (email) => {
  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured()) {
    return { 
      success: false, 
      error: 'Supabase Auth is not configured in backend environment' 
    };
  }

  try {
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendBase.replace(/\/$/, '')}/#/login?verified=true`;

    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      console.warn('[Supabase Auth Email] Resend notice:', error.message);
      return { success: false, error: error.message };
    }

    console.log('[Supabase Auth Email] Verification email dispatched successfully via Supabase Auth.');
    return { 
      success: true, 
      message: 'Verification email dispatched successfully via Supabase Auth.' 
    };
  } catch (err) {
    console.error('[Supabase Auth Email] Error dispatching verification email:', err.message);
    return { success: false, error: err.message };
  }
};

module.exports = {
  resendVerificationEmail,
  // Alias for backward compatibility
  sendOTPEmail: resendVerificationEmail
};
