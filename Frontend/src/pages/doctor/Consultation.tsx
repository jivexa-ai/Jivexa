import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHealthData, Medication } from '../../context/HealthDataContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Toast } from '../../components/ui/Toast';
import { 
  Stethoscope, User, Heart, AlertTriangle, 
  Plus, Trash2, Clipboard, FileText, ArrowLeft, ShieldCheck, Search,
  Sparkles, CheckCircle2, Pill, Clock, Calendar, Check
} from 'lucide-react';

const PRODUCT_SUGGESTIONS = [
  'Paracetamol 500mg (Oral Tablet)',
  'Amoxicillin 250mg (Antibiotic Capsule)',
  'Cetirizine 10mg (Antihistamine Tablet)',
  'Metformin 500mg (Antidiabetic Tablet)',
  'Atorvastatin 10mg (Cholesterol Statins)',
  'Pantoprazole 40mg (Gastro Acid Reflux)',
  'Azithromycin 500mg (Antibiotic Tablet)',
  'Ibuprofen 400mg (Pain Relief Tablet)'
];

const DOSAGE_PRESETS = ['1 tablet', '2 tablets', '5 ml syrup', '1 capsule', '1 drop'];
const FREQUENCY_PRESETS = ['Once daily (OD)', 'Twice daily (BD)', 'Thrice daily (TDS)', 'At Bedtime (HS)', 'As Needed (PRN)'];
const DURATION_PRESETS = ['3 Days', '5 Days', '7 Days', '14 Days', '30 Days'];
const INSTRUCTION_PRESETS = ['Take after meals', 'Take on empty stomach (before breakfast)', 'Take with plenty of water'];

export const DoctorConsultation: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const { appointments, healthRecords, completeConsultation } = useHealthData();
  const navigate = useNavigate();

  const appt = appointments.find((a) => a.id === appointmentId);
  const patientId = appt?.patientId || '';

  const [summary, setSummary] = useState('');
  const [meds, setMeds] = useState<Medication[]>([
    { name: '', dosage: '1 tablet', frequency: 'Once daily (OD)', duration: '5 Days', instructions: 'Take after meals' }
  ]);
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  
  const [patientDetails, setPatientDetails] = useState<any>(null);
  const [loadingPatient, setLoadingPatient] = useState(false);

  const [focusedMedIdx, setFocusedMedIdx] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    if (!patientId) return;
    setLoadingPatient(true);

    const timer = setTimeout(() => {
      setPatientDetails({
        bloodGroup: 'O+ Positive',
        allergies: 'Peanuts, Penicillin (mild)',
        conditions: 'Mild Asthma, Eczema',
        emergencyContact: 'Neha Gangwar (+91 99887 76655)'
      });
      setLoadingPatient(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [patientId]);

  const sharedDocs = healthRecords.filter((r) => r.patientId === patientId);

  const handleAddMedicine = () => {
    setMeds([...meds, { name: '', dosage: '1 tablet', frequency: 'Once daily (OD)', duration: '5 Days', instructions: 'Take after meals' }]);
  };

  const handleRemoveMedicine = (idx: number) => {
    const updated = meds.filter((_, i) => i !== idx);
    setMeds(updated);
  };

  const handleMedChange = (idx: number, field: keyof Medication, val: string) => {
    const updated = [...meds];
    updated[idx] = { ...updated[idx], [field]: val };
    setMeds(updated);
  };

  const handleQuickAddMed = (drugName: string) => {
    const emptyIdx = meds.findIndex(m => !m.name.trim());
    if (emptyIdx !== -1) {
      handleMedChange(emptyIdx, 'name', drugName);
    } else {
      setMeds([...meds, { name: drugName, dosage: '1 tablet', frequency: 'Once daily (OD)', duration: '5 Days', instructions: 'Take after meals' }]);
    }
  };

  const handleCompleteSubmit = async (e: React.FormEvent, status: 'Draft' | 'Issued' = 'Issued') => {
    e.preventDefault();
    if (!appt) return;
    
    if (!summary.trim()) {
      setErrorMsg('Please enter a clinical consultation summary diagnosis.');
      window.scrollTo(0, 0);
      return;
    }

    const validMeds = meds.filter((m) => m.name.trim() !== '');

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      await completeConsultation(
        appt.id, 
        summary, 
        validMeds, 
        notes, 
        followUpDate || undefined, 
        status
      );

      setToastMsg(
        status === 'Draft' 
          ? 'Consultation progress saved as Draft.' 
          : '🎉 Consultation completed and digital prescription issued successfully!'
      );
      
      setTimeout(() => {
        navigate('/doctor/dashboard');
      }, 1200);

    } catch (e) {
      setErrorMsg('An error occurred during submission.');
      setIsSubmitting(false);
    }
  };

  if (!appt) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <h3>Appointment record not found.</h3>
        <Button onClick={() => navigate('/doctor/dashboard')} style={{ marginTop: '14px', borderRadius: '12px' }}>Return to Dashboard</Button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}

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
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white' }}>Consultation Workstation: {appt.patientName}</h1>
              <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: '12px', color: 'white' }}>📹 Live Consultation</span>
            </div>
            <p style={{ opacity: 0.9, fontSize: '0.88rem', marginTop: '4px' }}>
              Patient ID: <strong>{appt.patientId}</strong> • Date: <strong>{appt.date}</strong> • Time Slot: <strong>{appt.time}</strong>
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '28px' }} className="grid-2-mobile">
        
        {/* LEFT COLUMN: PATIENT CLINICAL DETAILS & SHARED RECORDS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}><User size={20} /><span style={{ fontWeight: 800 }}>Patient Clinical Details</span></div>}>
            {loadingPatient ? (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-light)', padding: '12px 0' }}>Loading patient clinical file...</div>
            ) : patientDetails ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                  <span style={{ color: 'var(--text-light)' }}>Blood Group</span>
                  <span style={{ fontWeight: 800, color: '#0f766e' }}>{patientDetails.bloodGroup}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                  <span style={{ color: 'var(--text-light)' }}>Allergies Log</span>
                  <span style={{ fontWeight: 800, color: 'var(--error)' }}>{patientDetails.allergies}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                  <span style={{ color: 'var(--text-light)' }}>Chronic Conditions</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{patientDetails.conditions}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ color: 'var(--text-light)' }}>Emergency Contact</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{patientDetails.emergencyContact}</span>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-light)', padding: '12px 0' }}>Patient details record loaded.</div>
            )}
          </Card>

          <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}><FileText size={20} /><span style={{ fontWeight: 800 }}>Shared Health Records</span></div>}>
            {sharedDocs.length === 0 ? (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                No records shared by patient for this session.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sharedDocs.map((doc) => (
                  <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border)', backgroundColor: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={18} style={{ color: 'var(--primary)' }} />
                      <div>
                        <strong style={{ fontSize: '0.85rem', display: 'block' }}>{doc.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.date} • {doc.type}</span>
                      </div>
                    </div>
                    {doc.fileUrl && (
                      <a href={doc.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
                        View ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

        </div>

        {/* RIGHT COLUMN: CONSULTATION SUMMARY & PRESCRIPTION COMPOSER */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <form onSubmit={(e) => handleCompleteSubmit(e, 'Issued')} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {errorMsg && (
              <div style={{ backgroundColor: 'var(--error-light)', border: '1px solid var(--error)', padding: '12px 16px', borderRadius: '14px', color: 'var(--error)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* CONSULTATION SUMMARY */}
            <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}><Clipboard size={20} /><span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-dark)' }}>Clinical Consultation Summary & Diagnosis</span></div>}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-dark)' }}>Diagnosis & Clinical Assessment Notes *</label>
                <textarea
                  rows={4}
                  placeholder="Record summary of diagnosis, physical examinations, and patient advice."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  disabled={isSubmitting}
                  style={{
                    padding: '14px',
                    borderRadius: '14px',
                    border: '1px solid var(--border)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.92rem',
                    outline: 'none',
                    width: '100%',
                    resize: 'vertical'
                  }}
                  required
                />
              </div>
            </Card>

            {/* PRESCRIPTION COMPOSER */}
            <Card 
              title={<div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)' }}><Pill size={20} /><span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-dark)' }}>Prescription Composer & Drug Catalog</span></div>}
              headerAction={
                <Button type="button" variant="outline" onClick={handleAddMedicine} style={{ height: '36px', fontSize: '0.8rem', borderRadius: '10px', fontWeight: 800 }}>
                  <Plus size={14} />
                  Add Medicine Line
                </Button>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* QUICK DRUG SEARCH BADGES */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: '#f0fdfa', padding: '14px 18px', borderRadius: '16px', border: '1px solid #99f6e4' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 800, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <Sparkles size={14} /> 1-Click Common Drug Autofill
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                    {PRODUCT_SUGGESTIONS.slice(0, 6).map((drug) => (
                      <button
                        key={drug}
                        type="button"
                        onClick={() => handleQuickAddMed(drug)}
                        style={{
                          backgroundColor: 'white',
                          color: '#0f766e',
                          border: '1px solid #0d9488',
                          borderRadius: '20px',
                          padding: '4px 12px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        + {drug.split(' ')[0]} {drug.split(' ')[1]}
                      </button>
                    ))}
                  </div>
                </div>

                {meds.map((med, idx) => (
                  <div 
                    key={idx}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: '16px',
                      padding: '18px',
                      backgroundColor: 'white',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      position: 'relative'
                    }}
                  >
                    {meds.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(idx)}
                        style={{
                          position: 'absolute',
                          top: '14px',
                          right: '14px',
                          background: '#fef2f2',
                          border: '1px solid #fecaca',
                          borderRadius: '8px',
                          padding: '6px',
                          color: '#dc2626',
                          cursor: 'pointer',
                          zIndex: 10
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '14px', position: 'relative' }} className="grid-2-mobile">
                      
                      <div style={{ position: 'relative' }}>
                        <Input 
                          label="Medicine Name *"
                          placeholder="e.g. Paracetamol 500mg"
                          value={med.name}
                          onFocus={() => setFocusedMedIdx(idx)}
                          onBlur={() => setTimeout(() => setFocusedMedIdx(null), 200)}
                          onChange={(e) => handleMedChange(idx, 'name', e.target.value)}
                          required
                          disabled={isSubmitting}
                        />
                        {focusedMedIdx === idx && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            backgroundColor: 'white',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                            zIndex: 100,
                            maxHeight: '200px',
                            overflowY: 'auto',
                            marginTop: '4px'
                          }}>
                            {PRODUCT_SUGGESTIONS.filter(name => 
                              name.toLowerCase().includes(med.name.toLowerCase())
                            ).map((name) => (
                              <div
                                key={name}
                                onMouseDown={() => handleMedChange(idx, 'name', name)}
                                style={{
                                  padding: '10px 14px',
                                  fontSize: '0.84rem',
                                  cursor: 'pointer',
                                  borderBottom: '1px solid #f1f5f9'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0fdfa'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                              >
                                💊 <strong>{name}</strong>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <Input 
                          label="Dosage *"
                          placeholder="1 tablet"
                          value={med.dosage}
                          onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                          disabled={isSubmitting}
                        />
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                          {DOSAGE_PRESETS.slice(0, 2).map((d) => (
                            <span key={d} onClick={() => handleMedChange(idx, 'dosage', d)} style={{ fontSize: '0.68rem', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Input 
                          label="Frequency *"
                          placeholder="Once daily"
                          value={med.frequency}
                          onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                          disabled={isSubmitting}
                        />
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                          {FREQUENCY_PRESETS.slice(0, 2).map((f) => (
                            <span key={f} onClick={() => handleMedChange(idx, 'frequency', f)} style={{ fontSize: '0.68rem', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                              {f.split(' ')[0]}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Input 
                          label="Duration *"
                          placeholder="5 Days"
                          value={med.duration}
                          onChange={(e) => handleMedChange(idx, 'duration', e.target.value)}
                          disabled={isSubmitting}
                        />
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                          {DURATION_PRESETS.slice(0, 2).map((dur) => (
                            <span key={dur} onClick={() => handleMedChange(idx, 'duration', dur)} style={{ fontSize: '0.68rem', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                              {dur}
                            </span>
                          ))}
                        </div>
                      </div>

                    </div>

                    <Input 
                      label="Special Instructions (Optional)"
                      placeholder="e.g. Take after meals with lukewarm water"
                      value={med.instructions}
                      onChange={(e) => handleMedChange(idx, 'instructions', e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                ))}

                <Input 
                  label="Follow-Up Appointment Date (Optional)"
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  disabled={isSubmitting}
                />

                <Input 
                  label="Prescription Footnotes (General Clinical Advice)"
                  placeholder="e.g. Avoid cold beverages, get adequate rest, follow up if fever persists"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </Card>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
              <Button type="button" variant="outline" onClick={() => navigate('/doctor/dashboard')} disabled={isSubmitting} style={{ borderRadius: '12px', padding: '12px 24px', fontWeight: 700 }}>
                Discard
              </Button>
              <Button 
                type="button" 
                onClick={(e) => handleCompleteSubmit(e, 'Draft')} 
                disabled={isSubmitting}
                style={{ backgroundColor: 'white', color: 'var(--text-dark)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 24px', fontWeight: 800 }}
              >
                Save as Draft
              </Button>
              <Button 
                type="button" 
                onClick={(e) => handleCompleteSubmit(e, 'Issued')} 
                isLoading={isSubmitting}
                style={{ borderRadius: '12px', padding: '12px 32px', fontWeight: 800, backgroundColor: 'var(--primary)', boxShadow: '0 4px 14px rgba(15, 118, 110, 0.3)' }}
              >
                Issue Digital Prescription
              </Button>
            </div>

          </form>

        </div>

      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: '#f0fdfa', padding: '18px 24px', borderRadius: '16px', border: '1px solid #99f6e4' }}>
        <ShieldCheck size={24} style={{ color: '#0d9488', flexShrink: 0 }} />
        <span style={{ fontSize: '0.84rem', color: '#115e59' }}>
          <strong>Prescription Integrity Standard:</strong> Completing this session signs the prescription digitally with your clinical credentials and dispatches the record to the patient and database securely.
        </span>
      </div>

    </div>
  );
};
