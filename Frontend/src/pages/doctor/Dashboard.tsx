import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useHealthData, Appointment, Prescription, HealthRecord } from '../../context/HealthDataContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { 
  Calendar, Clock, User, Clipboard, FileText, Settings, Stethoscope, 
  Search, Eye, ShieldAlert, Heart, FileDown, CheckCircle 
} from 'lucide-react';

import { Toast } from '../../components/ui/Toast';
import { Lock, ShieldCheck, UserCheck, Send, CheckCircle2 } from 'lucide-react';

interface PatientSummary {
  id: string;
  name: string;
  lastSeen: string;
}

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    appointments, doctors, prescriptions, healthRecords, sharedReports, updateAppointmentStatus,
    searchPatientByHealthId, requestPatientAccess, accessRequests 
  } = useHealthData();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'Today' | 'Appointments' | 'Patients' | 'Shared Reports' | 'Health ID Search'>('Today');
  
  const activeDoc = doctors.find((d) => d.id === user?.id) || doctors.find((d) => d.id === '00000000-0000-0000-0000-000000000001') || doctors.find((d) => d.id === 'doc_1') || doctors[0];

  const docAppts = appointments.filter((a) => a.doctorId === activeDoc?.id);
  const todayStr = new Date().toISOString().split('T')[0];
  
  const todayAppts = docAppts.filter((a) => a.date === todayStr);
  
  const patientIds = Array.from(new Set(docAppts.map((a) => a.patientId)));
  const uniquePatients: PatientSummary[] = patientIds.map((pid) => {
    const lastAppt = docAppts.filter((a) => a.patientId === pid).sort((a, b) => b.date.localeCompare(a.date))[0];
    return {
      id: pid,
      name: lastAppt?.patientName || 'Patient',
      lastSeen: lastAppt?.date || ''
    };
  });

  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientDetails, setPatientDetails] = useState<any>(null);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // JHID Workstation States
  const [healthIdQuery, setHealthIdQuery] = useState('');
  const [searchedPatientInfo, setSearchedPatientInfo] = useState<any>(null);
  const [isSearchingJhid, setIsSearchingJhid] = useState(false);
  const [isRequestingConsent, setIsRequestingConsent] = useState(false);
  const [jhidError, setJhidError] = useState('');
  const [jhidToast, setJhidToast] = useState('');
  const [viewingReportModal, setViewingReportModal] = useState<any | null>(null);

  useEffect(() => {
    if (!selectedPatientId) return;
    
    setLoadingPatient(true);
    const mockProfiles: Record<string, any> = {
      'user_patient_001': {
        bloodGroup: 'O+ Positive',
        allergies: 'Peanuts, Penicillin',
        conditions: 'Mild Asthma, Eczema',
        emergencyContact: 'Neha Gangwar (+91 99887 76655)'
      }
    };

    const timer = setTimeout(() => {
      setPatientDetails(
        mockProfiles[selectedPatientId] || {
          bloodGroup: 'O+ Positive',
          allergies: 'None logged',
          conditions: 'General Health Checkup',
          emergencyContact: 'Relative (+91 98765 43210)'
        }
      );
      setLoadingPatient(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedPatientId]);

  const handleLaunchConsult = async (apptId: string) => {
    await updateAppointmentStatus(apptId, 'In Consultation');
    navigate(`/doctor/consultation/${apptId}`);
  };

  const handleViewPatientHistory = (patientId: string) => {
    setSelectedPatientId(patientId);
  };

  const filteredPatients = uniquePatients.filter((p) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: '3px solid rgba(255, 255, 255, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            fontWeight: 900,
            color: 'white',
            backdropFilter: 'blur(10px)'
          }}>
            {user?.name ? user.name.replace('Dr.', '').trim().charAt(0).toUpperCase() : 'D'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white' }}>Welcome, {user?.name || 'Doctor'}. 👋</h1>
              <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: '12px', color: 'white' }}>Verified Practitioner</span>
            </div>
            <p style={{ opacity: 0.9, fontSize: '0.88rem', marginTop: '4px' }}>
              Specialty: <strong>{activeDoc?.specialty || 'General Practice'}</strong> • Clinic Location: <strong>{activeDoc?.location || 'Indiranagar, Bengaluru'}</strong> • NMC Reg: <strong>{activeDoc?.registrationNumber || 'NMC-2026-88940'}</strong>
            </p>
          </div>
        </div>

        <Button 
          onClick={() => navigate('/doctor/settings')} 
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
          <Settings size={18} />
          Configure Scheduler
        </Button>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: '24px' }}>
        <button
          onClick={() => setActiveTab('Today')}
          style={{
            padding: '12px 6px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'Today' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'Today' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.92rem',
            cursor: 'pointer'
          }}
        >
          Today's Queue ({todayAppts.length})
        </button>
        <button
          onClick={() => setActiveTab('Appointments')}
          style={{
            padding: '12px 6px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'Appointments' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'Appointments' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.92rem',
            cursor: 'pointer'
          }}
        >
          All Appointments ({docAppts.length})
        </button>
        <button
          onClick={() => setActiveTab('Patients')}
          style={{
            padding: '12px 6px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'Patients' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'Patients' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.92rem',
            cursor: 'pointer'
          }}
        >
          My Patients ({uniquePatients.length})
        </button>
        <button
          onClick={() => setActiveTab('Shared Reports')}
          style={{
            padding: '12px 6px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'Shared Reports' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'Shared Reports' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.92rem',
            cursor: 'pointer'
          }}
        >
          Shared AI Reports ({sharedReports.length})
        </button>
        <button
          onClick={() => setActiveTab('Health ID Search')}
          style={{
            padding: '12px 6px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'Health ID Search' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'Health ID Search' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <ShieldCheck size={16} />
          Find Patient by Health ID
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }} className="grid-2-mobile">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* JHID SEARCH WORKSTATION */}
          {activeTab === 'Health ID Search' && (
            <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><ShieldCheck size={22} style={{ color: 'var(--primary)' }} /><span style={{ fontWeight: 800 }}>Find Patient by Jivexa Health ID (JHID)</span></div>}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  Enter a patient's permanent <strong>Jivexa Health ID (JHID)</strong> to search for their record. Access to full clinical summaries requires patient consent approval.
                </p>

                {/* Search Input Bar */}
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!healthIdQuery.trim()) return;
                    setJhidError('');
                    setIsSearchingJhid(true);
                    const res = await searchPatientByHealthId(healthIdQuery);
                    setIsSearchingJhid(false);
                    if (res.success && res.patientInfo) {
                      setSearchedPatientInfo(res.patientInfo);
                    } else {
                      setSearchedPatientInfo(null);
                      setJhidError(res.error || 'No patient found matching this JIVEXA Health ID.');
                    }
                  }}
                  style={{ display: 'flex', gap: '12px' }}
                >
                  <Input 
                    placeholder="e.g. JIV-2026-849201"
                    value={healthIdQuery}
                    onChange={(e) => setHealthIdQuery(e.target.value)}
                    style={{ height: '44px', fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace' }}
                    icon={<Search size={18} style={{ color: 'var(--primary)' }} />}
                  />
                  <Button type="submit" isLoading={isSearchingJhid} style={{ height: '44px', borderRadius: '12px', padding: '0 24px', fontWeight: 700 }}>
                    Search Health ID
                  </Button>
                </form>

                {jhidError && (
                  <div style={{ backgroundColor: 'var(--error-light)', border: '1px solid var(--error)', borderRadius: '14px', padding: '14px', color: 'var(--error)', fontSize: '0.88rem', fontWeight: 600 }}>
                    ⚠️ {jhidError}
                  </div>
                )}

                {/* Searched Patient Card & Access Request Status */}
                {searchedPatientInfo && (
                  <div style={{ border: '1.5px solid var(--border)', borderRadius: '20px', padding: '24px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #0f766e 0%, #10b981 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.25rem' }}>
                          {searchedPatientInfo.name.charAt(0)}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{searchedPatientInfo.name}</h3>
                          <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>
                            JHID: {searchedPatientInfo.healthId}
                          </span>
                        </div>
                      </div>

                      {/* Consent Status Badge */}
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        padding: '6px 14px',
                        borderRadius: '20px',
                        backgroundColor: searchedPatientInfo.consentStatus === 'approved' ? 'var(--secondary-light)' : searchedPatientInfo.consentStatus === 'pending' ? 'var(--warning-light)' : '#f1f5f9',
                        color: searchedPatientInfo.consentStatus === 'approved' ? 'var(--secondary)' : searchedPatientInfo.consentStatus === 'pending' ? 'var(--warning)' : 'var(--text-muted)'
                      }}>
                        {searchedPatientInfo.consentStatus === 'approved' ? '✓ Consent Approved' : searchedPatientInfo.consentStatus === 'pending' ? '⏳ Access Request Pending' : '🔒 Consent Required'}
                      </span>
                    </div>

                    {/* If Consent NOT Approved */}
                    {searchedPatientInfo.consentStatus !== 'approved' ? (
                      <div style={{ backgroundColor: '#f8fafc', border: '1px border-dashed var(--border)', borderRadius: '16px', padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <Lock size={28} style={{ color: 'var(--text-light)' }} />
                        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '440px' }}>
                          Medical summary, allergies, active prescriptions, and AI report history are protected. Request permission from the patient to unlock records.
                        </p>

                        {searchedPatientInfo.consentStatus === 'pending' ? (
                          <Button disabled variant="outline" style={{ borderRadius: '12px' }}>
                            ⏳ Request Pending Patient Approval
                          </Button>
                        ) : (
                          <Button 
                            isLoading={isRequestingConsent}
                            onClick={async () => {
                              setIsRequestingConsent(true);
                              const res = await requestPatientAccess(searchedPatientInfo.healthId);
                              setIsRequestingConsent(false);
                              if (res.success) {
                                setSearchedPatientInfo({ ...searchedPatientInfo, consentStatus: 'pending' });
                                setJhidToast(`Access request sent to ${searchedPatientInfo.name}.`);
                              }
                            }}
                            style={{ borderRadius: '12px', padding: '10px 24px', fontWeight: 700 }}
                          >
                            <Send size={16} />
                            Send Access Request to Patient
                          </Button>
                        )}
                      </div>
                    ) : (
                      /* UNLOCKED CLINICAL SUMMARY */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--secondary)', fontWeight: 800, fontSize: '0.85rem' }}>
                          <CheckCircle2 size={18} />
                          <span>Authorized Health Summary Access Granted</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }} className="grid-3-mobile">
                          <div style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '14px', backgroundColor: 'var(--surface-raised)' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-light)' }}>Blood Group</span>
                            <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>{searchedPatientInfo.bloodGroup}</p>
                          </div>
                          <div style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '14px', backgroundColor: 'var(--error-light)' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--error)' }}>⚠️ Allergies</span>
                            <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--error)', marginTop: '2px' }}>{searchedPatientInfo.allergies}</p>
                          </div>
                          <div style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '14px', backgroundColor: 'var(--primary-light)' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)' }}>🩺 Chronic Conditions</span>
                            <p style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary)', marginTop: '2px' }}>{searchedPatientInfo.conditions}</p>
                          </div>
                        </div>

                        <div>
                          <h4 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: '8px' }}>Active Prescriptions & Medications</h4>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', backgroundColor: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            • Cetirizine 10mg (1 tablet daily after dinner)<br />
                            • Paracetamol 500mg (as needed for fever/pain)
                          </div>
                        </div>

                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <FileText size={18} style={{ color: 'var(--primary)' }} />
                              Patient Diagnostic Reports & AI Summaries ({searchedPatientInfo.reports?.length || 3})
                            </h4>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--secondary)' }}>
                              ✓ Linked to Health ID: {searchedPatientInfo.healthId}
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {(searchedPatientInfo.reports || [
                              {
                                id: 'rep_cbc_01',
                                name: 'Complete Blood Count (CBC) Panel & Hematology Analysis',
                                type: 'Lab Report',
                                date: '2026-08-10',
                                fileSize: '2.4 MB',
                                summary: 'Hemoglobin: 14.2 g/dL (Normal: 13.5-17.5). WBC: 7,200/mcL (Normal). Platelet Count: 250,000/mcL. Overall hematology profile is optimal.',
                                score: 92,
                                status: 'Verified Optimal'
                              },
                              {
                                id: 'rep_xray_02',
                                name: 'Digital Chest X-Ray (PA View) & AI Diagnostic Imaging Summary',
                                type: 'Imaging / Radiology',
                                date: '2026-07-28',
                                fileSize: '5.8 MB',
                                summary: 'Lungs clear bilaterally. No focal parenchymal consolidation, pleural effusion, or pneumothorax observed. Cardiac size within normal limits.',
                                score: 96,
                                status: 'Normal Diagnostic'
                              },
                              {
                                id: 'rep_lipid_03',
                                name: 'Comprehensive Lipid & Metabolic Function Profile',
                                type: 'Lab Report',
                                date: '2026-06-15',
                                fileSize: '1.8 MB',
                                summary: 'Total Cholesterol: 175 mg/dL (Desirable < 200). HDL: 52 mg/dL. LDL: 98 mg/dL. Triglycerides: 120 mg/dL. Fasting Glucose: 92 mg/dL.',
                                score: 90,
                                status: 'Normal'
                              }
                            ]).map((rep: any) => (
                              <div key={rep.id} style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                                  <div>
                                    <h5 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{rep.name}</h5>
                                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'inline-block', marginTop: '2px' }}>
                                      Date: {rep.date} • Size: {rep.fileSize} • Type: <strong>{rep.type}</strong>
                                    </span>
                                  </div>
                                  <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '12px', backgroundColor: 'var(--secondary-light)', color: 'var(--secondary)' }}>
                                    {rep.status} ({rep.score}/100)
                                  </span>
                                </div>

                                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0, backgroundColor: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                  <strong>AI Diagnostic Breakdown:</strong> {rep.summary}
                                </p>

                                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                                  <Button 
                                    size="sm" 
                                    onClick={() => setViewingReportModal(rep)}
                                    style={{ fontSize: '0.78rem', height: '34px', fontWeight: 700 }}
                                  >
                                    <Eye size={14} /> View Report Details
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => setJhidToast(`Downloading report PDF: "${rep.name}"`)}
                                    style={{ fontSize: '0.78rem', height: '34px', fontWeight: 700 }}
                                  >
                                    <FileDown size={14} /> Download PDF
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>
            </Card>
          )}

          {activeTab === 'Today' && (
            <Card title="Today's Consultation Queue">
              {todayAppts.length === 0 ? (
                <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Stethoscope size={36} style={{ color: 'var(--text-light)', marginBottom: '12px' }} />
                  <p style={{ fontSize: '0.9rem' }}>No patient consultations scheduled for today.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {todayAppts.map((appt) => (
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
                          <span style={{ margin: 'auto' }}>{appt.patientName.charAt(0)}</span>
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{appt.patientName}</h4>
                            <span style={{ 
                              fontSize: '0.65rem', 
                              fontWeight: 700, 
                              padding: '2px 6px', 
                              borderRadius: '4px',
                              backgroundColor: appt.status === 'In Consultation' ? 'var(--warning-light)' : (appt.status === 'Completed' ? 'var(--success-light)' : 'var(--primary-light)'),
                              color: appt.status === 'In Consultation' ? 'var(--warning)' : (appt.status === 'Completed' ? 'var(--primary)' : 'var(--primary)')
                            }}>
                              {appt.status}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Clock size={12} />
                            <span>Slot: {appt.time}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }} className="w-100-mobile justify-between">
                        <button
                          onClick={() => setSelectedAppt(appt)}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            color: 'var(--text-muted)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '8px 12px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Details
                        </button>
                        
                        {appt.status !== 'Completed' && appt.status !== 'Cancelled' && (
                          <Button onClick={() => handleLaunchConsult(appt.id)} style={{ height: '36px', fontSize: '0.82rem' }}>
                            {appt.status === 'In Consultation' ? 'Resume Consultation' : 'Start Consultation'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {activeTab === 'Appointments' && (
            <Card title="Appointment Registers (All Schedules)">
              {docAppts.length === 0 ? (
                <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Calendar size={36} style={{ color: 'var(--text-light)', marginBottom: '12px' }} />
                  <p style={{ fontSize: '0.9rem' }}>No clinical appointment files registered.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {docAppts.map((appt) => (
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
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--surface-raised)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                          <span style={{ margin: 'auto' }}>{appt.patientName.charAt(0)}</span>
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{appt.patientName}</h4>
                            <span style={{ 
                              fontSize: '0.65rem', 
                              fontWeight: 700, 
                              padding: '2px 6px', 
                              borderRadius: '4px',
                              backgroundColor: appt.status === 'Completed' ? 'var(--success-light)' : (appt.status === 'Cancelled' ? 'var(--error-light)' : 'var(--warning-light)'),
                              color: appt.status === 'Completed' ? 'var(--primary)' : (appt.status === 'Cancelled' ? 'var(--error)' : 'var(--warning)')
                            }}>
                              {appt.status}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Clock size={12} />
                            <span>Slot: {appt.time} • {appt.date}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          onClick={() => setSelectedAppt(appt)}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--border)',
                            color: 'var(--text-muted)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '8px 12px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          View Details
                        </button>
                        
                        {(appt.status === 'Upcoming' || appt.status === 'Pending' || appt.status === 'Confirmed' || appt.status === 'In Consultation') && (
                          <Button onClick={() => handleLaunchConsult(appt.id)} style={{ height: '34px', fontSize: '0.8rem' }}>
                            {appt.status === 'In Consultation' ? 'Resume' : 'Start'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {activeTab === 'Patients' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>My Patients Directory</h3>
                <div style={{ width: '260px' }}>
                  <Input 
                    placeholder="Search patients by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={<Search size={16} />}
                  />
                </div>
              </div>

              {filteredPatients.length === 0 ? (
                <div className="card" style={{ padding: '48px 20px', textAlign: 'center', backgroundColor: 'white' }}>
                  <User size={40} style={{ color: 'var(--text-light)', marginBottom: '12px' }} />
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No patients found matching the query.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                  {filteredPatients.map((pat) => (
                    <Card key={pat.id}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                            {pat.name.charAt(0)}
                          </div>
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{pat.name}</h4>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>Last Visit: {pat.lastSeen}</span>
                          </div>
                        </div>
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                          <Button onClick={() => handleViewPatientHistory(pat.id)} variant="outline" style={{ height: '32px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Eye size={14} />
                            Medical File
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 'Shared Reports' && (
            <Card title="Shared AI Medical Reports from Patients">
              {sharedReports.length === 0 ? (
                <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <FileText size={36} style={{ color: 'var(--text-light)', marginBottom: '12px' }} />
                  <p style={{ fontSize: '0.9rem' }}>No AI medical reports shared by patients yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {sharedReports.map((sr) => (
                    <div 
                      key={sr.id}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '16px',
                        backgroundColor: 'white'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{sr.patientName} — {sr.reportTitle}</h4>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Shared: {sr.sharedAt} • Review Status: <strong>{sr.reviewStatus}</strong></span>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', backgroundColor: sr.healthScore > 80 ? 'var(--secondary-light)' : 'var(--warning-light)', color: sr.healthScore > 80 ? 'var(--secondary)' : 'var(--warning)' }}>
                          AI Score: {sr.healthScore}/100
                        </span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', backgroundColor: 'var(--surface-raised)', padding: '10px 12px', borderRadius: '4px', marginTop: '8px' }}>
                        "{sr.analysisSummary}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <Card title="Clinic Statistics">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-light)' }}>Today's Queue</span>
                <span style={{ fontWeight: 700 }}>{todayAppts.length} Patients</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-light)' }}>Total Completed</span>
                <span style={{ fontWeight: 700 }}>{docAppts.filter(a => a.status === 'Completed').length} Consults</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-light)' }}>Session Hours</span>
                <span style={{ fontWeight: 600 }}>{activeDoc?.availability.split(' (')[0]}</span>
              </div>
            </div>
          </Card>

          <Card title="Patient Intake Guidelines">
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Review patient allergy metrics and uploaded lab scans before beginning medication schedules. Employs electronic prescription records system to prevent medication errors.
            </p>
          </Card>

        </div>

      </div>

      {selectedAppt && (
        <Modal isOpen={!!selectedAppt} onClose={() => setSelectedAppt(null)} title="Appointment Details">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <strong>Patient Name:</strong>
              <span>{selectedAppt.patientName}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <strong>Scheduled Date / Time:</strong>
              <span>{selectedAppt.date} at {selectedAppt.time}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <strong>Appointment Status:</strong>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{selectedAppt.status}</span>
            </div>
            {selectedAppt.notes && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <strong>Patient Intake Notes:</strong>
                <p style={{ padding: '8px 12px', backgroundColor: 'var(--surface-raised)', borderRadius: '4px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  "{selectedAppt.notes}"
                </p>
              </div>
            )}
            {selectedAppt.consultationSummary && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <strong>Consultation Summary:</strong>
                <p style={{ padding: '8px 12px', backgroundColor: 'var(--primary-light)', borderRadius: '4px', fontSize: '0.82rem', color: 'var(--primary)' }}>
                  "{selectedAppt.consultationSummary}"
                </p>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <Button onClick={() => setSelectedAppt(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {selectedPatientId && (
        <Modal 
          isOpen={!!selectedPatientId} 
          onClose={() => { setSelectedPatientId(null); setPatientDetails(null); }} 
          title="Clinical Medical File & EHR Records"
        >
          {loadingPatient ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              Loading patient clinical file records...
            </div>
          ) : patientDetails ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '68vh', overflowY: 'auto', paddingRight: '4px' }}>
              
              {/* PATIENT HEADER BANNER */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)', 
                padding: '20px 24px', 
                borderRadius: '20px', 
                color: 'white',
                boxShadow: '0 8px 20px -4px rgba(15, 118, 110, 0.3)'
              }}>
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '50%', 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                  border: '2px solid rgba(255, 255, 255, 0.4)', 
                  color: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 900, 
                  fontSize: '1.4rem',
                  backdropFilter: 'blur(8px)',
                  flexShrink: 0
                }}>
                  {uniquePatients.find(p => p.id === selectedPatientId)?.name.charAt(0) || 'P'}
                </div>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'white' }}>
                    {uniquePatients.find(p => p.id === selectedPatientId)?.name}
                  </h3>
                  <span style={{ fontSize: '0.82rem', opacity: 0.95, display: 'block', marginTop: '2px' }}>
                    Blood Group: <strong>{patientDetails.bloodGroup}</strong> • Emergency: <strong>{patientDetails.emergencyContact}</strong>
                  </span>
                </div>
              </div>

              {/* ALLERGIES & CHRONIC CONDITIONS GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-2-mobile">
                <div style={{ border: '1px solid #fecaca', backgroundColor: '#fff1f2', padding: '16px', borderRadius: '16px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#dc2626', letterSpacing: '0.04em' }}>⚠️ ALLERGIES LOG</span>
                  <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#991b1b', marginTop: '6px' }}>{patientDetails.allergies}</p>
                </div>
                <div style={{ border: '1px solid #99f6e4', backgroundColor: '#f0fdfa', padding: '16px', borderRadius: '16px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#0d9488', letterSpacing: '0.04em' }}>🩺 CHRONIC CONDITIONS</span>
                  <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f766e', marginTop: '6px' }}>{patientDetails.conditions}</p>
                </div>
              </div>

              {/* CONSULTATION HISTORY */}
              <div style={{ backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '18px', padding: '20px' }}>
                <h4 style={{ fontWeight: 800, fontSize: '0.98rem', marginBottom: '14px', color: 'var(--text-dark)' }}>Consultation History</h4>
                {docAppts.filter(a => a.patientId === selectedPatientId).length === 0 ? (
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>No past consultation history logged.</span>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {docAppts.filter(a => a.patientId === selectedPatientId).map((appt) => (
                      <div key={appt.id} style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: '#f8fafc', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 800, color: 'var(--text-dark)' }}>📅 {appt.date} ({appt.time})</span>
                          <span style={{ backgroundColor: '#dcfce7', color: '#15803d', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px' }}>
                            {appt.status}
                          </span>
                        </div>
                        {appt.consultationSummary && (
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '6px', lineHeight: '1.4' }}>
                            "{appt.consultationSummary}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ISSUED PRESCRIPTIONS */}
              <div style={{ backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '18px', padding: '20px' }}>
                <h4 style={{ fontWeight: 800, fontSize: '0.98rem', marginBottom: '14px', color: 'var(--text-dark)' }}>Issued Prescriptions</h4>
                {prescriptions.filter(pr => pr.patientId === selectedPatientId).length === 0 ? (
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>No active digital prescriptions issued yet.</span>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {prescriptions.filter(pr => pr.patientId === selectedPatientId).map((pr) => (
                      <div key={pr.id} style={{ border: '1px solid #e2e8f0', padding: '14px 18px', borderRadius: '14px', backgroundColor: '#f0fdfa', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, marginBottom: '8px' }}>
                          <span style={{ color: '#0f766e' }}>Prescription #{pr.id.slice(0, 8)}</span>
                          <span style={{ color: '#15803d', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '8px', fontSize: '0.72rem' }}>
                            {pr.status || 'Issued'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {pr.medications.map((m, idx) => (
                            <div key={idx} style={{ fontSize: '0.82rem', color: 'var(--text-dark)' }}>
                              💊 <strong>{m.name}</strong> • {m.dosage} ({m.frequency}) • {m.duration}
                            </div>
                          ))}
                        </div>
                        {pr.followUpDate && (
                          <div style={{ fontSize: '0.78rem', color: '#0f766e', fontWeight: 700, marginTop: '8px' }}>
                            📅 Follow-up Date: {pr.followUpDate}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SHARED LAB REPORTS & DOCUMENTS */}
              <div style={{ backgroundColor: 'white', border: '1px solid var(--border)', borderRadius: '18px', padding: '20px' }}>
                <h4 style={{ fontWeight: 800, fontSize: '0.98rem', marginBottom: '14px', color: 'var(--text-dark)' }}>Shared Lab Reports / Documents</h4>
                {healthRecords.filter(r => r.patientId === selectedPatientId).length === 0 ? (
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>No shared diagnostic reports found.</span>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {healthRecords.filter(r => r.patientId === selectedPatientId).map((rec) => (
                      <div key={rec.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)', padding: '12px 16px', borderRadius: '12px', fontSize: '0.85rem', backgroundColor: '#f8fafc' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <FileText size={18} style={{ color: 'var(--primary)' }} />
                          <div>
                            <strong style={{ display: 'block', color: 'var(--text-dark)' }}>{rec.name}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rec.date} • {rec.type}</span>
                          </div>
                        </div>
                        <a href={rec.fileUrl || '#'} download style={{ textDecoration: 'none', color: '#0f766e', backgroundColor: '#e0f2fe', padding: '6px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800, fontSize: '0.78rem' }}>
                          <FileDown size={14} />
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Could not load file details.</div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <Button variant="outline" onClick={() => { setSelectedPatientId(null); setPatientDetails(null); }} style={{ borderRadius: '12px', fontWeight: 700 }}>
              Close File
            </Button>
            <Button 
              onClick={() => {
                const targetAppt = docAppts.find(a => a.patientId === selectedPatientId);
                const apptIdToUse = targetAppt ? targetAppt.id : 'appt_001';
                setSelectedPatientId(null);
                navigate(`/doctor/consultation/${apptIdToUse}`);
              }} 
              style={{ borderRadius: '12px', fontWeight: 800, backgroundColor: 'var(--primary)' }}
            >
              <Stethoscope size={16} />
              Start Consultation
            </Button>
          </div>
        </Modal>
      )}

      {viewingReportModal && (
        <Modal isOpen={!!viewingReportModal} onClose={() => setViewingReportModal(null)} title={viewingReportModal.name}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>Document Type</span>
                <p style={{ fontWeight: 800, color: 'var(--primary)', margin: 0 }}>{viewingReportModal.type}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>Date Verified</span>
                <p style={{ fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{viewingReportModal.date}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase' }}>Diagnostic Score</span>
                <p style={{ fontWeight: 800, color: 'var(--secondary)', margin: 0 }}>{viewingReportModal.score}/100</p>
              </div>
            </div>

            <div style={{ backgroundColor: '#f0fdfa', border: '1px solid rgba(15,118,110,0.2)', padding: '16px', borderRadius: '12px' }}>
              <h5 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f766e', marginBottom: '6px' }}>AI Diagnostic Clinical Breakdown</h5>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: '1.6', margin: 0 }}>
                {viewingReportModal.summary}
              </p>
            </div>

            <div>
              <h5 style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: '8px' }}>Key Test Parameters & Reference Ranges</h5>
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', fontSize: '0.84rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '10px 14px', backgroundColor: '#f8fafc', fontWeight: 800, borderBottom: '1px solid var(--border)' }}>
                  <span>Parameter</span>
                  <span>Observed Value</span>
                  <span>Reference Limit</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                  <span>Hemoglobin (Hb)</span>
                  <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>14.2 g/dL</span>
                  <span style={{ color: 'var(--text-muted)' }}>13.5 - 17.5</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '10px 14px', borderBottom: '1px solid #f1f5f9' }}>
                  <span>Total WBC Count</span>
                  <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>7,200 /mcL</span>
                  <span style={{ color: 'var(--text-muted)' }}>4,500 - 11,000</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '10px 14px' }}>
                  <span>Platelet Count</span>
                  <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>250,000 /mcL</span>
                  <span style={{ color: 'var(--text-muted)' }}>150,000 - 450,000</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
              <Button variant="outline" onClick={() => setViewingReportModal(null)}>Close</Button>
              <Button onClick={() => { setJhidToast(`Downloading PDF: ${viewingReportModal.name}`); setViewingReportModal(null); }}>
                <FileDown size={16} /> Download Full PDF Report
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {jhidToast && <Toast message={jhidToast} onClose={() => setJhidToast('')} />}

    </div>
  );
};
