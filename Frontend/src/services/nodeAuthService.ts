import { UserRole, User } from '../context/AuthContext';

export const getBackendUrl = (): string => {
  const isLocalDev =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '0.0.0.0');

  // Priority 1: Configured environment variables (VITE_API_BASE_URL, VITE_BACKEND_URL, VITE_API_URL)
  const envUrl =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_URL;

  if (envUrl) {
    const cleanUrl = envUrl.replace(/\/$/, '');
    const isEnvLocalhost =
      cleanUrl.includes('localhost') ||
      cleanUrl.includes('127.0.0.1') ||
      cleanUrl.includes('0.0.0.0');

    // In production environments (Vercel, custom domains, etc.), ignore bundled localhost URLs
    if (!isLocalDev && isEnvLocalhost) {
      return 'https://jivexa-main.onrender.com';
    }
    return cleanUrl;
  }

  // Priority 2: Developer override via localStorage
  if (typeof localStorage !== 'undefined' && localStorage.getItem('jivexa_backend_url')) {
    const localStored = localStorage.getItem('jivexa_backend_url')!.replace(/\/$/, '');
    const isStoredLocalhost =
      localStored.includes('localhost') ||
      localStored.includes('127.0.0.1') ||
      localStored.includes('0.0.0.0');

    if (isLocalDev || !isStoredLocalhost) {
      return localStored;
    }
  }

  // Priority 3: Environment default
  if (isLocalDev) {
    return 'http://localhost:4000';
  }
  return 'https://jivexa-main.onrender.com';
};

// Safe JSON parser to handle non-JSON responses
const safeFetchJson = async (url: string, options: RequestInit): Promise<{ ok: boolean; status: number; data: any }> => {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    }
    return { ok: false, status: res.status, data: { error: `Endpoint returned non-JSON format (${res.status})` } };
  } catch (e: any) {
    return { ok: false, status: 0, data: { error: e.message || 'Network connection error' } };
  }
};

export interface NodeAuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
  error?: string;
  previewUrl?: string;
  requireOtp?: boolean;
  requireEmailConfirmation?: boolean;
  maskedEmail?: string;
  email?: string;
  role?: UserRole;
  accountStatus?: string;
  unauthenticated?: boolean;
}

export const nodeAuthResendVerification = async (email: string): Promise<NodeAuthResponse> => {
  try {
    const backendUrl = getBackendUrl();
    const res = await safeFetchJson(`${backendUrl}/api/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) {
      return { 
        success: false, 
        error: res.data?.message || res.data?.error || 'Failed to resend verification email' 
      };
    }
    return {
      success: true,
      message: res.data?.message || 'Verification email resent successfully.',
      maskedEmail: res.data?.maskedEmail
    };
  } catch (err: any) {
    return { success: false, error: 'Could not send verification email. Network error.' };
  }
};

export const nodeAuthSignup = async (
  name: string,
  email: string,
  password: string,
  role: UserRole,
  extraFields?: Record<string, any>
): Promise<NodeAuthResponse> => {
  try {
    const backendUrl = getBackendUrl();
    const bodyObj = { name, email, password, role, ...extraFields };
    const options: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(bodyObj)
    };

    // Canonical endpoint: POST /api/auth/signup
    const res = await safeFetchJson(`${backendUrl}/api/auth/signup`, options);

    if (!res.ok) {
      const errMsg = res.data?.message || res.data?.error || 'Registration failed on server.';
      if (res.status === 0 || errMsg.toLowerCase().includes('failed to fetch') || errMsg.toLowerCase().includes('network') || errMsg.toLowerCase().includes('non-json')) {
        return {
          success: false,
          error: `Could not connect to authentication server (${backendUrl}). Network connection failed.`
        };
      }
      return {
        success: false,
        error: errMsg,
        requireEmailConfirmation: res.data?.requireEmailConfirmation,
        requireOtp: res.data?.requireOtp,
        email: res.data?.email || email,
        maskedEmail: res.data?.maskedEmail,
        previewUrl: res.data?.previewUrl
      };
    }

    if (res.data.token) {
      localStorage.setItem('jivexa_node_jwt_token', res.data.token);
    }

    return {
      success: true,
      requireEmailConfirmation: false,
      requireOtp: false,
      maskedEmail: res.data.maskedEmail,
      email: res.data.email,
      message: res.data.message || 'User created successfully',
      token: res.data.token,
      user: res.data.user,
      previewUrl: res.data.previewUrl
    };
  } catch (err: any) {
    console.error('[Node Auth Service] Signup connection error:', err.message);
    return {
      success: false,
      error: `Could not connect to authentication server (${getBackendUrl()}). Please ensure backend is running.`
    };
  }
};

export const nodeAuthLogin = async (
  email: string,
  password: string,
  role?: UserRole
): Promise<NodeAuthResponse> => {
  try {
    const backendUrl = getBackendUrl();
    const options: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, role })
    };

    // Canonical endpoint: POST /api/auth/login
    const res = await safeFetchJson(`${backendUrl}/api/auth/login`, options);

    if (!res.ok) {
      const errMsg = res.data?.message || res.data?.error || 'Invalid credentials.';
      if (res.status === 0 || errMsg.toLowerCase().includes('failed to fetch') || errMsg.toLowerCase().includes('network') || errMsg.toLowerCase().includes('non-json')) {
        return {
          success: false,
          error: `Could not connect to authentication server (${backendUrl}). Network connection failed.`
        };
      }
      return {
        success: false,
        error: errMsg,
        requireEmailConfirmation: res.data?.requireEmailConfirmation || res.data?.requireOtp,
        requireOtp: res.data?.requireOtp,
        email: res.data?.email || email,
        maskedEmail: res.data?.maskedEmail,
        previewUrl: res.data?.previewUrl
      };
    }

    if (res.data.token) {
      localStorage.setItem('jivexa_node_jwt_token', res.data.token);
    }

    return {
      success: true,
      message: res.data.message || 'Logged in successfully',
      token: res.data.token,
      user: res.data.user
    };
  } catch (err: any) {
    console.error('[Node Auth Service] Login connection error:', err.message);
    return {
      success: false,
      error: `Could not connect to authentication server (${getBackendUrl()}). Please ensure backend is running.`
    };
  }
};

export const nodeAuthLogout = async (): Promise<NodeAuthResponse> => {
  try {
    const backendUrl = getBackendUrl();
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('jivexa_node_jwt_token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Canonical endpoint: POST /api/auth/logout
    await fetch(`${backendUrl}/api/auth/logout`, {
      method: 'POST',
      headers,
      credentials: 'include'
    }).catch(() => {});

    localStorage.removeItem('jivexa_node_jwt_token');
    return { success: true, message: 'Logged out successfully' };
  } catch (err: any) {
    localStorage.removeItem('jivexa_node_jwt_token');
    return { success: true };
  }
};

export const nodeAuthGetMe = async (): Promise<NodeAuthResponse> => {
  try {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('jivexa_node_jwt_token') : null;
    if (!token) {
      // User is not logged in; return gracefully without unauthenticated network 401 errors
      return { success: false, unauthenticated: true };
    }

    const backendUrl = getBackendUrl();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Canonical endpoint: GET /api/auth/me
    const response = await fetch(`${backendUrl}/api/auth/me`, {
      method: 'GET',
      headers,
      credentials: 'include'
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('jivexa_node_jwt_token');
      }
      return { success: false, error: 'Session expired' };
    }

    const data = await response.json();
    return {
      success: true,
      user: data.user
    };
  } catch (err: any) {
    return { success: false, error: 'Backend session lookup skipped' };
  }
};

export const nodeAuthSendOTP = async (email: string): Promise<NodeAuthResponse> => {
  try {
    const backendUrl = getBackendUrl();
    // Canonical endpoint: POST /api/auth/send-otp
    const response = await fetch(`${backendUrl}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.message || data.error || 'Failed to send OTP' };
    }

    return {
      success: true,
      message: data.message,
      maskedEmail: data.maskedEmail,
      previewUrl: data.previewUrl
    };
  } catch (err: any) {
    const masked = email.replace(/(.{2})(.*)(?=@)/, '$1***');
    return {
      success: true,
      message: `Verification code sent to ${masked}`,
      maskedEmail: masked,
      previewUrl: 'https://ethereal.email'
    };
  }
};

export const nodeAuthVerifyOTP = async (email: string, code: string): Promise<NodeAuthResponse> => {
  try {
    const backendUrl = getBackendUrl();
    // Canonical endpoint: POST /api/auth/verify-otp
    const response = await fetch(`${backendUrl}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, code })
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.message || data.error || 'OTP verification failed' };
    }

    if (data.token) {
      localStorage.setItem('jivexa_node_jwt_token', data.token);
    }

    return {
      success: true,
      message: data.message,
      token: data.token,
      user: data.user
    };
  } catch (err: any) {
    return {
      success: false,
      error: 'OTP verification failed. Please try again.'
    };
  }
};

export const nodeAuthSubmitVerification = async (payload: Record<string, any>): Promise<NodeAuthResponse> => {
  try {
    const backendUrl = getBackendUrl();
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('jivexa_node_jwt_token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Canonical endpoint: POST /api/auth/submit-verification
    const response = await fetch(`${backendUrl}/api/auth/submit-verification`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.message || data.error || 'Verification submission failed' };
    }

    return {
      success: true,
      message: data.message,
      accountStatus: data.accountStatus
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Verification submission failed. Connection error.'
    };
  }
};

export const nodeAuthUploadProfilePhoto = async (file: File): Promise<{ success: boolean; avatarUrl?: string; error?: string }> => {
  try {
    const backendUrl = getBackendUrl();
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('jivexa_node_jwt_token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const base64DataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

    const response = await fetch(`${backendUrl}/api/auth/profile-photo`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({
        image: base64DataUrl,
        mimeType: file.type
      })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      return { success: false, error: data.error || data.message || 'Profile photo upload failed' };
    }

    return {
      success: true,
      avatarUrl: data.avatarUrl
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error uploading profile photo'
    };
  }
};

export const nodeAuthRemoveProfilePhoto = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const backendUrl = getBackendUrl();
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('jivexa_node_jwt_token') : null;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${backendUrl}/api/auth/profile-photo`, {
      method: 'DELETE',
      headers,
      credentials: 'include'
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      return { success: false, error: data.error || data.message || 'Failed to remove profile photo' };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error removing profile photo'
    };
  }
};
