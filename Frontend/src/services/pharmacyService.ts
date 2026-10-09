import { getBackendUrl } from './nodeAuthService';
import { Order, OrderItem } from '../context/HealthDataContext';

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

export const createPharmacyOrderApi = async (data: {
  pharmacyId: string;
  pharmacyName?: string;
  items: OrderItem[];
  totalAmount?: number;
  totalPrice?: number;
  deliveryAddress?: string;
  prescriptionId?: string;
}): Promise<{ success: boolean; order?: Order; error?: string }> => {
  try {
    const backendUrl = getBackendUrl();
    const res = await fetchJson(`${backendUrl}/api/pharmacy/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      return { success: false, error: res.data?.error || 'Failed to place pharmacy order' };
    }

    return { success: true, order: res.data.order };
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection error' };
  }
};

export const getPharmacyOrdersApi = async (): Promise<{ success: boolean; orders?: Order[]; error?: string }> => {
  try {
    const backendUrl = getBackendUrl();
    const res = await fetchJson(`${backendUrl}/api/pharmacy/orders`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!res.ok) {
      return { success: false, error: res.data?.error || 'Failed to fetch pharmacy orders' };
    }

    return { success: true, orders: res.data.orders || [] };
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection error' };
  }
};

export const updatePharmacyOrderApi = async (
  id: string,
  updates: Partial<Order>
): Promise<{ success: boolean; order?: Order; error?: string }> => {
  try {
    const backendUrl = getBackendUrl();
    const res = await fetchJson(`${backendUrl}/api/pharmacy/orders/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(updates)
    });

    if (!res.ok) {
      return { success: false, error: res.data?.error || 'Failed to update pharmacy order' };
    }

    return { success: true, order: res.data.order };
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection error' };
  }
};
