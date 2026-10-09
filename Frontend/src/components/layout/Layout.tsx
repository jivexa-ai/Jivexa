import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { BrandLogo } from '../common/BrandLogo';
import { ThemeToggle } from '../common/ThemeToggle';
import {
  Menu, X, Bell, LogOut, User as UserIcon, Shield, Heart,
  Activity, MessageSquare, Clipboard, Calendar, FileText,
  UserCheck, Pill, Settings, HelpCircle, ChevronRight, Home, Info, Phone, AlertTriangle, ListOrdered, BookOpen, Siren, Navigation, Clock, ShieldCheck
} from 'lucide-react';
import { isPatientMvpOnly } from '../../config';

// --- PUBLIC LAYOUT ---
export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (isAuthenticated) {
      const routes = {
        PATIENT: '/patient/dashboard',
        DOCTOR: '/doctor/dashboard',
        PHARMACY: '/pharmacy/dashboard',
        ADMIN: '/admin/dashboard',
        AMBULANCE_PARTNER: '/partner/ambulance',
      };
      navigate(routes[role!]);
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      {/* Disclaimer Top Bar */}
      <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '8px var(--space-md)', fontSize: '0.8rem', textAlign: 'center', fontWeight: 500 }}>
        Jivexa Health OS Demo: This platform displays simulated medical guidelines and information. In case of medical emergencies, consult a doctor immediately.
      </div>

      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'var(--surface-glass)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)',
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <BrandLogo size="md" />

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="sr-mobile-hide">
            <Link to="/about" style={{ color: 'var(--text-main)', fontWeight: 500 }}>About</Link>
            <Link to="/how-it-works" style={{ color: 'var(--text-main)', fontWeight: 500 }}>How It Works</Link>
            <Link to="/health-id-lookup" style={{ color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={16} /> Health ID Lookup
            </Link>
            {!isPatientMvpOnly() ? (
              <>
                <Link to="/for-doctors" style={{ color: 'var(--text-main)', fontWeight: 500 }}>For Doctors</Link>
                <Link to="/for-pharmacies" style={{ color: 'var(--text-main)', fontWeight: 500 }}>For Pharmacies</Link>
              </>
            ) : (
              <span style={{ fontSize: '0.74rem', fontWeight: 800, backgroundColor: 'rgba(2, 132, 199, 0.1)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '12px' }}>
                Patient AI Health MVP
              </span>
            )}
            <Link to="/faq" style={{ color: 'var(--text-main)', fontWeight: 500 }}>FAQs</Link>
            <Link to="/contact" style={{ color: 'var(--text-main)', fontWeight: 500 }}>Contact</Link>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} className="sr-mobile-hide">
              {isAuthenticated ? (
                <>
                  <button 
                    onClick={handleCTA}
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 16px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'background var(--transition-fast)'
                    }}
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={logout}
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 16px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" style={{ color: 'var(--text-main)', fontWeight: 600 }}>Login</Link>
                  <Link 
                    to="/signup" 
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 18px',
                      fontWeight: 600,
                      transition: 'background var(--transition-fast)'
                    }}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Global Theme Toggle in Top Right */}
            <ThemeToggle />

            {/* Mobile Menu Icon */}
            <button 
              style={{ display: 'none', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }} 
              className="sr-mobile-show"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>


      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 'calc(var(--header-height) + 26px)',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'var(--surface)',
          zIndex: 49,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeIn 0.2s ease'
        }}>
          <Link to="/about" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.2rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>About</Link>
          <Link to="/how-it-works" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.2rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>How It Works</Link>
          <Link to="/health-id-lookup" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Health ID Lookup</Link>
          {!isPatientMvpOnly() && (
            <>
              <Link to="/for-doctors" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.2rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>For Doctors</Link>
              <Link to="/for-pharmacies" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.2rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>For Pharmacies</Link>
            </>
          )}
          <Link to="/faq" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.2rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>FAQs</Link>
          <Link to="/contact" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.2rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Contact</Link>
          
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {isAuthenticated ? (
              <>
                <button onClick={() => { setMobileMenuOpen(false); handleCTA(); }} style={{ backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '12px', borderRadius: 'var(--radius-md)', fontWeight: 600, width: '100%' }}>Dashboard</button>
                <button onClick={() => { setMobileMenuOpen(false); logout(); }} style={{ border: '1px solid var(--border)', padding: '12px', borderRadius: 'var(--radius-md)', fontWeight: 600, width: '100%' }}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ border: '1px solid var(--border)', padding: '12px', borderRadius: 'var(--radius-md)', fontWeight: 600, textAlign: 'center' }}>Login</Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)} style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '12px', borderRadius: 'var(--radius-md)', fontWeight: 600, textAlign: 'center' }}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Body */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--footer-bg)', color: 'rgba(255,255,255,0.7)', padding: '64px 0 32px 0', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px', marginBottom: '48px' }} className="footer-grid-mobile">
            <div>
              <BrandLogo size="md" variant="light" style={{ marginBottom: '16px' }} />
              <p style={{ fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '20px', maxWidth: '360px' }}>
                Combining intelligent technology, healthcare information, and patient support to help you understand and manage your health journey.
              </p>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                Primary Domain: <a href="https://jivexa.in" style={{ color: 'white' }}>jivexa.in</a>
              </div>
            </div>

            <div>
              <h4 style={{ color: 'white', marginBottom: '16px', fontSize: '1rem' }}>Platform</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                <li><Link to="/about" style={{ color: 'rgba(255,255,255,0.7)' }}>About Jivexa Health</Link></li>
                <li><Link to="/how-it-works" style={{ color: 'rgba(255,255,255,0.7)' }}>How It Works</Link></li>
                <li><Link to="/for-doctors" style={{ color: 'rgba(255,255,255,0.7)' }}>For Doctors</Link></li>
                <li><Link to="/for-pharmacies" style={{ color: 'rgba(255,255,255,0.7)' }}>For Pharmacies</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: 'white', marginBottom: '16px', fontSize: '1rem' }}>Resources</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                <li><Link to="/resources" style={{ color: 'rgba(255,255,255,0.7)' }}>Health Resources</Link></li>
                <li><Link to="/faq" style={{ color: 'rgba(255,255,255,0.7)' }}>FAQs</Link></li>
                <li><Link to="/contact" style={{ color: 'rgba(255,255,255,0.7)' }}>Contact Us</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: 'white', marginBottom: '16px', fontSize: '1rem' }}>Legal</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                <li><Link to="/privacy" style={{ color: 'rgba(255,255,255,0.7)' }}>Privacy Policy</Link></li>
                <li><Link to="/terms" style={{ color: 'rgba(255,255,255,0.7)' }}>Terms & Conditions</Link></li>
                <li><Link to="/disclaimer" style={{ color: 'rgba(255,255,255,0.7)' }}>Medical Disclaimer</Link></li>
              </ul>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '32px 0' }} />

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
            <p>© {new Date().getFullYear()} Jivexa Health OS. All rights reserved.</p>
            <p style={{ maxWidth: '600px', textAlign: 'right' }} className="footer-disclaimer-mobile">
              Disclaimer: Jivexa Health provides general healthcare technology services and informational guides. It is not a direct healthcare provider, hospital, or pharmacist.
            </p>
          </div>
        </div>
      </footer>

      {/* Embedded Mobile CSS Styles */}
      <style>{`
        @media (max-width: 768px) {
          .sr-mobile-hide { display: none !important; }
          .sr-mobile-show { display: block !important; }
          .footer-grid-mobile {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .footer-disclaimer-mobile {
            text-align: left !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

// --- DASHBOARD LAYOUT ---
export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role, logout } = useAuth();
  const { notifications, markNotificationAsRead } = useHealthData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const userNotifs = notifications.filter((n) => n.userId === user?.id);
  const unreadNotifs = userNotifs.filter((n) => !n.isRead);

  const isMvp = isPatientMvpOnly();

  const sidebarLinks: Record<string, { label: string; path: string; icon: React.ReactNode; comingSoon?: boolean }[]> = {
    PATIENT: isMvp ? [
      { label: 'Dashboard', path: '/patient/dashboard', icon: <Home size={18} /> },
      { label: 'JIVEXA Health AI', path: '/patient/ai-assistant', icon: <MessageSquare size={18} /> },
      { label: 'AI Report Analyzer', path: '/patient/ai-report-analyzer', icon: <FileText size={18} /> },
      { label: 'My Health Profile', path: '/patient/profile', icon: <UserIcon size={18} /> },
      { label: 'Health Records', path: '/patient/health-records', icon: <Clipboard size={18} /> },
      { label: 'Health Timeline', path: '/patient/timeline', icon: <Activity size={18} /> },
      { label: 'Settings', path: '/patient/settings', icon: <Settings size={18} /> },
    ] : [
      { label: 'Dashboard', path: '/patient/dashboard', icon: <Home size={18} /> },
      { label: 'JIVEXA Health AI Bot', path: '/patient/ai-assistant', icon: <MessageSquare size={18} /> },
      { label: 'AI Medical Report Analyzer', path: '/patient/ai-report-analyzer', icon: <FileText size={18} /> },
      { label: 'My Health Profile', path: '/patient/profile', icon: <UserIcon size={18} /> },
      { label: 'Health Records', path: '/patient/health-records', icon: <Clipboard size={18} /> },
      { label: 'Appointments', path: '/patient/appointments', icon: <Calendar size={18} /> },
      { label: 'Find Doctors', path: '/patient/doctors', icon: <UserCheck size={18} /> },
      { label: 'Medicines & Orders', path: '/patient/medicines', icon: <Pill size={18} /> },
      { label: 'Health Timeline', path: '/patient/timeline', icon: <Activity size={18} /> },
      { label: 'Settings', path: '/patient/settings', icon: <Settings size={18} /> },
    ],
    DOCTOR: [
      { label: 'Overview Dashboard', path: '/doctor/dashboard', icon: <Home size={18} /> },
      { label: 'Doctor Settings', path: '/doctor/settings', icon: <Settings size={18} /> },
    ],
    PHARMACY: [
      { label: 'Order Dashboard', path: '/pharmacy/dashboard', icon: <ListOrdered size={18} /> },
      { label: 'Pharmacy Settings', path: '/pharmacy/settings', icon: <Settings size={18} /> },
    ],
    AMBULANCE_PARTNER: [
      { label: 'Overview Dashboard', path: '/ambulance/dashboard', icon: <Home size={18} /> },
      { label: 'Emergency Requests', path: '/ambulance/requests', icon: <Siren size={18} /> },
      { label: 'Active Trips', path: '/ambulance/active-trips', icon: <Navigation size={18} /> },
      { label: 'Trip History', path: '/ambulance/history', icon: <Clock size={18} /> },
      { label: 'Driver Profile', path: '/ambulance/driver-profile', icon: <UserCheck size={18} /> },
      { label: 'Vehicle Details', path: '/ambulance/vehicle-details', icon: <ShieldCheck size={18} /> },
      { label: 'Settings', path: '/ambulance/settings', icon: <Settings size={18} /> },
    ],
    ADMIN: [
      { label: 'Admin Dashboard', path: '/admin/dashboard', icon: <Shield size={18} /> },
    ]
  };

  const activeLinks = sidebarLinks[role || 'PATIENT'] || sidebarLinks['PATIENT'];

  const getRoleLabel = () => {
    switch (role) {
      case 'ADMIN': return { bg: 'var(--error-light)', color: 'var(--error)', text: 'ADMIN SECURE' };
      case 'DOCTOR': return { bg: 'var(--secondary-light)', color: 'var(--secondary)', text: 'PRACTITIONER' };
      case 'PHARMACY': return { bg: 'var(--warning-light)', color: 'var(--warning)', text: 'PHARMACY HUB' };
      case 'AMBULANCE_PARTNER': return { bg: 'var(--error-light)', color: 'var(--error)', text: 'AMBULANCE FLEET' };
      default: return { bg: 'var(--primary-light)', color: 'var(--primary)', text: 'PATIENT CORE' };
    }
  };

  const roleLabel = getRoleLabel();

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--background)' }}>
      {/* Desktop Sidebar */}
      <aside style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0
      }} className="sr-mobile-hide">
        <div style={{ height: 'var(--header-height)', display: 'flex', alignItems: 'center', padding: '0 var(--space-lg)', borderBottom: '1px solid var(--border)', gap: '10px' }}>
          <BrandLogo size="sm" />
          <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '3px 6px', background: roleLabel.bg, color: roleLabel.color, borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {roleLabel.text}
          </span>
        </div>

        <div style={{ padding: 'var(--space-md)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '1.1rem' }}>
            <span style={{ margin: 'auto' }}>{user?.name.charAt(0)}</span>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <h5 style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.name}</h5>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {activeLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path} 
                to={link.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all var(--transition-fast)'
                }}
              >
                {link.icon}
                <span style={{ fontSize: '0.9rem', flex: 1 }}>{link.label}</span>
                {link.comingSoon && (
                  <span style={{
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    backgroundColor: 'rgba(100, 116, 139, 0.12)',
                    color: '#64748b',
                    padding: '2px 6px',
                    borderRadius: '6px'
                  }}>
                    SOON
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: 'var(--space-md)', borderTop: '1px solid var(--border)' }}>
          <button 
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '10px 14px',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--error)',
              fontWeight: 500,
              cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
              transition: 'background var(--transition-fast)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--error-light)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut size={18} />
            <span style={{ fontSize: '0.9rem' }}>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <header style={{
          height: 'var(--header-height)',
          backgroundColor: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--space-lg)',
          position: 'relative'
        }}>
          <div style={{ display: 'none', alignItems: 'center', gap: '12px' }} className="sr-mobile-flex">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}
            >
              <Menu size={24} />
            </button>
            <BrandLogo size="sm" />
          </div>

          <div className="sr-mobile-hide" style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Secure Health Ecosystem
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Global Theme Toggle in Top Right */}
            <ThemeToggle />

            <div style={{ position: 'relative' }}>

              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '8px',
                  borderRadius: '50%',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background var(--transition-fast)'
                }}
                className="hover-bg-light"
              >
                <Bell size={20} />
                {unreadNotifs.length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    backgroundColor: 'var(--error)',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '12px',
                  width: '320px',
                  backgroundColor: 'var(--surface)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--border)',
                  zIndex: 100,
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Notifications</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{unreadNotifs.length} unread</span>
                  </div>
                  <div>
                    {userNotifs.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No notifications yet.
                      </div>
                    ) : (
                      userNotifs.map((notif) => (
                        <div 
                          key={notif.id} 
                          onClick={() => { markNotificationAsRead(notif.id); }}
                          style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid var(--border)',
                            backgroundColor: notif.isRead ? 'transparent' : 'var(--primary-light)',
                            cursor: 'pointer',
                            transition: 'background var(--transition-fast)'
                          }}
                        >
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '4px', fontWeight: notif.isRead ? 400 : 500 }}>
                            {notif.message}
                          </p>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.9rem' }} className="sr-mobile-flex">
                <span style={{ margin: 'auto' }}>{user?.name.charAt(0)}</span>
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }} className="sr-mobile-hide">
                {user?.name}
              </span>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-lg)' }} className="dashboard-main-panel">
          {children}
        </main>

        {role === 'PATIENT' && (
          <nav style={{
            display: 'none',
            height: '60px',
            backgroundColor: 'var(--surface)',
            borderTop: '1px solid var(--border)',
            justifyContent: 'space-around',
            alignItems: 'center',
            zIndex: 48
          }} className="sr-mobile-flex">
            <Link to="/patient/dashboard" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: location.pathname === '/patient/dashboard' ? 'var(--primary)' : 'var(--text-muted)' }}>
              <Home size={20} />
              <span style={{ fontSize: '0.65rem', marginTop: '2px', fontWeight: 500 }}>Home</span>
            </Link>
            <Link to="/patient/ai-assistant" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: location.pathname === '/patient/ai-assistant' ? 'var(--primary)' : 'var(--text-muted)' }}>
              <MessageSquare size={20} />
              <span style={{ fontSize: '0.65rem', marginTop: '2px', fontWeight: 500 }}>AI Chat</span>
            </Link>
            <Link to="/patient/health-records" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: location.pathname === '/patient/health-records' ? 'var(--primary)' : 'var(--text-muted)' }}>
              <Clipboard size={20} />
              <span style={{ fontSize: '0.65rem', marginTop: '2px', fontWeight: 500 }}>Records</span>
            </Link>
            {isPatientMvpOnly() ? (
              <Link to="/patient/ai-report-analyzer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: location.pathname === '/patient/ai-report-analyzer' ? 'var(--primary)' : 'var(--text-muted)' }}>
                <FileText size={20} />
                <span style={{ fontSize: '0.65rem', marginTop: '2px', fontWeight: 500 }}>Analyze</span>
              </Link>
            ) : (
              <Link to="/patient/appointments" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: location.pathname === '/patient/appointments' ? 'var(--primary)' : 'var(--text-muted)' }}>
                <Calendar size={20} />
                <span style={{ fontSize: '0.65rem', marginTop: '2px', fontWeight: 500 }}>Book</span>
              </Link>
            )}
            <Link to="/patient/profile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: location.pathname === '/patient/profile' ? 'var(--primary)' : 'var(--text-muted)' }}>
              <UserIcon size={20} />
              <span style={{ fontSize: '0.65rem', marginTop: '2px', fontWeight: 500 }}>Profile</span>
            </Link>
          </nav>
        )}
      </div>

      {mobileMenuOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(2px)',
            zIndex: 200,
            display: 'flex'
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            style={{
              width: '280px',
              backgroundColor: 'var(--surface)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-xl)',
              animation: 'slideRight 0.25s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ height: 'var(--header-height)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--space-md)', borderBottom: '1px solid var(--border)' }}>
              <Link to="/" className="logo-lockup" onClick={() => setMobileMenuOpen(false)}>
                <div className="logo-lockup-icon-wrapper" style={{ width: '34px', height: '34px', borderRadius: '4px' }}>
                  <img src="/assets/logo.jpg" alt="Jivexa Logo" className="logo-lockup-icon" />
                </div>
                <span className="logo-lockup-text" style={{ fontSize: '1.15rem' }}>JIVEXA</span>
              </Link>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                <span style={{ margin: 'auto' }}>{user?.name.charAt(0)}</span>
              </div>
              <div style={{ overflow: 'hidden' }}>
                <h5 style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user?.name}</h5>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{roleLabel.text}</span>
              </div>
            </div>

            <nav style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
              {activeLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link 
                    key={link.path} 
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                      backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                      fontWeight: isActive ? 600 : 500
                    }}
                  >
                    {link.icon}
                    <span style={{ fontSize: '0.9rem', flex: 1 }}>{link.label}</span>
                    {link.comingSoon && (
                      <span style={{
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        backgroundColor: 'rgba(100, 116, 139, 0.12)',
                        color: '#64748b',
                        padding: '2px 6px',
                        borderRadius: '6px'
                      }}>
                        SOON
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
              <button 
                onClick={() => { setMobileMenuOpen(false); logout(); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '10px 14px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--error)',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                <LogOut size={18} />
                <span style={{ fontSize: '0.9rem' }}>Log out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hover-bg-light:hover { background-color: var(--surface-raised); }
        @media (max-width: 768px) {
          .sr-mobile-hide { display: none !important; }
          .sr-mobile-flex { display: flex !important; }
          .dashboard-main-panel {
            padding: var(--space-md) !important;
            padding-bottom: 80px !important;
          }
        }
        @keyframes slideRight {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};
