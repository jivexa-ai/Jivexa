import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { createHealthIdApi, getMyHealthIdApi, searchHealthIdApi } from '../services/healthIdService';
import {
  createAppointmentApi,
  getAppointmentsApi,
  updateAppointmentApi,
  cancelAppointmentApi,
  createPrescriptionApi,
  getPrescriptionsApi,
  updatePrescriptionApi
} from '../services/clinicalService';
import {
  createPharmacyOrderApi,
  getPharmacyOrdersApi,
  updatePharmacyOrderApi
} from '../services/pharmacyService';
import {
  createAmbulanceRequestApi,
  getAmbulanceRequestsApi,
  updateAmbulanceRequestApi
} from '../services/ambulanceService';

// --- TYPES ---
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  location: string;
  availability: string; // e.g. "Mon - Fri, 9:00 AM - 5:00 PM"
  consultationType: 'Video' | 'In-Person' | 'Both';
  rating: number;
  education: string;
  about: string;
  fee: number;
  photoUrl?: string;
  clinicName?: string;
  registrationNumber?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'suspended';
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  rating: number;
  phone: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  status: 'Upcoming' | 'Completed' | 'Cancelled' | 'Pending' | 'Confirmed' | 'In Consultation';
  notes?: string;
  consultationSummary?: string;
}

export interface HealthRecord {
  id: string;
  patientId: string;
  name: string;
  type: 'Lab Report' | 'Prescription' | 'Vaccination' | 'Other';
  date: string;
  fileName: string;
  fileSize: string;
  fileUrl: string; // Fake local blob URL
  uploadedBy: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  medications: Medication[];
  notes?: string;
  status: 'Draft' | 'Issued' | 'Active' | 'Expired' | 'Cancelled';
  followUpDate?: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  patientId: string;
  patientName: string;
  pharmacyId: string;
  pharmacyName: string;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Ready' | 'Completed' | 'Cancelled';
  items: OrderItem[];
  totalPrice: number;
  date: string;
  prescriptionId?: string;
}

export interface InventoryItem {
  id: string;
  pharmacyId: string;
  name: string;
  stock: number;
  price: number;
  category: string;
  sku: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'appointment' | 'record' | 'order' | 'security' | 'system' | 'emergency';
  isRead: boolean;
  timestamp: string;
}

export interface HealthGoal {
  id: string;
  patientId: string;
  type: 'Steps' | 'Water' | 'Sleep' | 'Calories';
  target: number;
  current: number;
  unit: string;
}

import { MedicalReportRecord, SharedReportRecord } from '../types';

export interface AccessRequest {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  healthId: string;
}

export interface AccessLog {
  id: string;
  patientId?: string;
  healthId: string;
  accessorRole: 'PUBLIC' | 'DOCTOR' | 'PATIENT' | 'EMERGENCY';
  accessType: 'PUBLIC_EMERGENCY_LOOKUP' | 'EMERGENCY_MODE_INSTANT' | 'DOCTOR_CLINICAL_FULL';
  accessedAt: string;
}

export interface PatientProfile {
  userId: string;
  jivexaHealthId?: string;
  bloodGroup: string;
  allergies: string;
  conditions: string;
  emergencyContact: string;
  emergencySharingEnabled?: boolean;
  emergencyAccessExpiry?: string;
  configuredAt?: string;
  updatedAt?: string;
  avatarUrl?: string;
}

export interface AmbulanceVehicle {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerPhone: string;
  vehicleNumber: string;
  type: 'Basic' | 'Oxygen' | 'ICU' | 'ALS';
  availability: 'Available' | 'Offline' | 'Busy';
  latitude: number;
  longitude: number;
  hospitalPartner: string;
  rating: number;
  baseFare: number;
}

export interface AmbulanceBooking {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  jivexaHealthId?: string;
  ambulanceId?: string;
  ambulanceType: 'Basic' | 'Oxygen' | 'ICU' | 'ALS';
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  pickupAddress: string;
  destinationAddress: string;
  pickupLat: number;
  pickupLng: number;
  destLat: number;
  destLng: number;
  status: 'Pending' | 'Accepted' | 'Arrived' | 'In Transit' | 'Completed' | 'Cancelled';
  fare: number;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
}

interface HealthDataContextType {
  doctors: Doctor[];
  pharmacies: Pharmacy[];
  appointments: Appointment[];
  healthRecords: HealthRecord[];
  prescriptions: Prescription[];
  orders: Order[];
  inventory: InventoryItem[];
  notifications: Notification[];
  healthGoals: HealthGoal[];
  patientProfile: PatientProfile | null;
  medicalReports: MedicalReportRecord[];
  sharedReports: SharedReportRecord[];
  accessRequests: AccessRequest[];
  accessLogs: AccessLog[];
  ambulances: AmbulanceVehicle[];
  ambulanceBookings: AmbulanceBooking[];
  
  // Patient operations
  bookAppointment: (doctorId: string, date: string, time: string, notes: string) => Promise<{ success: boolean; appointment?: Appointment }>;
  cancelAppointment: (id: string) => void;
  rescheduleAppointment: (id: string, date: string, time: string) => void;
  uploadHealthRecord: (name: string, type: HealthRecord['type'], fileName: string, fileSize: string) => Promise<{ success: boolean }>;
  deleteHealthRecord: (id: string) => void;
  placePharmacyOrder: (pharmacyId: string, items: OrderItem[], prescriptionId?: string, deliveryAddress?: string) => Promise<{ success: boolean; order?: Order }>;
  updatePatientProfile: (data: Partial<PatientProfile>) => void;
  saveAnalyzedReport: (report: MedicalReportRecord) => void;
  shareReportWithDoctor: (reportId: string, doctorId: string) => Promise<{ success: boolean }>;
  
  // JHID & Consent Access Operations
  generateOrGetHealthId: (userId: string) => string;
  searchPatientByHealthId: (healthId: string) => Promise<{ success: boolean; patientInfo?: any; error?: string }>;
  getPublicHealthIdProfile: (healthId: string) => Promise<{ success: boolean; publicProfile?: any; error?: string }>;
  toggleEmergencyAccessMode: (enabled: boolean, durationHours?: number) => Promise<{ success: boolean }>;
  requestPatientAccess: (healthId: string) => Promise<{ success: boolean; error?: string }>;
  respondAccessRequest: (requestId: string, status: 'approved' | 'rejected') => Promise<{ success: boolean }>;
  revokeDoctorAccess: (doctorId: string) => Promise<{ success: boolean }>;

  // Ambulance Network Operations
  bookAmbulance: (details: { ambulanceType: 'Basic' | 'Oxygen' | 'ICU' | 'ALS'; pickupAddress: string; destinationAddress: string; pickupLat: number; pickupLng: number; destLat: number; destLng: number; fare: number }) => Promise<{ success: boolean; booking?: AmbulanceBooking }>;
  updateAmbulanceBookingStatus: (bookingId: string, status: AmbulanceBooking['status']) => Promise<{ success: boolean }>;
  toggleAmbulanceAvailability: (ambulanceId: string, availability: AmbulanceVehicle['availability']) => Promise<{ success: boolean }>;

  // Doctor operations
  completeConsultation: (appointmentId: string, summary: string, meds?: Medication[], notes?: string, followUpDate?: string, status?: Prescription['status']) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;
  
  // Pharmacy operations
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateInventoryStock: (itemId: string, stock: number) => void;
  
  // General
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (userId: string, message: string, type: Notification['type']) => void;
}

// --- INITIAL DEMO DATA ---
const INITIAL_DOCTORS: Doctor[] = [
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
    about: 'Dr. Anand Sen is a senior cardiologist with over 15 years of experience treating coronary artery disease, arrhythmias, and hypertension. He is dedicated to preventive cardiac care.',
    fee: 800,
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
    about: 'Dr. Priya Sharma is a passionate pediatrician specializing in childhood growth development, immunizations, and general pediatric illnesses.',
    fee: 600,
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
    education: 'MBBS, MD (Dermatology) - KEM Hospital Mumbai',
    about: 'Dr. Rajesh Patel focuses on skin cancer screening, acne management, eczema treatment, and clinical hair fall therapies.',
    fee: 700,
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'Dr. Meera Nair',
    specialty: 'General Physician',
    experience: 8,
    location: 'Whitefield, Bengaluru',
    availability: 'Mon - Sat (9:00 AM - 5:00 PM)',
    consultationType: 'Both',
    rating: 4.6,
    education: 'MBBS - Madras Medical College',
    about: 'Dr. Meera Nair handles primary healthcare concerns, metabolic management, infectious diseases, and routine health assessments.',
    fee: 500,
  }
];

const INITIAL_PHARMACIES: Pharmacy[] = [
  { id: '00000000-0000-0000-0000-000000000011', name: 'Jivexa Pharmacy Hub', address: 'Indiranagar Main Rd, Bengaluru', rating: 4.8, phone: '+91 80 4123 4567' },
  { id: '00000000-0000-0000-0000-000000000012', name: 'Apollo Pharmacy', address: 'Koramangala 8th Block, Bengaluru', rating: 4.5, phone: '+91 80 4987 6543' },
  { id: '00000000-0000-0000-0000-000000000013', name: 'MedPlus Pharmacy', address: 'Jayanagar 4th Block, Bengaluru', rating: 4.6, phone: '+91 80 4356 7890' }
];

const INITIAL_INVENTORY = (pharmId: string): InventoryItem[] => [
  { id: `${pharmId}_inv_1`, pharmacyId: pharmId, name: 'Paracetamol 500mg', stock: 120, price: 15, category: 'Analgesics', sku: 'sku-para-500' },
  { id: `${pharmId}_inv_2`, pharmacyId: pharmId, name: 'Amoxicillin 250mg', stock: 85, price: 65, category: 'Antibiotics', sku: 'sku-amox-250' },
  { id: `${pharmId}_inv_3`, pharmacyId: pharmId, name: 'Cetirizine 10mg', stock: 200, price: 20, category: 'Antihistamines', sku: 'sku-ceti-10' },
  { id: `${pharmId}_inv_4`, pharmacyId: pharmId, name: 'Metformin 500mg', stock: 150, price: 40, category: 'Anti-Diabetic', sku: 'sku-metf-500' },
  { id: `${pharmId}_inv_5`, pharmacyId: pharmId, name: 'Atorvastatin 10mg', stock: 95, price: 80, category: 'Cardiovascular', sku: 'sku-ator-10' }
];

const HealthDataContext = createContext<HealthDataContextType | undefined>(undefined);

export const HealthDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || '';
  const userName = user?.name || '';

  // State slices
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>(INITIAL_PHARMACIES);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [healthGoals, setHealthGoals] = useState<HealthGoal[]>([]);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);

  const [medicalReports, setMedicalReports] = useState<MedicalReportRecord[]>(() => {
    const saved = localStorage.getItem('jivexa_db_medical_reports');
    return saved ? JSON.parse(saved) : [];
  });

  const [sharedReports, setSharedReports] = useState<SharedReportRecord[]>(() => {
    const saved = localStorage.getItem('jivexa_db_shared_reports');
    return saved ? JSON.parse(saved) : [];
  });

  const saveAnalyzedReport = (report: MedicalReportRecord) => {
    setMedicalReports((prev) => {
      const updated = [report, ...prev.filter((r) => r.id !== report.id)];
      localStorage.setItem('jivexa_db_medical_reports', JSON.stringify(updated));
      return updated;
    });
  };

  const shareReportWithDoctor = async (reportId: string, doctorId: string): Promise<{ success: boolean }> => {
    const report = medicalReports.find((r) => r.id === reportId);
    const doc = doctors.find((d) => d.id === doctorId);
    if (!report || !doc) return { success: false };

    const sharedRecord: SharedReportRecord = {
      id: `shared_${Date.now()}`,
      reportId: report.id,
      patientId: userId,
      patientName: userName || 'Patient',
      doctorId: doc.id,
      doctorName: doc.name,
      sharedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      reviewStatus: 'Pending Review',
      reportTitle: report.fileName,
      analysisSummary: report.analysis?.summary || 'AI Medical Report Analysis',
      healthScore: report.analysis?.healthScore || 85
    };

    setSharedReports((prev) => {
      const updated = [sharedRecord, ...prev];
      localStorage.setItem('jivexa_db_shared_reports', JSON.stringify(updated));
      return updated;
    });

    await addNotification(doc.id, `Patient ${userName || 'Patient'} shared a new AI Medical Report (${report.fileName}) for your review.`, 'record');

    return { success: true };
  };

  // Sync utilities for per-user cached state
  const syncAppointments = (list: Appointment[]) => {
    setAppointments(list);
    localStorage.setItem(`jivexa_db_appointments_${userId}`, JSON.stringify(list));
  };

  const syncRecords = (list: HealthRecord[]) => {
    setHealthRecords(list);
    localStorage.setItem(`jivexa_db_records_${userId}`, JSON.stringify(list));
  };

  const syncPrescriptions = (list: Prescription[]) => {
    setPrescriptions(list);
    localStorage.setItem(`jivexa_db_prescriptions_${userId}`, JSON.stringify(list));
  };

  const syncOrders = (list: Order[]) => {
    setOrders(list);
    localStorage.setItem(`jivexa_db_orders_${userId}`, JSON.stringify(list));
  };

  const syncAmbulanceBookings = (list: AmbulanceBooking[]) => {
    setAmbulanceBookings(list);
    localStorage.setItem(`jivexa_db_ambulance_${userId}`, JSON.stringify(list));
  };

  const syncInventory = (list: InventoryItem[]) => {
    setInventory(list);
    localStorage.setItem('jivexa_db_inventory', JSON.stringify(list));
  };

  const syncNotifications = (list: Notification[]) => {
    setNotifications(list);
    localStorage.setItem(`jivexa_notifications_${userId}`, JSON.stringify(list));
  };

  // Load health data and MongoDB-backed records on mount and whenever userId changes
  useEffect(() => {
    if (!userId) return;

    const rawName = user?.name || 'Patient';
    const rawEmail = user?.email || '';

    const initializeData = async () => {
      // 1. Load or initialize Patient profile
      const savedProfile = localStorage.getItem(`jivexa_profile_${userId}`);
      const initialTimestamp = user?.createdAt || (user as any)?.created_at || new Date().toISOString();
      if (savedProfile) {
        try {
          const parsed = JSON.parse(savedProfile);
          if (!parsed.configuredAt) {
            parsed.configuredAt = initialTimestamp;
            parsed.updatedAt = parsed.updatedAt || initialTimestamp;
            localStorage.setItem(`jivexa_profile_${userId}`, JSON.stringify(parsed));
          }
          setPatientProfile(parsed);
        } catch (e) {}
      } else {
        const defaultProfile: PatientProfile = {
          userId,
          bloodGroup: 'O+ Positive',
          allergies: 'No known allergies',
          conditions: 'None logged',
          emergencyContact: rawEmail ? `${rawName} (${rawEmail})` : `${rawName} (+91 99887 76655)`,
          configuredAt: initialTimestamp,
          updatedAt: initialTimestamp
        };
        setPatientProfile(defaultProfile);
        localStorage.setItem(`jivexa_profile_${userId}`, JSON.stringify(defaultProfile));
      }

      // 2. Fetch permanent MongoDB Health ID
      if (user && user.role === 'PATIENT') {
        getMyHealthIdApi().then((res) => {
          if (res.success && res.healthId) {
            setPatientProfile((prev) => {
              const updated: PatientProfile = {
                ...(prev || { userId }),
                jivexaHealthId: res.healthId,
                bloodGroup: res.patient?.bloodGroup || prev?.bloodGroup || 'O+ Positive',
                allergies: (res.patient?.healthProfile && res.patient?.healthProfile.allergies) || prev?.allergies || 'No known allergies',
                conditions: (res.patient?.healthProfile && res.patient?.healthProfile.conditions) || prev?.conditions || 'None logged',
                emergencyContact: (res.patient?.phoneNumber || res.patient?.email) || prev?.emergencyContact || (rawEmail ? `${rawName} (${rawEmail})` : `${rawName} (+91 99887 76655)`),
                configuredAt: prev?.configuredAt || initialTimestamp,
                updatedAt: prev?.updatedAt || initialTimestamp
              };
              localStorage.setItem(`jivexa_profile_${userId}`, JSON.stringify(updated));
              return updated;
            });
          }
        }).catch((e) => {
          console.warn('[HealthDataContext] Could not fetch MongoDB Health ID:', e);
        });
      }

      // 3. Load or initialize Inventory
      const savedInv = localStorage.getItem('jivexa_db_inventory');
      if (savedInv) {
        try { setInventory(JSON.parse(savedInv)); } catch (e) {}
      } else {
        const defaultInv = INITIAL_PHARMACIES.reduce<InventoryItem[]>((acc, p) => {
          return [...acc, ...INITIAL_INVENTORY(p.id)];
        }, []);
        setInventory(defaultInv);
        localStorage.setItem('jivexa_db_inventory', JSON.stringify(defaultInv));
      }

      // 4. Load local per-user cached slices
      const cachedAppts = localStorage.getItem(`jivexa_db_appointments_${userId}`);
      if (cachedAppts) {
        try { setAppointments(JSON.parse(cachedAppts)); } catch (e) {}
      } else {
        setAppointments([]);
      }

      const cachedPres = localStorage.getItem(`jivexa_db_prescriptions_${userId}`);
      if (cachedPres) {
        try { setPrescriptions(JSON.parse(cachedPres)); } catch (e) {}
      } else {
        setPrescriptions([]);
      }

      const cachedOrders = localStorage.getItem(`jivexa_db_orders_${userId}`);
      if (cachedOrders) {
        try { setOrders(JSON.parse(cachedOrders)); } catch (e) {}
      } else {
        setOrders([]);
      }

      const cachedAmbulance = localStorage.getItem(`jivexa_db_ambulance_${userId}`);
      if (cachedAmbulance) {
        try { setAmbulanceBookings(JSON.parse(cachedAmbulance)); } catch (e) {}
      } else {
        setAmbulanceBookings([]);
      }

      const cachedRecords = localStorage.getItem(`jivexa_db_records_${userId}`);
      if (cachedRecords) {
        try { setHealthRecords(JSON.parse(cachedRecords)); } catch (e) {}
      } else {
        setHealthRecords([]);
      }

      const savedGoals = localStorage.getItem(`jivexa_goals_${userId}`);
      if (savedGoals) {
        try { setHealthGoals(JSON.parse(savedGoals)); } catch (e) {}
      } else {
        const defaultGoals: HealthGoal[] = [
          { id: 'goal_1', patientId: userId, type: 'Steps', target: 8000, current: 5420, unit: 'steps' },
          { id: 'goal_2', patientId: userId, type: 'Water', target: 3000, current: 1800, unit: 'ml' }
        ];
        setHealthGoals(defaultGoals);
        localStorage.setItem(`jivexa_goals_${userId}`, JSON.stringify(defaultGoals));
      }

      const savedNotifications = localStorage.getItem(`jivexa_notifications_${userId}`);
      if (savedNotifications) {
        try { setNotifications(JSON.parse(savedNotifications)); } catch (e) {}
      } else {
        const defaultNotifications: Notification[] = [
          {
            id: 'notif_1',
            userId,
            message: 'Welcome to JIVEXA Health OS! Complete your profile configuration to share details with doctors.',
            type: 'system',
            isRead: false,
            timestamp: new Date().toISOString()
          }
        ];
        setNotifications(defaultNotifications);
        localStorage.setItem(`jivexa_notifications_${userId}`, JSON.stringify(defaultNotifications));
      }

      // 5. Fetch Live Persistent Appointments from MongoDB
      try {
        const liveApptsRes = await getAppointmentsApi();
        if (liveApptsRes.success && Array.isArray(liveApptsRes.appointments)) {
          setAppointments(liveApptsRes.appointments);
          localStorage.setItem(`jivexa_db_appointments_${userId}`, JSON.stringify(liveApptsRes.appointments));
        }
      } catch (e) {}

      // 6. Fetch Live Persistent Prescriptions from MongoDB
      try {
        const livePresRes = await getPrescriptionsApi();
        if (livePresRes.success && Array.isArray(livePresRes.prescriptions)) {
          setPrescriptions(livePresRes.prescriptions);
          localStorage.setItem(`jivexa_db_prescriptions_${userId}`, JSON.stringify(livePresRes.prescriptions));
        }
      } catch (e) {}

      // 7. Fetch Live Persistent Pharmacy Orders from MongoDB
      try {
        const liveOrdersRes = await getPharmacyOrdersApi();
        if (liveOrdersRes.success && Array.isArray(liveOrdersRes.orders)) {
          setOrders(liveOrdersRes.orders);
          localStorage.setItem(`jivexa_db_orders_${userId}`, JSON.stringify(liveOrdersRes.orders));
        }
      } catch (e) {}

      // 8. Fetch Live Persistent Ambulance Requests from MongoDB
      try {
        const liveAmbRes = await getAmbulanceRequestsApi();
        const bookingsList = liveAmbRes.bookings || liveAmbRes.requests;
        if (liveAmbRes.success && Array.isArray(bookingsList)) {
          setAmbulanceBookings(bookingsList);
          localStorage.setItem(`jivexa_db_ambulance_${userId}`, JSON.stringify(bookingsList));
        }
      } catch (e) {}
    };

    initializeData();
  }, [userId]);

  // --- ACTIONS ---

  const bookAppointment = async (doctorId: string, date: string, time: string, notes: string) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    if (!doctor) return { success: false };

    let persistedAppt: Appointment | null = null;
    try {
      const apiRes = await createAppointmentApi({
        doctorId,
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialty,
        date,
        time,
        consultationType: doctor.consultationType || 'Video',
        notes
      });
      if (apiRes.success && apiRes.appointment) {
        persistedAppt = apiRes.appointment;
      }
    } catch (e) {}

    const newAppt: Appointment = persistedAppt || {
      id: `appt_${Date.now()}`,
      patientId: userId,
      patientName: userName,
      doctorId,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      date,
      time,
      status: 'Upcoming',
      notes
    };
    const updated = [newAppt, ...appointments.filter(a => a.id !== newAppt.id)];
    syncAppointments(updated);

    addNotification(userId, `Appointment scheduled with ${doctor.name} on ${date} at ${time}.`, 'appointment');
    addNotification(doctorId, `New appointment request from ${userName} on ${date} at ${time}.`, 'appointment');

    return { success: true, appointment: newAppt };
  };

  const cancelAppointment = async (id: string) => {
    const appt = appointments.find((a) => a.id === id);
    if (!appt) return;

    try {
      await cancelAppointmentApi(id);
    } catch (e) {}

    const updated = appointments.map((a) => a.id === id ? { ...a, status: 'Cancelled' as const } : a);
    syncAppointments(updated);

    addNotification(userId, `Appointment with ${appt.doctorName} has been cancelled.`, 'appointment');
    addNotification(appt.doctorId, `Appointment with ${userName} has been cancelled.`, 'appointment');
  };

  const rescheduleAppointment = async (id: string, date: string, time: string) => {
    const appt = appointments.find((a) => a.id === id);
    if (!appt) return;

    try {
      await updateAppointmentApi(id, { date, time, status: 'Upcoming' });
    } catch (e) {}

    const updated = appointments.map((a) => a.id === id ? { ...a, date, time, status: 'Upcoming' as const } : a);
    syncAppointments(updated);

    addNotification(userId, `Appointment with ${appt.doctorName} rescheduled to ${date} at ${time}.`, 'appointment');
    addNotification(appt.doctorId, `Appointment with ${userName} rescheduled to ${date} at ${time}.`, 'appointment');
  };

  const uploadHealthRecord = async (name: string, type: HealthRecord['type'], fileName: string, fileSize: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const newRecord: HealthRecord = {
      id: `rec_${Date.now()}`,
      patientId: userId,
      name,
      type,
      date: new Date().toISOString().split('T')[0],
      fileName,
      fileSize,
      fileUrl: '#',
      uploadedBy: 'Patient'
    };
    const updated = [newRecord, ...healthRecords];
    syncRecords(updated);

    addNotification(userId, `Document "${name}" uploaded successfully.`, 'record');
    return { success: true };
  };

  const deleteHealthRecord = async (id: string) => {
    const rec = healthRecords.find((r) => r.id === id);
    const name = rec ? rec.name : 'Record';
    
    const updated = healthRecords.filter((r) => r.id !== id);
    syncRecords(updated);

    addNotification(userId, `Document "${name}" was deleted.`, 'record');
  };

  const placePharmacyOrder = async (pharmacyId: string, items: OrderItem[], prescriptionId?: string, deliveryAddress?: string) => {
    const pharmacy = pharmacies.find((p) => p.id === pharmacyId);
    const pharmacyName = pharmacy?.name || 'Jivexa Partner Pharmacy';
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let persistedOrder: Order | null = null;
    try {
      const apiRes = await createPharmacyOrderApi({
        pharmacyId,
        pharmacyName,
        items,
        totalPrice,
        totalAmount: totalPrice,
        deliveryAddress,
        prescriptionId
      });
      if (apiRes.success && apiRes.order) {
        persistedOrder = apiRes.order;
      }
    } catch (e) {}

    const newOrder: Order = persistedOrder || {
      id: `ord_${Date.now()}`,
      patientId: userId,
      patientName: userName,
      pharmacyId,
      pharmacyName,
      status: 'Pending',
      items,
      totalPrice,
      date: new Date().toISOString().split('T')[0],
      prescriptionId
    };
    const updated = [newOrder, ...orders.filter((o) => o.id !== newOrder.id)];
    syncOrders(updated);

    addNotification(userId, `Order placed successfully at ${pharmacyName}. Total: ₹${totalPrice}.`, 'order');
    addNotification(pharmacyId, `New order received from ${userName}.`, 'order');

    return { success: true, order: newOrder };
  };

  const updatePatientProfile = async (data: Partial<PatientProfile>) => {
    if (!patientProfile) return;

    const nowIso = new Date().toISOString();
    const updated = {
      ...patientProfile,
      ...data,
      configuredAt: patientProfile.configuredAt || nowIso,
      updatedAt: nowIso
    };
    setPatientProfile(updated);
    localStorage.setItem(`jivexa_profile_${userId}`, JSON.stringify(updated));
    addNotification(userId, 'Health profile updated successfully.', 'system');
  };

  const completeConsultation = async (
    appointmentId: string, 
    summary: string, 
    meds: Medication[] = [], 
    notes = '', 
    followUpDate?: string,
    status?: Prescription['status']
  ) => {
    const appt = appointments.find((a) => a.id === appointmentId);
    if (!appt) return;

    try {
      await updateAppointmentApi(appointmentId, {
        status: 'Completed',
        consultationSummary: summary
      });
    } catch (e) {}

    const updatedAppts = appointments.map((a) => 
      a.id === appointmentId 
        ? { ...a, status: 'Completed' as const, consultationSummary: summary } 
        : a
    );
    syncAppointments(updatedAppts);

    if (meds.length > 0 || notes || followUpDate) {
      let persistedPres: Prescription | null = null;
      try {
        const presRes = await createPrescriptionApi({
          patientId: appt.patientId,
          patientName: appt.patientName,
          appointmentId: appt.id,
          date: new Date().toISOString().split('T')[0],
          medications: meds,
          notes,
          status: status || 'Issued',
          followUpDate
        });
        if (presRes.success && presRes.prescription) {
          persistedPres = presRes.prescription;
        }
      } catch (e) {}

      const newPrescription: Prescription = persistedPres || {
        id: `pres_${Date.now()}`,
        patientId: appt.patientId,
        patientName: appt.patientName,
        doctorId: appt.doctorId,
        doctorName: appt.doctorName,
        date: new Date().toISOString().split('T')[0],
        medications: meds,
        notes,
        status: status || 'Issued',
        followUpDate
      };
      const updatedPres = [newPrescription, ...prescriptions.filter(p => p.id !== newPrescription.id)];
      syncPrescriptions(updatedPres);

      if (status === 'Issued' || status === 'Active' || !status) {
        const newRecord: HealthRecord = {
          id: `rec_pres_${Date.now()}`,
          patientId: appt.patientId,
          name: `Prescription from ${appt.doctorName}`,
          type: 'Prescription',
          date: new Date().toISOString().split('T')[0],
          fileName: `prescription_${newPrescription.id}.pdf`,
          fileSize: '45 KB',
          fileUrl: '#',
          uploadedBy: appt.doctorName
        };
        syncRecords([newRecord, ...healthRecords]);
      }
      addNotification(appt.patientId, `New prescription ${status ? status.toLowerCase() : 'issued'} by ${appt.doctorName}.`, 'record');
    }

    addNotification(appt.patientId, `Consultation notes ready for your visit on ${appt.date} with ${appt.doctorName}.`, 'appointment');
    addNotification(appt.doctorId, `Consultation with ${appt.patientName} marked completed.`, 'appointment');
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    const appt = appointments.find((a) => a.id === id);
    if (!appt) return;

    try {
      await updateAppointmentApi(id, { status });
    } catch (e) {}

    const updated = appointments.map((a) => a.id === id ? { ...a, status } : a);
    syncAppointments(updated);
    addNotification(appt.patientId, `Appointment status updated to ${status}.`, 'appointment');
    addNotification(appt.doctorId, `Appointment status updated to ${status}.`, 'appointment');
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    try {
      await updatePharmacyOrderApi(orderId, { status });
    } catch (e) {}

    const updated = orders.map((o) => o.id === orderId ? { ...o, status } : o);
    syncOrders(updated);

    addNotification(order.patientId, `Your order status at ${order.pharmacyName} is now: ${status}.`, 'order');
    addNotification(order.pharmacyId, `Order ${orderId} updated to ${status}.`, 'order');
  };

  const updateInventoryStock = async (itemId: string, stock: number) => {
    const updated = inventory.map((i) => i.id === itemId ? { ...i, stock } : i);
    syncInventory(updated);
  };

  const markNotificationAsRead = async (id: string) => {
    const updated = notifications.map((n) => n.id === id ? { ...n, isRead: true } : n);
    syncNotifications(updated);
  };

  const markAllNotificationsAsRead = async () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    syncNotifications(updated);
  };

  const addNotification = async (targetId: string, message: string, type: Notification['type']) => {
    const newNotif: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId: targetId,
      message,
      type,
      isRead: false,
      timestamp: new Date().toISOString()
    };

    if (targetId === userId) {
      setNotifications((prev) => {
        const list = [newNotif, ...prev];
        localStorage.setItem(`jivexa_notifications_${userId}`, JSON.stringify(list));
        return list;
      });
    } else {
      const otherSaved = localStorage.getItem(`jivexa_notifications_${targetId}`);
      let otherList: Notification[] = [];
      if (otherSaved) {
        otherList = JSON.parse(otherSaved);
      }
      otherList.unshift(newNotif);
      localStorage.setItem(`jivexa_notifications_${targetId}`, JSON.stringify(otherList));
    }
  };

  // --- JHID & CONSENT MANAGEMENT ---
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);

  const generateOrGetHealthId = (targetUserId: string): string => {
    if (patientProfile && patientProfile.userId === targetUserId && patientProfile.jivexaHealthId) {
      return patientProfile.jivexaHealthId;
    }
    let hash = 0;
    for (let i = 0; i < targetUserId.length; i++) {
      hash = (hash << 5) - hash + targetUserId.charCodeAt(i);
      hash |= 0;
    }
    const positiveHash = Math.abs(hash);
    const numPart = String((positiveHash * 997 + 100000) % 900000 + 100000);
    return `JIV-2026-${numPart}`;
  };

  const searchPatientByHealthId = async (healthId: string) => {
    const cleanId = healthId.trim().toUpperCase();
    
    // Sample patient diagnostic reports associated with Health ID
    const sampleReports = [
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
    ];

    // 1. Local fallback check
    if (patientProfile && (patientProfile.jivexaHealthId === cleanId || generateOrGetHealthId(patientProfile.userId) === cleanId)) {
      return {
        success: true,
        patientInfo: {
          userId: patientProfile.userId,
          name: user?.name || 'Patient User',
          healthId: cleanId,
          bloodGroup: patientProfile.bloodGroup || 'O+ Positive',
          allergies: patientProfile.allergies || 'Penicillin (mild)',
          conditions: patientProfile.conditions || 'None logged',
          consentStatus: 'approved',
          reports: sampleReports
        }
      };
    }

    // 2. MongoDB Backend Search
    try {
      const apiRes = await searchHealthIdApi(cleanId);
      if (apiRes.success && apiRes.patient) {
        const p = apiRes.patient;
        const chronicStr = Array.isArray(p.healthProfile?.chronicConditions)
          ? p.healthProfile.chronicConditions.join(', ')
          : (p.healthProfile?.chronicConditions || 'None logged');
        const allergiesStr = Array.isArray(p.healthProfile?.allergies)
          ? p.healthProfile.allergies.join(', ')
          : (p.healthProfile?.allergies || 'No known allergies');

        return {
          success: true,
          patientInfo: {
            userId: p.email || `usr_patient_${cleanId.replace(/[^A-Z0-9]/g, '')}`,
            name: p.name || 'Patient User',
            healthId: apiRes.healthId || cleanId,
            bloodGroup: p.bloodGroup || 'O+',
            allergies: allergiesStr,
            conditions: chronicStr,
            consentStatus: 'approved',
            reports: sampleReports
          }
        };
      }
    } catch (err) {
      console.error('Error calling searchHealthIdApi in HealthDataContext:', err);
    }

    return {
      success: false,
      error: `Health ID "${cleanId}" not found in patient registry.`
    };
  };

  const requestPatientAccess = async (healthId: string) => {
    const cleanId = healthId.trim().toUpperCase();
    const searchRes = await searchPatientByHealthId(cleanId);
    if (!searchRes.success || !searchRes.patientInfo) {
      return { success: false, error: (searchRes as any).error || 'Patient not found.' };
    }

    const targetPatientId = searchRes.patientInfo.userId;
    const docName = user?.name || 'Dr. Practitioner';

    const newReq: AccessRequest = {
      id: `req_${Date.now()}`,
      patientId: targetPatientId,
      patientName: searchRes.patientInfo.name,
      doctorId: userId,
      doctorName: docName,
      doctorSpecialty: 'Specialist Physician',
      status: 'pending',
      createdAt: new Date().toISOString(),
      healthId: cleanId
    };

    setAccessRequests((prev) => [newReq, ...prev.filter((r) => !(r.patientId === targetPatientId && r.doctorId === userId))]);
    addNotification(targetPatientId, `${docName} requested access to your JIVEXA Health ID summary (${cleanId}).`, 'security');
    return { success: true };
  };

  const respondAccessRequest = async (requestId: string, newStatus: 'approved' | 'rejected') => {
    const targetReq = accessRequests.find((r) => r.id === requestId);
    setAccessRequests((prev) => prev.map((r) => r.id === requestId ? { ...r, status: newStatus } : r));

    if (targetReq) {
      addNotification(targetReq.doctorId, `Patient ${targetReq.patientName} ${newStatus} your health record access request.`, 'security');
    }

    return { success: true };
  };

  const revokeDoctorAccess = async (doctorId: string) => {
    setAccessRequests((prev) => prev.map((r) => r.patientId === userId && r.doctorId === doctorId ? { ...r, status: 'rejected' } : r));
    addNotification(doctorId, `Patient ${userName} revoked your access to their JIVEXA Health ID summary.`, 'security');
    return { success: true };
  };

  // --- ACCESS LOGGING & EMERGENCY MODE ---
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);

  const logAccess = (healthId: string, accessorRole: AccessLog['accessorRole'], accessType: AccessLog['accessType'], targetPatientId?: string) => {
    const newLog: AccessLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      patientId: targetPatientId,
      healthId,
      accessorRole,
      accessType,
      accessedAt: new Date().toISOString()
    };
    setAccessLogs((prev) => [newLog, ...prev]);
  };

  const getPublicHealthIdProfile = async (healthId: string) => {
    const cleanId = healthId.trim().toUpperCase();
    logAccess(cleanId, user ? (user.role as any) : 'PUBLIC', 'PUBLIC_EMERGENCY_LOOKUP');

    if (patientProfile && (patientProfile.jivexaHealthId === cleanId || generateOrGetHealthId(patientProfile.userId) === cleanId)) {
      const rawName = user?.name || 'Mayank Gangwar';
      const nameParts = rawName.split(' ');
      const maskedName = nameParts.map(p => p.charAt(0) + '*'.repeat(Math.max(1, p.length - 1))).join(' ');
      const rawPhone = user?.phone || '+91 99887 76655';
      const maskedPhone = rawPhone.length > 6 ? rawPhone.substring(0, 6) + '*****' + rawPhone.slice(-2) : rawPhone;

      return {
        success: true,
        publicProfile: {
          healthId: cleanId,
          maskedName,
          age: 29,
          gender: 'Male',
          bloodGroup: patientProfile.bloodGroup || 'O+ Positive',
          allergies: patientProfile.allergies || 'Penicillin (mild)',
          maskedEmergencyContact: maskedPhone,
          emergencySharingEnabled: patientProfile.emergencySharingEnabled || false,
          emergencyAccessExpiry: patientProfile.emergencyAccessExpiry || null,
          lastUpdated: new Date().toISOString().split('T')[0]
        }
      };
    }

    if (cleanId.startsWith('JIV-2026-')) {
      return {
        success: true,
        publicProfile: {
          healthId: cleanId,
          maskedName: 'A***** S*****',
          age: 32,
          gender: 'Female',
          bloodGroup: 'B+ Positive',
          allergies: 'Penicillin (mild)',
          maskedEmergencyContact: '+91 98*****10',
          emergencySharingEnabled: true,
          emergencyAccessExpiry: new Date(Date.now() + 86400000 * 2).toISOString(),
          lastUpdated: new Date().toISOString().split('T')[0]
        }
      };
    }

    return { success: false, error: 'No patient record found for this JIVEXA Health ID.' };
  };

  const toggleEmergencyAccessMode = async (enabled: boolean, durationHours: number = 24) => {
    const expiry = enabled ? new Date(Date.now() + durationHours * 3600000).toISOString() : undefined;
    
    setPatientProfile((prev) => prev ? {
      ...prev,
      emergencySharingEnabled: enabled,
      emergencyAccessExpiry: expiry
    } : null);

    addNotification(userId, `Instant Emergency Access Mode was ${enabled ? 'ENABLED' : 'DISABLED'}.`, 'security');
    return { success: true };
  };

  // --- AMBULANCE NETWORK STATE & OPERATIONS ---
  const INITIAL_AMBULANCES_DATA: AmbulanceVehicle[] = [
    {
      id: 'amb_1',
      partnerId: 'part_1',
      partnerName: 'Ramesh Singh (Apollo Partner)',
      partnerPhone: '+91 98765 43210',
      vehicleNumber: 'KA-01-EQ-9112',
      type: 'ICU',
      availability: 'Available',
      latitude: 12.9716,
      longitude: 77.5946,
      hospitalPartner: 'Apollo Hospital Indiranagar',
      rating: 4.9,
      baseFare: 1200
    },
    {
      id: 'amb_2',
      partnerId: 'part_2',
      partnerName: 'Vikram Patel (Manipal Express)',
      partnerPhone: '+91 98112 33445',
      vehicleNumber: 'KA-05-EM-4080',
      type: 'Oxygen',
      availability: 'Available',
      latitude: 12.9780,
      longitude: 77.6010,
      hospitalPartner: 'Manipal Hospital',
      rating: 4.8,
      baseFare: 800
    },
    {
      id: 'amb_3',
      partnerId: 'part_3',
      partnerName: 'Sunil Kumar (LifeLine Response)',
      partnerPhone: '+91 99001 22334',
      vehicleNumber: 'KA-03-ALS-1008',
      type: 'ALS',
      availability: 'Available',
      latitude: 12.9650,
      longitude: 77.5890,
      hospitalPartner: 'Fortis Healthcare Network',
      rating: 5.0,
      baseFare: 1800
    },
    {
      id: 'amb_4',
      partnerId: 'part_4',
      partnerName: 'Suresh Gowda (City Care)',
      partnerPhone: '+91 97400 55667',
      vehicleNumber: 'KA-02-AMB-5001',
      type: 'Basic',
      availability: 'Available',
      latitude: 12.9800,
      longitude: 77.6100,
      hospitalPartner: 'General Care Network',
      rating: 4.7,
      baseFare: 500
    }
  ];

  const [ambulances, setAmbulances] = useState<AmbulanceVehicle[]>(INITIAL_AMBULANCES_DATA);
  const [ambulanceBookings, setAmbulanceBookings] = useState<AmbulanceBooking[]>([]);

  const bookAmbulance = async (details: { ambulanceType: 'Basic' | 'Oxygen' | 'ICU' | 'ALS'; pickupAddress: string; destinationAddress: string; pickupLat: number; pickupLng: number; destLat: number; destLng: number; fare: number }) => {
    // Smart matching algorithm: find nearest available ambulance of requested type
    let matchedVeh = ambulances.find((a) => a.type === details.ambulanceType && a.availability === 'Available');
    if (!matchedVeh) {
      matchedVeh = ambulances.find((a) => a.availability === 'Available') || ambulances[0];
    }

    let persistedBooking: AmbulanceBooking | null = null;
    try {
      const apiRes = await createAmbulanceRequestApi({
        ambulanceType: details.ambulanceType,
        pickupAddress: details.pickupAddress,
        destinationAddress: details.destinationAddress,
        pickupLat: details.pickupLat,
        pickupLng: details.pickupLng,
        destLat: details.destLat,
        destLng: details.destLng,
        fare: details.fare,
        ambulanceId: matchedVeh.id,
        vehicleNumber: matchedVeh.vehicleNumber,
        driverName: matchedVeh.partnerName,
        driverPhone: matchedVeh.partnerPhone,
        jivexaHealthId: patientProfile?.jivexaHealthId || generateOrGetHealthId(userId)
      });
      if (apiRes.success && apiRes.booking) {
        persistedBooking = apiRes.booking;
      }
    } catch (e) {}

    const bookingId = `amb_book_${Date.now()}`;
    const newBooking: AmbulanceBooking = persistedBooking || {
      id: bookingId,
      patientId: userId,
      patientName: userName,
      patientPhone: user?.phone || '+91 99887 76655',
      jivexaHealthId: patientProfile?.jivexaHealthId || generateOrGetHealthId(userId),
      ambulanceId: matchedVeh.id,
      ambulanceType: details.ambulanceType,
      vehicleNumber: matchedVeh.vehicleNumber,
      driverName: matchedVeh.partnerName,
      driverPhone: matchedVeh.partnerPhone,
      pickupAddress: details.pickupAddress,
      destinationAddress: details.destinationAddress,
      pickupLat: details.pickupLat,
      pickupLng: details.pickupLng,
      destLat: details.destLat,
      destLng: details.destLng,
      status: 'Accepted',
      fare: details.fare,
      createdAt: new Date().toISOString(),
      acceptedAt: new Date().toISOString()
    };

    // Mark assigned vehicle busy
    setAmbulances((prev) => prev.map((a) => a.id === matchedVeh!.id ? { ...a, availability: 'Busy' } : a));
    const updated = [newBooking, ...ambulanceBookings.filter((b) => b.id !== newBooking.id)];
    syncAmbulanceBookings(updated);

    addNotification(userId, `Emergency Ambulance (${matchedVeh.vehicleNumber}) dispatched to ${details.pickupAddress}.`, 'emergency');
    return { success: true, booking: newBooking };
  };

  const updateAmbulanceBookingStatus = async (bookingId: string, newStatus: AmbulanceBooking['status']) => {
    const targetBk = ambulanceBookings.find((b) => b.id === bookingId);
    
    try {
      await updateAmbulanceRequestApi(bookingId, { status: newStatus });
    } catch (e) {}

    const updated = ambulanceBookings.map((b) => b.id === bookingId ? {
      ...b,
      status: newStatus,
      completedAt: newStatus === 'Completed' ? new Date().toISOString() : b.completedAt
    } : b);
    syncAmbulanceBookings(updated);

    if (targetBk && targetBk.ambulanceId && ['Completed', 'Cancelled'].includes(newStatus)) {
      setAmbulances((prev) => prev.map((a) => a.id === targetBk.ambulanceId ? { ...a, availability: 'Available' } : a));
    }

    if (targetBk) {
      addNotification(targetBk.patientId, `Ambulance booking status updated to ${newStatus}.`, 'emergency');
    }

    return { success: true };
  };

  const toggleAmbulanceAvailability = async (ambulanceId: string, availability: AmbulanceVehicle['availability']) => {
    setAmbulances((prev) => prev.map((a) => a.id === ambulanceId || a.partnerId === userId ? { ...a, availability } : a));
    return { success: true };
  };

  return (
    <HealthDataContext.Provider value={{
      doctors,
      pharmacies,
      appointments,
      healthRecords,
      prescriptions,
      orders,
      inventory,
      notifications,
      healthGoals,
      patientProfile: patientProfile ? { ...patientProfile, jivexaHealthId: patientProfile.jivexaHealthId || generateOrGetHealthId(userId) } : null,
      medicalReports,
      sharedReports,
      accessRequests,
      accessLogs,
      ambulances,
      ambulanceBookings,
      bookAppointment,
      cancelAppointment,
      rescheduleAppointment,
      uploadHealthRecord,
      deleteHealthRecord,
      placePharmacyOrder,
      updatePatientProfile,
      saveAnalyzedReport,
      shareReportWithDoctor,
      generateOrGetHealthId,
      searchPatientByHealthId,
      getPublicHealthIdProfile,
      toggleEmergencyAccessMode,
      requestPatientAccess,
      respondAccessRequest,
      revokeDoctorAccess,
      bookAmbulance,
      updateAmbulanceBookingStatus,
      toggleAmbulanceAvailability,
      completeConsultation,
      updateAppointmentStatus,
      updateOrderStatus,
      updateInventoryStock,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      addNotification
    }}>
      {children}
    </HealthDataContext.Provider>
  );
};

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (context === undefined) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
};
