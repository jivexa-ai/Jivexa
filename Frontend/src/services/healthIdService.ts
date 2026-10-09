import { getBackendUrl } from './nodeAuthService';

const getBackendUrls = (): string[] => {
  const primaryUrl = getBackendUrl();
  const urls: string[] = [primaryUrl];

  if (typeof localStorage !== 'undefined' && localStorage.getItem('jivexa_backend_url')) {
    const local = localStorage.getItem('jivexa_backend_url')!.replace(/\/$/, '');
    if (!urls.includes(local)) urls.push(local);
  }

  const isLocalDev =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '0.0.0.0');

  const defaults = isLocalDev
    ? ['http://localhost:4000', 'http://127.0.0.1:4000', 'https://jivexa-main.onrender.com']
    : ['https://jivexa-main.onrender.com'];

  for (const d of defaults) {
    if (!urls.includes(d)) {
      urls.push(d);
    }
  }

  return urls;
};

const fetchWithFallback = async (path: string, options: RequestInit): Promise<Response> => {
  const urls = getBackendUrls();
  let lastError: any = null;
  for (const baseUrl of urls) {
    try {
      const res = await fetch(`${baseUrl}${path}`, options);
      // If we got an HTTP response (even 404), the server is connected
      return res;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('Failed to connect to backend server');
};

export interface HealthIdPatientProfile {
  name: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  email?: string;
  phoneNumber?: string;
  emergencyContact?: any;
  address?: string;
  healthProfile?: any;
  createdAt?: string;
}

export interface HealthIdResponse {
  success: boolean;
  message?: string;
  healthId?: string;
  patient?: HealthIdPatientProfile;
  verificationStatus?: string;
  error?: string;
}

// 1. Create a new unique Digital Health ID in MongoDB
export const createHealthIdApi = async (data?: {
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  phoneNumber?: string;
  emergencyContact?: any;
  address?: string;
}): Promise<HealthIdResponse> => {
  try {
    const token = localStorage.getItem('jivexa_node_jwt_token');
    const response = await fetchWithFallback('/api/health-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(data || {})
    });

    const result = await response.json();
    if (!response.ok) {
      return { success: false, message: result.message || result.error || 'Failed to create Health ID' };
    }

    return {
      success: true,
      healthId: result.healthId,
      patient: result.patient,
      message: result.message
    };
  } catch (err: any) {
    console.warn('[Health ID Service] Create API error:', err.message);
    return { success: false, message: 'Backend server connection error' };
  }
};

// 2. Fetch authenticated patient's Health ID from MongoDB
export const getMyHealthIdApi = async (): Promise<HealthIdResponse> => {
  try {
    const token = localStorage.getItem('jivexa_node_jwt_token');
    if (!token) {
      return { success: false, message: 'Unauthorized, please login first' };
    }

    const response = await fetchWithFallback('/api/health-id/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();
    if (!response.ok) {
      return { success: false, message: result.message || result.error || 'Failed to fetch Health ID' };
    }

    return {
      success: true,
      healthId: result.healthId,
      patient: result.patient
    };
  } catch (err: any) {
    console.warn('[Health ID Service] Get My Health ID error:', err.message);
    return { success: false, message: 'Backend server connection error' };
  }
};

// 3. Search and verify any Health ID against MongoDB
export const searchHealthIdApi = async (
  healthIdQuery: string
): Promise<HealthIdResponse> => {
  try {
    const cleanQuery = encodeURIComponent((healthIdQuery || "").trim());

    const response = await fetchWithFallback(
      `/api/health-id/search?healthId=${cleanQuery}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message:
          result.message ||
          (response.status === 404
            ? "Health ID not found"
            : "Health ID verification failed"),
      };
    }

    return {
      success: true,
      healthId: result.healthId,
      patient: result.patient,
      verificationStatus: result.verificationStatus,
    };
  } catch (err: any) {
    console.warn(
      "[Health ID Service] Search API error:",
      err.message
    );

    return {
      success: false,
      message: "Backend server connection error",
    };
  }
};