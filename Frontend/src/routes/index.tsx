/**
 * Application Route Definitions
 */

export const ROUTES = {
  PUBLIC: {
    HOME: '/',
    ABOUT: '/about',
    HOW_IT_WORKS: '/how-it-works',
    FOR_DOCTORS: '/for-doctors',
    FOR_PHARMACIES: '/for-pharmacies',
    RESOURCES: '/resources',
    FAQ: '/faq',
    CONTACT: '/contact',
    PRIVACY: '/privacy',
    TERMS: '/terms',
    DISCLAIMER: '/disclaimer',
  },
  AUTH: {
    LOGIN: '/login',
    SIGNUP: '/signup',
    VERIFY: '/verify',
    FORGOT_PASSWORD: '/forgot-password',
  },
  PATIENT: {
    DASHBOARD: '/patient/dashboard',
    AI_ASSISTANT: '/patient/ai-assistant',
    AI_REPORT_ANALYZER: '/patient/ai-report-analyzer',
    APPOINTMENTS: '/patient/appointments',
    DOCTORS: '/patient/doctors',
    HEALTH_RECORDS: '/patient/health-records',
    TIMELINE: '/patient/timeline',
    MEDICINES: '/patient/medicines',
    PROFILE: '/patient/profile',
    SETTINGS: '/patient/settings',
  },
  DOCTOR: {
    DASHBOARD: '/doctor/dashboard',
    CONSULTATION: '/doctor/consultation/:appointmentId',
    SETTINGS: '/doctor/settings',
  },
  PHARMACY: {
    DASHBOARD: '/pharmacy/dashboard',
    SETTINGS: '/pharmacy/settings',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
  },
} as const;
