import { getBackendUrl } from './nodeAuthService';
import { AmbulanceBooking } from '../context/HealthDataContext';

const getAuthHeaders = (): Record<string, string> => {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('jivexa_node_jwt_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const fetchJson = async (url: string, options: RequestInit): Promise<{ ok: boolean; status: number; data: any }> => {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    }
    return { ok: false, status: res.status, data: { error: `Non-JSON response (${res.status})` } };
  } catch (err: any) {
    return { ok: false, status: 0, data: { error: err.message || 'Network connection failed' } };
  }
};

export const createAmbulanceRequestApi = async (data: {
  ambulanceType: 'Basic' | 'Oxygen' | 'ICU' | 'ALS';
  pickupAddress: string;
  destinationAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  destLat?: number;
  destLng?: number;
  emergencyType?: string;
  fare?: number;
  jivexaHealthId?: string;
  ambulanceId?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
}): Promise<{ success: boolean; booking?: AmbulanceBooking; error?: string }> => {
  try {
    const backendUrl = getBackendUrl();
    const res = await fetchJson(`${backendUrl}/api/ambulance/requests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      return { success: false, error: res.data?.error || 'Failed to dispatch ambulance' };
    }

    return { success: true, booking: res.data.booking || res.data.request };
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection error' };
  }
};

export const getAmbulanceRequestsApi = async (): Promise<{ success: boolean; requests?: AmbulanceBooking[]; bookings?: AmbulanceBooking[]; error?: string }> => {
  try {
    const backendUrl = getBackendUrl();
    const res = await fetchJson(`${backendUrl}/api/ambulance/requests`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!res.ok) {
      return { success: false, error: res.data?.error || 'Failed to fetch ambulance requests' };
    }

    const bookings = res.data.bookings || res.data.requests || [];
    return { success: true, requests: bookings, bookings };
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection error' };
  }
};

export const updateAmbulanceRequestApi = async (
  id: string,
  updates: Partial<AmbulanceBooking>
): Promise<{ success: boolean; booking?: AmbulanceBooking; error?: string }> => {
  try {
    const backendUrl = getBackendUrl();
    const res = await fetchJson(`${backendUrl}/api/ambulance/requests/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(updates)
    });

    if (!res.ok) {
      return { success: false, error: res.data?.error || 'Failed to update ambulance request' };
    }

    return { success: true, booking: res.data.booking || res.data.request };
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection error' };
  }
};
