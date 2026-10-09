import React from 'react';
import { 
  User, Heart, Activity, ShieldCheck, Stethoscope, 
  FileText, Pill, Siren, CheckCircle2, Navigation, Clock, Shield
} from 'lucide-react';
import { UserRole } from '../../context/AuthContext';

// --- 1. PATIENT REAL HUMAN PHOTOGRAPHY ILLUSTRATION ---
export const Patient3DIllustration: React.FC = () => {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '310px',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 16px 36px rgba(0, 0, 0, 0.25)',
      backgroundColor: '#0284c7'
    }}>
      <img
        src="/assets/images/patient-hero.jpg"
        alt="Real Human Patient Wellness"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block'
        }}
      />
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.15) 60%, transparent 100%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        right: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderRadius: '14px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={22} style={{ color: '#0284c7' }} />
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
              Digital Health ID
            </span>
            <h4 style={{ fontSize: '0.98rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              JIV-2026-849201
            </h4>
          </div>
        </div>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#059669', backgroundColor: '#d1fae5', padding: '4px 10px', borderRadius: '12px' }}>
          ✓ Verified Record
        </span>
      </div>
    </div>
  );
};

// --- 2. DOCTOR REAL HUMAN PHOTOGRAPHY ILLUSTRATION ---
export const Doctor3DIllustration: React.FC = () => {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '310px',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 16px 36px rgba(0, 0, 0, 0.25)',
      backgroundColor: '#059669'
    }}>
      <img
        src="/assets/images/doctor-hero.jpg"
        alt="Real Medical Doctor Practitioner"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block'
        }}
      />
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(6, 78, 59, 0.88) 0%, rgba(6, 78, 59, 0.15) 60%, transparent 100%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        right: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderRadius: '14px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Stethoscope size={22} style={{ color: '#059669' }} />
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
              Practitioner Portal
            </span>
            <h4 style={{ fontSize: '0.94rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              Verified Practitioner License
            </h4>
          </div>
        </div>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '4px 10px', borderRadius: '12px' }}>
          ✓ Verified License
        </span>
      </div>
    </div>
  );
};

// --- 3. AMBULANCE REAL HUMAN PHOTOGRAPHY ILLUSTRATION ---
export const Ambulance3DIllustration: React.FC = () => {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '310px',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 16px 36px rgba(0, 0, 0, 0.25)',
      backgroundColor: '#dc2626'
    }}>
      <img
        src="/assets/images/ambulance-hero.jpg"
        alt="Real Emergency Ambulance Response Unit"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block'
        }}
      />
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(69, 10, 10, 0.88) 0%, rgba(69, 10, 10, 0.15) 60%, transparent 100%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        right: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderRadius: '14px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Siren size={22} style={{ color: '#dc2626' }} />
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
              Emergency Dispatch
            </span>
            <h4 style={{ fontSize: '0.94rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              24/7 Rapid Ambulance Network
            </h4>
          </div>
        </div>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#dc2626', backgroundColor: '#fee2e2', padding: '4px 10px', borderRadius: '12px' }}>
          Live Fleet
        </span>
      </div>
    </div>
  );
};

// --- 4. PHARMACY REAL HUMAN PHOTOGRAPHY ILLUSTRATION ---
export const Pharmacy3DIllustration: React.FC = () => {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '310px',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 16px 36px rgba(0, 0, 0, 0.25)',
      backgroundColor: '#d97706'
    }}>
      <img
        src="/assets/images/pharmacy-hero.jpg"
        alt="Real Pharmacist Dispensing Medicine"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block'
        }}
      />
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(69, 26, 3, 0.88) 0%, rgba(69, 26, 3, 0.15) 60%, transparent 100%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        right: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderRadius: '14px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Pill size={22} style={{ color: '#d97706' }} />
          <div>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
              Pharmacy Fulfillment
            </span>
            <h4 style={{ fontSize: '0.94rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              Verified Prescription Dispensing
            </h4>
          </div>
        </div>
        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#d97706', backgroundColor: '#fef3c7', padding: '4px 10px', borderRadius: '12px' }}>
          Stock Sync
        </span>
      </div>
    </div>
  );
};

// --- GRAPHIC DISPATCHER ---
export const RoleIllustrationGraphic: React.FC<{ role: UserRole }> = ({ role }) => {
  switch (role) {
    case 'DOCTOR':
      return <Doctor3DIllustration />;
    case 'AMBULANCE_PARTNER':
      return <Ambulance3DIllustration />;
    case 'PHARMACY':
      return <Pharmacy3DIllustration />;
    case 'PATIENT':
    default:
      return <Patient3DIllustration />;
  }
};
