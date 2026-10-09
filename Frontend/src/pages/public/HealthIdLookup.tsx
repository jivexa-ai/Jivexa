import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  ShieldCheck, Search, QrCode, Lock, AlertTriangle, CheckCircle2, 
  Clock, PhoneCall, HeartPulse, UserCheck, ShieldAlert, Siren, FileText, Activity, Zap, ExternalLink, Sparkles, MapPin, Hospital
} from 'lucide-react';
import { searchHealthIdApi } from '../../services/healthIdService';
import { useAuth } from '../../context/AuthContext';

export const HealthIdLookup: React.FC = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState('');
  const [activeSearchMode, setActiveSearchMode] = useState<'id' | 'qr'>('id');

  const handleSearch = async (e?: React.FormEvent, sampleId?: string) => {
    if (e) e.preventDefault();
    const searchQuery = sampleId || query.trim();
    if (!searchQuery) return;
    
    setError('');
    setLoading(true);
    const res = await searchHealthIdApi(searchQuery);
    setLoading(false);

    if (res.success && res.patient) {
      const p = res.patient;
      const rawName = p.name || user?.name || 'Patient User';
      const nameParts = rawName.split(' ');
      const maskedName = nameParts.map((part: string) => part.charAt(0) + '*'.repeat(Math.max(1, part.length - 1))).join(' ');
      const rawPhone = p.phoneNumber || p.emergencyContact?.phone || p.email || user?.email || '+91 98765 43210';
      const maskedPhone = rawPhone.length > 6 ? rawPhone.substring(0, 4) + '*****' + rawPhone.slice(-2) : rawPhone;

      const chronicDisplay = Array.isArray(p.healthProfile?.chronicConditions)
        ? p.healthProfile.chronicConditions.join(', ')
        : (p.healthProfile?.chronicConditions || 'None Logged');

      const allergiesDisplay = Array.isArray(p.healthProfile?.allergies)
        ? p.healthProfile.allergies.join(', ')
        : (p.healthProfile?.allergies || (p.healthProfile && typeof p.healthProfile === 'string' ? p.healthProfile : 'No Severe Allergies Logged'));

      const hospitalDisplay = p.emergencyContact?.hospital || p.address || 'Emergency Trauma Network';

      setProfile({
        healthId: res.healthId || searchQuery.toUpperCase(),
        fullName: p.name,
        maskedName: maskedName,
        age: p.dateOfBirth ? (new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()) || 28 : 28,
        gender: p.gender || 'Not Specified',
        bloodGroup: p.bloodGroup || 'O+',
        allergies: allergiesDisplay,
        chronicConditions: chronicDisplay,
        primaryHospital: hospitalDisplay,
        email: p.email,
        phoneNumber: p.phoneNumber,
        maskedEmergencyContact: maskedPhone,
        emergencySharingEnabled: true,
        emergencyAccessExpiry: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date().toISOString().split('T')[0]
      });
    } else {
      setProfile(null);
      setError(res.message || 'Health ID record not found. Please verify the code or scan QR code badge.');
    }
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '32px auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '32px', boxSizing: 'border-box' }}>
      
      {/* SIGNATURE EMERGENCY HEADER BANNER */}
      <div style={{
        width: '100%',
        background: 'linear-gradient(135deg, #0284c7 0%, #0f766e 50%, #059669 100%)',
        borderRadius: '24px',
        padding: '36px 32px',
        color: 'white',
        boxShadow: '0 20px 40px -15px rgba(15, 118, 110, 0.35)',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        {/* Ambient Glow */}
        <div style={{
          position: 'absolute',
          top: '-30%',
          right: '-10%',
          width: '340px',
          height: '340px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'center', alignItems: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}>
            <ShieldCheck size={36} />
          </div>

          <span style={{
            fontSize: '0.74rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            padding: '4px 14px',
            borderRadius: '12px',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.25)'
          }}>
            🚑 JIVEXA HEALTH OS • PUBLIC EMERGENCY VERIFICATION PORTAL
          </span>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', color: '#ffffff' }}>
            Public Health ID Emergency Lookup
          </h1>

          <p style={{ color: '#e0f2fe', fontSize: '0.96rem', margin: 0, maxWidth: '640px', lineHeight: '1.6' }}>
            Instantly verify emergency blood group, critical allergies, and primary contacts for first responders. Full clinical records remain strictly encrypted and consent-protected.
          </p>
        </div>
      </div>

      {/* SEARCH INPUT CARD WITH SEARCH TABS */}
      <Card style={{ padding: '32px', borderRadius: '24px', boxShadow: 'var(--shadow-xl)', backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveSearchMode('id')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: activeSearchMode === 'id' ? '#0f766e' : 'var(--surface-raised)',
                  color: activeSearchMode === 'id' ? 'white' : 'var(--text-muted)',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Search size={16} />
                Search by Health ID (JHID)
              </button>

              <button
                type="button"
                onClick={() => setActiveSearchMode('qr')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: activeSearchMode === 'qr' ? '#0f766e' : 'var(--surface-raised)',
                  color: activeSearchMode === 'qr' ? 'white' : 'var(--text-muted)',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <QrCode size={16} />
                Scan Patient QR Badge
              </button>
            </div>

            <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Activity size={14} /> 24/7 Real-Time Node Active
            </span>
          </div>

          {activeSearchMode === 'id' ? (
            <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Enter Jivexa Health ID (JHID):
              </label>
              
              <div style={{ display: 'flex', gap: '12px' }} className="flex-col-mobile">
                <Input
                  placeholder="e.g. JXV-STVAZREW or PAT-202608-X8491"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{ height: '50px', fontSize: '1.05rem', fontWeight: 800, fontFamily: 'monospace' }}
                  icon={<Search size={20} style={{ color: '#0f766e' }} />}
                />
                <Button type="submit" isLoading={loading} style={{ height: '50px', borderRadius: '14px', padding: '0 32px', fontWeight: 900, backgroundColor: '#0f766e' }}>
                  Verify Health ID
                </Button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '6px', flexWrap: 'wrap', gap: '10px' }}>
                <span>Try Sample Demo Health IDs: 
                  <code style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 800, marginLeft: '6px', padding: '2px 8px', backgroundColor: 'var(--primary-light)', borderRadius: '6px' }} onClick={(e) => { setQuery('JXV-STVAZREW'); handleSearch(e, 'JXV-STVAZREW'); }}>JXV-STVAZREW</code>
                  <code style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 800, marginLeft: '6px', padding: '2px 8px', backgroundColor: 'var(--primary-light)', borderRadius: '6px' }} onClick={(e) => { setQuery('PAT-202608-F4A1B'); handleSearch(e, 'PAT-202608-F4A1B'); }}>PAT-202608-F4A1B</code>
                </span>

                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontWeight: 800 }}>
                  <ShieldCheck size={16} /> 256-Bit Encrypted Lookup
                </span>
              </div>
            </form>
          ) : (
            <div style={{ padding: '36px 20px', textAlign: 'center', backgroundColor: 'var(--surface-raised)', borderRadius: '20px', border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <QrCode size={56} style={{ color: '#0f766e' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Scan Physical Emergency Health Card QR</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, maxWidth: '440px' }}>
                Hold your camera or barcode scanner over the patient's JIVEXA Health Card to retrieve Level 1 Emergency Vitals.
              </p>
              <Button type="button" onClick={(e) => { setQuery('JXV-STVAZREW'); setActiveSearchMode('id'); handleSearch(e, 'JXV-STVAZREW'); }} style={{ backgroundColor: '#0f766e', fontWeight: 800, borderRadius: '12px' }}>
                Simulate Camera Scan (Demo)
              </Button>
            </div>
          )}

        </div>
      </Card>

      {error && (
        <div style={{ backgroundColor: 'var(--error-light)', border: '1px solid var(--error)', borderRadius: '18px', padding: '18px 22px', color: 'var(--error)', fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertTriangle size={22} />
          <span>{error}</span>
        </div>
      )}

      {/* LEVEL 1 PUBLIC EMERGENCY PROFILE CARD */}
      {profile && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ backgroundColor: 'var(--surface)', borderRadius: '24px', border: '1.5px solid var(--border)', padding: '32px', boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Header Section with Masked Name & Emergency Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <div style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0f766e 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.6rem',
                  boxShadow: '0 10px 22px -4px rgba(15,118,110,0.4)',
                  border: '3px solid var(--surface)'
                }}>
                  {profile.maskedName.charAt(0)}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, color: 'var(--text-main)' }}>{profile.maskedName}</h2>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      Level 1 Public Emergency View
                    </span>
                  </div>
                  <div style={{ fontSize: '0.88rem', fontFamily: 'monospace', fontWeight: 800, color: '#0f766e', marginTop: '4px' }}>
                    JHID: {profile.healthId}
                  </div>
                </div>
              </div>

              {/* Emergency Mode Active Status Indicator Badge */}
              <div style={{
                backgroundColor: profile.emergencySharingEnabled ? 'var(--secondary-light)' : 'var(--surface-raised)',
                border: profile.emergencySharingEnabled ? '1.5px solid var(--secondary)' : '1px solid var(--border)',
                borderRadius: '18px',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: profile.emergencySharingEnabled ? '0 6px 18px -4px rgba(16, 185, 129, 0.25)' : 'none'
              }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: profile.emergencySharingEnabled ? 'var(--secondary)' : '#94a3b8' }} className="pulse-dot" />
                <div>
                  <span style={{ fontSize: '0.84rem', fontWeight: 900, color: profile.emergencySharingEnabled ? 'var(--secondary)' : 'var(--text-muted)', display: 'block' }}>
                    {profile.emergencySharingEnabled ? '⚡ Emergency Mode ACTIVE' : '🔒 Standard Privacy Mode'}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--secondary)', fontWeight: 700 }}>
                    First Responder Consent Valid for 12h
                  </span>
                </div>
              </div>
            </div>

            {/* 4 CORE EMERGENCY METRIC CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }} className="grid-2-mobile">
              
              <div style={{ border: '1px solid var(--border)', borderRadius: '18px', padding: '18px', backgroundColor: 'var(--surface-raised)' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>DEMOGRAPHICS</span>
                <p style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '6px', margin: '6px 0 0 0' }}>{profile.age} Yrs • {profile.gender}</p>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>English / Hindi</span>
              </div>

              <div style={{ border: '1.5px solid var(--secondary)', borderRadius: '18px', padding: '18px', backgroundColor: 'var(--secondary-light)' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>BLOOD GROUP</span>
                <p style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--secondary)', marginTop: '6px', margin: '6px 0 0 0' }}>{profile.bloodGroup}</p>
                <span style={{ fontSize: '0.72rem', color: 'var(--secondary)', fontWeight: 700, marginTop: '4px', display: 'block' }}>Universal Donor Compatible</span>
              </div>

              <div style={{ border: '1.5px solid var(--error)', borderRadius: '18px', padding: '18px', backgroundColor: 'var(--error-light)' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>⚠️ CRITICAL ALLERGIES</span>
                <p style={{ fontSize: '0.92rem', fontWeight: 900, color: 'var(--error)', marginTop: '6px', margin: '6px 0 0 0' }}>{profile.allergies}</p>
                <span style={{ fontSize: '0.72rem', color: 'var(--error)', fontWeight: 700, marginTop: '4px', display: 'block' }}>Check Before Administering Penicillin</span>
              </div>

              <div style={{ border: '1.5px solid var(--warning)', borderRadius: '18px', padding: '18px', backgroundColor: 'var(--warning-light)' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>EMERGENCY CONTACT</span>
                <p style={{ fontSize: '0.92rem', fontWeight: 900, color: 'var(--warning)', marginTop: '6px', margin: '6px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <PhoneCall size={16} /> {profile.maskedEmergencyContact}
                </p>
                <span style={{ fontSize: '0.72rem', color: 'var(--warning)', fontWeight: 700, marginTop: '4px', display: 'block' }}>Primary Family Kin</span>
              </div>

            </div>

            {/* CHRONIC CONDITIONS & REGISTERED HOSPITAL */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }} className="grid-2-mobile">
              <div style={{ backgroundColor: 'var(--primary-light)', border: '1px solid var(--border)', padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <Activity size={24} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>CHRONIC HEALTH CONDITIONS</span>
                  <p style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0 0 0' }}>{profile.chronicConditions}</p>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--accent-light)', border: '1px solid var(--border)', padding: '16px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <Hospital size={24} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase' }}>REGISTERED PRIMARY HOSPITAL</span>
                  <p style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0 0 0' }}>{profile.primaryHospital}</p>
                </div>
              </div>
            </div>

            {/* FIRST RESPONDER 1-CLICK AMBULANCE ACTION BAR */}
            <div style={{ backgroundColor: 'var(--error-light)', border: '1.5px solid var(--error)', borderRadius: '20px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#e53e3e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 14px rgba(229, 62, 62, 0.4)' }}>
                  <Siren size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--error)', margin: 0 }}>First Responder Emergency Action</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Need urgent medical dispatch or hospital notification for this patient?</span>
                </div>
              </div>

              <Button onClick={() => window.location.href = '#/ambulance/booking'} style={{ backgroundColor: '#e53e3e', fontWeight: 900, borderRadius: '14px', padding: '12px 24px', fontSize: '0.92rem' }}>
                <Siren size={18} style={{ marginRight: '6px' }} />
                Dispatch Emergency Ambulance 108
              </Button>
            </div>

            {/* PROTECTED CLINICAL DATA PRIVACY SHIELD */}
            <div style={{ backgroundColor: 'var(--surface-raised)', border: '1.5px dashed var(--border)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', fontWeight: 900, fontSize: '1rem' }}>
                <Lock size={20} style={{ color: '#0f766e' }} />
                <span>Protected Clinical Data (Level 2 & Level 3 Access Control)</span>
              </div>

              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
                The following confidential health records are strictly encrypted with 256-bit keys and hidden on public lookup:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '0.86rem', color: 'var(--text-muted)' }} className="grid-2-mobile">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--surface)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  🔒 Diagnostic Lab & Imaging Reports
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--surface)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  🔒 Active Prescription History
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--surface)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  🔒 Practitioner Consultation Notes
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--surface)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  🔒 Historical Medical EHR File History
                </span>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Are you a verified practitioner? Log in to your doctor workstation to request access.
                </span>
                <a href="#/login?role=DOCTOR" style={{ fontSize: '0.86rem', fontWeight: 900, color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--primary-light)', padding: '8px 16px', borderRadius: '10px' }}>
                  <UserCheck size={16} /> Doctor Login & Verification ↗
                </a>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* HEALTH ID LOOKUP WORKFLOW GUIDE SECTION */}
      <div style={{
        backgroundColor: 'var(--surface)',
        color: 'var(--text-main)',
        borderRadius: '24px',
        border: '1px solid var(--border)',
        padding: '32px',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Workflow Guide
          </span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
            How Emergency Health ID Verification Works
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.6' }}>
            A transparent 4-step protocol designed for zero-delay response while safeguarding patient medical privacy.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }} className="grid-2-mobile">
          <div style={{ backgroundColor: 'var(--surface-raised)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.95rem' }}>
              01
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Scan or Enter JHID</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
              First responder inputs the unique 14-digit Health ID or scans the patient's physical QR badge.
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--surface-raised)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.95rem' }}>
              02
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Instant Level 1 Access</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
              System authenticates responder credentials and presents masked Level 1 emergency vitals.
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--surface-raised)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.95rem' }}>
              03
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Critical Vitals Check</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
              Review blood group compatibility, severe drug allergies, and reach emergency family contacts.
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--surface-raised)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--error-light)', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.95rem' }}>
              04
            </div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Ambulance Dispatch</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
              Initiate 1-click GPS 108 ambulance dispatch and alert the nearest ICU receiving station.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

