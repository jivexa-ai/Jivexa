import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { 
  Heart, MessageSquare, Clipboard, Calendar, Pill, 
  Activity, ArrowRight, Star, Clock, AlertCircle, Plus, Check, Sparkles,
  ShieldCheck, Copy, QrCode, Lock, CheckCircle2, XCircle, UserCheck, Siren, Edit3, Droplet, Footprints, MapPin, RefreshCw, FileText
} from 'lucide-react';
import { Toast } from '../../components/ui/Toast';
import { Modal } from '../../components/ui/Modal';
import { isPatientMvpOnly } from '../../config';

export const PatientDashboard: React.FC = () => {
  const { user, updateOnboarding } = useAuth();
  const { 
    appointments, healthRecords, healthGoals, patientProfile, updatePatientProfile,
    accessRequests, respondAccessRequest, revokeDoctorAccess,
    toggleEmergencyAccessMode, accessLogs 
  } = useHealthData();
  const navigate = useNavigate();

  const [toastMsg, setToastMsg] = useState('');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [emergencyExpiryHours, setEmergencyExpiryHours] = useState(24);
  const [isTogglingEmergency, setIsTogglingEmergency] = useState(false);

  // Real-Time GPS Geolocation State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Daily vitals real-time interactive tracking state with LocalStorage persistence
  const [dailyWater, setDailyWater] = useState<number>(() => {
    const saved = localStorage.getItem('jivexa_daily_water');
    return saved ? parseInt(saved) : 1800;
  });
  const [dailySteps, setDailySteps] = useState<number>(() => {
    const saved = localStorage.getItem('jivexa_daily_steps');
    return saved ? parseInt(saved) : 5420;
  });
  const [waterGoal] = useState(3000);
  const [stepsGoal] = useState(8000);

  // Save to LocalStorage whenever updated
  React.useEffect(() => {
    localStorage.setItem('jivexa_daily_water', dailyWater.toString());
  }, [dailyWater]);

  React.useEffect(() => {
    localStorage.setItem('jivexa_daily_steps', dailySteps.toString());
  }, [dailySteps]);

  // Function to get real location address from coordinates via Reverse Geocoding
  const detectLiveGPSLocation = () => {
    if (!navigator.geolocation) {
      setUserLocation({ lat: 28.6635, lng: 77.4635, address: 'Delhi NCR (28.6635° N, 77.4635° E)' });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let formattedAddr = `GPS: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;

        try {
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
          if (res.ok) {
            const data = await res.json();
            const city = data.city || data.locality || data.principalSubdivision || '';
            const state = data.principalSubdivision || '';
            const locality = data.locality && data.locality !== city ? data.locality : '';
            
            const placeParts = [locality, city, state].filter(Boolean);
            if (placeParts.length > 0) {
              formattedAddr = `${placeParts.join(', ')} (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`;
            }
          }
        } catch (err) {
          console.warn('Reverse geocode fallback:', err);
        }

        setUserLocation({ lat, lng, address: formattedAddr });
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation permission error or fallback:', err);
        setUserLocation({ lat: 28.6635, lng: 77.4635, address: 'Delhi NCR (28.6635° N, 77.4635° E)' });
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Request HTML5 Real-Time GPS Geolocation on load
  React.useEffect(() => {
    detectLiveGPSLocation();
  }, []);

  // Edit Profile Form State
  const [editForm, setEditForm] = useState({
    bloodGroup: patientProfile?.bloodGroup || 'O+ Positive',
    allergies: patientProfile?.allergies || 'None reported',
    conditions: patientProfile?.conditions || 'None reported',
    emergencyContact: patientProfile?.emergencyContact || (user?.email ? `${user.name} (${user.email})` : 'Emergency Contact Not Set')
  });

  // --- ONBOARDING STATE ---
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardForm, setOnboardForm] = useState({
    dob: user?.dob || '',
    phone: user?.phone || '',
    bloodGroup: patientProfile?.bloodGroup || 'O+ Positive',
    allergies: patientProfile?.allergies || '',
    conditions: patientProfile?.conditions || '',
    emergencyContact: patientProfile?.emergencyContact || '',
    goalSteps: '8000',
    goalWater: '3000'
  });

  const handleOnboardSubmit = async () => {
    updatePatientProfile({
      bloodGroup: onboardForm.bloodGroup,
      allergies: onboardForm.allergies,
      conditions: onboardForm.conditions,
      emergencyContact: onboardForm.emergencyContact
    });
    
    await updateOnboarding({
      onboarded: true,
      phone: onboardForm.phone,
      dob: onboardForm.dob
    });
  };

  const handleSkipOnboarding = async () => {
    await updateOnboarding({ onboarded: true });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updatePatientProfile({
      bloodGroup: editForm.bloodGroup,
      allergies: editForm.allergies,
      conditions: editForm.conditions,
      emergencyContact: editForm.emergencyContact
    });
    setToastMsg('Health Profile updated successfully!');
    setIsEditProfileModalOpen(false);
  };

  if (user && !user.onboarded) {
    const totalSteps = 6;
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>Onboarding Profile</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Step {onboardingStep} of {totalSteps}</span>
        </div>
        <div style={{ height: '4px', backgroundColor: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: `${(onboardingStep / totalSteps) * 100}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width 0.3s ease' }} />
        </div>

        <Card title={`Step ${onboardingStep}: ${
          onboardingStep === 1 ? 'Welcome to JIVEXA' :
          onboardingStep === 2 ? 'Basic Profile' :
          onboardingStep === 3 ? 'Health Preferences' :
          onboardingStep === 4 ? 'Emergency Contact (Optional)' :
          onboardingStep === 5 ? 'Health Goals' :
          'Complete Profile'
        }`}>
          {onboardingStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center', alignItems: 'center', padding: '20px 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart size={28} fill="var(--primary)" style={{ margin: 'auto' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Welcome to Your Health Operating System</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                JIVEXA is designed to help you consolidate your medical records, communicate with doctors, and understand diagnostic reports simply. Let's configure your profile.
              </p>
              <Button onClick={() => setOnboardingStep(2)} style={{ marginTop: '12px' }}>Begin Configuration</Button>
            </div>
          )}

          {onboardingStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input 
                label="Date of Birth" 
                type="date" 
                value={onboardForm.dob}
                onChange={(e) => setOnboardForm({ ...onboardForm, dob: e.target.value })}
              />
              <Input 
                label="Phone Number" 
                placeholder="+91 98765 43210" 
                value={onboardForm.phone}
                onChange={(e) => setOnboardForm({ ...onboardForm, phone: e.target.value })}
              />
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <Button variant="outline" onClick={() => setOnboardingStep(1)}>Back</Button>
                <Button onClick={() => setOnboardingStep(3)} style={{ flex: 1 }}>Continue</Button>
              </div>
            </div>
          )}

          {onboardingStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Select 
                label="Blood Group"
                options={[
                  { value: 'A+ Positive', label: 'A+ Positive' },
                  { value: 'A- Negative', label: 'A- Negative' },
                  { value: 'B+ Positive', label: 'B+ Positive' },
                  { value: 'B- Negative', label: 'B- Negative' },
                  { value: 'AB+ Positive', label: 'AB+ Positive' },
                  { value: 'AB- Negative', label: 'AB- Negative' },
                  { value: 'O+ Positive', label: 'O+ Positive' },
                  { value: 'O- Negative', label: 'O- Negative' }
                ]}
                value={onboardForm.bloodGroup}
                onChange={(val) => setOnboardForm({ ...onboardForm, bloodGroup: val })}
              />
              <Input 
                label="Known Drug / Food Allergies" 
                placeholder="e.g. Peanuts, Penicillin (leave blank if none)" 
                value={onboardForm.allergies}
                onChange={(e) => setOnboardForm({ ...onboardForm, allergies: e.target.value })}
              />
              <Input 
                label="Existing Conditions / Diagnoses" 
                placeholder="e.g. Mild Asthma, Hypertension" 
                value={onboardForm.conditions}
                onChange={(e) => setOnboardForm({ ...onboardForm, conditions: e.target.value })}
              />
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <Button variant="outline" onClick={() => setOnboardingStep(2)}>Back</Button>
                <Button onClick={() => setOnboardingStep(4)} style={{ flex: 1 }}>Continue</Button>
              </div>
            </div>
          )}

          {onboardingStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Providing an emergency contact allows emergency practitioners to contact your representative if required.
              </p>
              <Input 
                label="Emergency Contact Name & Phone" 
                placeholder="Amit Gangwar (+91 99887 76655)" 
                value={onboardForm.emergencyContact}
                onChange={(e) => setOnboardForm({ ...onboardForm, emergencyContact: e.target.value })}
              />
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <Button variant="outline" onClick={() => setOnboardingStep(3)}>Back</Button>
                <Button onClick={() => setOnboardingStep(5)} style={{ flex: 1 }}>Continue</Button>
              </div>
            </div>
          )}

          {onboardingStep === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input 
                label="Daily Steps Goal" 
                type="number"
                value={onboardForm.goalSteps}
                onChange={(e) => setOnboardForm({ ...onboardForm, goalSteps: e.target.value })}
              />
              <Input 
                label="Daily Water Intake Goal (ml)" 
                type="number"
                value={onboardForm.goalWater}
                onChange={(e) => setOnboardForm({ ...onboardForm, goalWater: e.target.value })}
              />
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <Button variant="outline" onClick={() => setOnboardingStep(4)}>Back</Button>
                <Button onClick={() => setOnboardingStep(6)} style={{ flex: 1 }}>Continue</Button>
              </div>
            </div>
          )}

          {onboardingStep === 6 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center', alignItems: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={24} style={{ margin: 'auto' }} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Profile Configured!</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Your data is stored securely. You can modify these settings anytime from your dashboard settings.
              </p>
              <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '12px' }}>
                <Button variant="outline" onClick={() => setOnboardingStep(5)}>Back</Button>
                <Button onClick={handleOnboardSubmit} style={{ flex: 1 }}>Enter Dashboard</Button>
              </div>
            </div>
          )}
        </Card>
        
        {onboardingStep < 6 && (
          <button onClick={handleSkipOnboarding} style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem', alignSelf: 'center' }}>
            Skip onboarding and set up later
          </button>
        )}
      </div>
    );
  }

  const activeAppts = appointments.filter((a) => a.patientId === user?.id && ['Upcoming', 'Confirmed', 'In Consultation', 'Pending'].includes(a.status));
  const userRecords = healthRecords.filter((r) => r.patientId === user?.id);
  const sampleFallbackRecords = [
    { id: 'rec-cbc-01', name: 'Comprehensive Blood Count (CBC)', date: '18 Aug 2026', type: 'Lab Diagnostic Report' },
    { id: 'rec-xray-02', name: 'Chest X-Ray Digital Imaging', date: '12 Aug 2026', type: 'Radiology Report' },
    { id: 'rec-lipid-03', name: 'Lipid Profile & Cholesterol Panel', date: '04 Aug 2026', type: 'Blood Test Report' }
  ];
  const displayRecords = userRecords.length > 0 ? userRecords.slice(0, 3) : sampleFallbackRecords;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* BRAND HEADER BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #10b981 100%)',
        borderRadius: '24px',
        padding: '32px 36px',
        color: 'white',
        boxShadow: '0 12px 30px -8px rgba(15, 118, 110, 0.4)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            backdropFilter: 'blur(10px)'
          }}>
            <Heart size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white' }}>
                Good morning, {user?.name ? user.name.split(' ')[0] : 'Piyush'}. 👋
              </h1>
              <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: '12px', color: 'white' }}>
                {isPatientMvpOnly() ? 'Patient AI Health MVP' : 'Health OS Active'}
              </span>
            </div>
            <p style={{ opacity: 0.9, fontSize: '0.88rem', marginTop: '4px' }}>
              {isPatientMvpOnly() 
                ? 'Understand your health reports with AI, consult your JIVEXA Health AI Bot, and manage your health records.'
                : 'Track clinical vitals, manage appointments, and consult your JIVEXA Health AI Bot.'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
              <button
                onClick={detectLiveGPSLocation}
                title="Click to refresh live GPS location"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                  border: 'none',
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  padding: '4px 14px', 
                  borderRadius: '12px', 
                  color: '#ccfbf1', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  backdropFilter: 'blur(6px)',
                  cursor: 'pointer' 
                }}
              >
                <MapPin size={13} style={{ color: '#5eead4' }} />
                <span>{isLocating ? 'Detecting Live GPS Location...' : (userLocation?.address || 'Detecting Location...')}</span>
                <RefreshCw size={12} className={isLocating ? 'spin' : ''} style={{ opacity: 0.8 }} />
              </button>
            </div>
          </div>
        </div>

        {isPatientMvpOnly() ? (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/patient/ai-report-analyzer')}
              style={{
                backgroundColor: 'white',
                color: '#0f766e',
                border: 'none',
                borderRadius: '14px',
                padding: '12px 22px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
              }}
            >
              <Sparkles size={18} style={{ color: '#0f766e' }} />
              Analyze Health Report
            </button>
            <button 
              onClick={() => navigate('/patient/ai-assistant')}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '14px',
                padding: '12px 22px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backdropFilter: 'blur(8px)'
              }}
            >
              <MessageSquare size={18} />
              Talk to JIVEXA AI
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/patient/ambulance')}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                padding: '12px 20px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)'
              }}
            >
              <Siren size={18} />
              Book Ambulance
            </button>
            <button 
              onClick={() => navigate('/patient/ai-report-analyzer')}
              style={{
                backgroundColor: 'white',
                color: '#0f766e',
                border: 'none',
                borderRadius: '14px',
                padding: '12px 20px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
              }}
            >
              <Sparkles size={18} />
              Analyze Lab Report
            </button>
            <button 
              onClick={() => navigate('/patient/ai-assistant')}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '14px',
                padding: '12px 20px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backdropFilter: 'blur(8px)'
              }}
            >
              <MessageSquare size={18} />
              JIVEXA Health AI Bot
            </button>
            <button 
              onClick={() => navigate('/patient/appointments')}
              style={{
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 18px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Calendar size={16} />
              Book Consultation
            </button>
          </div>
        )}
      </div>

      {/* JIVEXA HEALTH ID CARD */}
      <div style={{
        background: 'linear-gradient(135deg, #0f766e 0%, #115e59 50%, #0d9488 100%)',
        borderRadius: '24px',
        padding: '24px 28px',
        color: 'white',
        boxShadow: '0 16px 32px -10px rgba(15, 118, 110, 0.35)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <ShieldCheck size={18} style={{ color: '#5eead4' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#ccfbf1' }}>Permanent Health Identifier</span>
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '0.04em', fontFamily: 'monospace', color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            {patientProfile?.jivexaHealthId || 'JXV-STVAZREW'}
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#e6fffa', opacity: 0.9 }}>
            {isPatientMvpOnly() 
              ? 'Your unique digital Health Identifier for personal records and AI health tracking'
              : 'Share your JHID with doctors to grant secure consent-based access to your health summary'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => {
              const hid = patientProfile?.jivexaHealthId || 'JXV-STVAZREW';
              navigator.clipboard.writeText(hid);
              setToastMsg(`JIVEXA Health ID (${hid}) copied to clipboard!`);
            }}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              borderRadius: '14px',
              padding: '10px 18px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Copy size={16} />
            Copy Health ID
          </button>

          <button
            onClick={() => setIsQrModalOpen(true)}
            style={{
              backgroundColor: 'white',
              color: '#0f766e',
              border: 'none',
              borderRadius: '14px',
              padding: '10px 18px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <QrCode size={16} />
            QR Badge
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }} className="grid-2-mobile">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* DOCTOR CONSENT, EMERGENCY MODE & AUDIT LOGS (PRESERVED FOR NON-MVP / ECOSYSTEM MODE) */}
          {!isPatientMvpOnly() && (
            <>
              {/* DOCTOR CONSENT ACCESS MANAGER CARD */}
              <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Lock size={20} style={{ color: 'var(--primary)' }} /><span style={{ fontWeight: 800, fontSize: '1.05rem' }}>Manage Doctor Access & Consent</span></div>}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Pending Consent Requests */}
                  {accessRequests.filter((r) => r.patientId === user?.id && r.status === 'pending').length > 0 && (
                    <div style={{ backgroundColor: 'var(--warning-light)', border: '1px solid var(--warning)', borderRadius: '16px', padding: '16px 20px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '12px' }}>
                        ⚡ Pending Access Requests ({accessRequests.filter((r) => r.patientId === user?.id && r.status === 'pending').length}):
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {accessRequests.filter((r) => r.patientId === user?.id && r.status === 'pending').map((req) => (
                          <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                            <div>
                              <h4 style={{ fontSize: '0.92rem', fontWeight: 800 }}>{req.doctorName}</h4>
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{req.doctorSpecialty} • Requested Access</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <Button size="sm" onClick={async () => {
                                await respondAccessRequest(req.id, 'approved');
                                setToastMsg(`Granted access to ${req.doctorName}.`);
                              }}>
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" onClick={async () => {
                                await respondAccessRequest(req.id, 'rejected');
                                setToastMsg(`Declined request from ${req.doctorName}.`);
                              }}>
                                Decline
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Approved Doctors List */}
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '10px' }}>
                      Authorized Doctors with Active Consent:
                    </span>
                    {accessRequests.filter((r) => r.patientId === user?.id && r.status === 'approved').length === 0 ? (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '12px 0' }}>
                        No doctors currently have authorized access to your Health ID summary.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {accessRequests.filter((r) => r.patientId === user?.id && r.status === 'approved').map((req) => (
                          <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '14px', padding: '12px 16px', backgroundColor: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <UserCheck size={18} style={{ color: 'var(--secondary)' }} />
                              <div>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{req.doctorName}</h4>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.doctorSpecialty}</span>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" onClick={async () => {
                              await revokeDoctorAccess(req.doctorId);
                              setToastMsg(`Revoked access for ${req.doctorName}.`);
                            }}>
                              Revoke Access
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </Card>

              {/* LEVEL 3 EMERGENCY ACCESS MODE CONTROLS */}
              <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Activity size={20} style={{ color: 'var(--secondary)' }} /><span style={{ fontWeight: 800, fontSize: '1.05rem' }}>Instant Emergency Access Sharing Mode</span></div>}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    Enable emergency instant sharing to allow ER responders to view critical emergency data using your Health ID without waiting for manual consent.
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', backgroundColor: '#f8fafc', padding: '16px 20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                        Emergency Mode: {patientProfile?.emergencySharingEnabled ? '⚡ ENABLED' : '🔒 DISABLED'}
                      </h4>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {patientProfile?.emergencySharingEnabled && patientProfile.emergencyAccessExpiry
                          ? `Active until ${new Date(patientProfile.emergencyAccessExpiry).toLocaleString()}`
                          : 'Disabled — standard consent rules apply.'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      {!patientProfile?.emergencySharingEnabled && (
                        <Select
                          value={String(emergencyExpiryHours)}
                          onChange={(val) => setEmergencyExpiryHours(Number(val))}
                          options={[
                            { value: '24', label: 'Duration: 24 Hours' },
                            { value: '48', label: 'Duration: 48 Hours' },
                            { value: '168', label: 'Duration: 7 Days' }
                          ]}
                          style={{ height: '42px', fontSize: '0.84rem', minWidth: '170px' }}
                        />
                      )}

                      <Button
                        isLoading={isTogglingEmergency}
                        onClick={async () => {
                          setIsTogglingEmergency(true);
                          const nextState = !patientProfile?.emergencySharingEnabled;
                          await toggleEmergencyAccessMode(nextState, emergencyExpiryHours);
                          setIsTogglingEmergency(false);
                          setToastMsg(`Emergency Access Mode ${nextState ? 'ENABLED' : 'DISABLED'}.`);
                        }}
                        style={{
                          backgroundColor: patientProfile?.emergencySharingEnabled ? 'var(--error)' : 'var(--secondary)',
                          borderRadius: '12px',
                          padding: '0 24px',
                          height: '42px',
                          fontWeight: 800,
                          fontSize: '0.86rem',
                          whiteSpace: 'nowrap',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        {patientProfile?.emergencySharingEnabled ? 'Disable Emergency Mode' : 'Enable Emergency Mode'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* AUDIT ACCESS LOG HISTORY */}
              <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Clock size={20} style={{ color: 'var(--primary)' }} /><span style={{ fontWeight: 800, fontSize: '1.05rem' }}>Health ID Access Audit Logs</span></div>}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Immutable log of all public lookups, emergency views, and practitioner accesses to your Health ID profile.
                  </span>

                  {accessLogs.length === 0 ? (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '12px 0' }}>
                      No access events recorded yet. Every Health ID query will be logged here in real-time.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                      {accessLogs.map((log) => (
                        <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dotted var(--border)', paddingBottom: '8px', fontSize: '0.82rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              backgroundColor: log.accessType === 'DOCTOR_CLINICAL_FULL' ? 'var(--primary-light)' : log.accessType === 'EMERGENCY_MODE_INSTANT' ? 'var(--secondary-light)' : '#f1f5f9',
                              color: log.accessType === 'DOCTOR_CLINICAL_FULL' ? 'var(--primary)' : log.accessType === 'EMERGENCY_MODE_INSTANT' ? 'var(--secondary)' : 'var(--text-muted)'
                            }}>
                              {log.accessorRole}
                            </span>
                            <span style={{ fontWeight: 600 }}>{log.accessType.replace(/_/g, ' ')}</span>
                          </div>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                            {new Date(log.accessedAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </>
          )}

          {/* REAL-TIME DAILY VITALS TRACKER WIDGETS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }} className="grid-2-mobile">
            
            {/* STEPS TRACKER */}
            <div 
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid var(--border)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Footprints size={16} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase' }}>Daily Steps</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => {
                      const next = Math.min(dailySteps + 500, 20000);
                      setDailySteps(next);
                      setToastMsg(`Logged +500 steps! Total today: ${next.toLocaleString()} steps.`);
                    }}
                    style={{
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '4px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    +500
                  </button>
                  <button
                    onClick={() => {
                      const next = Math.min(dailySteps + 1000, 20000);
                      setDailySteps(next);
                      setToastMsg(`Logged +1,000 steps! Total today: ${next.toLocaleString()} steps.`);
                    }}
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '4px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    +1,000
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)' }}>{dailySteps.toLocaleString()}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ {stepsGoal.toLocaleString()} steps</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', marginLeft: 'auto' }}>
                  {Math.round((dailySteps / stepsGoal) * 100)}%
                </span>
              </div>

              <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginTop: '6px' }}>
                <div style={{ width: `${Math.min((dailySteps / stepsGoal) * 100, 100)}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width 0.3s ease' }} />
              </div>
            </div>

            {/* WATER HYDRATION TRACKER */}
            <div 
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid var(--border)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Droplet size={16} style={{ color: '#0284c7' }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase' }}>Water Hydration</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => {
                      const next = Math.min(dailyWater + 250, 6000);
                      setDailyWater(next);
                      setToastMsg(`Logged +250 ml water! Total today: ${next} ml.`);
                    }}
                    style={{
                      backgroundColor: '#e0f2fe',
                      color: '#0284c7',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '4px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    +250 ml
                  </button>
                  <button
                    onClick={() => {
                      const next = Math.min(dailyWater + 500, 6000);
                      setDailyWater(next);
                      setToastMsg(`Logged +500 ml water! Total today: ${next} ml.`);
                    }}
                    style={{
                      backgroundColor: '#0284c7',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '4px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    +500 ml
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)' }}>{dailyWater.toLocaleString()}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ {waterGoal.toLocaleString()} ml</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0284c7', marginLeft: 'auto' }}>
                  {Math.round((dailyWater / waterGoal) * 100)}%
                </span>
              </div>

              <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginTop: '6px' }}>
                <div style={{ width: `${Math.min((dailyWater / waterGoal) * 100, 100)}%`, height: '100%', backgroundColor: '#0284c7', transition: 'width 0.3s ease' }} />
              </div>
            </div>

          </div>

          {isPatientMvpOnly() ? (
            /* COMING SOON CAPABILITIES (NON-CLICKABLE ROADMAP SECTION) */
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontWeight: 800 }}>Coming Soon — Ecosystem Capabilities</span>
                </div>
              }
              headerAction={
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '3px 8px', borderRadius: '4px' }}>
                  Roadmap
                </span>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.5' }}>
                  Jivexa is currently operating in <strong>Patient AI Health MVP Mode</strong>. Clinical doctor networks, medicine delivery, and emergency fleet services will launch in subsequent phases:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }} className="grid-2-mobile">
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Heart size={20} style={{ color: '#0d9488', flexShrink: 0 }} />
                    <div>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Doctor Care</h5>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Coming Soon (V2)</span>
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Pill size={20} style={{ color: '#d97706', flexShrink: 0 }} />
                    <div>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Pharmacy & Medicines</h5>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Coming Soon (V3)</span>
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Siren size={20} style={{ color: '#dc2626', flexShrink: 0 }} />
                    <div>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Ambulance Assistance</h5>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Coming Soon (V4)</span>
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <MapPin size={20} style={{ color: '#2563eb', flexShrink: 0 }} />
                    <div>
                      <h5 style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>Healthcare Directory</h5>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Coming Soon (V5)</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card 
              title="Upcoming Consultations"
              headerAction={
                <Link to="/patient/appointments" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Manage Bookings</Link>
              }
            >
              {activeAppts.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Calendar size={32} style={{ color: 'var(--text-light)', marginBottom: '12px' }} />
                  <p style={{ fontSize: '0.9rem' }}>No upcoming doctor appointments scheduled.</p>
                  <Button variant="outline" onClick={() => navigate('/patient/doctors')} style={{ marginTop: '12px' }}>Find a Practitioner</Button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {activeAppts.map((appt) => (
                    <div 
                      key={appt.id}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      className="flex-col-mobile gap-sm"
                    >
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                          <span style={{ margin: 'auto' }}>{appt.doctorName.charAt(4)}</span>
                        </div>
                        <div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{appt.doctorName}</h4>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{appt.doctorSpecialty} • Video Consultation</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }} className="w-100-mobile justify-between">
                        <div style={{ textAlign: 'right' }} className="text-left-mobile">
                          <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>{new Date(appt.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-light)' }}>{appt.time}</span>
                        </div>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 600, 
                          padding: '4px 10px', 
                          backgroundColor: appt.status === 'In Consultation' ? 'var(--warning-light)' : (appt.status === 'Pending' ? 'var(--error-light)' : 'var(--secondary-light)'), 
                          color: appt.status === 'In Consultation' ? 'var(--warning)' : (appt.status === 'Pending' ? 'var(--error)' : 'var(--secondary)'),
                          borderRadius: '4px' 
                        }}>
                          {appt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Quick Operations</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }} className="grid-2-mobile">
              <div 
                onClick={() => navigate('/patient/ai-report-analyzer')}
                className="card card-hover" 
                style={{ textAlign: 'center', padding: '20px 12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
              >
                <FileText size={22} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Analyze Report</span>
              </div>
              <div 
                onClick={() => navigate('/patient/ai-assistant')}
                className="card card-hover" 
                style={{ textAlign: 'center', padding: '20px 12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
              >
                <MessageSquare size={22} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Talk to AI</span>
              </div>
              <div 
                onClick={() => navigate('/patient/health-records')}
                className="card card-hover" 
                style={{ textAlign: 'center', padding: '20px 12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
              >
                <Clipboard size={22} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>View Records</span>
              </div>
              <div 
                onClick={() => navigate('/patient/profile')}
                className="card card-hover" 
                style={{ textAlign: 'center', padding: '20px 12px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
              >
                <UserCheck size={22} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>My Profile</span>
              </div>
            </div>
          </div>

        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* MY HEALTH PROFILE CARD */}
          <Card title="My Health Profile">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-light)', fontWeight: 500 }}>Blood Group</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{patientProfile?.bloodGroup || 'O+'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-light)', fontWeight: 500 }}>Active Allergies</span>
                <span style={{ fontWeight: 700, color: 'var(--error)' }}>{patientProfile?.allergies || 'Peanuts, Penicillin (mild)'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-light)', fontWeight: 500 }}>Diagnosed Conditions</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{patientProfile?.conditions || 'Mild Asthma'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ color: 'var(--text-light)', fontWeight: 500 }}>Emergency Contact</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{patientProfile?.emergencyContact || (user?.email ? `${user.name} (${user.email})` : 'Emergency Contact Not Set')}</span>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsEditProfileModalOpen(true)} 
                style={{ marginTop: '8px', height: '38px', fontSize: '0.82rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Edit3 size={14} /> Update Health Info
              </Button>
            </div>
          </Card>

          {/* RECENT DOCUMENTS CARD */}
          <Card 
            title="Recent Documents"
            headerAction={<Link to="/patient/health-records" style={{ fontSize: '0.85rem', fontWeight: 600 }}>View All</Link>}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {displayRecords.map((rec) => (
                <div 
                  key={rec.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.82rem',
                    borderBottom: '1px solid var(--border)',
                    paddingBottom: '8px'
                  }}
                >
                  <Clipboard size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <div style={{ overflow: 'hidden', flex: 1 }}>
                    <span style={{ display: 'block', fontWeight: 700, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--text-main)' }}>{rec.name}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>{rec.date} • {rec.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}

      {/* QR BADGE MODAL */}
      <Modal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} title="Your JIVEXA Health ID QR Badge">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '10px 0', textAlign: 'center' }}>
          <div style={{ backgroundColor: 'white', border: '3px solid var(--primary)', borderRadius: '24px', padding: '24px', boxShadow: 'var(--shadow-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '160px', height: '160px', borderRadius: '16px', background: 'linear-gradient(135deg, #0f766e 0%, #10b981 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <QrCode size={110} />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'monospace', color: 'var(--primary)' }}>
              {patientProfile?.jivexaHealthId || 'JXV-STVAZREW'}
            </span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '340px' }}>
            Present this QR Badge or Health ID to authorized healthcare practitioners to grant instant consent-based clinical summary access.
          </p>

          <Button onClick={() => setIsQrModalOpen(false)} style={{ borderRadius: '12px', width: '100%' }}>Close QR Badge</Button>
        </div>
      </Modal>

      {/* EDIT PROFILE MODAL */}
      <Modal isOpen={isEditProfileModalOpen} onClose={() => setIsEditProfileModalOpen(false)} title="Update Your Health Profile">
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0' }}>
          <Select 
            label="Blood Group"
            options={[
              { value: 'A+ Positive', label: 'A+ Positive' },
              { value: 'A- Negative', label: 'A- Negative' },
              { value: 'B+ Positive', label: 'B+ Positive' },
              { value: 'B- Negative', label: 'B- Negative' },
              { value: 'AB+ Positive', label: 'AB+ Positive' },
              { value: 'AB- Negative', label: 'AB- Negative' },
              { value: 'O+ Positive', label: 'O+ Positive' },
              { value: 'O- Negative', label: 'O- Negative' }
            ]}
            value={editForm.bloodGroup}
            onChange={(val) => setEditForm({ ...editForm, bloodGroup: val })}
          />
          <Input 
            label="Active Allergies" 
            placeholder="e.g. Peanuts, Penicillin (mild)"
            value={editForm.allergies}
            onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })}
          />
          <Input 
            label="Diagnosed Conditions" 
            placeholder="e.g. Mild Asthma, Hypertension"
            value={editForm.conditions}
            onChange={(e) => setEditForm({ ...editForm, conditions: e.target.value })}
          />
          <Input 
            label="Emergency Contact" 
            placeholder="e.g. contact@example.com (+91 99887 76655)"
            value={editForm.emergencyContact}
            onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
          />
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <Button type="button" variant="outline" onClick={() => setIsEditProfileModalOpen(false)} style={{ flex: 1 }}>
              Cancel
            </Button>
            <Button type="submit" style={{ flex: 1 }}>
              Save Profile Info
            </Button>
          </div>
        </form>
      </Modal>

      <style>{`
        @media (max-width: 768px) {
          .flex-col-mobile { flex-direction: column !important; align-items: flex-start !important; }
          .text-left-mobile { text-align: left !important; }
          .w-100-mobile { width: 100% !important; }
        }
      `}</style>
    </div>
  );
};
