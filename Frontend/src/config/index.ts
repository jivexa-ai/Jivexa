/**
 * Application Runtime Configuration
 */

import { getBackendUrl } from '../services/nodeAuthService';

export const CONFIG = {
  get apiBaseUrl(): string {
    return getBackendUrl();
  },
  patientMvpOnly: import.meta.env.VITE_PATIENT_MVP_ONLY === 'true' || import.meta.env.VITE_PATIENT_MVP_ONLY === true || true,
};

export const isPatientMvpOnly = (): boolean => {
  if (typeof window !== 'undefined' && window.location.search.includes('mvp_bypass=true')) {
    return false; // internal bypass for developer/admin testing if needed
  }
  const flag = import.meta.env.VITE_PATIENT_MVP_ONLY;
  if (flag !== undefined) {
    return flag === 'true' || flag === true;
  }
  return true;
};
