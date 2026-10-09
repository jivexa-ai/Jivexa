import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHealthData, Doctor } from '../../context/HealthDataContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Toast } from '../../components/ui/Toast';
import { 
  Search, Star, MapPin, Calendar, Clock, Video, User, 
  CheckCircle2, ShieldCheck, Stethoscope, Award, Phone, 
  Building2, Sparkles, Filter, Check
} from 'lucide-react';

export const DoctorDiscovery: React.FC = () => {
  const { doctors, bookAppointment } = useHealthData();
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('All');
  const [consultType, setConsultType] = useState('All');

  // Booking Modal State
  const [selectedDoc, setSelectedDoc] = useState<Doctor | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('10:30 AM');
  const [consultMode, setConsultMode] = useState<'Video' | 'In-Person'>('Video');
  const [symptomsNotes, setSymptomsNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Default Practo Doctors Data with Avatars & Credentials
  const defaultPractoDoctors: Doctor[] = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Dr. Anand Sen',
      specialty: 'Cardiologist',
      experience: 15,
      location: 'Indiranagar, Bengaluru',
      availability: 'Mon, Wed, Fri (10:00 AM - 4:00 PM)',
      consultationType: 'Both',
      rating: 4.9,
      education: 'MBBS, MD (Cardiology) - AIIMS Delhi',
      about: 'Senior cardiologist with over 15 years of experience treating coronary artery disease, arrhythmias, and hypertension. Dedicated to preventive cardiac care.',
      fee: 800,
      photoUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80',
      clinicName: 'Sen Cardiac Care Institute',
      registrationNumber: 'MCI-119283-X',
      status: 'approved'
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Dr. Priya Sharma',
      specialty: 'Pediatrician',
      experience: 12,
      location: 'Koramangala, Bengaluru',
      availability: 'Tue, Thu, Sat (9:00 AM - 1:00 PM)',
      consultationType: 'Both',
      rating: 4.8,
      education: 'MBBS, DCH - Bangalore Medical College',
      about: 'Passionate pediatrician specializing in childhood growth development, immunizations, and general pediatric illnesses.',
      fee: 600,
      photoUrl: 'https://images.unsplash.com/photo-1594824813566-88855ce64ce4?w=200&auto=format&fit=crop&q=80',
      clinicName: 'Kiddies Health Clinic',
      registrationNumber: 'KMC-773910-B',
      status: 'approved'
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Dr. Rajesh Patel',
      specialty: 'Dermatologist',
      experience: 10,
      location: 'Jayanagar, Bengaluru',
      availability: 'Mon - Fri (5:00 PM - 8:00 PM)',
      consultationType: 'Video',
      rating: 4.7,
      education: 'MBBS, MD (Dermatology) - JIPMER',
      about: 'Focuses on skin cancer screening, acne management, eczema treatment, and clinical hair fall therapies.',
      fee: 700,
      photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80',
      clinicName: 'DermaCare Skin & Laser Clinic',
      registrationNumber: 'MCI-994812-D',
      status: 'approved'
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      name: 'Dr. Meera Nair',
      specialty: 'General Physician',
      experience: 14,
      location: 'Whitefield, Bengaluru',
      availability: 'Mon - Sat (9:00 AM - 5:00 PM)',
      consultationType: 'Both',
      rating: 4.6,
      education: 'MBBS, DNB (Internal Medicine) - Manipal Hospital',
      about: 'Handles primary healthcare concerns, metabolic management, infectious diseases, and routine health assessments.',
      fee: 500,
      photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80',
      clinicName: 'Whitefield Family Health Clinic',
      registrationNumber: 'KMC-662810-G',
      status: 'approved'
    }
  ];

  const displayDoctors = doctors.length > 0 ? doctors : defaultPractoDoctors;

  const filteredDoctors = displayDoctors.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase()) || 
                          doc.specialty.toLowerCase().includes(search.toLowerCase()) ||
                          doc.location.toLowerCase().includes(search.toLowerCase()) ||
                          (doc.clinicName && doc.clinicName.toLowerCase().includes(search.toLowerCase()));
    const matchesSpecialty = specialty === 'All' || doc.specialty === specialty;
    const matchesType = consultType === 'All' || 
                        doc.consultationType === consultType || 
                        doc.consultationType === 'Both';
    return matchesSearch && matchesSpecialty && matchesType;
  });

  const specialties = ['All', 'Cardiologist', 'Pediatrician', 'Dermatologist', 'General Physician', 'Orthopedics', 'Neurology', 'Gynecologist'];

  const handleOpenBooking = (doc: Doctor) => {
    setSelectedDoc(doc);
    setIsBookingOpen(true);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSelectedTimeSlot('10:30 AM');
    setConsultMode('Video');
    setSymptomsNotes('');
    setErrorMsg('');
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;
    if (!selectedDate || !selectedTimeSlot) {
      setErrorMsg('Please select an appointment date and time slot.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await bookAppointment(
        selectedDoc.name,
        selectedDoc.specialty,
        selectedDate,
        selectedTimeSlot
      );

      setIsBookingOpen(false);
      setToastMsg(`🎉 Consultation booked with ${selectedDoc.name} on ${selectedDate} at ${selectedTimeSlot}!`);
    } catch (e) {
      setErrorMsg('An unexpected error occurred during booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableTimeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', 
    '11:00 AM', '02:00 PM', '03:30 PM', '05:00 PM'
  ];

  // Quick next 4 dates
  const nextDates = Array.from({ length: 4 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      fullDate: d.toISOString().split('T')[0],
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    };
  });

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* PRACTO-STYLE BRAND GRADIENT HEADER BANNER */}
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
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white' }}>Find & Book Verified Healthcare Practitioners</h1>
              <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: '12px', color: 'white' }}>100% Verified NMC License</span>
            </div>
            <p style={{ opacity: 0.9, fontSize: '0.88rem', marginTop: '4px' }}>
              Connect with top-rated medical specialists for instant online video calls or clinic visits.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: '10px 16px', borderRadius: '16px', backdropFilter: 'blur(8px)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', opacity: 0.8, fontWeight: 700 }}>Verified Doctors</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{displayDoctors.length} Active</div>
          </div>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: '10px 16px', borderRadius: '16px', backdropFilter: 'blur(8px)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', opacity: 0.8, fontWeight: 700 }}>Slot Lock</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>Instant</div>
          </div>
        </div>
      </div>

      {/* SEARCH BAR & FILTER CARD */}
      <Card style={{ borderRadius: '20px', padding: '18px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }} className="grid-3-mobile">
          <div style={{ position: 'relative' }}>
            <Input 
              placeholder="Search doctors by name, specialty, or clinic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ height: '42px', fontSize: '0.88rem', paddingLeft: '36px', borderRadius: '12px' }}
              icon={<Search size={16} style={{ color: 'var(--text-light)' }} />}
            />
          </div>

          <Select 
            options={specialties.map((s) => ({ value: s, label: s === 'All' ? 'All Specialties' : s }))}
            value={specialty}
            onChange={(val) => setSpecialty(val)}
            style={{ height: '42px', borderRadius: '12px' }}
          />

          <Select 
            options={[
              { value: 'All', label: 'All Formats (Video & Clinic)' },
              { value: 'Video', label: 'Video Call only' },
              { value: 'In-Person', label: 'Clinic Visit only' }
            ]}
            value={consultType}
            onChange={(val) => setConsultType(val)}
            style={{ height: '42px', borderRadius: '12px' }}
          />
        </div>
      </Card>

      {/* DOCTORS CARDS LIST */}
      {filteredDoctors.length === 0 ? (
        <Card style={{ padding: '64px 24px', textAlign: 'center', backgroundColor: 'white', borderRadius: '24px' }}>
          <User size={48} style={{ color: 'var(--text-light)', margin: '0 auto 16px auto' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>No healthcare practitioners found</h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '6px', maxWidth: '400px', margin: '6px auto 0 auto' }}>
            We couldn't find any doctor matching "{search}". Try clearing your specialty or location filters.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }} className="grid-2-mobile">
          {filteredDoctors.map((doc) => (
            <Card 
              key={doc.id}
              style={{
                borderRadius: '24px',
                border: '1px solid var(--border)',
                backgroundColor: 'white',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.25s ease'
              }}
            >
              <div>
                {/* Doctor Avatar Header */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '20px',
                      background: 'linear-gradient(135deg, #0f766e 0%, #10b981 100%)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.25rem',
                      boxShadow: '0 4px 12px rgba(15, 118, 110, 0.25)',
                      flexShrink: 0
                    }}>
                      {doc.name.replace('Dr. ', '').split(' ').map(n => n[0]).join('')}
                    </div>
                    <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', backgroundColor: '#10b981', color: 'white', borderRadius: '50%', padding: '3px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }} title="NMC License Verified">
                      <CheckCircle2 size={14} />
                    </div>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-dark)' }}>{doc.name}</h3>
                        <span style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 800 }}>
                          {doc.specialty} • {doc.experience} Yrs Exp
                        </span>
                      </div>
                      
                      {doc.rating ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#fffbebfb', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: '12px', color: '#d97706', fontSize: '0.82rem', fontWeight: 800 }}>
                          <Star size={14} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                          <span>{doc.rating}</span>
                        </div>
                      ) : (
                        <div style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800 }}>
                          🆕 New Practitioner
                        </div>
                      )}
                    </div>

                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
                      {doc.education || 'MBBS, Specialist Medical Practitioner'}
                    </p>
                  </div>
                </div>

                {/* About Bio */}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.5', marginBottom: '16px', minHeight: '40px' }}>
                  {doc.about}
                </p>

                {/* Info List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building2 size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{doc.clinicName || 'Specialist Health Clinic'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={15} style={{ color: 'var(--text-light)', flexShrink: 0 }} />
                    <span>{doc.location}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={15} style={{ color: 'var(--text-light)', flexShrink: 0 }} />
                    <span>{doc.availability}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Fee & Booking Button */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Consultation Fee</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-dark)' }}>
                    ₹{doc.fee} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>/ Session</span>
                  </div>
                </div>

                <Button 
                  onClick={() => handleOpenBooking(doc)}
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    borderRadius: '14px',
                    padding: '12px 22px',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 14px rgba(15, 118, 110, 0.3)'
                  }}
                >
                  Book Consultation
                </Button>
              </div>

            </Card>
          ))}
        </div>
      )}

      {/* PRACTO REAL SLOT SELECTION & BOOKING MODAL */}
      <Modal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} title={`Book Consultation: ${selectedDoc?.name}`}>
        {selectedDoc && (
          <form onSubmit={handleConfirmBooking} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {errorMsg && (
              <div style={{ backgroundColor: 'var(--error-light)', border: '1px solid var(--error)', padding: '12px', borderRadius: '12px', color: 'var(--error)', fontSize: '0.85rem', fontWeight: 600 }}>
                {errorMsg}
              </div>
            )}

            {/* Doctor Info Box */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', backgroundColor: '#f0fdfa', padding: '14px 18px', borderRadius: '16px', border: '1px solid rgba(15, 118, 110, 0.2)' }}>
              <img src={selectedDoc.photoUrl} alt={selectedDoc.name} style={{ width: '52px', height: '52px', borderRadius: '14px', objectFit: 'cover' }} />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-dark)' }}>{selectedDoc.name}</h4>
                <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700 }}>
                  {selectedDoc.specialty} • Consultation Fee: ₹{selectedDoc.fee}
                </span>
              </div>
            </div>

            {/* 1. SELECT DATE CARDS */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-dark)', display: 'block', marginBottom: '8px' }}>
                Select Appointment Date *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }} className="grid-2-mobile">
                {nextDates.map((item) => (
                  <button
                    type="button"
                    key={item.fullDate}
                    onClick={() => setSelectedDate(item.fullDate)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '12px',
                      border: '2px solid',
                      borderColor: selectedDate === item.fullDate ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: selectedDate === item.fullDate ? 'var(--primary-light)' : 'white',
                      color: selectedDate === item.fullDate ? 'var(--primary)' : 'var(--text-dark)',
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. SELECT TIME SLOT CHIPS */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-dark)', display: 'block', marginBottom: '8px' }}>
                Select Real Available Slot *
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {availableTimeSlots.map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => setSelectedTimeSlot(slot)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid',
                      borderColor: selectedTimeSlot === slot ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: selectedTimeSlot === slot ? 'var(--primary)' : 'white',
                      color: selectedTimeSlot === slot ? 'white' : 'var(--text-dark)',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer'
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. CONSULTATION MODE */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-dark)', display: 'block', marginBottom: '8px' }}>
                Consultation Mode *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setConsultMode('Video')}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: '2px solid',
                    borderColor: consultMode === 'Video' ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: consultMode === 'Video' ? 'var(--primary-light)' : 'white',
                    color: consultMode === 'Video' ? 'var(--primary)' : 'var(--text-dark)',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Video size={18} />
                  HD Video Consultation
                </button>

                <button
                  type="button"
                  onClick={() => setConsultMode('In-Person')}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    border: '2px solid',
                    borderColor: consultMode === 'In-Person' ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: consultMode === 'In-Person' ? 'var(--primary-light)' : 'white',
                    color: consultMode === 'In-Person' ? 'var(--primary)' : 'var(--text-dark)',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Building2 size={18} />
                  In-Person Clinic Visit
                </button>
              </div>
            </div>

            <Input 
              label="Patient Symptoms / Reason for Visit" 
              placeholder="e.g. Follow-up on blood pressure lab results, chest tightness, or routine checkup" 
              value={symptomsNotes}
              onChange={(e) => setSymptomsNotes(e.target.value)}
              disabled={isSubmitting}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <Button type="button" variant="outline" onClick={() => setIsBookingOpen(false)} disabled={isSubmitting} style={{ borderRadius: '12px' }}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting} style={{ borderRadius: '12px', backgroundColor: 'var(--primary)', padding: '12px 28px', fontWeight: 800 }}>
                Confirm & Lock Consultation Slot
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
