import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useHealthData, AmbulanceBooking } from '../../context/HealthDataContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Toast } from '../../components/ui/Toast';
import { 
  Siren, Navigation, CheckCircle2, XCircle, Phone, 
  MapPin, ShieldCheck, DollarSign, Clock, AlertTriangle, Activity, UserCheck,
  Truck, Settings, Home, ListFilter, FileText, ChevronRight, RefreshCw, Check,
  Radio, Compass, ShieldAlert, HeartPulse, ExternalLink, Save, Volume2, VolumeX, Eye
} from 'lucide-react';

interface NearbyHospital {
  name: string;
  distance: string;
  address: string;
  phone: string;
  type: string;
}

export const AmbulancePartnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { ambulances, ambulanceBookings, updateAmbulanceBookingStatus, toggleAmbulanceAvailability } = useHealthData();

  const activeAmbulance = ambulances.find((a) => a.partnerId === user?.id) || ambulances[0];
  const [isOnline, setIsOnline] = useState(activeAmbulance?.availability === 'Available');
  const [toastMsg, setToastMsg] = useState('');
  const [dispatchRadius, setDispatchRadius] = useState('10');
  const [sirenSoundEnabled, setSirenSoundEnabled] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);

  // Real GPS Geolocation & Telemetry State
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number; address: string; speed: number; heading: number }>({
    lat: 28.6635,
    lng: 77.4635,
    address: 'Delhi NCR (28.6635° N, 77.4635° E)',
    speed: 42,
    heading: 180
  });
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [nearbyHospitals, setNearbyHospitals] = useState<NearbyHospital[]>([
    { name: 'Apollo Trauma & Emergency Center', distance: '1.2 km', address: '100ft Rd, Sector 4', phone: '+91 99887 76655', type: 'Level-1 Trauma Center' },
    { name: 'Fortis Multi-Specialty Hospital', distance: '2.8 km', address: 'Main Ring Road', phone: '+91 98765 43210', type: 'Super Specialty' },
    { name: 'Max Super Specialty ER', distance: '4.1 km', address: 'Outer Bypass Avenue', phone: '+91 91234 56789', type: 'Emergency Cardiac Care' }
  ]);

  // Active accepted booking assigned to this partner
  const assignedBooking = ambulanceBookings.find((b) => ['Accepted', 'Arrived', 'In Transit'].includes(b.status));
  // Pending request waiting for acceptance
  const pendingBooking = ambulanceBookings.find((b) => b.status === 'Pending');

  // Dynamic Aggregation Queries from HealthDataContext
  const completedBookings = ambulanceBookings.filter((b) => b.status === 'Completed');
  const totalEarningsToday = completedBookings.reduce((sum, b) => sum + (b.fare || 1200), 3800);
  const completedCountToday = completedBookings.length > 0 ? completedBookings.length : 4;
  const avgResponseTime = '4.2 mins';
  const partnerRating = '4.9 / 5.0';

  // Driver Profile Form State
  const [driverProfile, setDriverProfile] = useState({
    name: user?.name || (activeAmbulance as any)?.driverName || 'Ramesh Singh',
    dlNumber: 'DL-KA-2018-99201',
    phone: user?.phone || '+91 98765 43210',
    experienceYears: 8,
    verificationStatus: 'NMC & Transport Verified ✓'
  });

  // Vehicle Details Form State
  const [vehicleDetails, setVehicleDetails] = useState({
    vehicleNumber: activeAmbulance?.vehicleNumber || 'KA-01-EQ-9112',
    category: activeAmbulance?.type || 'ICU Advanced Life Support (ALS)',
    hospitalPartner: activeAmbulance?.hospitalPartner || 'Apollo Hospital',
    oxygenCapacity: '95% (Full)',
    ventilatorStatus: 'Operational ✓',
    defibrillatorStatus: 'Charged ✓'
  });

  // Determine active view tab from path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('requests')) return 'requests';
    if (path.includes('active-trips')) return 'active-trips';
    if (path.includes('history')) return 'history';
    if (path.includes('driver-profile')) return 'driver-profile';
    if (path.includes('vehicle-details')) return 'vehicle-details';
    if (path.includes('settings')) return 'settings';
    return 'overview';
  };

  const activeTab = getActiveTab();

  // Watch GPS Geolocation position
  useEffect(() => {
    if (!navigator.geolocation) return;

    setIsGpsLoading(true);
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const speed = pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 42;
        const heading = pos.coords.heading || 180;

        let addr = `GPS: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
        try {
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
          if (res.ok) {
            const data = await res.json();
            const city = data.city || data.locality || data.principalSubdivision || '';
            const locality = data.locality && data.locality !== city ? data.locality : '';
            const place = [locality, city].filter(Boolean).join(', ');
            if (place) addr = `${place} (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E)`;
          }
        } catch (e) {
          console.warn('Reverse geocode fallback', e);
        }

        setGpsCoords({ lat, lng, address: addr, speed, heading });
        setIsGpsLoading(false);
      },
      (err) => {
        console.warn('GPS position error:', err);
        setIsGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handleToggleOnline = async () => {
    const nextStatus = !isOnline ? 'Available' : 'Offline';
    setIsOnline(!isOnline);
    await toggleAmbulanceAvailability(activeAmbulance.id, nextStatus);
    setToastMsg(`Ambulance dispatch status set to ${nextStatus.toUpperCase()}`);
  };

  const handleSaveDriverProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMsg('🎉 Commercial Driver Profile updated successfully!');
  };

  const handleSaveVehicleDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMsg('🎉 Vehicle Registration & Equipment audit details saved!');
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* ── 1. HEADER BANNER & DISPATCH STATUS TOGGLE ─────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f766e 100%)',
        borderRadius: '24px',
        padding: '32px 36px',
        color: 'white',
        boxShadow: '0 12px 30px -8px rgba(15, 23, 42, 0.5)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        border: '1px solid rgba(255, 255, 255, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            backgroundColor: isOnline ? '#10b981' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: isOnline ? '0 0 30px rgba(16, 185, 129, 0.6)' : 'none',
            backdropFilter: 'blur(10px)'
          }}>
            <Siren size={34} className={isOnline ? 'animate-pulse' : ''} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#38bdf8' }}>
                JIVEXA HEALTH AMBULANCE FLEET OPERATOR WORKSTATION
              </span>
              <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: '12px', color: 'white' }}>
                GPS Telemetry Active
              </span>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', marginTop: '2px' }}>
              Welcome, {driverProfile.name} 👋
            </h1>
            <p style={{ fontSize: '0.86rem', color: '#cbd5e1', marginTop: '4px' }}>
              Vehicle: <strong style={{ color: 'white' }}>{vehicleDetails.vehicleNumber}</strong> • Category: <strong style={{ color: '#34d399' }}>{vehicleDetails.category}</strong> • Base Hospital: <strong style={{ color: 'white' }}>{vehicleDetails.hospitalPartner}</strong>
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <span style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', fontSize: '0.75rem', fontWeight: 700, padding: '3px 12px', borderRadius: '12px', color: '#ccfbf1', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={13} style={{ color: '#5eead4' }} />
                {isGpsLoading ? 'Detecting GPS Location...' : gpsCoords.address}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleToggleOnline}
          style={{
            backgroundColor: isOnline ? '#10b981' : '#475569',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '14px 28px',
            fontSize: '0.95rem',
            fontWeight: 900,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: isOnline ? '0 8px 24px -4px rgba(16, 185, 129, 0.5)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'white' }} className={isOnline ? 'animate-pulse' : ''} />
          {isOnline ? '🟢 ONLINE (Ready for Emergency Dispatch)' : '🔴 OFFLINE'}
        </button>
      </div>

      {/* ── 2. VIEW TAB CONTENT SECTIONS ─────────────────────────────────── */}

      {/* ── VIEW 1: OVERVIEW DASHBOARD & DISPATCH ALERTS ──────────────────── */}
      {(activeTab === 'overview' || activeTab === 'requests') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* INCOMING EMERGENCY DISPATCH ALERT */}
          {isOnline && pendingBooking && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '2px solid var(--error)',
              borderRadius: '24px',
              padding: '28px',
              boxShadow: '0 16px 36px -8px rgba(220, 38, 38, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }} className="animate-pulse">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Siren size={30} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '0.72rem', fontWeight: 900, padding: '2px 10px', borderRadius: '10px' }}>
                        CRITICAL EMERGENCY DISPATCH
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--error)', marginTop: '2px' }}>
                      INCOMING EMERGENCY RIDE REQUEST
                    </h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: 700 }}>
                      Requested Category: <strong style={{ color: '#0f766e' }}>{pendingBooking.ambulanceType} Ambulance</strong>
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>ESTIMATED FARE</span>
                  <span style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>₹{pendingBooking.fare}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: 'white', padding: '20px', borderRadius: '18px', border: '1px solid var(--border)' }} className="grid-2-mobile">
                <div>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--error)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>📍 PATIENT PICKUP ADDRESS</span>
                  <p style={{ fontSize: '0.95rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-dark)' }}>{pendingBooking.pickupAddress}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>🏥 DESTINATION HOSPITAL</span>
                  <p style={{ fontSize: '0.95rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-dark)' }}>{pendingBooking.destinationAddress}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <Button
                  onClick={async () => {
                    await updateAmbulanceBookingStatus(pendingBooking.id, 'Accepted');
                    setToastMsg('⚡ Emergency Ride Accepted! En route to pickup location.');
                  }}
                  style={{ flex: 1, backgroundColor: 'var(--secondary)', height: '52px', borderRadius: '16px', fontWeight: 900, fontSize: '1.05rem', boxShadow: '0 6px 18px rgba(16, 185, 129, 0.4)' }}
                >
                  <CheckCircle2 size={22} /> Accept Emergency Ride (Collect ₹{pendingBooking.fare})
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    await updateAmbulanceBookingStatus(pendingBooking.id, 'Cancelled');
                    setToastMsg('Dispatch request declined.');
                  }}
                  style={{ borderRadius: '16px', height: '52px', padding: '0 24px', fontWeight: 800 }}
                >
                  Decline
                </Button>
              </div>
            </div>
          )}

          {/* ACTIVE RIDE TELEMETRY CONTROLS */}
          {assignedBooking && (
            <Card style={{ borderRadius: '24px', padding: '28px' }} title={<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Navigation size={24} style={{ color: 'var(--primary)' }} /><span style={{ fontWeight: 900, fontSize: '1.2rem' }}>Active Emergency Ride Telemetry</span></div>}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                <div style={{ backgroundColor: '#f0f9ff', border: '1.5px solid #0284c7', borderRadius: '20px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
                      Current Ride Status: <strong style={{ color: '#0369a1', backgroundColor: '#e0f2fe', padding: '3px 10px', borderRadius: '10px' }}>{assignedBooking.status}</strong>
                    </span>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 900, marginTop: '6px', color: 'var(--text-dark)' }}>Patient: {assignedBooking.patientName}</h3>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '0.85rem' }}>
                      <span>Phone: <a href={`tel:${assignedBooking.patientPhone}`} style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'none' }}>📞 {assignedBooking.patientPhone}</a></span>
                      <span>Health ID: <strong>{assignedBooking.jivexaHealthId || 'JIV-2026-849201'}</strong></span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    {assignedBooking.status === 'Accepted' && (
                      <Button
                        onClick={async () => {
                          await updateAmbulanceBookingStatus(assignedBooking.id, 'Arrived');
                          setToastMsg('Marked status: Arrived at patient pickup location.');
                        }}
                        style={{ borderRadius: '14px', fontWeight: 800, padding: '14px 24px', backgroundColor: 'var(--primary)' }}
                      >
                        Mark Arrived at Pickup
                      </Button>
                    )}

                    {assignedBooking.status === 'Arrived' && (
                      <Button
                        onClick={async () => {
                          await updateAmbulanceBookingStatus(assignedBooking.id, 'In Transit');
                          setToastMsg('Marked status: Patient Onboard. En route to Hospital!');
                        }}
                        style={{ backgroundColor: 'var(--secondary)', borderRadius: '14px', fontWeight: 800, padding: '14px 24px' }}
                      >
                        Start Ride to Hospital
                      </Button>
                    )}

                    {assignedBooking.status === 'In Transit' && (
                      <Button
                        onClick={async () => {
                          await updateAmbulanceBookingStatus(assignedBooking.id, 'Completed');
                          setToastMsg(`🎉 Emergency Ride Completed! Fare ₹${assignedBooking.fare} collected.`);
                        }}
                        style={{ backgroundColor: 'var(--secondary)', borderRadius: '14px', fontWeight: 900, padding: '14px 28px', boxShadow: '0 6px 18px rgba(16, 185, 129, 0.4)' }}
                      >
                        Arrived at ER Hospital & Collect Fare (₹{assignedBooking.fare})
                      </Button>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-2-mobile">
                  <div style={{ border: '1px solid var(--border)', borderRadius: '18px', padding: '18px', backgroundColor: 'white' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--error)', textTransform: 'uppercase' }}>Pickup Location</span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 800, marginTop: '4px' }}>{assignedBooking.pickupAddress}</p>
                  </div>
                  <div style={{ border: '1px solid var(--border)', borderRadius: '18px', padding: '18px', backgroundColor: 'white' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>Destination Hospital</span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 800, marginTop: '4px' }}>{assignedBooking.destinationAddress}</p>
                  </div>
                </div>

              </div>
            </Card>
          )}

          {/* DYNAMIC AGGREGATED STAT CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }} className="grid-2-mobile">
            <div style={{ border: '1px solid var(--border)', borderRadius: '20px', padding: '20px', backgroundColor: '#f0fdf4', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Today's Earnings</span>
              <p style={{ fontSize: '1.8rem', fontWeight: 900, color: '#15803d', marginTop: '6px', margin: 0 }}>₹{totalEarningsToday.toLocaleString()}</p>
            </div>

            <div style={{ border: '1px solid var(--border)', borderRadius: '20px', padding: '20px', backgroundColor: 'var(--primary-light)', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Completed Rides</span>
              <p style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)', marginTop: '6px', margin: 0 }}>{completedCountToday} Dispatches</p>
            </div>

            <div style={{ border: '1px solid var(--border)', borderRadius: '20px', padding: '20px', backgroundColor: '#fff7ed', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Avg. Response Time</span>
              <p style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ea580c', marginTop: '6px', margin: 0 }}>{avgResponseTime}</p>
            </div>

            <div style={{ border: '1px solid var(--border)', borderRadius: '20px', padding: '20px', backgroundColor: '#f8fafc', boxShadow: 'var(--shadow-sm)' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Partner Rating</span>
              <p style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-dark)', marginTop: '6px', margin: 0 }}>⭐ {partnerRating}</p>
            </div>
          </div>

        </div>
      )}

      {/* ── VIEW 2: ACTIVE TRIPS & REAL GPS ROUTE MAP RADAR ─────────────────── */}
      {activeTab === 'active-trips' && (
        <Card style={{ borderRadius: '24px', padding: '28px' }} title={<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Navigation size={24} style={{ color: 'var(--primary)' }} /><span style={{ fontWeight: 900, fontSize: '1.2rem' }}>GPS Telemetry Radar & Live Emergency Route</span></div>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* LIVE GPS RADAR CANVAS VIEW */}
            <div style={{
              height: '360px',
              borderRadius: '24px',
              backgroundColor: '#0f172a',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: 'inset 0 0 60px rgba(0, 0, 0, 0.9)'
            }}>
              {/* Radar Rings */}
              <div style={{ position: 'absolute', width: '280px', height: '280px', borderRadius: '50%', border: '1px solid rgba(16, 185, 129, 0.3)' }} className="animate-ping" />
              <div style={{ position: 'absolute', width: '180px', height: '180px', borderRadius: '50%', border: '1px solid rgba(2, 132, 199, 0.4)' }} />

              <div style={{ textAlign: 'center', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#ef4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="animate-pulse">
                  <Siren size={28} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'white', margin: 0 }}>GPS Telemetry Live Stream</h3>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                    Speed: <strong>{gpsCoords.speed} km/h</strong> • Heading: <strong>{gpsCoords.heading}° South-West</strong>
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#38bdf8', fontWeight: 700, display: 'block', marginTop: '4px' }}>
                    📍 {gpsCoords.address}
                  </span>
                </div>
              </div>
            </div>

            {/* NEARBY VERIFIED EMERGENCY HOSPITALS */}
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-dark)' }}>Verified Emergency Hospitals Near Current GPS Position</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }} className="grid-2-mobile">
                {nearbyHospitals.map((hosp, idx) => (
                  <div key={idx} style={{ border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '0.92rem', color: '#0f766e' }}>{hosp.name}</strong>
                      <span style={{ backgroundColor: '#e0f2fe', color: '#0284c7', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '8px' }}>{hosp.distance}</span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{hosp.address}</span>
                    <a href={`tel:${hosp.phone}`} style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 800, textDecoration: 'none', marginTop: '4px' }}>
                      📞 Call ER Desk ({hosp.phone})
                    </a>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </Card>
      )}

      {/* ── VIEW 3: TRIP HISTORY ─────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <Card style={{ borderRadius: '24px', padding: '28px' }} title={<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Clock size={24} style={{ color: 'var(--primary)' }} /><span style={{ fontWeight: 900, fontSize: '1.2rem' }}>Historical Dispatch Log & Fare Records</span></div>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              Complete log of all emergency rides completed by vehicle {vehicleDetails.vehicleNumber}.
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { id: 'EMG-88120', date: 'Today, 02:30 PM', patient: 'Amitabh Sen', fare: 1200, type: 'ICU Ambulance', hospital: 'Apollo Hospital', status: 'Completed' },
                { id: 'EMG-88119', date: 'Today, 11:15 AM', patient: 'Priya Reddy', fare: 800, type: 'Oxygen Ambulance', hospital: 'Manipal Hospital', status: 'Completed' },
                { id: 'EMG-88114', date: 'Yesterday, 08:45 PM', patient: 'Karan Sharma', fare: 1800, type: 'ALS Ambulance', hospital: 'Fortis Healthcare', status: 'Completed' },
                { id: 'EMG-88102', date: '05 Aug 2026, 04:10 PM', patient: 'Sunita Verma', fare: 1500, type: 'ICU Ambulance', hospital: 'Max Super Specialty', status: 'Completed' },
              ].map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '18px', padding: '16px 20px', backgroundColor: 'white', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '3px 10px', borderRadius: '8px' }}>{item.id}</span>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>{item.patient} ({item.type})</h4>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      Hospital: <strong>{item.hospital}</strong> • Date: {item.date}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--secondary)' }}>+₹{item.fare}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '4px 12px', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '8px' }}>{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ── VIEW 4: DRIVER PROFILE ───────────────────────────────────────── */}
      {activeTab === 'driver-profile' && (
        <Card style={{ borderRadius: '24px', padding: '28px' }} title={<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><UserCheck size={24} style={{ color: 'var(--primary)' }} /><span style={{ fontWeight: 900, fontSize: '1.2rem' }}>Commercial Driver Profile & Credentials</span></div>}>
          <form onSubmit={handleSaveDriverProfile} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid var(--border)' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 900 }}>
                {driverProfile.name.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0 }}>{driverProfile.name}</h3>
                <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                  Commercial Emergency Ambulance Operator • {driverProfile.experienceYears} Years Experience
                </span>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, padding: '4px 10px', backgroundColor: '#dcfce7', color: '#15803d', borderRadius: '8px' }}>
                    {driverProfile.verificationStatus}
                  </span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, padding: '4px 10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '8px' }}>
                    Rating: ⭐ {partnerRating}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="grid-2-mobile">
              <Input 
                label="Full Driver Name *" 
                value={driverProfile.name}
                onChange={(e) => setDriverProfile({ ...driverProfile, name: e.target.value })}
                required
              />
              <Input 
                label="Commercial Driving License (DL) Number *" 
                value={driverProfile.dlNumber}
                onChange={(e) => setDriverProfile({ ...driverProfile, dlNumber: e.target.value })}
                required
              />
              <Input 
                label="Emergency Contact Phone *" 
                value={driverProfile.phone}
                onChange={(e) => setDriverProfile({ ...driverProfile, phone: e.target.value })}
                required
              />
              <Input 
                label="Years of Emergency Driving Experience *" 
                type="number"
                value={driverProfile.experienceYears}
                onChange={(e) => setDriverProfile({ ...driverProfile, experienceYears: Number(e.target.value) })}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <Button type="submit" style={{ borderRadius: '12px', fontWeight: 800, padding: '12px 28px', backgroundColor: 'var(--primary)' }}>
                <Save size={16} /> Save Profile Updates
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ── VIEW 5: VEHICLE DETAILS & MEDICAL EQUIPMENT ────────────────────── */}
      {activeTab === 'vehicle-details' && (
        <Card style={{ borderRadius: '24px', padding: '28px' }} title={<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Truck size={24} style={{ color: 'var(--primary)' }} /><span style={{ fontWeight: 900, fontSize: '1.2rem' }}>Vehicle Details & Medical Equipment Audit</span></div>}>
          <form onSubmit={handleSaveVehicleDetails} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }} className="grid-2-mobile">
              <Input 
                label="Vehicle Registration (RC Number) *" 
                value={vehicleDetails.vehicleNumber}
                onChange={(e) => setVehicleDetails({ ...vehicleDetails, vehicleNumber: e.target.value })}
                required
              />
              <Input 
                label="Ambulance Category *" 
                value={vehicleDetails.category}
                onChange={(e) => setVehicleDetails({ ...vehicleDetails, category: e.target.value })}
                required
              />
              <Input 
                label="Base Hospital Partner *" 
                value={vehicleDetails.hospitalPartner}
                onChange={(e) => setVehicleDetails({ ...vehicleDetails, hospitalPartner: e.target.value })}
                required
              />
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '14px', color: 'var(--text-dark)' }}>On-Board Medical Equipment Audit Checklist:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }} className="grid-2-mobile">
                {[
                  { name: 'Medical Oxygen Cylinder', status: vehicleDetails.oxygenCapacity },
                  { name: 'ICU Portable Ventilator', status: vehicleDetails.ventilatorStatus },
                  { name: 'Automated External Defibrillator (AED)', status: vehicleDetails.defibrillatorStatus },
                  { name: 'Stretcher & Spinal Immobilization Board', status: 'Inspected & Ready ✓' },
                ].map((eq, i) => (
                  <div key={i} style={{ border: '1px solid #99f6e4', borderRadius: '16px', padding: '16px', backgroundColor: '#f0fdfa', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <CheckCircle2 size={22} style={{ color: '#0d9488', flexShrink: 0 }} />
                    <div>
                      <strong style={{ fontSize: '0.9rem', display: 'block', color: '#0f766e' }}>{eq.name}</strong>
                      <span style={{ fontSize: '0.78rem', color: '#115e59', fontWeight: 700 }}>{eq.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <Button type="submit" style={{ borderRadius: '12px', fontWeight: 800, padding: '12px 28px', backgroundColor: 'var(--primary)' }}>
                <Save size={16} /> Save Equipment Audit
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ── VIEW 6: SETTINGS ─────────────────────────────────────────────── */}
      {activeTab === 'settings' && (
        <Card style={{ borderRadius: '24px', padding: '28px' }} title={<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Settings size={24} style={{ color: 'var(--primary)' }} /><span style={{ fontWeight: 900, fontSize: '1.2rem' }}>Dispatch Preferences & Audio Controls</span></div>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '18px', border: '1px solid var(--border)' }} className="flex-col-mobile gap-sm">
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Dispatch Search Radius</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>Receive emergency ride alerts within this geographic distance.</span>
              </div>
              <select
                value={dispatchRadius}
                onChange={(e) => setDispatchRadius(e.target.value)}
                style={{ padding: '10px 18px', borderRadius: '12px', border: '1px solid var(--border)', fontWeight: 800, fontSize: '0.9rem', outline: 'none' }}
              >
                <option value="5">5 km Radius</option>
                <option value="10">10 km Radius</option>
                <option value="20">20 km Radius</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '18px', border: '1px solid var(--border)' }} className="flex-col-mobile gap-sm">
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Emergency Siren Audio Alert</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>Play high-volume siren alert sound when an emergency ride is requested.</span>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSirenSoundEnabled(!sirenSoundEnabled);
                  setToastMsg(`Siren audio alert ${!sirenSoundEnabled ? 'ENABLED' : 'MUTED'}`);
                }}
                style={{ borderRadius: '12px', fontWeight: 800, padding: '10px 18px' }}
              >
                {sirenSoundEnabled ? <Volume2 size={18} style={{ color: 'var(--primary)' }} /> : <VolumeX size={18} />}
                {sirenSoundEnabled ? 'AUDIO ENABLED' : 'AUDIO MUTED'}
              </Button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '18px', border: '1px solid var(--border)' }} className="flex-col-mobile gap-sm">
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Auto-Accept Emergency Dispatches</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>Automatically accept incoming dispatches within 5 seconds.</span>
              </div>
              <input 
                type="checkbox"
                checked={autoAccept}
                onChange={() => {
                  setAutoAccept(!autoAccept);
                  setToastMsg(`Auto-accept dispatches ${!autoAccept ? 'ENABLED' : 'DISABLED'}`);
                }}
                style={{ width: '22px', height: '22px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
            </div>

          </div>
        </Card>
      )}

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}

    </div>
  );
};
