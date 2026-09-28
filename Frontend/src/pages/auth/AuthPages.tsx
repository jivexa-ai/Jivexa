import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { BrandLogo } from '../../components/common/BrandLogo';
import { RoleIllustrationGraphic } from '../../components/common/RoleIllustrations';
import { 
  Heart, Shield, Check, Lock, Mail, User, Stethoscope, 
  Pill, Siren, CheckCircle2, ShieldCheck, ArrowRight, RefreshCw, FileText, ExternalLink, AlertTriangle, KeyRound
} from 'lucide-react';

// --- ROLE HIGHLIGHTS CONFIGURATION ---
const roleHighlights: Record<UserRole, {
  badge: string;
  title: string;
  desc: string;
  gradient: string;
  features: string[];
}> = {
  PATIENT: {
    badge: 'HEALTH VAULT',
    title: 'Your Complete Health Records & Digital Care.',
    desc: 'Easily manage your health records, lab reports, doctor prescriptions, and emergency care in one secure place.',
    gradient: 'linear-gradient(135deg, #0284c7 0%, #0f766e 100%)',
    features: ['Instant Lab Report Analysis', 'Secure Health ID Access', '24/7 Emergency Ambulance Booking']
  },
  DOCTOR: {
    badge: 'DOCTOR PORTAL',
    title: 'Streamlined Patient Consultations & Digital Records.',
    desc: 'Conduct online & in-clinic consultations, review patient medical history with consent, and issue instant digital prescriptions.',
    gradient: 'linear-gradient(135deg, #059669 0%, #065f46 100%)',
    features: ['NMC Verified Practitioner', 'E-Prescriptions & Verification', 'Integrated Patient Health History']
  },
  AMBULANCE_PARTNER: {
    badge: 'EMERGENCY 24/7',
    title: 'Rapid Emergency Dispatch & Fleet Navigation.',
    desc: 'Accept nearby emergency dispatch requests, navigate to patient locations, and coordinate with hospital emergency departments.',
    gradient: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
    features: ['Commercial Vehicle Verification', 'Basic & ICU Fleet Options', 'Hospital Emergency Pre-Notification']
  },
  PHARMACY: {
    badge: 'PHARMACY HUB',
    title: 'Verified Digital Rx Dispensing & Inventory.',
    desc: 'Process verified doctor prescriptions, manage medicine inventory stock, and track home delivery orders for patients.',
    gradient: 'linear-gradient(135deg, #d97706 0%, #92400e 100%)',
    features: ['State Drug License Verified', 'Medicine Inventory Sync', 'Order Delivery Dispatch']
  },
  ADMIN: {
    badge: 'ADMIN PORTAL',
    title: 'Administrative Security & System Control.',
    desc: 'Platform analytics, practitioner verification, and security compliance.',
    gradient: 'linear-gradient(135deg, #4338ca 0%, #312e81 100%)',
    features: ['System Verification', 'Practitioner Licensing', 'Platform Controls']
  }
};

// --- LEFT HERO ILLUSTRATION PANEL ---
const AuthHeroPanel: React.FC<{ activeRole: UserRole }> = ({ activeRole }) => {
  const graphic = roleHighlights[activeRole] || roleHighlights.PATIENT;

  return (
    <div style={{
      flex: '1.1',
      background: graphic.gradient,
      borderRadius: '28px',
      padding: '36px 32px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      gap: '24px',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 24px 48px -12px rgba(2, 132, 199, 0.35)',
      height: '100%',
      transition: 'background 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      boxSizing: 'border-box'
    }} className="sr-mobile-hide">
      
      {/* Ambient Lighting Overlay */}
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '360px', height: '360px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%)', filter: 'blur(45px)', pointerEvents: 'none' }} />

      {/* Top Header Lockup */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ flexShrink: 0 }}>
          <BrandLogo size="sm" variant="light" />
        </div>
        <span style={{
          fontSize: '0.68rem',
          fontWeight: 800,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          backgroundColor: 'rgba(255, 255, 255, 0.18)',
          color: '#ffffff',
          padding: '6px 14px',
          borderRadius: '16px',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          boxSizing: 'border-box'
        }}>
          {graphic.badge}
        </span>
      </div>

      {/* DEDICATED 3D ILLUSTRATION CONTAINER */}
      <div style={{ position: 'relative', zIndex: 10, margin: '12px 0 8px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <RoleIllustrationGraphic role={activeRole} />
      </div>

      {/* Bottom Text Narrative & Feature Checklist */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h2 style={{ fontSize: '1.55rem', fontWeight: 900, color: 'white', lineHeight: '1.25', letterSpacing: '-0.02em' }}>
          {graphic.title}
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#e2e8f0', lineHeight: '1.55' }}>
          {graphic.desc}
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
          {graphic.features.map((feat, idx) => (
            <span key={idx} style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              backgroundColor: 'rgba(255, 255, 255, 0.14)',
              color: '#ffffff',
              padding: '4px 10px',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Check size={12} style={{ color: '#38bdf8' }} />
              {feat}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
};

// --- SELECTABLE ROLE CARDS COMPONENT ---
const RoleSelectorCards: React.FC<{ activeRole: UserRole; onSelectRole: (role: UserRole) => void }> = ({ activeRole, onSelectRole }) => {
  const roles = [
    {
      id: 'PATIENT' as UserRole,
      title: 'Patient',
      desc: 'Personal Health & AI Insights',
      icon: <User size={18} style={{ color: activeRole === 'PATIENT' ? '#0284c7' : 'var(--text-muted)' }} />,
      color: '#0284c7'
    },
    {
      id: 'DOCTOR' as UserRole,
      title: 'Doctor',
      desc: 'Clinical Consults & Digital Rx',
      icon: <Stethoscope size={18} style={{ color: activeRole === 'DOCTOR' ? '#10b981' : 'var(--text-muted)' }} />,
      color: '#10b981'
    },
    {
      id: 'AMBULANCE_PARTNER' as UserRole,
      title: 'Ambulance',
      desc: '24/7 Emergency Dispatch Fleet',
      icon: <Siren size={18} style={{ color: activeRole === 'AMBULANCE_PARTNER' ? '#ef4444' : 'var(--text-muted)' }} />,
      color: '#ef4444'
    },
    {
      id: 'PHARMACY' as UserRole,
      title: 'Pharmacy',
      desc: 'Medicine Orders & Stock Sync',
      icon: <Pill size={18} style={{ color: activeRole === 'PHARMACY' ? '#f59e0b' : 'var(--text-muted)' }} />,
      color: '#f59e0b'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
      <label style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
        Select Account Category:
      </label>

      <div className="grid-2-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {roles.map((r) => {
          const isSelected = activeRole === r.id;
          return (
            <div
              key={r.id}
              onClick={() => onSelectRole(r.id)}
              style={{
                border: isSelected ? `2px solid ${r.color}` : '1.5px solid var(--border)',
                backgroundColor: isSelected ? 'var(--surface-raised)' : 'var(--surface)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isSelected ? '0 6px 18px -4px rgba(2, 132, 199, 0.2)' : 'none',
                position: 'relative'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: isSelected ? 'var(--surface)' : 'var(--surface-raised)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {r.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</h4>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {r.desc}
                </p>
              </div>

              {isSelected && (
                <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                  <CheckCircle2 size={15} style={{ color: r.color }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- LOGIN VIEW ---
export const Login: React.FC = () => {
  const { isAuthenticated, role, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialRole = (): UserRole => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role')?.toUpperCase();
    if (roleParam === 'AMBULANCE' || roleParam === 'AMBULANCE_PARTNER') return 'AMBULANCE_PARTNER';
    if (roleParam === 'DOCTOR') return 'DOCTOR';
    if (roleParam === 'PHARMACY') return 'PHARMACY';
    return 'PATIENT';
  };

  const [activeRole, setActiveRole] = useState<UserRole>(getInitialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && role) {
      const dashboardRoutes: Record<UserRole, string> = {
        PATIENT: '/patient/dashboard',
        DOCTOR: '/doctor/dashboard',
        PHARMACY: '/pharmacy/dashboard',
        ADMIN: '/admin/dashboard',
        AMBULANCE_PARTNER: '/ambulance/dashboard'
      };
      navigate(dashboardRoutes[role], { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  useEffect(() => {
    const roleFromUrl = getInitialRole();
    setActiveRole(roleFromUrl);
  }, [location.search]);

  const handleTabChange = (role: UserRole) => {
    setActiveRole(role);
    setError('');
    setEmailError('');
    setPasswordError('');
  };

  const getRoleLoginTitle = () => {
    switch (activeRole) {
      case 'DOCTOR': return 'Sign In as Doctor';
      case 'AMBULANCE_PARTNER': return 'Sign In as Ambulance Partner';
      case 'PHARMACY': return 'Sign In as Pharmacist';
      default: return 'Sign In as Patient';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    let hasError = false;
    setEmailError('');
    setPasswordError('');
    setError('');

    if (!trimmedEmail) {
      setEmailError('Please enter your email address.');
      hasError = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setEmailError('Please enter a valid email address (e.g. user@domain.com).');
        hasError = true;
      }
    }

    if (!trimmedPassword) {
      setPasswordError('Please enter your password.');
      hasError = true;
    } else if (trimmedPassword.length < 3) {
      setPasswordError('Password must be at least 3 characters long.');
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);

    try {
      const res = await login(trimmedEmail, trimmedPassword, activeRole);
      if (res.success && res.role) {
        const dashboardRoutes: Record<UserRole, string> = {
          PATIENT: '/patient/dashboard',
          DOCTOR: '/doctor/dashboard',
          PHARMACY: '/pharmacy/dashboard',
          ADMIN: '/admin/dashboard',
          AMBULANCE_PARTNER: '/ambulance/dashboard'
        };
        navigate(dashboardRoutes[res.role]);
      } else if (res.requireOtp) {
        navigate(`/signup?step=verify-otp&email=${encodeURIComponent(res.email || trimmedEmail)}&role=${activeRole}`);
      } else {
        const errMsg = res.error || 'Login failed. Please check your credentials.';
        if (errMsg.toLowerCase().includes('password')) {
          setPasswordError(errMsg);
        } else {
          setEmailError(errMsg);
        }
      }
    } catch (err) {
      setEmailError('An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - var(--header-height) - 40px)',
      padding: '24px 20px',
      background: 'radial-gradient(circle at 50% 20%, rgba(2, 132, 199, 0.08) 0%, rgba(16, 185, 129, 0.04) 50%, transparent 80%)'
    }}>
      <div className="flex-col-mobile" style={{
        display: 'flex',
        maxWidth: '1040px',
        width: '100%',
        gap: '32px',
        alignItems: 'stretch'
      }}>
        {/* Left Side Dynamic 3D Illustration Panel */}
        <AuthHeroPanel activeRole={activeRole} />

        {/* Right Side Glassmorphism Form */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Card title={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              <div style={{ display: 'none' }} className="sr-mobile-block">
                <BrandLogo size="md" />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
                {getRoleLoginTitle()}
              </h2>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                Select your account category below and enter your credentials.
              </span>
            </div>
          } className="mobile-p-16" style={{ width: '100%', borderRadius: '24px', boxShadow: 'var(--shadow-xl)', padding: '32px' }}>

            {/* 1. ROLE CARDS (BEFORE EMAIL FIELD) */}
            <RoleSelectorCards activeRole={activeRole} onSelectRole={handleTabChange} />

            {/* 2. AUTHENTICATION INPUT FIELDS */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <Input 
                label="Email Address *" 
                type="text" 
                placeholder="name@domain.com" 
                icon={<Mail size={16} />}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                  if (error) setError('');
                }}
                error={emailError}
                required
              />

              <Input 
                label="Password *" 
                type="password" 
                placeholder="••••••••" 
                icon={<Lock size={16} />}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                  if (error) setError('');
                }}
                error={passwordError}
                required
              />

              <div style={{ textAlign: 'right' }}>
                <Link to="/forgot-password" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>Forgot password?</Link>
              </div>

              <Button type="submit" isLoading={isLoading} fullWidth style={{ height: '46px', fontSize: '0.98rem', fontWeight: 800 }}>
                Sign In as {activeRole === 'PATIENT' ? 'Patient' : activeRole === 'DOCTOR' ? 'Doctor' : activeRole === 'PHARMACY' ? 'Pharmacist' : 'Ambulance Partner'}
              </Button>
              
              <div style={{ textAlign: 'center', fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                Don't have an account? <Link to={`/signup?role=${activeRole}`} style={{ fontWeight: 800, color: 'var(--primary)' }}>Create Account</Link>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

// --- SIGNUP VIEW WITH STEP 2 OTP & ROLE VERIFICATION ---
export const Signup: React.FC = () => {
  const { signup, verifyEmail, sendOTP, submitRoleVerification } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialRole = (): UserRole => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role')?.toUpperCase();
    if (roleParam === 'AMBULANCE' || roleParam === 'AMBULANCE_PARTNER') return 'AMBULANCE_PARTNER';
    if (roleParam === 'DOCTOR') return 'DOCTOR';
    if (roleParam === 'PHARMACY') return 'PHARMACY';
    return 'PATIENT';
  };

  // Step Machine: 'FORM' | 'OTP' | 'ROLE_VERIFICATION'
  const [step, setStep] = useState<'FORM' | 'OTP' | 'ROLE_VERIFICATION'>('FORM');
  const [role, setRole] = useState<UserRole>(getInitialRole);

  // Registration Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Field Level Error States
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  
  // Role Specific Credentials (Asked in Step 3 after OTP)
  const [nmcRegistrationNumber, setNmcRegistrationNumber] = useState('');
  const [stateMedicalCouncil, setStateMedicalCouncil] = useState('Karnataka Medical Council');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [drugLicenseNumber, setDrugLicenseNumber] = useState('');
  const [gstin, setGstin] = useState('');

  // OTP State
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const stepParam = params.get('step');
    const emailParam = params.get('email');
    const roleFromUrl = getInitialRole();

    setRole(roleFromUrl);

    if (stepParam === 'verify-otp' && emailParam) {
      setEmail(emailParam);
      setMaskedEmail(emailParam.replace(/(.{2})(.*)(?=@)/, '$1***'));
      setStep('OTP');
    }
  }, [location.search]);

  // Resend Timer Countdown
  useEffect(() => {
    let interval: any = null;
    if (step === 'OTP' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const updated = [...otpDigits];
    updated[index] = val.slice(-1);
    setOtpDigits(updated);

    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      setOtpDigits(pasted.split(''));
      otpInputRefs.current[5]?.focus();
    }
  };

  const getRoleSignupTitle = () => {
    switch (role) {
      case 'DOCTOR': return 'Register Doctor Practitioner';
      case 'AMBULANCE_PARTNER': return 'Register Emergency Ambulance Fleet';
      case 'PHARMACY': return 'Register Licensed Pharmacy Hub';
      default: return 'Register Patient Account';
    }
  };

  // STEP 1: INITIAL REGISTRATION SUBMIT (BASIC CREDENTIALS ONLY)
  const handleInitialSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirm = confirmPassword.trim();

    let hasError = false;
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmError('');
    setError('');

    if (!trimmedName) {
      setNameError('Please enter your full name.');
      hasError = true;
    } else if (trimmedName.length < 3) {
      setNameError('Full name must be at least 3 characters long.');
      hasError = true;
    }

    if (!trimmedEmail) {
      setEmailError('Please enter your email address.');
      hasError = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        setEmailError('Please enter a valid email address (e.g. user@domain.com).');
        hasError = true;
      }
    }

    if (!trimmedPassword) {
      setPasswordError('Please choose a password.');
      hasError = true;
    } else if (trimmedPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      hasError = true;
    } else if (!/[A-Z]/.test(trimmedPassword)) {
      setPasswordError('Password must contain at least one uppercase letter (A-Z).');
      hasError = true;
    } else if (!/[a-z]/.test(trimmedPassword)) {
      setPasswordError('Password must contain at least one lowercase letter (a-z).');
      hasError = true;
    } else if (!/[0-9]/.test(trimmedPassword)) {
      setPasswordError('Password must contain at least one number (0-9).');
      hasError = true;
    } else if (!/[^A-Za-z0-9]/.test(trimmedPassword)) {
      setPasswordError('Password must contain at least one special symbol (@!#$ etc.).');
      hasError = true;
    }

    if (!trimmedConfirm) {
      setConfirmError('Please confirm your password.');
      hasError = true;
    } else if (trimmedPassword !== trimmedConfirm) {
      setConfirmError('Passwords do not match. Please re-enter your password.');
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);

    try {
      const res = await signup(trimmedEmail, trimmedName, role, trimmedPassword);
      if (res.success) {
        if (role === 'PATIENT') {
          setSuccessMsg('🎉 Account registered successfully! Opening dashboard...');
          setTimeout(() => {
            navigate('/patient/dashboard');
          }, 800);
        } else {
          setStep('ROLE_VERIFICATION');
        }
      } else {
        const errMsg = res.error || 'Registration failed.';
        if (errMsg.toLowerCase().includes('password')) {
          setPasswordError(errMsg);
        } else if (errMsg.toLowerCase().includes('name')) {
          setNameError(errMsg);
        } else {
          setEmailError(errMsg);
        }
      }
    } catch (err) {
      setEmailError('An unexpected error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: VERIFY 6-DIGIT EMAIL OTP (FOR FUTURE OTP USE)
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length < 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const res = await verifyEmail(code, email);
      if (res.success) {
        if (role === 'PATIENT') {
          setSuccessMsg('🎉 Email verified successfully! Activating account...');
          setTimeout(() => {
            navigate('/patient/dashboard');
          }, 1200);
        } else {
          setStep('ROLE_VERIFICATION');
        }
      } else {
        setError(res.error || 'OTP verification failed. Please check the code.');
      }
    } catch (err) {
      setError('Error verifying OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 3: SUBMIT PROFESSIONAL ROLE CREDENTIALS (AFTER INITIAL REGISTRATION)
  const handleRoleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Role-specific credential validation
    const payload: Record<string, any> = { email, role };
    if (role === 'DOCTOR') {
      if (!nmcRegistrationNumber.trim() || !stateMedicalCouncil.trim()) {
        setError('Please enter your NMC Registration Number and State Medical Council.');
        return;
      }
      payload.nmcRegistrationNumber = nmcRegistrationNumber;
      payload.stateMedicalCouncil = stateMedicalCouncil;
    } else if (role === 'AMBULANCE_PARTNER') {
      if (!vehicleNumber.trim()) {
        setError('Please enter your Commercial Vehicle Registration (RC) Number.');
        return;
      }
      payload.vehicleNumber = vehicleNumber;
    } else if (role === 'PHARMACY') {
      if (!drugLicenseNumber.trim() || !gstin.trim()) {
        setError('Please enter your State Drug License Number and GSTIN Registration.');
        return;
      }
      payload.drugLicenseNumber = drugLicenseNumber;
      payload.gstin = gstin;
    }

    setIsLoading(true);

    try {
      await submitRoleVerification(payload);
      setSuccessMsg('🎉 Professional verification details submitted! Workstation activated.');
      setTimeout(() => {
        const dashboardRoutes: Record<UserRole, string> = {
          PATIENT: '/patient/dashboard',
          DOCTOR: '/doctor/dashboard',
          PHARMACY: '/pharmacy/dashboard',
          ADMIN: '/admin/dashboard',
          AMBULANCE_PARTNER: '/ambulance/dashboard'
        };
        navigate(dashboardRoutes[role] || '/patient/dashboard');
      }, 1000);
    } catch (err) {
      setError('An error occurred submitting professional credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setError('');
    setSuccessMsg('');

    const res = await sendOTP(email);
    if (res.success) {
      setSuccessMsg(`New 6-digit verification code sent to ${res.maskedEmail || email}`);
      setPreviewUrl(res.previewUrl || null);
      setResendTimer(45);
      setCanResend(false);
    } else {
      setError(res.error || 'Could not resend OTP email.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - var(--header-height) - 40px)',
      padding: '24px 20px',
      background: 'radial-gradient(circle at 50% 20%, rgba(2, 132, 199, 0.08) 0%, rgba(16, 185, 129, 0.04) 50%, transparent 80%)'
    }}>
      <div className="flex-col-mobile" style={{
        display: 'flex',
        maxWidth: '1040px',
        width: '100%',
        gap: '32px',
        alignItems: 'stretch'
      }}>
        {/* Left Side Dynamic 3D Illustration Panel */}
        <AuthHeroPanel activeRole={role} />

        {/* Right Side Form Card */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Card title={
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              <div style={{ display: 'none' }} className="sr-mobile-block">
                <BrandLogo size="md" />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
                {step === 'OTP' ? 'Verify Email OTP' : step === 'ROLE_VERIFICATION' ? 'Professional Licensing & Verification' : getRoleSignupTitle()}
              </h2>
              <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                {step === 'OTP' 
                  ? `Enter the 6-digit code sent to ${maskedEmail || email}.`
                  : step === 'ROLE_VERIFICATION'
                  ? 'Provide mandatory practitioner credentials to complete registration and activate your workstation.'
                  : 'Select your account category below and complete basic registration.'}
              </span>
            </div>
          } className="mobile-p-16" style={{ width: '100%', borderRadius: '24px', boxShadow: 'var(--shadow-xl)', padding: '32px' }}>

            {/* STEP 1: INITIAL REGISTRATION FORM (BASIC CREDENTIALS ONLY - NO LICENSE CARDS) */}
            {step === 'FORM' && (
              <>
                {/* 1. SELECTABLE ROLE CARDS (BEFORE NAME FIELD) */}
                <RoleSelectorCards activeRole={role} onSelectRole={(r) => setRole(r)} />

                {/* 2. BASIC REGISTRATION INPUT FIELDS */}
                <form onSubmit={handleInitialSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Input 
                    label="Full Name *" 
                    placeholder="User Name" 
                    icon={<User size={16} />}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (nameError) setNameError('');
                      if (error) setError('');
                    }}
                    error={nameError}
                    required
                  />

                  <Input 
                    label="Email Address *" 
                    type="text" 
                    placeholder="abc@abc.in" 
                    icon={<Mail size={16} />}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                      if (error) setError('');
                    }}
                    error={emailError}
                    required
                  />

                  <Input 
                    label="Choose Password *" 
                    type="password" 
                    placeholder="••••••••" 
                    icon={<Lock size={16} />}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                      if (error) setError('');
                    }}
                    error={passwordError}
                    required
                  />

                  <Input 
                    label="Confirm Password *" 
                    type="password" 
                    placeholder="••••••••" 
                    icon={<Lock size={16} />}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (confirmError) setConfirmError('');
                      if (error) setError('');
                    }}
                    error={confirmError}
                    required
                  />

                  <Button type="submit" isLoading={isLoading} fullWidth style={{ height: '48px', fontSize: '1rem', fontWeight: 800, marginTop: '8px' }}>
                    Register Account
                  </Button>
                  
                  <div style={{ textAlign: 'center', fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Already have an account? <Link to={`/login?role=${role}`} style={{ fontWeight: 800, color: 'var(--primary)' }}>Sign In</Link>
                  </div>
                </form>
              </>
            )}

            {/* STEP 2: 6-DIGIT EMAIL OTP VERIFICATION SCREEN (OPTIONAL FUTURE OTP USE) */}
            {step === 'OTP' && (
              <form onSubmit={handleVerifyOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {error && (
                  <div style={{ backgroundColor: 'var(--error-light)', border: '1px solid var(--error)', padding: '12px 14px', borderRadius: '14px', color: 'var(--error)', fontSize: '0.86rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={18} />
                    <span>{error}</span>
                  </div>
                )}

                {successMsg && (
                  <div style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac', padding: '12px 14px', borderRadius: '14px', color: '#15803d', fontSize: '0.86rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={18} />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* OTP INPUT BOXES */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', padding: '12px 0 4px 0' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <KeyRound size={24} />
                  </div>
                  <label style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-dark)' }}>Enter 6-Digit Email Verification Code *</label>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { otpInputRefs.current[idx] = el; }}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        onPaste={handlePaste}
                        style={{
                          width: '44px',
                          height: '52px',
                          borderRadius: '12px',
                          border: digit ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                          fontSize: '1.3rem',
                          fontWeight: 900,
                          textAlign: 'center',
                          backgroundColor: digit ? '#f0f9ff' : 'white',
                          color: 'var(--primary)',
                          outline: 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>

                <Button type="submit" isLoading={isLoading} fullWidth style={{ height: '48px', fontSize: '1rem', fontWeight: 900, borderRadius: '14px' }}>
                  Verify Code & Continue
                </Button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                  <button
                    type="button"
                    onClick={() => setStep('FORM')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}
                  >
                    ← Change Email
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={!canResend}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: canResend ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: 800,
                      cursor: canResend ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {canResend ? 'Resend OTP Code' : `Resend code in ${resendTimer}s`}
                  </button>
                </div>

              </form>
            )}

            {/* STEP 3: PROFESSIONAL ROLE LICENSING CREDENTIALS FORM (TRIGGERS AFTER INITIAL REGISTRATION) */}
            {step === 'ROLE_VERIFICATION' && (
              <form onSubmit={handleRoleVerificationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {error && (
                  <div style={{ backgroundColor: 'var(--error-light)', border: '1px solid var(--error)', padding: '12px 14px', borderRadius: '14px', color: 'var(--error)', fontSize: '0.86rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={18} />
                    <span>{error}</span>
                  </div>
                )}

                {successMsg && (
                  <div style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac', padding: '12px 14px', borderRadius: '14px', color: '#15803d', fontSize: '0.86rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={18} />
                    <span>{successMsg}</span>
                  </div>
                )}

                {role === 'DOCTOR' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '18px', border: '1.5px solid #99f6e4' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>🩺 PRACTITIONER VERIFICATION DATA</span>
                    <Input 
                      label="NMC / State Medical Council Registration No. *" 
                      placeholder="e.g. NMC-2026-88940" 
                      value={nmcRegistrationNumber}
                      onChange={(e) => setNmcRegistrationNumber(e.target.value)}
                      required
                    />
                    <Input 
                      label="State Medical Council *" 
                      placeholder="Karnataka Medical Council" 
                      value={stateMedicalCouncil}
                      onChange={(e) => setStateMedicalCouncil(e.target.value)}
                      required
                    />
                  </div>
                )}

                {role === 'AMBULANCE_PARTNER' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#fef2f2', padding: '20px', borderRadius: '18px', border: '1.5px solid #fecaca' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.04em' }}>🚑 FLEET VEHICLE REGISTRATION DATA</span>
                    <Input 
                      label="Commercial Vehicle Registration (RC) Number *" 
                      placeholder="e.g. KA-01-EQ-9112" 
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      required
                    />
                  </div>
                )}

                {role === 'PHARMACY' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#fff7ed', padding: '20px', borderRadius: '18px', border: '1.5px solid #fed7aa' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>💊 PHARMACY STORE LICENSE DATA</span>
                    <Input 
                      label="State Drug License Number (Form 20/21) *" 
                      placeholder="e.g. DL-KA-2026-99201" 
                      value={drugLicenseNumber}
                      onChange={(e) => setDrugLicenseNumber(e.target.value)}
                      required
                    />
                    <Input 
                      label="GSTIN Registration *" 
                      placeholder="e.g. 29AAACJ1234F1Z5" 
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      required
                    />
                  </div>
                )}

                <Button type="submit" isLoading={isLoading} fullWidth style={{ height: '48px', fontSize: '1rem', fontWeight: 900, borderRadius: '14px' }}>
                  Submit Professional Credentials & Complete Activation
                </Button>
              </form>
            )}

          </Card>
        </div>
      </div>
    </div>
  );
};

export const Verify: React.FC = () => {
  return <Signup />;
};

export const ForgotPassword: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMsg('');
    const res = await resetPassword(email);
    setLoading(false);
    if (res.success) {
      setMsg('Password reset instructions have been sent to your email.');
    } else {
      setError(res.error || 'Password reset request failed.');
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '40px auto', padding: '0 20px' }}>
      <Card title="Reset Account Password">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {msg && <div style={{ color: '#15803d', backgroundColor: '#dcfce7', padding: '10px 14px', borderRadius: '10px', fontSize: '0.86rem', fontWeight: 700 }}>{msg}</div>}
          {error && <div style={{ color: 'var(--error)', backgroundColor: 'var(--error-light)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.86rem', fontWeight: 600 }}>{error}</div>}
          <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" isLoading={loading} style={{ borderRadius: '12px', fontWeight: 800 }}>Send Reset Link</Button>
        </form>
      </Card>
    </div>
  );
};
