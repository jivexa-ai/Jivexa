import { getBackendUrl } from './nodeAuthService';
import { Appointment, Prescription, Medication } from '../context/HealthDataContext';

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

// Safe JSON fetch wrapper
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

// ==========================================
// 1. APPOINTMENT API CLIENT
// ==========================================

export const createAppointmentApi = async (data: {
  doctorId: string;
  doctorName?: string;
  doctorSpecialty?: string;
  date: string;
  time: string;
  consultationType?: 'Video' | 'In-Person' | 'Both';
  notes?: string;
}): Promise<{ success: boolean; appointment?: Appointment; error?: string }> => {
  try {
    const backendUrl = getBackendUrl();
    const res = await fetchJson(`${backendUrl}/api/appointments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      return { success: false, error: res.data?.error || 'Failed to book appointment' };
    }

    return { success: true, appointment: res.data.appointment };
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection error' };
  }
};

export const getAppointmentsApi = async (): Promise<{ success: boolean; appointments?: Appointment[]; error?: string }> => {
  try {
    const backendUrl = getBackendUrl();
    const res = await fetchJson(`${backendUrl}/api/appointments`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!res.ok) {
      return { success: false, error: res.data?.error || 'Failed to fetch appointments' };
    }

    return { success: true, appointments: res.data.appointments || [] };
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection error' };
  }
};

export const updateAppointmentApi = async (
  id: string,
  updates: Partial<Appointment>
): Promise<{ success: boolean; appointment?: Appointment; error?: string }> => {
  try {
    const backendUrl = getBackendUrl();
    const res = await fetchJson(`${backendUrl}/api/appointments/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(updates)
    });

    if (!res.ok) {
      return { success: false, error: res.data?.error || 'Failed to update appointment' };
    }

    return { success: true, appointment: res.data.appointment };
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection error' };
  }
};

export const cancelAppointmentApi = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const backendUrl = getBackendUrl();
    const res = await fetchJson(`${backendUrl}/api/appointments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!res.ok) {
      return { success: false, error: res.data?.error || 'Failed to cancel appointment' };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection error' };
  }
};

// ==========================================
// 2. PRESCRIPTION API CLIENT
// ==========================================

export const createPrescriptionApi = async (data: {
  patientId: string;
  patientName?: string;
  appointmentId?: string;
  date?: string;
  medications: Medication[];
  notes?: string;
  status?: Prescription['status'];
  followUpDate?: string;
}): Promise<{ success: boolean; prescription?: Prescription; error?: string }> => {
  try {
    const backendUrl = getBackendUrl();
    const res = await fetchJson(`${backendUrl}/api/prescriptions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      return { success: false, error: res.data?.error || 'Failed to create prescription' };
    }

    return { success: true, prescription: res.data.prescription };
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection error' };
  }
};

export const getPrescriptionsApi = async (
  patientId?: string
): Promise<{ success: boolean; prescriptions?: Prescription[]; error?: string }> => {
  try {
    const backendUrl = getBackendUrl();
    const query = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
    const res = await fetchJson(`${backendUrl}/api/prescriptions${query}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!res.ok) {
      return { success: false, error: res.data?.error || 'Failed to fetch prescriptions' };
    }

    return { success: true, prescriptions: res.data.prescriptions || [] };
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection error' };
  }
};

export const updatePrescriptionApi = async (
  id: string,
  updates: Partial<Prescription>
): Promise<{ success: boolean; prescription?: Prescription; error?: string }> => {
  try {
    const backendUrl = getBackendUrl();
    const res = await fetchJson(`${backendUrl}/api/prescriptions/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(updates)
    });

    if (!res.ok) {
      return { success: false, error: res.data?.error || 'Failed to update prescription' };
    }

    return { success: true, prescription: res.data.prescription };
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection error' };
  }
};
