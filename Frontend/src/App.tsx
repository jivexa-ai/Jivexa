import React from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';

// Layout wrappers & Protected Route
import {
  PublicLayout,
  DashboardLayout,
  ProtectedRoute,
  SplashScreen,
} from './components/layout';

import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ComingSoonView } from './components/common/ComingSoonView';
import { isPatientMvpOnly } from './config';

// Reusable UI
import { Button } from './components/ui/Button';

// Public pages
import { Home } from './pages/public/Home';
import { HealthIdLookup } from './pages/public/HealthIdLookup';

import {
  About,
  HowItWorks,
  ForDoctors as PublicForDoctors,
  ForPharmacies as PublicForPharmacies,
  FAQ,
  Contact,
  Resources,
  PrivacyPolicy,
  Terms,
  Disclaimer,
} from './pages/public/StaticPages';

// Auth Pages
import {
  Login,
  Signup,
  Verify,
  ForgotPassword,
} from './pages/auth/AuthPages';

// Patient platform views
import { PatientDashboard } from './pages/patient/Dashboard';
import { AIAssistantChat } from './pages/patient/AIAssistant';
import { AIReportAnalyzer } from './pages/patient/AIReportAnalyzer';
import { PatientProfileEdit } from './pages/patient/Profile';
import { HealthRecordsExplorer } from './pages/patient/HealthRecords';
import { PatientAppointments } from './pages/patient/Appointments';
import { DoctorDiscovery } from './pages/patient/Doctors';
import { PatientMedicines } from './pages/patient/Medicines';
import { PatientHealthTimeline } from './pages/patient/HealthTimeline';
import { PatientSettings } from './pages/patient/Settings';
import { PatientAmbulanceBooking } from './pages/patient/AmbulanceBooking';

// Doctor platform views
import { DoctorDashboard } from './pages/doctor/Dashboard';
import { DoctorConsultation } from './pages/doctor/Consultation';
import { DoctorSettings } from './pages/doctor/DoctorSettings';

// Pharmacy platform views
import { PharmacyDashboard } from './pages/pharmacy/Dashboard';

// Ambulance Partner platform views
import { AmbulancePartnerDashboard } from './pages/partner/AmbulancePartnerDashboard';

// Admin platform views
import { AdminDashboard } from './pages/admin/Dashboard';
import { DoctorOnboardingAdmin } from './pages/admin/DoctorOnboardingAdmin';


// ============================================================
// SCROLL TO TOP
// ============================================================

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [pathname]);

  return null;
};


// ============================================================
// 404 VIEW
// ============================================================

const NotFound: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)',
        padding: '40px var(--space-md)',
        textAlign: 'center',
        gap: '16px',
      }}
    >
      <h1
        style={{
          fontSize: '4rem',
          fontWeight: 900,
          color: 'var(--primary)',
        }}
      >
        404
      </h1>

      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
        }}
      >
        Something went wrong.
      </h2>

      <p
        style={{
          color: 'var(--text-muted)',
          maxWidth: '440px',
        }}
      >
        We couldn't find the page you are looking for. It might have been
        moved, deleted, or doesn't exist.
      </p>

      <Button
        onClick={() => (window.location.href = '#/')}
        style={{ marginTop: '12px' }}
      >
        Return to Safety
      </Button>
    </div>
  );
};


// ============================================================
// APP
// ============================================================

export const App: React.FC = () => {
  const [showSplash, setShowSplash] = React.useState(() => {
    return !sessionStorage.getItem('jivexa_splash_shown');
  });

  React.useEffect(() => {
    // Normalize external auth redirects (e.g. Supabase email verification) to HashRouter path
    if (window.location.pathname.startsWith('/login') && !window.location.hash) {
      window.location.replace(`/#/login${window.location.search}`);
    }
  }, []);

  return (
    <ErrorBoundary>
      {showSplash && (
        <SplashScreen
          onComplete={() => {
            sessionStorage.setItem('jivexa_splash_shown', 'true');
            setShowSplash(false);
          }}
        />
      )}

      <Router>
        {/* Automatically scroll to top on route change */}
        <ScrollToTop />

        <Routes>

          {/* ================================================== */}
          {/* PUBLIC ROUTES */}
          {/* ================================================== */}

          <Route
            path="/"
            element={
              <PublicLayout>
                <Home />
              </PublicLayout>
            }
          />

          <Route
            path="/health-id-lookup"
            element={
              <PublicLayout>
                <HealthIdLookup />
              </PublicLayout>
            }
          />

          <Route
            path="/about"
            element={
              <PublicLayout>
                <About />
              </PublicLayout>
            }
          />

          <Route
            path="/how-it-works"
            element={
              <PublicLayout>
                <HowItWorks />
              </PublicLayout>
            }
          />

          <Route
            path="/for-doctors"
            element={
              <PublicLayout>
                {isPatientMvpOnly() ? (
                  <ComingSoonView 
                    moduleName="Doctor Care" 
                    category="doctor" 
                    customDescription="Doctor Care and practitioner onboarding are coming soon. Jivexa is currently available for Patient AI Health testing." 
                  />
                ) : (
                  <PublicForDoctors />
                )}
              </PublicLayout>
            }
          />

          <Route
            path="/for-pharmacies"
            element={
              <PublicLayout>
                {isPatientMvpOnly() ? (
                  <ComingSoonView 
                    moduleName="Pharmacy" 
                    category="pharmacy" 
                    customDescription="Pharmacy Hub and fulfillment network are coming soon. Jivexa is currently available for Patient AI Health testing." 
                  />
                ) : (
                  <PublicForPharmacies />
                )}
              </PublicLayout>
            }
          />

          <Route
            path="/faq"
            element={
              <PublicLayout>
                <FAQ />
              </PublicLayout>
            }
          />

          <Route
            path="/contact"
            element={
              <PublicLayout>
                <Contact />
              </PublicLayout>
            }
          />

          <Route
            path="/resources"
            element={
              <PublicLayout>
                <Resources />
              </PublicLayout>
            }
          />

          <Route
            path="/privacy"
            element={
              <PublicLayout>
                <PrivacyPolicy />
              </PublicLayout>
            }
          />

          <Route
            path="/terms"
            element={
              <PublicLayout>
                <Terms />
              </PublicLayout>
            }
          />

          <Route
            path="/disclaimer"
            element={
              <PublicLayout>
                <Disclaimer />
              </PublicLayout>
            }
          />


          {/* ================================================== */}
          {/* AUTH ROUTES */}
          {/* ================================================== */}

          <Route
            path="/login"
            element={
              <PublicLayout>
                <Login />
              </PublicLayout>
            }
          />

          <Route
            path="/signup"
            element={
              <PublicLayout>
                <Signup />
              </PublicLayout>
            }
          />

          <Route
            path="/verify"
            element={
              <PublicLayout>
                <Verify />
              </PublicLayout>
            }
          />

          <Route
            path="/forgot-password"
            element={
              <PublicLayout>
                <ForgotPassword />
              </PublicLayout>
            }
          />


          {/* ================================================== */}
          {/* PROTECTED PATIENT PLATFORM */}
          {/* ================================================== */}

          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <DashboardLayout>
                  <PatientDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/ai-assistant"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <DashboardLayout>
                  <AIAssistantChat />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/ai-report-analyzer"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <DashboardLayout>
                  <AIReportAnalyzer />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/profile"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <DashboardLayout>
                  <PatientProfileEdit />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/health-records"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <DashboardLayout>
                  <HealthRecordsExplorer />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/appointments"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <DashboardLayout>
                  {isPatientMvpOnly() ? (
                    <ComingSoonView 
                      moduleName="Clinical Appointments" 
                      category="doctor" 
                      customDescription="Doctor appointment booking is coming soon. Jivexa is currently available for Patient AI Health testing." 
                    />
                  ) : (
                    <PatientAppointments />
                  )}
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/doctors"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <DashboardLayout>
                  {isPatientMvpOnly() ? (
                    <ComingSoonView 
                      moduleName="Healthcare Directory" 
                      category="directory" 
                      customDescription="Healthcare Directory and Doctor Discovery are coming soon. Jivexa is currently available for Patient AI Health testing." 
                    />
                  ) : (
                    <DoctorDiscovery />
                  )}
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/medicines"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <DashboardLayout>
                  {isPatientMvpOnly() ? (
                    <ComingSoonView 
                      moduleName="Pharmacy" 
                      category="pharmacy" 
                      customDescription="Pharmacy Hub and medicine ordering are coming soon. Jivexa is currently available for Patient AI Health testing." 
                    />
                  ) : (
                    <PatientMedicines />
                  )}
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/timeline"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <DashboardLayout>
                  <PatientHealthTimeline />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/settings"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <DashboardLayout>
                  <PatientSettings />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/ambulance"
            element={
              <ProtectedRoute allowedRoles={['PATIENT']}>
                <DashboardLayout>
                  {isPatientMvpOnly() ? (
                    <ComingSoonView 
                      moduleName="Emergency Assistance" 
                      category="ambulance" 
                      customDescription="Emergency Assistance and ambulance fleet dispatch are coming soon. Jivexa is currently available for Patient AI Health testing." 
                    />
                  ) : (
                    <PatientAmbulanceBooking />
                  )}
                </DashboardLayout>
              </ProtectedRoute>
            }
          />


          {/* ================================================== */}
          {/* PROTECTED AMBULANCE PARTNER PLATFORM */}
          {/* ================================================== */}

          <Route
            path="/ambulance/dashboard"
            element={
              <ProtectedRoute allowedRoles={['AMBULANCE_PARTNER']}>
                <DashboardLayout>
                  {isPatientMvpOnly() ? (
                    <ComingSoonView moduleName="Emergency Assistance" category="ambulance" />
                  ) : (
                    <AmbulancePartnerDashboard />
                  )}
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ambulance/requests"
            element={
              <ProtectedRoute allowedRoles={['AMBULANCE_PARTNER']}>
                <DashboardLayout>
                  {isPatientMvpOnly() ? (
                    <ComingSoonView moduleName="Emergency Assistance" category="ambulance" />
                  ) : (
                    <AmbulancePartnerDashboard />
                  )}
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ambulance/active-trips"
            element={
              <ProtectedRoute allowedRoles={['AMBULANCE_PARTNER']}>
                <DashboardLayout>
                  {isPatientMvpOnly() ? (
                    <ComingSoonView moduleName="Emergency Assistance" category="ambulance" />
                  ) : (
                    <AmbulancePartnerDashboard />
                  )}
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ambulance/history"
            element={
              <ProtectedRoute allowedRoles={['AMBULANCE_PARTNER']}>
                <DashboardLayout>
                  {isPatientMvpOnly() ? (
                    <ComingSoonView moduleName="Emergency Assistance" category="ambulance" />
                  ) : (
                    <AmbulancePartnerDashboard />
                  )}
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ambulance/driver-profile"
            element={
              <ProtectedRoute allowedRoles={['AMBULANCE_PARTNER']}>
                <DashboardLayout>
                  {isPatientMvpOnly() ? (
                    <ComingSoonView moduleName="Emergency Assistance" category="ambulance" />
                  ) : (
                    <AmbulancePartnerDashboard />
                  )}
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ambulance/vehicle-details"
            element={
              <ProtectedRoute allowedRoles={['AMBULANCE_PARTNER']}>
                <DashboardLayout>
                  {isPatientMvpOnly() ? (
                    <ComingSoonView moduleName="Emergency Assistance" category="ambulance" />
                  ) : (
                    <AmbulancePartnerDashboard />
                  )}
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/ambulance/settings"
            element={
              <ProtectedRoute allowedRoles={['AMBULANCE_PARTNER']}>
                <DashboardLayout>
                  {isPatientMvpOnly() ? (
                    <ComingSoonView moduleName="Emergency Assistance" category="ambulance" />
                  ) : (
                    <AmbulancePartnerDashboard />
                  )}
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/partner/ambulance"
            element={
              <ProtectedRoute allowedRoles={['AMBULANCE_PARTNER']}>
                <DashboardLayout>
                  {isPatientMvpOnly() ? (
                    <ComingSoonView moduleName="Emergency Assistance" category="ambulance" />
                  ) : (
                    <AmbulancePartnerDashboard />
                  )}
                </DashboardLayout>
              </ProtectedRoute>
            }
          />


          {/* ================================================== */}
          {/* PROTECTED DOCTOR PLATFORM */}
          {/* ================================================== */}

          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DashboardLayout>
                  {isPatientMvpOnly() ? (
                    <ComingSoonView moduleName="Doctor Care" category="doctor" />
                  ) : (
                    <DoctorDashboard />
                  )}
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/consultation/:appointmentId"
            element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DashboardLayout>
                  {isPatientMvpOnly() ? (
                    <ComingSoonView moduleName="Doctor Care" category="doctor" />
                  ) : (
                    <DoctorConsultation />
                  )}
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/settings"
            element={
              <ProtectedRoute allowedRoles={['DOCTOR']}>
                <DashboardLayout>
                  {isPatientMvpOnly() ? (
                    <ComingSoonView moduleName="Doctor Care" category="doctor" />
                  ) : (
                    <DoctorSettings />
                  )}
                </DashboardLayout>
              </ProtectedRoute>
            }
          />


          {/* ================================================== */}
          {/* PROTECTED PHARMACY PLATFORM */}
          {/* ================================================== */}

          <Route
            path="/pharmacy/dashboard"
            element={
              <ProtectedRoute allowedRoles={['PHARMACY']}>
                <DashboardLayout>
                  {isPatientMvpOnly() ? (
                    <ComingSoonView moduleName="Pharmacy" category="pharmacy" />
                  ) : (
                    <PharmacyDashboard />
                  )}
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/pharmacy/settings"
            element={
              <ProtectedRoute allowedRoles={['PHARMACY']}>
                <DashboardLayout>
                  {isPatientMvpOnly() ? (
                    <ComingSoonView moduleName="Pharmacy" category="pharmacy" />
                  ) : (
                    <PatientSettings />
                  )}
                </DashboardLayout>
              </ProtectedRoute>
            }
          />


          {/* ================================================== */}
          {/* PROTECTED ADMIN PLATFORM */}
          {/* ================================================== */}

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/doctors"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout>
                  <DoctorOnboardingAdmin />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />


          {/* ================================================== */}
          {/* 404 REDIRECT FALLBACK */}
          {/* ================================================== */}

          <Route
            path="*"
            element={
              <PublicLayout>
                <NotFound />
              </PublicLayout>
            }
          />

        </Routes>
      </Router>
    </ErrorBoundary>
  );
};