import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Toast } from '../../components/ui/Toast';
import { 
  Calendar, Clock, DollarSign, MapPin, ArrowLeft, Stethoscope, 
  Video, Building, ShieldCheck, CheckCircle2, Globe, Award, CreditCard, Save
} from 'lucide-react';

export const DoctorSettings: React.FC = () => {
  const { user } = useAuth();
  const { doctors, updateDoctorProfile } = useHealthData() as any;
  const navigate = useNavigate();

  const activeDoc = doctors.find((d) => d.id === user?.id) || doctors.find((d) => d.id === '00000000-0000-0000-0000-000000000001') || doctors.find((d) => d.id === 'doc_1') || doctors[0];

  const [form, setForm] = useState({
    name: user?.name || activeDoc?.name || 'Dr. Mittal',
    specialty: activeDoc?.specialty || 'Cardiologist',
    qualifications: (activeDoc as any)?.qualifications || 'MBBS, MD (Cardiology)',
    registrationNumber: activeDoc?.registrationNumber || 'NMC-2026-88940',
    experienceYears: activeDoc?.experience || 12,
    languages: (activeDoc as any)?.languages?.join(', ') || 'English, Hindi, Kannada',
    consultationMode: 'Both' as 'Video' | 'Clinic' | 'Both',
    fee: activeDoc?.fee || 800,
    location: activeDoc?.location || 'Indiranagar, Bengaluru, KA',
    clinicName: activeDoc?.clinicName || 'Mittal Heart & Vascular Clinic',
    availability: activeDoc?.availability || 'Mon, Wed, Fri (10:00 AM - 4:00 PM)',
    slotDuration: '30 mins',
    upiId: 'drmittal@upi',
    bankAccount: '998877665432 (HDFC Bank)',
    days: {
      mon: true, tue: false, wed: true, thu: false, fri: true, sat: false, sun: false
    }
  });

  const [toastMsg, setToastMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (updateDoctorProfile && activeDoc?.id) {
      updateDoctorProfile(activeDoc.id, {
        name: form.name,
        specialty: form.specialty,
        qualifications: form.qualifications,
        registrationNumber: form.registrationNumber,
        experienceYears: Number(form.experienceYears),
        fee: Number(form.fee),
        location: form.location,
        clinicName: form.clinicName,
        availability: form.availability
      } as any);
    }

    setIsSaving(false);
    setToastMsg('🎉 Practitioner profile & scheduler settings saved successfully!');
  };

  const specialtyOptions = [
    { value: 'Cardiologist', label: 'Cardiologist (Heart Specialist)' },
    { value: 'Dermatologist', label: 'Dermatologist (Skin Specialist)' },
    { value: 'Pediatrician', label: 'Pediatrician (Child Specialist)' },
    { value: 'General Physician', label: 'General Physician / Internal Medicine' },
    { value: 'Endocrinologist', label: 'Endocrinologist (Diabetes & Hormones)' },
    { value: 'Neurologist', label: 'Neurologist (Brain & Spine)' },
    { value: 'Orthopedic Surgeon', label: 'Orthopedic Surgeon (Bones & Joints)' },
    { value: 'Gynecologist', label: 'Gynecologist & Obstetrician' }
  ];

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
          <button 
            onClick={() => navigate('/doctor/dashboard')}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              padding: '12px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              backdropFilter: 'blur(8px)'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white' }}>Practitioner Profile & Scheduler</h1>
              <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: '12px', color: 'white' }}>NMC Verified Portal</span>
            </div>
            <p style={{ opacity: 0.9, fontSize: '0.88rem', marginTop: '4px' }}>
              Configure your practice details, consultation fees, active clinic hours, and payout settlement details.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* 1. PRACTITIONER IDENTITY & NMC VERIFICATION */}
        <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}><Stethoscope size={22} /><span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-dark)' }}>Doctor Identity & Verification</span></div>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #99f6e4', padding: '14px 18px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="flex-col-mobile gap-sm">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldCheck size={24} style={{ color: '#0d9488' }} />
                <div>
                  <strong style={{ fontSize: '0.92rem', color: '#0f766e' }}>National Medical Commission (NMC) Verification</strong>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: '#115e59', marginTop: '2px' }}>
                    Registration No: <strong>{form.registrationNumber}</strong> • Status: <strong style={{ color: '#15803d' }}>Verified Active</strong>
                  </span>
                </div>
              </div>
              <a 
                href="https://www.nmc.org.in/information-desk/indian-medical-register/" 
                target="_blank" 
                rel="noreferrer"
                style={{ backgroundColor: 'white', color: '#0f766e', border: '1px solid #0d9488', borderRadius: '10px', padding: '6px 14px', fontSize: '0.78rem', fontWeight: 800, textDecoration: 'none' }}
              >
                NMC Portal Check ↗
              </a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="grid-2-mobile">
              <Input 
                label="Full Doctor Name (with Prefix) *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Select
                label="Primary Medical Specialty *"
                options={specialtyOptions}
                value={form.specialty}
                onChange={(val) => setForm({ ...form, specialty: val })}
              />
              <Input 
                label="Qualifications & Degrees *"
                placeholder="MBBS, MD, MS, DM"
                value={form.qualifications}
                onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
                required
              />
              <Input 
                label="NMC / State Registration Number *"
                value={form.registrationNumber}
                onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
                required
              />
              <Input 
                label="Years of Experience *"
                type="number"
                value={form.experienceYears}
                onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })}
                required
              />
              <Input 
                label="Languages Spoken *"
                placeholder="English, Hindi, Kannada, Tamil"
                value={form.languages}
                onChange={(e) => setForm({ ...form, languages: e.target.value })}
                required
              />
            </div>
          </div>
        </Card>

        {/* 2. CONSULTATION MODES & FEES */}
        <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}><DollarSign size={22} /><span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-dark)' }}>Consultation Modes & Pricing</span></div>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 700 }}>Consultation Modes Offered</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }} className="grid-2-mobile">
                {[
                  { mode: 'Video', label: '📹 Video Call Only', desc: 'Tele-consultations via HD WebRTC' },
                  { mode: 'Clinic', label: '🏥 In-Person Clinic Only', desc: 'Physical visits at clinic address' },
                  { mode: 'Both', label: '✨ Both Video & Clinic', desc: 'Full flexibility for patients' }
                ].map((item) => (
                  <div
                    key={item.mode}
                    onClick={() => setForm({ ...form, consultationMode: item.mode as any })}
                    style={{
                      border: form.consultationMode === item.mode ? '2px solid var(--primary)' : '1px solid var(--border)',
                      backgroundColor: form.consultationMode === item.mode ? '#f0fdfa' : 'white',
                      padding: '16px',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <strong style={{ display: 'block', fontSize: '0.92rem', color: form.consultationMode === item.mode ? '#0f766e' : 'var(--text-dark)' }}>{item.label}</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }} className="grid-2-mobile">
              <Input 
                label="Consultation Fee (₹) *"
                type="number"
                value={form.fee}
                onChange={(e) => setForm({ ...form, fee: Number(e.target.value) })}
                required
              />
              <Input 
                label="Clinic Name / Medical Center *"
                value={form.clinicName}
                onChange={(e) => setForm({ ...form, clinicName: e.target.value })}
                icon={<Building size={16} />}
                required
              />
            </div>

            <Input 
              label="Clinic Physical Location Address *"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              icon={<MapPin size={16} />}
              required
            />
          </div>
        </Card>

        {/* 3. WEEKLY SESSION SCHEDULER & SLOTS */}
        <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}><Calendar size={22} /><span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-dark)' }}>Weekly Session Slots & Working Hours</span></div>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 700 }}>Active Practice Days</label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '4px' }}>
                {Object.keys(form.days).map((day) => {
                  const isChecked = form.days[day as keyof typeof form.days];
                  return (
                    <label 
                      key={day} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        padding: '10px 18px', 
                        border: isChecked ? '2px solid var(--primary)' : '1px solid var(--border)', 
                        borderRadius: '14px',
                        backgroundColor: isChecked ? '#f0fdfa' : 'white',
                        fontSize: '0.88rem',
                        fontWeight: isChecked ? 800 : 500,
                        color: isChecked ? '#0f766e' : 'var(--text-dark)',
                        cursor: 'pointer'
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        onChange={() => setForm({
                          ...form,
                          days: { ...form.days, [day]: !form.days[day as keyof typeof form.days] }
                        })}
                        style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                      />
                      <span style={{ textTransform: 'capitalize' }}>{day}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <Input 
              label="Availability Text (Displayed on Search Directory) *"
              value={form.availability}
              onChange={(e) => setForm({ ...form, availability: e.target.value })}
              required
            />
          </div>
        </Card>

        {/* 4. PAYOUT & BANKING DETAILS */}
        <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}><CreditCard size={22} /><span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-dark)' }}>Payout Settlement & Banking</span></div>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="grid-2-mobile">
            <Input 
              label="UPI Virtual Payment Address (VPA) *"
              placeholder="doctorname@upi"
              value={form.upiId}
              onChange={(e) => setForm({ ...form, upiId: e.target.value })}
              required
            />
            <Input 
              label="Bank Account Number & Bank Name *"
              placeholder="Account No + Bank Name"
              value={form.bankAccount}
              onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
              required
            />
          </div>
        </Card>

        {/* ACTION BUTTONS */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '8px' }}>
          <Button type="button" variant="outline" onClick={() => navigate('/doctor/dashboard')} style={{ borderRadius: '12px', padding: '12px 24px', fontWeight: 700 }}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSaving} style={{ borderRadius: '12px', padding: '12px 32px', fontWeight: 800, backgroundColor: 'var(--primary)', boxShadow: '0 4px 14px rgba(15, 118, 110, 0.3)' }}>
            <Save size={18} />
            Save Profile Updates
          </Button>
        </div>

      </form>

      {toastMsg && (
        <Toast message={toastMsg} onClose={() => setToastMsg('')} />
      )}

    </div>
  );
};
