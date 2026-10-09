const { createClient } = require('@supabase/supabase-js');

let supabaseClient = null;

const isPlaceholder = (val) => {
  if (!val) return true;
  const v = val.trim().toLowerCase();
  return (
    v.startsWith('<') ||
    v.endsWith('>') ||
    v.includes('placeholder') ||
    v.includes('your_') ||
    v === 'undefined' ||
    v === 'null'
  );
};

const isSupabaseConfigured = () => {
  const url = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.trim() : '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.trim() : '';
  return Boolean(url && key && !isPlaceholder(url) && !isPlaceholder(key));
};

const getSupabase = () => {
  if (supabaseClient) return supabaseClient;

  const url = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.trim() : '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.trim() : '';

  if (!url || !key || isPlaceholder(url) || isPlaceholder(key)) {
    return null;
  }

  supabaseClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  return supabaseClient;
};

const checkSupabaseHealth = async () => {
  if (!isSupabaseConfigured()) {
    return {
      configured: false,
      connected: false,
      message: 'Supabase credentials not configured or contain placeholders in .env'
    };
  }

  try {
    const client = getSupabase();
    if (!client) {
      return { configured: true, connected: false, message: 'Failed to initialize Supabase client' };
    }

    // Ping users table
    const { data, error } = await client.from('users').select('id').limit(1);
    if (error) {
      // 42501 means TLS handshake & API key authentication succeeded, but PostgreSQL table grant is needed
      if (error.code === '42501') {
        return {
          configured: true,
          connected: true,
          tablePermission: 'PENDING_GRANT',
          error: error.message,
          code: error.code,
          hint: error.hint || 'Run GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role; in Supabase SQL Editor'
        };
      }
      return {
        configured: true,
        connected: false,
        error: error.message,
        code: error.code
      };
    }

    const authStatus = await checkSupabaseAuthHealth();

    return {
      configured: true,
      connected: true,
      tablePermission: 'GRANTED',
      auth: authStatus,
      message: 'Supabase PostgreSQL and Auth connected successfully'
    };
  } catch (err) {
    return {
      configured: true,
      connected: false,
      error: err.message
    };
  }
};

const checkSupabaseAuthHealth = async () => {
  if (!isSupabaseConfigured()) {
    return { configured: false, active: false };
  }
  try {
    const client = getSupabase();
    if (!client) return { configured: true, active: false, message: 'Client unavailable' };
    const { error } = await client.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (error) {
      return { configured: true, active: false, error: error.message };
    }
    return { configured: true, active: true, provider: 'Supabase Auth Email Service' };
  } catch (e) {
    return { configured: true, active: false, error: e.message };
  }
};

module.exports = {
  getSupabase,
  isSupabaseConfigured,
  checkSupabaseHealth,
  checkSupabaseAuthHealth
};
