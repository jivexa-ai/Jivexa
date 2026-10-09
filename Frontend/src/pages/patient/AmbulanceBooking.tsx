import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../context/HealthDataContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Toast } from '../../components/ui/Toast';
import { Modal } from '../../components/ui/Modal';
import { 
  Siren, MapPin, Navigation, Phone, ShieldCheck, HeartPulse, 
  CheckCircle2, XCircle, Clock, AlertTriangle, Activity, PhoneCall, Radio, AlertOctagon
} from 'lucide-react';

export const PatientAmbulanceBooking: React.FC = () => {
  const { user } = useAuth();
  const { bookAmbulance, ambulanceBookings, updateAmbulanceBookingStatus, patientProfile } = useHealthData();

  const [pickupAddress, setPickupAddress] = useState('100ft Road, Indiranagar, Bengaluru, KA 560038');
  const [destAddress, setDestAddress] = useState('Apollo Hospital, 100ft Rd, Indiranagar');
  const [selectedType, setSelectedType] = useState<'Basic' | 'Oxygen' | 'ICU' | 'ALS'>('ICU');
  const [isBooking, setIsBooking] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);

  const fareMap = { Basic: 500, Oxygen: 800, ICU: 1200, ALS: 1800 };

  // Find active booking for patient
  const activeBooking = ambulanceBookings.find((b) => b.patientId === user?.id && ['Accepted', 'Arrived', 'In Transit'].includes(b.status));

  // Simulated GPS Telemetry Progress for Active Booking
  const [telemetryEta, setTelemetryEta] = useState(4);
  const [telemetryDistance, setTelemetryDistance] = useState(1.8);

  useEffect(() => {
    if (!activeBooking) return;
    const interval = setInterval(() => {
      setTelemetryEta((prev) => Math.max(1, prev - 1));
      setTelemetryDistance((prev) => Math.max(0.2, Number((prev - 0.3).toFixed(1))));
    }, 4000);
    return () => clearInterval(interval);
  }, [activeBooking]);

  const handleConfirmBooking = async () => {
    setIsBooking(true);
    const res = await bookAmbulance({
      ambulanceType: selectedType,
      pickupAddress,
      destinationAddress: destAddress,
      pickupLat: 12.9716,
      pickupLng: 77.5946,
      destLat: 12.9780,
      destLng: 77.6010,
      fare: fareMap[selectedType]
    });
    setIsBooking(false);

    if (res.success) {
      setToastMsg(`⚡ Emergency ${selectedType} Ambulance Dispatched! Driver is en route.`);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '24px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Emergency SOS Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)',
        borderRadius: '24px',
        padding: '24px 28px',
        color: 'white',
        boxShadow: '0 16px 32px -8px rgba(220, 38, 38, 0.4)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Siren size={32} className="animate-pulse" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', backgroundColor: 'rgba(255, 255, 255, 0.25)', padding: '2px 8px', borderRadius: '6px' }}>
                Jivexa Health Ambulance Network
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 900 }}>24/7 Rapid Ambulance Booking</h2>
            <span style={{ fontSize: '0.84rem', opacity: 0.9 }}>
              JHID: <strong>{patientProfile?.jivexaHealthId || 'JXV-STVAZREW'}</strong> • GPS Dispatch Enabled
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsSosModalOpen(true)}
          style={{
            backgroundColor: 'white',
            color: '#dc2626',
            border: 'none',
            borderRadius: '16px',
            padding: '12px 24px',
            fontSize: '0.92rem',
            fontWeight: 900,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 6px 18px rgba(0,0,0,0.25)'
          }}
        >
          <Siren size={20} />
          INSTANT SOS 108
        </button>
      </div>

      {/* Active Ride Tracking Card if booking exists */}
      {activeBooking ? (
        <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Siren size={22} style={{ color: 'var(--error)' }} /><span style={{ fontWeight: 900 }}>Active Ambulance Tracking</span></div>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Live Progress Banner */}
            <div style={{ backgroundColor: '#fef2f2', border: '1.5px solid var(--error)', borderRadius: '20px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  ⚡ Status: {activeBooking.status.toUpperCase()}
                </span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginTop: '2px', color: 'var(--text-dark)' }}>
                  Arriving in ~{telemetryEta} mins ({telemetryDistance} km away)
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Pickup: {activeBooking.pickupAddress} → {activeBooking.destinationAddress}
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Estimated Fare</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)' }}>₹{activeBooking.fare}</span>
              </div>
            </div>

            {/* Simulated Live GPS Map Screen */}
            <div style={{
              height: '240px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
            }}>
              {/* Map grid lines */}
              <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              
              {/* Simulated Ambulance Vehicle Marker */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 10, transition: 'all 1s ease' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#dc2626', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(220, 38, 38, 0.8)' }} className="animate-pulse">
                  <Siren size={24} />
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, backgroundColor: 'rgba(0,0,0,0.8)', padding: '4px 12px', borderRadius: '12px', fontFamily: 'monospace' }}>
                  {activeBooking.vehicleNumber} (En Route)
                </span>
              </div>
            </div>

            {/* Driver & Partner Card */}
            <div style={{ border: '1px solid var(--border)', borderRadius: '18px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', backgroundColor: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem' }}>
                  {activeBooking.driverName?.charAt(0) || 'D'}
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>{activeBooking.driverName}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Vehicle: <strong>{activeBooking.vehicleNumber}</strong> • Category: <strong>{activeBooking.ambulanceType}</strong>
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <a
                  href={`tel:${activeBooking.driverPhone}`}
                  style={{
                    backgroundColor: 'var(--secondary)',
                    color: 'white',
                    borderRadius: '12px',
                    padding: '10px 18px',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <PhoneCall size={16} /> Call Ambulance
                </a>

                <Button
                  variant="outline"
                  onClick={async () => {
                    await updateAmbulanceBookingStatus(activeBooking.id, 'Cancelled');
                    setToastMsg('Ambulance booking cancelled.');
                  }}
                  style={{ borderRadius: '12px', fontSize: '0.85rem' }}
                >
                  Cancel Ride
                </Button>
              </div>
            </div>

          </div>
        </Card>
      ) : (
        /* Booking Workflow */
        <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Navigation size={22} style={{ color: 'var(--primary)' }} /><span style={{ fontWeight: 900 }}>Book Emergency Ambulance</span></div>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Pickup & Destination Form */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-2-mobile">
              <Input
                label="Pickup GPS Location"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                icon={<MapPin size={18} style={{ color: 'var(--error)' }} />}
              />
              <Input
                label="Destination Hospital / Location"
                value={destAddress}
                onChange={(e) => setDestAddress(e.target.value)}
                icon={<Navigation size={18} style={{ color: 'var(--primary)' }} />}
              />
            </div>

            {/* Destination Quick Presets */}
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                Nearby Hospital Emergency Hubs:
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  'Apollo Hospital, Indiranagar (1.4 km)',
                  'Manipal Hospital, HAL Airport Rd (3.2 km)',
                  'Fortis Healthcare, Cunningham Rd (5.8 km)'
                ].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => {
                      setDestAddress(preset);
                      setToastMsg(`Selected destination: ${preset.split(' (')[0]}`);
                    }}
                    style={{
                      backgroundColor: destAddress === preset ? 'var(--primary-light)' : '#f8fafc',
                      color: destAddress === preset ? 'var(--primary)' : 'var(--text-dark)',
                      border: destAddress === preset ? '1px solid var(--primary)' : '1px solid var(--border)',
                      borderRadius: '20px',
                      padding: '6px 14px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.18s ease'
                    }}
                  >
                    🏥 {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Ambulance Category */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '14px' }}>Select Ambulance Category:</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }} className="grid-2-mobile">
                {[
                  {
                    type: 'Basic' as const,
                    title: 'Basic Ambulance',
                    fare: 500,
                    eta: '3-5 mins',
                    desc: 'Patient transport, standard stretcher & first-aid kit.'
                  },
                  {
                    type: 'Oxygen' as const,
                    title: 'Oxygen Ambulance',
                    fare: 800,
                    eta: '4-6 mins',
                    desc: 'Continuous O2 support, trained medical attendant.'
                  },
                  {
                    type: 'ICU' as const,
                    title: 'ICU Ambulance',
                    fare: 1200,
                    eta: '5-8 mins',
                    desc: 'Ventilator, cardiac monitor, suction machine & doctor.'
                  },
                  {
                    type: 'ALS' as const,
                    title: 'Advanced ALS',
                    fare: 1800,
                    eta: '4-7 mins',
                    desc: 'Defibrillator, emergency meds & paramedic team.'
                  }
                ].map((item) => (
                  <div
                    key={item.type}
                    onClick={() => setSelectedType(item.type)}
                    style={{
                      border: selectedType === item.type ? '2px solid var(--error)' : '1px solid var(--border)',
                      backgroundColor: selectedType === item.type ? '#fef2f2' : 'white',
                      borderRadius: '18px',
                      padding: '18px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      transition: 'all 0.2s ease',
                      boxShadow: selectedType === item.type ? '0 8px 20px -4px rgba(220, 38, 38, 0.2)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--error)', textTransform: 'uppercase' }}>
                        ~{item.eta}
                      </span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary)' }}>
                        ₹{item.fare}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.98rem', fontWeight: 800, marginTop: '2px' }}>{item.title}</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm Dispatch Button */}
            <Button
              variant="danger"
              isLoading={isBooking}
              onClick={handleConfirmBooking}
              style={{
                height: '52px',
                borderRadius: '16px',
                fontSize: '1.05rem',
                fontWeight: 900,
                letterSpacing: '0.02em',
                boxShadow: '0 10px 24px -4px rgba(220, 38, 38, 0.4)'
              }}
            >
              <Siren size={22} />
              Confirm & Dispatch {selectedType} Ambulance Now (₹{fareMap[selectedType]})
            </Button>

          </div>
        </Card>
      )}

      {/* INSTANT SOS 108 MODAL */}
      <Modal isOpen={isSosModalOpen} onClose={() => setIsSosModalOpen(false)} title="🚨 INSTANT EMERGENCY SOS BROADCAST">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center', alignItems: 'center', padding: '10px 0' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="animate-pulse">
            <AlertOctagon size={44} />
          </div>

          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#dc2626' }}>
              Emergency SOS 108 Signal Active
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: '1.5' }}>
              Your GPS location coordinates (12.9716° N, 77.5946° E) and Health ID summary (<strong>{patientProfile?.jivexaHealthId || 'JXV-STVAZREW'}</strong>) have been broadcast to Apollo Trauma Emergency Center.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <a
              href="tel:108"
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                borderRadius: '14px',
                padding: '14px 20px',
                fontWeight: 900,
                fontSize: '1rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 8px 20px rgba(220, 38, 38, 0.4)'
              }}
            >
              <PhoneCall size={20} /> Speed Dial 108 Emergency
            </a>

            <Button
              variant="outline"
              onClick={() => {
                setIsSosModalOpen(false);
                setToastMsg('SOS Alert cancelled.');
              }}
              style={{ borderRadius: '14px' }}
            >
              Cancel SOS Signal
            </Button>
          </div>
        </div>
      </Modal>

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}

    </div>
  );
};
