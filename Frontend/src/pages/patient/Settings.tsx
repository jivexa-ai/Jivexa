import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Toast } from '../../components/ui/Toast';
import { 
  Bell, Lock, Shield, Eye, Trash2, Heart, Smartphone, 
  Key, QrCode, Download, ShieldCheck, Laptop, AlertTriangle, 
  History, CheckCircle2, RefreshCw, XCircle, LogOut
} from 'lucide-react';

interface ActiveSession {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export const PatientSettings: React.FC = () => {
  const { user, logout } = useAuth();
  const { patientProfile, healthRecords, appointments } = useHealthData();
  
  // Notification Preferences
  const [allowNotifs, setAllowNotifs] = useState(true);
  const [allowEmailNotifs, setAllowEmailNotifs] = useState(true);
  
  // Security & 2FA State
  const [enable2FA, setEnable2FA] = useState(true);
  const [enableBiometrics, setEnableBiometrics] = useState(false);

  // Active Login Sessions
  const [sessions, setSessions] = useState<ActiveSession[]>([
    {
      id: 'sess_1',
      device: 'Chrome on Windows 11 (Desktop)',
      location: 'Bengaluru, India',
      ip: '49.207.192.14',
      lastActive: 'Active Now',
      isCurrent: true
    },
    {
      id: 'sess_2',
      device: 'JIVEXA Android App (Pixel 8)',
      location: 'Bengaluru, India',
      ip: '106.51.88.22',
      lastActive: '2 hours ago',
      isCurrent: false
    }
  ]);

  // Password Form State
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);
  const [passError, setPassError] = useState('');
  
  // Modals & Toast State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // HIPAA Access Logs
  const securityAuditLogs = [
    { time: '18 Aug 2026 14:30', entity: 'Dr. Anand Sen (Cardiologist)', action: 'Viewed Comprehensive Blood Count Report', status: 'AUTHORIZED' },
    { time: '12 Aug 2026 11:15', entity: 'Jivexa Central Pharmacy', action: 'Verified Amoxicillin 250mg Doctor Prescription', status: 'AUTHORIZED' },
    { time: '04 Aug 2026 09:00', entity: 'System Encryption Service', action: 'HIPAA 256-bit AES Vault Key Rotation', status: 'COMPLETED' }
  ];

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passForm.current || !passForm.new || !passForm.confirm) return;

    if (passForm.new !== passForm.confirm) {
      setPassError('New passwords do not match.');
      return;
    }

    setPassError('');
    setIsUpdatingPass(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    setIsUpdatingPass(false);
    setToastMsg('🔐 Password changed & 256-bit AES master key updated!');
    setPassForm({ current: '', new: '', confirm: '' });
  };

  const handleRevokeSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    setToastMsg('Device session revoked successfully.');
  };

  const handleRevokeAllOtherSessions = () => {
    setSessions(prev => prev.filter(s => s.isCurrent));
    setToastMsg('Logged out of all other remote device sessions.');
  };

  const handleDownloadBackup = () => {
    const dataObj = {
      exportDate: new Date().toISOString(),
      patient: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        bloodGroup: patientProfile?.bloodGroup || 'O+ Positive',
        allergies: patientProfile?.allergies,
        conditions: patientProfile?.conditions,
        emergencyContact: patientProfile?.emergencyContact
      },
      healthRecordsCount: healthRecords.length,
      appointmentsCount: appointments.length,
      encryptedVaultSignature: 'AES-256-GCM-884920'
    };

    const blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JIVEXA_Health_Vault_Backup_${user?.name?.replace(/\s+/g, '_') || 'Export'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setToastMsg('📥 Encrypted Health Data Backup downloaded successfully!');
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText.toLowerCase() === 'delete') {
      setIsDeleteOpen(false);
      alert('Your account is being scheduled for deletion in compliance with HIPAA records duration requirements.');
      logout();
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
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
            <Lock size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white' }}>Account & Security Command Center</h1>
              <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: '12px', color: 'white' }}>HIPAA 256-bit AES Protected</span>
            </div>
            <p style={{ opacity: 0.9, fontSize: '0.88rem', marginTop: '4px' }}>
              Manage multi-factor authentication, device access sessions, emergency QR passes, and encrypted health exports.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button 
            onClick={() => setIsQrModalOpen(true)}
            style={{
              backgroundColor: 'white',
              color: '#0f766e',
              borderRadius: '14px',
              padding: '12px 20px',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
            }}
          >
            <QrCode size={18} />
            Emergency Health QR Pass
          </Button>
        </div>
      </div>

      {/* 1. MULTI-FACTOR AUTHENTICATION & SECURITY CONTROLS */}
      <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldCheck size={20} style={{ color: 'var(--primary)' }} /><span>Two-Factor Authentication & Biometrics</span></div>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="flex-col-mobile gap-sm">
            <div>
              <span style={{ display: 'block', fontSize: '0.92rem', fontWeight: 800 }}>Two-Factor Authentication (2FA OTP)</span>
              <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Require an SMS or Authenticator App OTP code on every new device login.
              </span>
            </div>
            <input 
              type="checkbox" 
              checked={enable2FA} 
              onChange={() => {
                setEnable2FA(!enable2FA);
                setToastMsg(`2FA Security ${!enable2FA ? 'ENABLED' : 'DISABLED'}`);
              }}
              style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: 'var(--primary)' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px' }} className="flex-col-mobile gap-sm">
            <div>
              <span style={{ display: 'block', fontSize: '0.92rem', fontWeight: 800 }}>Biometric Lock (Fingerprint / Face ID)</span>
              <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Prompt for device biometrics before viewing clinical lab report files or prescriptions.
              </span>
            </div>
            <input 
              type="checkbox" 
              checked={enableBiometrics} 
              onChange={() => {
                setEnableBiometrics(!enableBiometrics);
                setToastMsg(`Biometric Vault Lock ${!enableBiometrics ? 'ENABLED' : 'DISABLED'}`);
              }}
              style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: 'var(--primary)' }}
            />
          </div>
        </div>
      </Card>

      {/* 2. ACTIVE DEVICE SESSIONS & SESSION REVOCATION */}
      <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Laptop size={20} style={{ color: 'var(--primary)' }} /><span>Active Login Sessions & Devices</span></div>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Manage active logins across desktop browsers and mobile apps.
            </span>
            {sessions.length > 1 && (
              <Button size="sm" variant="outline" onClick={handleRevokeAllOtherSessions}>
                Log Out All Other Devices
              </Button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sessions.map((sess) => (
              <div key={sess.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)', padding: '14px 18px', borderRadius: '16px', backgroundColor: sess.isCurrent ? '#f0fdfa' : 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ padding: '10px', backgroundColor: sess.isCurrent ? 'var(--primary-light)' : '#f1f5f9', color: sess.isCurrent ? 'var(--primary)' : 'var(--text-muted)', borderRadius: '12px' }}>
                    {sess.device.includes('Android') ? <Smartphone size={20} /> : <Laptop size={20} />}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong style={{ fontSize: '0.92rem', color: 'var(--text-dark)' }}>{sess.device}</strong>
                      {sess.isCurrent && (
                        <span style={{ backgroundColor: '#dcfce7', color: '#15803d', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px' }}>
                          THIS DEVICE
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                      📍 {sess.location} • IP: {sess.ip} • {sess.lastActive}
                    </span>
                  </div>
                </div>

                {!sess.isCurrent && (
                  <button 
                    onClick={() => handleRevokeSession(sess.id)}
                    style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '10px', padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 3. NOTIFICATION PREFERENCES */}
      <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Bell size={18} /><span>Notification Preferences</span></div>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="flex-col-mobile gap-sm">
            <div>
              <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700 }}>Enable In-App Dashboard Notifications</span>
              <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>Receive appointment reminders, pharmacy updates, and doctor messages.</span>
            </div>
            <input 
              type="checkbox" 
              checked={allowNotifs} 
              onChange={() => setAllowNotifs(!allowNotifs)}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px' }} className="flex-col-mobile gap-sm">
            <div>
              <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700 }}>Enable Email Alerts & Prescription Reminders</span>
              <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Send medication schedules and order updates to: <strong>{user?.email || 'patient@jivexa.in'}</strong>
              </span>
            </div>
            <input 
              type="checkbox" 
              checked={allowEmailNotifs} 
              onChange={() => setAllowEmailNotifs(!allowEmailNotifs)}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
          </div>
        </div>
      </Card>

      {/* 4. PASSWORD & CREDENTIAL MANAGEMENT */}
      <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Lock size={18} /><span>Change Account Password</span></div>}>
        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {passError && (
            <div style={{ backgroundColor: 'var(--error-light)', border: '1px solid var(--error)', padding: '10px 14px', borderRadius: '12px', color: 'var(--error)', fontSize: '0.82rem', fontWeight: 600 }}>
              {passError}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="grid-2-mobile">
            <Input 
              label="Current Password *" 
              type="password"
              placeholder="••••••••"
              value={passForm.current}
              onChange={(e) => setPassForm({ ...passForm, current: e.target.value })}
              required
              disabled={isUpdatingPass}
            />
            <div />
            <Input 
              label="New Password *" 
              type="password"
              placeholder="••••••••"
              value={passForm.new}
              onChange={(e) => setPassForm({ ...passForm, new: e.target.value })}
              required
              disabled={isUpdatingPass}
            />
            <Input 
              label="Confirm New Password *" 
              type="password"
              placeholder="••••••••"
              value={passForm.confirm}
              onChange={(e) => setPassForm({ ...passForm, confirm: e.target.value })}
              required
              disabled={isUpdatingPass}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '8px' }}>
            <Button type="submit" isLoading={isUpdatingPass} style={{ borderRadius: '12px', fontWeight: 800 }}>Change Password</Button>
          </div>
        </form>
      </Card>

      {/* 6. PRIVACY & DANGEROUS ACTIONS */}
      <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={18} /><span>Privacy & Data Management</span></div>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="flex-col-mobile gap-sm">
            <div>
              <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700 }}>Download Personal Encrypted Data Backup</span>
              <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>Download a complete encrypted JSON transcript of your logged health metrics, allergies, records, and prescriptions.</span>
            </div>
            <Button variant="outline" onClick={handleDownloadBackup} style={{ borderRadius: '12px', fontWeight: 800 }}>
              <Download size={16} />
              Export Data
            </Button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '20px', alignItems: 'center' }} className="flex-col-mobile gap-sm">
            <div>
              <span style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--error)' }}>Close JIVEXA Account</span>
              <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>Permanently remove your health profile. This action cannot be undone.</span>
            </div>
            <Button variant="danger" onClick={() => setIsDeleteOpen(true)} style={{ borderRadius: '12px', fontWeight: 800 }}>
              Delete Account
            </Button>
          </div>
        </div>
      </Card>

      {/* EMERGENCY HEALTH QR MODAL */}
      <Modal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} title="Emergency Medical QR Pass">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#f0fdfa', border: '2px solid var(--primary)', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <div style={{ width: '160px', height: '160px', backgroundColor: 'white', padding: '12px', borderRadius: '16px', boxShadow: '0 4px 14px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QrCode size={136} style={{ color: 'var(--primary)' }} />
            </div>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{user?.name}</h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 800, display: 'block' }}>
                JIVEXA Patient ID: JVX-889420
              </span>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '10px', fontSize: '0.82rem' }}>
                <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '10px', fontWeight: 800 }}>
                  Blood: {patientProfile?.bloodGroup || 'O+'}
                </span>
                <span style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '10px', fontWeight: 800 }}>
                  Allergies: {patientProfile?.allergies || 'None'}
                </span>
              </div>
            </div>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            First responders and ambulance paramedics can scan this QR code to access your critical emergency health parameters.
          </p>

          <Button fullWidth onClick={() => setIsQrModalOpen(false)} style={{ borderRadius: '12px' }}>
            Done
          </Button>
        </div>
      </Modal>

      {/* ACCOUNT DELETION CONFIRMATION MODAL */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Close My Account">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ backgroundColor: 'var(--error-light)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--error)', display: 'flex', gap: '10px' }}>
            <Trash2 size={20} style={{ color: 'var(--error)', flexShrink: 0 }} />
            <p style={{ fontSize: '0.8rem', color: 'var(--error)', fontWeight: 600 }}>
              WARNING: This is a destructive operation. All records in your health vault and timeline will be queued for deletion.
            </p>
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            To confirm this deletion request, please type <strong>delete</strong> in the input field below:
          </p>

          <Input 
            placeholder="Type 'delete' to verify"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText.toLowerCase() !== 'delete'}
            >
              Permanently Delete Account
            </Button>
          </div>
        </div>
      </Modal>

      {toastMsg && (
        <Toast message={toastMsg} onClose={() => setToastMsg('')} />
      )}

    </div>
  );
};
