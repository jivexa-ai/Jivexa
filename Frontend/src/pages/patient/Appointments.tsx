import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHealthData, Appointment } from '../../context/HealthDataContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Toast } from '../../components/ui/Toast';
import { 
  Calendar, Clock, Video, User, AlertCircle, RefreshCw, 
  XCircle, CheckCircle2, Plus, Stethoscope, FileText, 
  VideoOff, ShieldCheck, ExternalLink, Download
} from 'lucide-react';

export const PatientAppointments: React.FC = () => {
  const { user } = useAuth();
  const { appointments, rescheduleAppointment, cancelAppointment, bookAppointment } = useHealthData();
  
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Completed' | 'Cancelled'>('Upcoming');
  
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [isReschedOpen, setIsReschedOpen] = useState(false);
  const [reschedForm, setReschedForm] = useState({ date: '', time: '10:00 AM' });
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Book New Appointment Modal State
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [bookForm, setBookForm] = useState({
    doctorName: 'Dr. Sarah Jenkins',
    doctorSpecialty: 'Cardiology Specialist',
    date: '2026-08-22',
    time: '10:30 AM',
    notes: 'Routine blood pressure and lipid profile review.'
  });
  const [isBooking, setIsBooking] = useState(false);

  const [toastMsg, setToastMsg] = useState('');

  // Pre-populated default initial appointments fallback
  const defaultAppointments: Appointment[] = [
    {
      id: 'appt_sarah_01',
      patientId: user?.id || 'anonymous_user',
      patientName: user?.name || 'Patient',
      doctorId: 'doc_sarah',
      doctorName: 'Dr. Sarah Jenkins',
      doctorSpecialty: 'Cardiology Specialist',
      date: '2026-08-22',
      time: '10:30 AM',
      status: 'Confirmed',
      notes: 'Follow-up regarding low Hemoglobin (11.8 g/dL) and Lipid Profile results.'
    },
    {
      id: 'appt_rajesh_02',
      patientId: user?.id || 'anonymous_user',
      patientName: user?.name || 'Patient',
      doctorId: 'doc_rajesh',
      doctorName: 'Dr. Rajesh Sharma',
      doctorSpecialty: 'General Physician',
      date: '2026-08-25',
      time: '04:00 PM',
      status: 'Upcoming',
      notes: 'Routine seasonal health screening and immunity consultation.'
    },
    {
      id: 'appt_ananya_03',
      patientId: user?.id || 'anonymous_user',
      patientName: user?.name || 'Patient',
      doctorId: 'doc_ananya',
      doctorName: 'Dr. Ananya Roy',
      doctorSpecialty: 'Endocrinologist',
      date: '2026-07-15',
      time: '11:00 AM',
      status: 'Completed',
      notes: 'Fasting blood sugar & HbA1c screening consultation.',
      consultationSummary: 'Fasting Glucose 104 mg/dL evaluated. Recommended low-GI diet and 30-minute daily brisk walking. Schedule follow-up in 3 months.'
    },
    {
      id: 'appt_vikram_04',
      patientId: user?.id || 'anonymous_user',
      patientName: user?.name || 'Patient',
      doctorId: 'doc_vikram',
      doctorName: 'Dr. Vikram Patel',
      doctorSpecialty: 'Dermatologist',
      date: '2026-06-10',
      time: '02:30 PM',
      status: 'Cancelled',
      notes: 'Skin rash screening consultation.'
    }
  ];

  const patientAppts = appointments.length > 0 
    ? appointments.filter((a) => a.patientId === user?.id || !a.patientId) 
    : defaultAppointments;

  const filtered = patientAppts.filter((a) => {
    if (activeTab === 'Upcoming') return ['Upcoming', 'Confirmed', 'In Consultation', 'Pending'].includes(a.status);
    if (activeTab === 'Completed') return a.status === 'Completed';
    return a.status === 'Cancelled';
  });

  const handleCancelClick = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this medical consultation?')) {
      cancelAppointment(id);
      setToastMsg('Appointment cancelled successfully.');
    }
  };

  const handleOpenReschedule = (appt: Appointment) => {
    setSelectedAppt(appt);
    setIsReschedOpen(true);
    setReschedForm({ date: appt.date, time: appt.time });
  };

  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;

    setIsUpdating(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    rescheduleAppointment(selectedAppt.id, reschedForm.date, reschedForm.time);
    setIsReschedOpen(false);
    setIsUpdating(false);
    setToastMsg(`Appointment rescheduled to ${reschedForm.date} at ${reschedForm.time}.`);
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooking(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    bookAppointment(
      bookForm.doctorName,
      bookForm.doctorSpecialty,
      bookForm.date,
      bookForm.time
    );

    setIsBooking(false);
    setIsBookOpen(false);
    setToastMsg(`🎉 Consultation booked with ${bookForm.doctorName} for ${bookForm.date} at ${bookForm.time}!`);
  };

  const timeSlots = [
    { value: '09:00 AM', label: '09:00 AM' },
    { value: '10:00 AM', label: '10:00 AM' },
    { value: '10:30 AM', label: '10:30 AM' },
    { value: '11:00 AM', label: '11:00 AM' },
    { value: '02:00 PM', label: '02:00 PM' },
    { value: '03:30 PM', label: '03:30 PM' },
    { value: '05:00 PM', label: '05:00 PM' }
  ];

  const doctorOptions = [
    { value: 'Dr. Sarah Jenkins', label: 'Dr. Sarah Jenkins (Cardiology Specialist)' },
    { value: 'Dr. Rajesh Sharma', label: 'Dr. Rajesh Sharma (General Physician)' },
    { value: 'Dr. Ananya Roy', label: 'Dr. Ananya Roy (Endocrinologist)' },
    { value: 'Dr. Priya Nair', label: 'Dr. Priya Nair (Pediatrics)' },
    { value: 'Dr. Vikram Patel', label: 'Dr. Vikram Patel (Dermatology)' }
  ];

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* JIVEXA BRAND GRADIENT HEADER BANNER */}
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
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white' }}>My Consultations & Appointments</h1>
              <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: '12px', color: 'white' }}>Verified Telehealth</span>
            </div>
            <p style={{ opacity: 0.9, fontSize: '0.88rem', marginTop: '4px' }}>
              Schedule, track, and join video consultations with top licensed medical specialists.
            </p>
          </div>
        </div>

        {/* HIGH-CONTRAST READABLE BUTTON */}
        <button 
          onClick={() => setIsBookOpen(true)}
          style={{
            background: '#ffffff',
            color: '#0f766e',
            borderRadius: '14px',
            padding: '12px 24px',
            fontWeight: 800,
            fontSize: '0.92rem',
            border: 'none',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <Plus size={18} style={{ color: '#0f766e' }} />
          Book New Consultation
        </button>
      </div>

      {/* TAB NAVIGATION PILLS */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', gap: '28px' }}>
        {(['Upcoming', 'Completed', 'Cancelled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '14px 8px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
              color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {tab} {tab === 'Upcoming' ? 'Consultations' : tab === 'Completed' ? 'History' : 'Bookings'}
          </button>
        ))}
      </div>

      {/* APPOINTMENT CARDS LIST */}
      {filtered.length === 0 ? (
        <Card style={{ padding: '64px 24px', textAlign: 'center', backgroundColor: 'white', borderRadius: '24px' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <Calendar size={36} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>No consultations found under "{activeTab}"</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '6px', maxWidth: '400px', margin: '6px auto 16px auto' }}>
            You have no appointments listed in this view. Click "Book New Consultation" to connect with a doctor.
          </p>
          <Button onClick={() => setIsBookOpen(true)} style={{ borderRadius: '12px' }}>
            <Plus size={16} />
            Book Consultation Now
          </Button>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filtered.map((appt) => (
            <Card 
              key={appt.id}
              style={{ borderRadius: '24px', padding: '24px', border: '1px solid var(--border)', backgroundColor: 'white' }}
              title={
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem', border: '2px solid rgba(15, 118, 110, 0.2)' }}>
                    {appt.doctorName.replace('Dr. ', '').charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-dark)' }}>{appt.doctorName}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>{appt.doctorSpecialty}</p>
                  </div>
                </div>
              }
              headerAction={
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  padding: '5px 14px',
                  borderRadius: '16px',
                  backgroundColor: 
                    (appt.status === 'Upcoming' || appt.status === 'Confirmed') ? 'var(--primary-light)' : 
                    appt.status === 'In Consultation' ? '#fef3c7' :
                    appt.status === 'Completed' ? '#dcfce7' : '#fee2e2',
                  color: 
                    (appt.status === 'Upcoming' || appt.status === 'Confirmed') ? 'var(--primary)' : 
                    appt.status === 'In Consultation' ? '#d97706' :
                    appt.status === 'Completed' ? '#15803d' : '#b91c1c',
                }}>
                  ● {appt.status}
                </span>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', fontSize: '0.88rem', backgroundColor: '#f8fafc', padding: '16px 20px', borderRadius: '16px', border: '1px solid var(--border)' }} className="grid-3-mobile">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Calendar size={18} style={{ color: 'var(--primary)' }} />
                    <span>Scheduled: <strong>{appt.date}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Clock size={18} style={{ color: 'var(--primary)' }} />
                    <span>Time Slot: <strong>{appt.time}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Video size={18} style={{ color: 'var(--primary)' }} />
                    <span>Consultation: <strong>HD Telehealth Video</strong></span>
                  </div>
                </div>

                {appt.notes && (
                  <div style={{ padding: '14px 18px', backgroundColor: '#f0fdfa', borderRadius: '14px', border: '1px solid rgba(15, 118, 110, 0.2)', fontSize: '0.88rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>Patient Clinical Symptoms & Notes:</span>
                    "{appt.notes}"
                  </div>
                )}

                {appt.status === 'Completed' && appt.consultationSummary && (
                  <div style={{ padding: '16px 20px', backgroundColor: '#f0fdf4', borderLeft: '4px solid #16a34a', borderRadius: '12px', fontSize: '0.88rem' }}>
                    <span style={{ fontWeight: 800, color: '#15803d', display: 'block', marginBottom: '4px' }}>Doctor's Clinical Summary & Advice:</span>
                    {appt.consultationSummary}
                  </div>
                )}

                {/* ACTION BUTTONS */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  {['Upcoming', 'Confirmed'].includes(appt.status) && (
                    <Button 
                      onClick={() => setToastMsg(`🎥 Connecting to HD Video Telehealth session with ${appt.doctorName}...`)} 
                      style={{ backgroundColor: 'var(--primary)', color: 'white', borderRadius: '12px', padding: '10px 20px', fontWeight: 800 }}
                    >
                      <Video size={16} />
                      Join Live Video Consultation
                    </Button>
                  )}

                  {appt.status === 'Completed' && (
                    <Button 
                      onClick={() => setToastMsg(`📄 Downloading official prescription from ${appt.doctorName}...`)} 
                      variant="outline"
                      style={{ borderRadius: '12px', padding: '10px 20px', fontWeight: 700 }}
                    >
                      <Download size={16} />
                      Download Clinical Prescription
                    </Button>
                  )}

                  {['Upcoming', 'Pending', 'Confirmed'].includes(appt.status) && (
                    <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
                      <button 
                        onClick={() => handleCancelClick(appt.id)}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '12px',
                          border: '1px solid #fecaca',
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <XCircle size={15} />
                        Cancel Consult
                      </button>

                      <button 
                        onClick={() => handleOpenReschedule(appt)}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '12px',
                          border: '1px solid var(--border)',
                          backgroundColor: '#f8fafc',
                          color: 'var(--text-dark)',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <RefreshCw size={15} />
                        Reschedule Slot
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </Card>
          ))}
        </div>
      )}

      {/* BOOK NEW CONSULTATION MODAL */}
      <Modal isOpen={isBookOpen} onClose={() => setIsBookOpen(false)} title="Book Telehealth Doctor Consultation">
        <form onSubmit={handleBookSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <Select 
            label="Select Doctor / Specialist *"
            options={doctorOptions}
            value={bookForm.doctorName}
            onChange={(val) => {
              const spec = val.includes('Cardiology') ? 'Cardiology Specialist' : val.includes('General') ? 'General Physician' : val.includes('Endo') ? 'Endocrinologist' : 'Medical Specialist';
              setBookForm({ ...bookForm, doctorName: val, doctorSpecialty: spec });
            }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-2-mobile">
            <Input 
              label="Preferred Date *" 
              type="date"
              value={bookForm.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
              required
              disabled={isBooking}
            />
            <Select 
              label="Time Slot *"
              options={timeSlots}
              value={bookForm.time}
              onChange={(val) => setBookForm({ ...bookForm, time: val })}
              disabled={isBooking}
            />
          </div>

          <Input 
            label="Describe Symptoms / Reason for Visit" 
            placeholder="e.g. Discussing lab report findings, mild chest discomfort, or routine checkup" 
            value={bookForm.notes}
            onChange={(e) => setBookForm({ ...bookForm, notes: e.target.value })}
            disabled={isBooking}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <Button type="button" variant="outline" onClick={() => setIsBookOpen(false)} disabled={isBooking} style={{ borderRadius: '12px' }}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isBooking} style={{ borderRadius: '12px', backgroundColor: 'var(--primary)' }}>
              Confirm & Book Appointment
            </Button>
          </div>
        </form>
      </Modal>

      {/* RESCHEDULE MODAL */}
      <Modal isOpen={isReschedOpen} onClose={() => setIsReschedOpen(false)} title={`Reschedule Appointment: ${selectedAppt?.doctorName}`}>
        {selectedAppt && (
          <form onSubmit={handleConfirmReschedule} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-2-mobile">
              <Input 
                label="New Date" 
                type="date"
                value={reschedForm.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setReschedForm({ ...reschedForm, date: e.target.value })}
                required
                disabled={isUpdating}
              />
              <Select 
                label="New Session Slot"
                options={timeSlots}
                value={reschedForm.time}
                onChange={(val) => setReschedForm({ ...reschedForm, time: val })}
                disabled={isUpdating}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <Button type="button" variant="outline" onClick={() => setIsReschedOpen(false)} disabled={isUpdating} style={{ borderRadius: '12px' }}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isUpdating} style={{ borderRadius: '12px', backgroundColor: 'var(--primary)' }}>
                Save Rescheduled Time
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {toastMsg && (
        <Toast message={toastMsg} onClose={() => setToastMsg('')} />
      )}
    </div>
  );
};
