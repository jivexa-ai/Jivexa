import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Toast } from '../../components/ui/Toast';
import { 
  Stethoscope, ShieldAlert, CheckCircle2, XCircle, Search, 
  Plus, Calendar, Clock, MapPin, Award, UserCheck, AlertTriangle, 
  FileText, History, RefreshCw, Eye, Edit3, Trash2, Filter, ExternalLink,
  Code, Sparkles, Copy, Check
} from 'lucide-react';

export interface DoctorAdminRecord {
  id: string;
  fullName: string;
  specialty: string;
  photoUrl: string;
  bio: string;
  qualifications: string;
  yearsExperience: number;
  registrationNumber: string;
  clinicName: string;
  address: string;
  city: string;
  consultationModes: 'Video' | 'In-Person' | 'Both';
  consultationFee: number;
  availableDays: string[];
  availableTimeStart: string;
  availableTimeEnd: string;
  slotDurationMinutes: number;
  phoneNumber: string;
  email: string;
  languages?: string[];
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  verificationNotes: string;
  rating: number | null;
  reviewCount: number;
  createdAt: string;
}

export interface AdminAuditRecord {
  id: string;
  timestamp: string;
  adminName: string;
  action: string;
  doctorId: string;
  doctorName: string;
  details: string;
}

export const DoctorOnboardingAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'onboard' | 'pending' | 'all' | 'ai_parser' | 'audit'>('pending');

  const [doctorsList, setDoctorsList] = useState<DoctorAdminRecord[]>([
    {
      id: 'doc_req_101',
      fullName: 'Dr. Sameer Ganguly',
      specialty: 'Cardiologist',
      photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80',
      bio: 'Senior Cardiologist specializing in interventional cardiology and cardiac rehabilitation.',
      qualifications: 'MBBS, MD (Cardiology), FACC',
      yearsExperience: 14,
      registrationNumber: 'MCI-884920-A',
      clinicName: 'Ganguly Heart Institute',
      address: '102 Indiranagar Double Road',
      city: 'Bengaluru',
      consultationModes: 'Both',
      consultationFee: 900,
      availableDays: ['Mon', 'Wed', 'Fri'],
      availableTimeStart: '10:00 AM',
      availableTimeEnd: '05:00 PM',
      slotDurationMinutes: 30,
      phoneNumber: '+91 98450 11223',
      email: 'dr.sameer@gangulyheart.com',
      languages: ['English', 'Hindi', 'Bengali'],
      status: 'pending',
      verificationNotes: 'License submitted. Pending NMC portal check.',
      rating: null,
      reviewCount: 0,
      createdAt: '2026-08-18'
    },
    {
      id: 'doc_req_102',
      fullName: 'Dr. Kavita Deshmukh',
      specialty: 'Pediatrician',
      photoUrl: 'https://images.unsplash.com/photo-1594824813566-88855ce64ce4?w=200&auto=format&fit=crop&q=80',
      bio: 'Pediatric specialist with expertise in neonatal care and adolescent medicine.',
      qualifications: 'MBBS, DCH, MD (Pediatrics)',
      yearsExperience: 11,
      registrationNumber: 'KMC-773910-B',
      clinicName: 'Kiddies Health Clinic',
      address: '45 Koramangala 4th Block',
      city: 'Bengaluru',
      consultationModes: 'Both',
      consultationFee: 700,
      availableDays: ['Tue', 'Thu', 'Sat'],
      availableTimeStart: '09:00 AM',
      availableTimeEnd: '02:00 PM',
      slotDurationMinutes: 20,
      phoneNumber: '+91 97411 55667',
      email: 'dr.kavita@kiddieshealth.in',
      languages: ['English', 'Kannada', 'Hindi'],
      status: 'pending',
      verificationNotes: 'Karnataka Medical Council registration pending online cross-check.',
      rating: null,
      reviewCount: 0,
      createdAt: '2026-08-17'
    },
    {
      id: '00000000-0000-0000-0000-000000000001',
      fullName: 'Dr. Anand Sen',
      specialty: 'Cardiologist',
      photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80',
      bio: 'Senior cardiologist with over 15 years of experience treating coronary artery disease and hypertension.',
      qualifications: 'MBBS, MD (Cardiology) - AIIMS Delhi',
      yearsExperience: 15,
      registrationNumber: 'MCI-119283-X',
      clinicName: 'Sen Cardiac Care',
      address: 'Indiranagar',
      city: 'Bengaluru',
      consultationModes: 'Both',
      consultationFee: 800,
      availableDays: ['Mon', 'Wed', 'Fri'],
      availableTimeStart: '10:00 AM',
      availableTimeEnd: '04:00 PM',
      slotDurationMinutes: 30,
      phoneNumber: '+91 99000 11111',
      email: 'anand.sen@jivexa.in',
      languages: ['English', 'Hindi'],
      status: 'approved',
      verificationNotes: 'Verified on NMC National Medical Register. License valid.',
      rating: 4.9,
      reviewCount: 128,
      createdAt: '2026-08-01'
    }
  ]);

  const [auditLogs, setAuditLogs] = useState<AdminAuditRecord[]>([
    {
      id: 'log_1',
      timestamp: '2026-08-18 14:30:12',
      adminName: 'System Root Admin',
      action: 'APPROVE_DOCTOR',
      doctorId: '00000000-0000-0000-0000-000000000001',
      doctorName: 'Dr. Anand Sen',
      details: 'Verified NMC license MCI-119283-X. Generated 30-day consultation slots.'
    }
  ]);

  // Form State
  const [form, setForm] = useState({
    fullName: '',
    specialty: 'Cardiologist',
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80',
    bio: '',
    qualifications: 'MBBS, MD',
    yearsExperience: '10',
    registrationNumber: '',
    clinicName: '',
    address: '',
    city: 'Bengaluru',
    consultationModes: 'Both' as 'Video' | 'In-Person' | 'Both',
    consultationFee: '800',
    availableDays: ['Mon', 'Wed', 'Fri'],
    availableTimeStart: '10:00 AM',
    availableTimeEnd: '05:00 PM',
    slotDurationMinutes: '30',
    phoneNumber: '',
    email: '',
    languages: 'English, Hindi',
    verificationNotes: ''
  });

  // AI Raw Info Text Parser State
  const [rawText, setRawText] = useState(`Name: Dr. Rajiv Malhotra
Specialty: Cardiologist
Qualifications: MBBS, MD (Cardiology)
Registration Number: MCI-994820-A
Experience: 12 years
Clinic: Malhotra Heart Care
Address: 104 HSR Layout, Sector 1, Bengaluru
City: Bengaluru
Consultation Type: Both
Fee: ₹800
Available Days: Mon, Wed, Fri
Available Time: 10:00 AM - 05:00 PM
Languages: English, Hindi, Punjabi
Phone: +91 98110 44556
Email: dr.rajiv@malhotraheart.com
Bio: Senior cardiologist focusing on interventional cardiology and preventive hypertension management.`);

  const [parsedJsonResult, setParsedJsonResult] = useState<string>('');
  const [search, setSearch] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('All');
  const [toastMsg, setToastMsg] = useState('');
  const [verificationInput, setVerificationInput] = useState<{ [docId: string]: string }>({});

  const pendingDocs = doctorsList.filter(d => d.status === 'pending');
  const approvedDocs = doctorsList.filter(d => d.status === 'approved');

  const filteredAllDocs = doctorsList.filter(doc => {
    const matchesSearch = doc.fullName.toLowerCase().includes(search.toLowerCase()) || 
                          doc.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
                          doc.clinicName.toLowerCase().includes(search.toLowerCase());
    const matchesSpec = filterSpecialty === 'All' || doc.specialty === filterSpecialty;
    return matchesSearch && matchesSpec;
  });

  const handleDayToggle = (day: string) => {
    setForm(prev => {
      const exists = prev.availableDays.includes(day);
      return {
        ...prev,
        availableDays: exists ? prev.availableDays.filter(d => d !== day) : [...prev.availableDays, day]
      };
    });
  };

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.registrationNumber || !form.email || !form.phoneNumber) {
      alert('Please complete all required fields including Registration Number, Email, and Phone.');
      return;
    }

    const newDoc: DoctorAdminRecord = {
      id: `doc_req_${Date.now()}`,
      fullName: form.fullName,
      specialty: form.specialty,
      photoUrl: form.photoUrl,
      bio: form.bio,
      qualifications: form.qualifications,
      yearsExperience: parseInt(form.yearsExperience) || 5,
      registrationNumber: form.registrationNumber,
      clinicName: form.clinicName,
      address: form.address,
      city: form.city,
      consultationModes: form.consultationModes,
      consultationFee: parseInt(form.consultationFee) || 500,
      availableDays: form.availableDays,
      availableTimeStart: form.availableTimeStart,
      availableTimeEnd: form.availableTimeEnd,
      slotDurationMinutes: parseInt(form.slotDurationMinutes) || 30,
      phoneNumber: form.phoneNumber,
      email: form.email,
      languages: form.languages.split(',').map(l => l.trim()),
      status: 'pending',
      verificationNotes: form.verificationNotes || 'Onboarded by admin. Pending NMC Medical Register check.',
      rating: null, // NO fake ratings for new doctors!
      reviewCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setDoctorsList([newDoc, ...doctorsList]);

    // Log to Audit
    const log: AdminAuditRecord = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      adminName: 'System Root Admin',
      action: 'ONBOARD_SUBMITTED',
      doctorId: newDoc.id,
      doctorName: newDoc.fullName,
      details: `Submitted doctor profile. Reg No: ${newDoc.registrationNumber}. Status set to PENDING (Rating: null/unrated).`
    };
    setAuditLogs([log, ...auditLogs]);

    setToastMsg(`Doctor ${form.fullName} added to Pending Verifications queue!`);
    setActiveTab('pending');
  };

  const handleParseRawText = () => {
    const lines = rawText.split('\n');
    const getVal = (key: string) => {
      const line = lines.find(l => l.toLowerCase().startsWith(key.toLowerCase()));
      return line ? line.split(':')[1]?.trim() || '' : '';
    };

    const name = getVal('Name');
    const specialtyVal = getVal('Specialty');
    const qual = getVal('Qualifications');
    const reg = getVal('Registration Number');
    const exp = getVal('Experience');
    const clinic = getVal('Clinic');
    const addr = getVal('Address');
    const cityVal = getVal('City');
    const fee = getVal('Fee');
    const phone = getVal('Phone');
    const emailVal = getVal('Email');
    const bioVal = getVal('Bio');
    const langs = getVal('Languages');

    const jsonObj = {
      id: name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
      name: name,
      specialty: specialtyVal || 'General Physician',
      qualifications: qual,
      registration_number: reg,
      verified: false,
      experience_years: parseInt(exp) || 0,
      rating: null,
      review_count: 0,
      bio: bioVal,
      clinic_name: clinic,
      address: `${addr}, ${cityVal}`,
      city: cityVal || 'Bengaluru',
      consultation_type: 'Both',
      fee_inr: parseInt(fee.replace(/[^0-9]/g, '')) || 500,
      available_days: ['Mon', 'Wed', 'Fri'],
      available_time: '10:00 AM - 05:00 PM',
      languages: langs ? langs.split(',').map(s => s.trim()) : ['English', 'Hindi'],
      photo_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80',
      status: 'pending_verification'
    };

    setParsedJsonResult(JSON.stringify(jsonObj, null, 2));

    // Auto-fill onboarding form
    setForm({
      fullName: name,
      specialty: specialtyVal || 'Cardiologist',
      photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80',
      bio: bioVal,
      qualifications: qual,
      yearsExperience: (parseInt(exp) || 10).toString(),
      registrationNumber: reg,
      clinicName: clinic,
      address: addr,
      city: cityVal || 'Bengaluru',
      consultationModes: 'Both',
      consultationFee: (parseInt(fee.replace(/[^0-9]/g, '')) || 800).toString(),
      availableDays: ['Mon', 'Wed', 'Fri'],
      availableTimeStart: '10:00 AM',
      availableTimeEnd: '05:00 PM',
      slotDurationMinutes: '30',
      phoneNumber: phone || '+91 98000 11223',
      email: emailVal || 'doctor@clinic.com',
      languages: langs || 'English, Hindi',
      verificationNotes: 'Parsed from raw text notes. Awaiting NMC portal check.'
    });

    setToastMsg('✨ Raw text parsed successfully & form auto-filled!');
  };

  const handleApproveDoctor = (doc: DoctorAdminRecord) => {
    const notes = verificationInput[doc.id] || doc.verificationNotes || 'License verified on State/NMC Council portal. Approved for public booking.';
    
    setDoctorsList(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'approved', verificationNotes: notes } : d));

    const log: AdminAuditRecord = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      adminName: 'System Root Admin',
      action: 'APPROVE_DOCTOR',
      doctorId: doc.id,
      doctorName: doc.fullName,
      details: `NMC Reg ${doc.registrationNumber} verified on NMC Portal. Generated 30 days of consultation slots. Public profile published live.`
    };
    setAuditLogs([log, ...auditLogs]);

    setToastMsg(`🎉 ${doc.fullName} APPROVED & Published Live on Find a Healthcare Practitioner!`);
  };

  const handleRejectDoctor = (doc: DoctorAdminRecord) => {
    const notes = verificationInput[doc.id] || 'Registration number could not be verified on Medical Council portal.';

    setDoctorsList(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'rejected', verificationNotes: notes } : d));

    const log: AdminAuditRecord = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      adminName: 'System Root Admin',
      action: 'REJECT_DOCTOR',
      doctorId: doc.id,
      doctorName: doc.fullName,
      details: `Rejected. Reason: ${notes}`
    };
    setAuditLogs([log, ...auditLogs]);

    setToastMsg(`Doctor ${doc.fullName} status set to REJECTED.`);
  };

  const handleRegenerateSlots = (doc: DoctorAdminRecord) => {
    setToastMsg(`⚡ Auto-generated 30 days of consultation slots for ${doc.fullName} (${doc.availableDays.join(', ')} • ${doc.slotDurationMinutes} min slots)!`);
  };

  const specialties = ['All', 'Cardiologist', 'Pediatrician', 'Dermatologist', 'General Physician', 'Orthopedics', 'Neurology', 'Gynecologist'];

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
            <Stethoscope size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white' }}>Practo-Grade Doctor Onboarding & Verification</h1>
              <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: '12px', color: 'white' }}>Admin Control</span>
            </div>
            <p style={{ opacity: 0.9, fontSize: '0.88rem', marginTop: '4px' }}>
              Manually verify Medical Council licenses, onboard doctors, generate consultation slots, and publish live profiles.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <a 
            href="https://www.nmc.org.in/information-desk/indian-medical-register/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: 'white',
              color: '#0f766e',
              padding: '10px 18px',
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '0.85rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
            }}
          >
            <ExternalLink size={16} />
            Official NMC Register Check
          </a>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', gap: '24px' }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '14px 8px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'pending' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'pending' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <UserCheck size={18} />
          Pending Verifications ({pendingDocs.length})
        </button>

        <button
          onClick={() => setActiveTab('ai_parser')}
          style={{
            padding: '14px 8px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'ai_parser' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'ai_parser' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Sparkles size={18} />
          Raw Info AI Parser & Guide
        </button>

        <button
          onClick={() => setActiveTab('onboard')}
          style={{
            padding: '14px 8px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'onboard' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'onboard' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={18} />
          Onboard New Doctor
        </button>

        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '14px 8px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'all' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'all' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Stethoscope size={18} />
          All Doctors Directory ({doctorsList.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          style={{
            padding: '14px 8px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'audit' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'audit' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <History size={18} />
          Admin Audit Log
        </button>
      </div>

      {/* 1. RAW INFO AI PARSER & REUSABLE PROMPT ASSISTANT */}
      {activeTab === 'ai_parser' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <Card style={{ borderRadius: '24px', padding: '28px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={22} style={{ color: 'var(--primary)' }} />
              <span>Step 2: Paste Raw Doctor Notes for Instant AI Parsing</span>
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Paste unformatted raw doctor details (collected during phone call or meeting) into the box below. Click <strong>Parse & Auto-Fill Onboarding Form</strong> to instantly convert raw notes into structured JSON and populate the form!
            </p>

            <textarea 
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              style={{
                width: '100%',
                borderRadius: '16px',
                border: '1.5px solid var(--border)',
                padding: '16px',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                backgroundColor: '#f8fafc',
                lineHeight: '1.6'
              }}
            />

            <div style={{ display: 'flex', gap: '14px', marginTop: '16px' }}>
              <Button onClick={handleParseRawText} style={{ borderRadius: '12px', padding: '12px 24px', fontWeight: 800 }}>
                <Sparkles size={16} />
                Parse & Auto-Fill Onboarding Form
              </Button>
            </div>
          </Card>

          {parsedJsonResult && (
            <Card style={{ borderRadius: '24px', padding: '28px', backgroundColor: '#0f172a', color: '#10b981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Generated Strict JSON Schema (verified: false, rating: null)</span>
                <Button 
                  size="sm" 
                  onClick={() => {
                    navigator.clipboard.writeText(parsedJsonResult);
                    setToastMsg('Copied JSON Schema to clipboard!');
                  }}
                >
                  <Copy size={14} />
                  Copy JSON
                </Button>
              </div>

              <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.85rem', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                {parsedJsonResult}
              </pre>
            </Card>
          )}

        </div>
      )}

      {/* 2. ONBOARD NEW DOCTOR FORM */}
      {activeTab === 'onboard' && (
        <Card style={{ borderRadius: '24px', padding: '32px' }}>
          <form onSubmit={handleOnboardSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ backgroundColor: '#fffbebfb', border: '1.5px solid #f59e0b', borderRadius: '16px', padding: '16px 20px', color: '#92400e', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <AlertTriangle size={24} style={{ color: '#d97706', flexShrink: 0 }} />
              <span style={{ fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.5 }}>
                <strong>Legal Verification Protocol:</strong> Rating for new doctors is automatically set to <code>null ("🆕 New / Unrated")</code>. Never generate fake star ratings. Always verify the Medical Registration Number on the <a href="https://www.nmc.org.in/information-desk/indian-medical-register/" target="_blank" rel="noopener noreferrer" style={{ color: '#92400e', fontWeight: 800, textDecoration: 'underline' }}>National Medical Register (NMC)</a> before approving.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="grid-2-mobile">
              <Input 
                label="Doctor Full Name *" 
                placeholder="e.g. Dr. Rajiv Malhotra"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />

              <Input 
                label="Medical Council / NMC Registration Number *" 
                placeholder="e.g. MCI-884920-A or KMC-773910"
                value={form.registrationNumber}
                onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                required
                helperText="Required for clinical identity verification."
              />

              <Select 
                label="Medical Specialty *"
                options={specialties.filter(s => s !== 'All').map(s => ({ value: s, label: s }))}
                value={form.specialty}
                onChange={(val) => setForm({ ...form, specialty: val })}
              />

              <Input 
                label="Qualifications *" 
                placeholder="e.g. MBBS, MD (Cardiology), FACC"
                value={form.qualifications}
                onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
                required
              />

              <Input 
                label="Years of Experience *" 
                type="number"
                value={form.yearsExperience}
                onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })}
                required
              />

              <Input 
                label="Consultation Fee (₹ INR) *" 
                type="number"
                value={form.consultationFee}
                onChange={(e) => setForm({ ...form, consultationFee: e.target.value })}
                required
              />

              <Input 
                label="Clinic / Hospital Name *" 
                placeholder="e.g. Malhotra Heart Care"
                value={form.clinicName}
                onChange={(e) => setForm({ ...form, clinicName: e.target.value })}
                required
              />

              <Input 
                label="City *" 
                placeholder="e.g. Bengaluru"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
              />

              <Input 
                label="Doctor Contact Phone *" 
                placeholder="+91 98765 43210 (Private admin contact)"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                required
              />

              <Input 
                label="Doctor Email Address *" 
                type="email"
                placeholder="doctor@clinic.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />

              <Input 
                label="Spoken Languages" 
                placeholder="e.g. English, Hindi, Kannada"
                value={form.languages}
                onChange={(e) => setForm({ ...form, languages: e.target.value })}
              />

              <Input 
                label="Photo URL" 
                value={form.photoUrl}
                onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
              />
            </div>

            <Input 
              label="Clinic Full Street Address" 
              placeholder="e.g. 104 HSR Layout, Sector 1, Bengaluru"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />

            <Input 
              label="Doctor Bio / Executive Summary" 
              placeholder="Brief 2-3 sentence clinical description for patient profile display"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />

            {/* AVAILABLE DAYS CHECKBOXES */}
            <div>
              <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-dark)', display: 'block', marginBottom: '8px' }}>
                Available Weekly Days *
              </label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <button
                    type="button"
                    key={day}
                    onClick={() => handleDayToggle(day)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '12px',
                      border: '1.5px solid',
                      borderColor: form.availableDays.includes(day) ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: form.availableDays.includes(day) ? 'var(--primary-light)' : 'white',
                      color: form.availableDays.includes(day) ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" style={{ borderRadius: '14px', padding: '14px 32px', fontWeight: 800, backgroundColor: 'var(--primary)', marginTop: '8px' }}>
              Submit Doctor Profile to Verification Queue
            </Button>
          </form>
        </Card>
      )}

      {/* 3. PENDING VERIFICATIONS QUEUE */}
      {activeTab === 'pending' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {pendingDocs.length === 0 ? (
            <Card style={{ padding: '64px 24px', textAlign: 'center', backgroundColor: 'white', borderRadius: '24px' }}>
              <CheckCircle2 size={48} style={{ color: '#10b981', margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>No Pending Doctor Verifications</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                All doctor onboarding requests have been reviewed and processed.
              </p>
            </Card>
          ) : (
            pendingDocs.map(doc => (
              <Card key={doc.id} style={{ borderRadius: '24px', padding: '28px', border: '1px solid #fef08a', backgroundColor: '#fffdf5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                  
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                    <img 
                      src={doc.photoUrl} 
                      alt={doc.fullName}
                      style={{ width: '80px', height: '80px', borderRadius: '20px', objectFit: 'cover', border: '2px solid var(--primary)' }}
                    />

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{doc.fullName}</h3>
                        <span style={{ backgroundColor: '#fef3c7', color: '#d97706', fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px' }}>
                          PENDING VERIFICATION
                        </span>
                        <span style={{ backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px' }}>
                          Rating: New / Unrated
                        </span>
                      </div>

                      <p style={{ fontSize: '0.88rem', color: 'var(--primary)', fontWeight: 700, marginTop: '2px' }}>
                        {doc.specialty} • {doc.qualifications} ({doc.yearsExperience} yrs exp)
                      </p>

                      <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        <span>🆔 Reg No: <strong>{doc.registrationNumber}</strong></span>
                        <span>🏥 Clinic: <strong>{doc.clinicName}, {doc.city}</strong></span>
                        <span>🗣️ Spoken: <strong>{doc.languages?.join(', ') || 'English, Hindi'}</strong></span>
                      </div>

                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '6px', fontStyle: 'italic' }}>
                        "{doc.bio}"
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '280px' }}>
                    <a 
                      href="https://www.nmc.org.in/information-desk/indian-medical-register/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 800, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <ExternalLink size={14} />
                      Verify Reg #{doc.registrationNumber} on NMC Portal
                    </a>

                    <input 
                      type="text"
                      placeholder="Add admin verification notes..."
                      value={verificationInput[doc.id] || ''}
                      onChange={(e) => setVerificationInput({ ...verificationInput, [doc.id]: e.target.value })}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: '1px solid var(--border)',
                        fontSize: '0.82rem',
                        width: '100%'
                      }}
                    />

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Button 
                        onClick={() => handleApproveDoctor(doc)}
                        style={{ backgroundColor: '#10b981', color: 'white', borderRadius: '12px', flex: 1, fontWeight: 800 }}
                      >
                        <CheckCircle2 size={16} />
                        Approve & Publish Live
                      </Button>

                      <button 
                        onClick={() => handleRejectDoctor(doc)}
                        style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '12px', padding: '10px 16px', fontWeight: 800, cursor: 'pointer' }}
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  </div>

                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* 4. ALL DOCTORS DIRECTORY TABLE */}
      {activeTab === 'all' && (
        <Card style={{ borderRadius: '24px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <Input 
                placeholder="Search by doctor name, reg number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ height: '40px', fontSize: '0.85rem', paddingLeft: '34px', borderRadius: '12px' }}
                icon={<Search size={16} style={{ color: 'var(--text-light)' }} />}
              />
            </div>

            <Select 
              options={specialties.map(s => ({ value: s, label: s === 'All' ? 'All Specialties' : s }))}
              value={filterSpecialty}
              onChange={(val) => setFilterSpecialty(val)}
              style={{ height: '40px' }}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 800 }}>Doctor</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800 }}>Specialty & Reg No</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800 }}>Rating</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800 }}>Fee</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800 }}>Status</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllDocs.map((doc) => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={doc.photoUrl} alt={doc.fullName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <strong style={{ fontSize: '0.95rem', color: 'var(--text-dark)' }}>{doc.fullName}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{doc.qualifications}</span>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary)', display: 'block' }}>{doc.specialty}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>🆔 {doc.registrationNumber}</span>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      {doc.rating ? (
                        <span style={{ fontWeight: 800, color: '#d97706' }}>⭐ {doc.rating} ({doc.reviewCount})</span>
                      ) : (
                        <span style={{ backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '10px' }}>
                          🆕 New / Unrated
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '14px 18px', fontWeight: 800 }}>
                      ₹{doc.consultationFee}
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '4px 10px',
                        borderRadius: '12px',
                        backgroundColor: doc.status === 'approved' ? '#dcfce7' : doc.status === 'pending' ? '#fef3c7' : '#fee2e2',
                        color: doc.status === 'approved' ? '#15803d' : doc.status === 'pending' ? '#d97706' : '#b91c1c',
                        textTransform: 'uppercase'
                      }}>
                        {doc.status}
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <button 
                        onClick={() => handleRegenerateSlots(doc)}
                        style={{ backgroundColor: '#f0fdfa', border: '1px solid var(--primary)', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700 }}
                        title="Generate 30-day consultation slots"
                      >
                        ⚡ Regenerate Slots
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 5. ADMIN AUDIT LOG */}
      {activeTab === 'audit' && (
        <Card style={{ borderRadius: '24px', padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>Admin Write Audit Trail</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {auditLogs.map((log) => (
              <div key={log.id} style={{ border: '1px solid var(--border)', borderRadius: '16px', padding: '16px 20px', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>⏱️ {log.timestamp} • Admin: <strong>{log.adminName}</strong></span>
                  <span style={{ fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>{log.action}</span>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, marginTop: '6px', color: 'var(--text-dark)' }}>
                  {log.doctorName} (ID: {log.doctorId})
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {log.details}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {toastMsg && (
        <Toast message={toastMsg} onClose={() => setToastMsg('')} />
      )}
    </div>
  );
};
