const bcrypt = require('bcryptjs');
const { getSupabase, isSupabaseConfigured } = require('../config/supabase');

// ====================================================================
// FIELD CONVERTERS (camelCase <--> snake_case)
// ====================================================================

// --- 1. USER HELPERS ---
const mapUserFromDb = (row) => {
  if (!row) return null;
  const user = {
    _id: row.id,
    id: row.id,
    roleId: row.role_id,
    name: row.name,
    phone: row.phone || '',
    healthId: row.health_id || '',
    age: row.age,
    email: row.email,
    password: row.password,
    role: row.role,
    emailVerified: Boolean(row.email_verified),
    verified: Boolean(row.verified),
    twoFactorEnabled: Boolean(row.two_factor_enabled),
    accountStatus: row.account_status,
    otpDetails: row.otp_details || undefined,
    failedLoginAttempts: row.failed_login_attempts || 0,
    lockUntil: row.lock_until ? new Date(row.lock_until) : undefined,
    professionalDetails: row.professional_details || undefined,
    vehicleDetails: row.vehicle_details || undefined,
    licenseDetails: row.license_details || undefined,
    usage: row.usage || { tokenUsed: 0, tokenLimit: 10000, totalTokenUsed: 0 },
    avatarUrl: row.avatar_url || row.professional_details?.avatarUrl || row.usage?.avatarUrl || '',
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),

    async matchPassword(enteredPassword) {
      if (!this.password || !enteredPassword) return false;
      return await bcrypt.compare(enteredPassword, this.password);
    },

    isLocked() {
      return Boolean(this.lockUntil && this.lockUntil > new Date());
    },

    toAuthJSON() {
      return {
        id: this.id,
        _id: this.id,
        roleId: this.roleId,
        name: this.name,
        phone: this.phone || '',
        healthId: this.healthId || '',
        age: this.age,
        email: this.email,
        role: this.role,
        emailVerified: this.emailVerified,
        verified: this.verified || this.emailVerified,
        twoFactorEnabled: this.twoFactorEnabled,
        accountStatus: this.accountStatus,
        professionalDetails: this.professionalDetails,
        vehicleDetails: this.vehicleDetails,
        licenseDetails: this.licenseDetails,
        usage: this.usage,
        avatarUrl: this.avatarUrl || this.professionalDetails?.avatarUrl || this.usage?.avatarUrl || '',
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      };
    },

    toJSON() {
      return this.toAuthJSON();
    },

    async save() {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client not initialized');

      if (this.avatarUrl !== undefined) {
        this.professionalDetails = { ...(this.professionalDetails || {}), avatarUrl: this.avatarUrl };
        this.usage = { ...(this.usage || {}), avatarUrl: this.avatarUrl };
      }

      const payload = {
        role_id: this.roleId,
        name: this.name,
        phone: this.phone,
        health_id: this.healthId,
        age: this.age,
        email: this.email ? this.email.toLowerCase().trim() : undefined,
        password: this.password,
        role: this.role,
        email_verified: this.emailVerified,
        verified: this.verified,
        two_factor_enabled: this.twoFactorEnabled,
        account_status: this.accountStatus,
        otp_details: this.otpDetails || null,
        failed_login_attempts: this.failedLoginAttempts || 0,
        lock_until: this.lockUntil ? this.lockUntil.toISOString() : null,
        professional_details: this.professionalDetails || null,
        vehicle_details: this.vehicleDetails || null,
        license_details: this.licenseDetails || null,
        usage: this.usage || null,
        updated_at: new Date().toISOString()
      };

      // Clean undefined
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      const { data, error } = await client
        .from('users')
        .update(payload)
        .eq('id', this.id)
        .select('*')
        .single();

      if (error) throw new Error(`Supabase User Save Error: ${error.message}`);
      const updated = mapUserFromDb(data);
      Object.assign(this, updated);
      return this;
    }
  };

  return user;
};

const mapUserToDb = async (userData) => {
  let hashedPassword = userData.password;
  // If password is not yet hashed, hash it with bcrypt 12 rounds
  if (hashedPassword && !hashedPassword.startsWith('$2')) {
    const salt = await bcrypt.genSalt(12);
    hashedPassword = await bcrypt.hash(hashedPassword, salt);
  }

  const payload = {
    role_id: userData.roleId,
    name: userData.name,
    phone: userData.phone || '',
    health_id: userData.healthId || '',
    age: userData.age,
    email: userData.email ? userData.email.toLowerCase().trim() : '',
    password: hashedPassword,
    role: userData.role || 'PATIENT',
    email_verified: Boolean(userData.emailVerified),
    verified: Boolean(userData.verified),
    two_factor_enabled: Boolean(userData.twoFactorEnabled),
    account_status: userData.accountStatus || 'PENDING_EMAIL_VERIFICATION',
    otp_details: userData.otpDetails || null,
    failed_login_attempts: userData.failedLoginAttempts || 0,
    lock_until: userData.lockUntil ? new Date(userData.lockUntil).toISOString() : null,
    professional_details: userData.professionalDetails || null,
    vehicle_details: userData.vehicleDetails || null,
    license_details: userData.licenseDetails || null,
    usage: userData.usage || { tokenUsed: 0, tokenLimit: 10000, totalTokenUsed: 0 }
  };

  if (userData.id) payload.id = String(userData.id);
  if (userData._id) payload.id = String(userData._id);

  Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
  return payload;
};

// --- 2. HEALTH ID HELPERS ---
const mapHealthIdFromDb = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    healthId: row.health_id,
    userId: row.user_id,
    fullName: row.full_name,
    dateOfBirth: row.date_of_birth,
    gender: row.gender,
    phoneNumber: row.phone_number,
    email: row.email,
    bloodGroup: row.blood_group,
    emergencyContact: row.emergency_contact || {},
    address: row.address,
    healthProfile: row.health_profile || {},
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
    toJSON() {
      return { ...this };
    }
  };
};

const mapHealthIdToDb = (data) => {
  const payload = {
    health_id: data.healthId ? data.healthId.toUpperCase().trim() : undefined,
    user_id: String(data.userId),
    full_name: data.fullName,
    dateOf_birth: data.dateOfBirth || '2000-01-01',
    gender: data.gender || 'Unspecified',
    phone_number: data.phoneNumber || '',
    email: data.email ? data.email.toLowerCase().trim() : '',
    blood_group: data.bloodGroup || 'Not Set',
    emergency_contact: data.emergencyContact || {},
    address: data.address || '',
    health_profile: data.healthProfile || {}
  };
  if (data.id) payload.id = String(data.id);
  return payload;
};

// --- 3. APPOINTMENT HELPERS ---
const mapAppointmentFromDb = (row) => {
  if (!row) return null;
  const appt = {
    _id: row.id,
    id: row.id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    doctorSpecialty: row.doctor_specialty,
    date: row.date,
    time: row.time,
    consultationType: row.consultation_type,
    status: row.status,
    notes: row.notes || '',
    consultationSummary: row.consultation_summary || '',
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
    toJSON() {
      return {
        id: this.id,
        _id: this.id,
        patientId: this.patientId,
        patientName: this.patientName,
        doctorId: this.doctorId,
        doctorName: this.doctorName,
        doctorSpecialty: this.doctorSpecialty,
        date: this.date,
        time: this.time,
        consultationType: this.consultationType,
        status: this.status,
        notes: this.notes,
        consultationSummary: this.consultationSummary,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      };
    },
    async save() {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client not initialized');
      const { data, error } = await client
        .from('appointments')
        .update({
          patient_id: String(this.patientId),
          patient_name: this.patientName,
          doctor_id: String(this.doctorId),
          doctor_name: this.doctorName,
          doctor_specialty: this.doctorSpecialty,
          date: this.date,
          time: this.time,
          consultation_type: this.consultationType,
          status: this.status,
          notes: this.notes,
          consultation_summary: this.consultationSummary,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.id)
        .select('*')
        .single();
      if (error) throw new Error(`Supabase Appointment Save Error: ${error.message}`);
      Object.assign(this, mapAppointmentFromDb(data));
      return this;
    }
  };
  return appt;
};

// --- 4. PRESCRIPTION HELPERS ---
const mapPrescriptionFromDb = (row) => {
  if (!row) return null;
  const rx = {
    _id: row.id,
    id: row.id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    appointmentId: row.appointment_id || undefined,
    date: row.date,
    medications: row.medications || [],
    notes: row.notes || '',
    status: row.status,
    followUpDate: row.follow_up_date || '',
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
    toJSON() {
      return {
        id: this.id,
        _id: this.id,
        patientId: this.patientId,
        patientName: this.patientName,
        doctorId: this.doctorId,
        doctorName: this.doctorName,
        appointmentId: this.appointmentId,
        date: this.date,
        medications: this.medications,
        notes: this.notes,
        status: this.status,
        followUpDate: this.followUpDate,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      };
    },
    async save() {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client not initialized');
      const { data, error } = await client
        .from('prescriptions')
        .update({
          patient_id: String(this.patientId),
          patient_name: this.patientName,
          doctor_id: String(this.doctorId),
          doctor_name: this.doctorName,
          appointment_id: this.appointmentId ? String(this.appointmentId) : null,
          date: this.date,
          medications: this.medications,
          notes: this.notes,
          status: this.status,
          follow_up_date: this.followUpDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.id)
        .select('*')
        .single();
      if (error) throw new Error(`Supabase Prescription Save Error: ${error.message}`);
      Object.assign(this, mapPrescriptionFromDb(data));
      return this;
    }
  };
  return rx;
};

// --- 5. PHARMACY ORDER HELPERS ---
const mapPharmacyOrderFromDb = (row) => {
  if (!row) return null;
  const order = {
    _id: row.id,
    id: row.id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    pharmacyId: row.pharmacy_id,
    pharmacyName: row.pharmacy_name,
    items: row.items || [],
    totalAmount: Number(row.total_amount || 0),
    totalPrice: Number(row.total_price || row.total_amount || 0),
    status: row.status,
    deliveryAddress: row.delivery_address || '',
    paymentStatus: row.payment_status || 'Pending',
    prescriptionId: row.prescription_id || '',
    date: row.date || '',
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
    toJSON() {
      return {
        id: this.id,
        _id: this.id,
        patientId: this.patientId,
        patientName: this.patientName,
        pharmacyId: this.pharmacyId,
        pharmacyName: this.pharmacyName,
        items: this.items,
        totalAmount: this.totalAmount,
        totalPrice: this.totalPrice,
        status: this.status,
        deliveryAddress: this.deliveryAddress,
        paymentStatus: this.paymentStatus,
        prescriptionId: this.prescriptionId,
        date: this.date,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      };
    },
    async save() {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client not initialized');
      const { data, error } = await client
        .from('pharmacy_orders')
        .update({
          patient_id: String(this.patientId),
          patient_name: this.patientName,
          pharmacy_id: String(this.pharmacyId),
          pharmacy_name: this.pharmacyName,
          items: this.items,
          total_amount: this.totalAmount,
          total_price: this.totalPrice || this.totalAmount,
          status: this.status,
          delivery_address: this.deliveryAddress,
          payment_status: this.paymentStatus,
          prescription_id: this.prescriptionId,
          date: this.date,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.id)
        .select('*')
        .single();
      if (error) throw new Error(`Supabase PharmacyOrder Save Error: ${error.message}`);
      Object.assign(this, mapPharmacyOrderFromDb(data));
      return this;
    }
  };
  return order;
};

// --- 6. AMBULANCE REQUEST HELPERS ---
const mapAmbulanceRequestFromDb = (row) => {
  if (!row) return null;
  const amb = {
    _id: row.id,
    id: row.id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    patientPhone: row.patient_phone || '',
    jivexaHealthId: row.jivexa_health_id || '',
    ambulanceId: row.ambulance_id || '',
    ambulanceType: row.ambulance_type || 'ICU',
    vehicleNumber: row.vehicle_number || '',
    driverName: row.driver_name || '',
    driverPhone: row.driver_phone || '',
    pickupAddress: row.pickup_address,
    destinationAddress: row.destination_address,
    pickupLat: Number(row.pickup_lat || 12.9716),
    pickupLng: Number(row.pickup_lng || 77.5946),
    destLat: Number(row.dest_lat || 12.9780),
    destLng: Number(row.dest_lng || 77.6010),
    emergencyType: row.emergency_type || 'General Emergency',
    status: row.status || 'Pending',
    fare: Number(row.fare || 0),
    acceptedAt: row.accepted_at ? new Date(row.accepted_at) : undefined,
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
    toJSON() {
      return {
        id: this.id,
        _id: this.id,
        patientId: this.patientId,
        patientName: this.patientName,
        patientPhone: this.patientPhone,
        jivexaHealthId: this.jivexaHealthId,
        ambulanceId: this.ambulanceId,
        ambulanceType: this.ambulanceType,
        vehicleNumber: this.vehicleNumber,
        driverName: this.driverName,
        driverPhone: this.driverPhone,
        pickupAddress: this.pickupAddress,
        destinationAddress: this.destinationAddress,
        pickupLat: this.pickupLat,
        pickupLng: this.pickupLng,
        destLat: this.destLat,
        destLng: this.destLng,
        emergencyType: this.emergencyType,
        status: this.status,
        fare: this.fare,
        acceptedAt: this.acceptedAt,
        completedAt: this.completedAt,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      };
    },
    async save() {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client not initialized');
      const { data, error } = await client
        .from('ambulance_requests')
        .update({
          patient_id: String(this.patientId),
          patient_name: this.patientName,
          patient_phone: this.patientPhone,
          jivexa_health_id: this.jivexaHealthId,
          ambulance_id: this.ambulanceId,
          ambulance_type: this.ambulanceType,
          vehicle_number: this.vehicleNumber,
          driver_name: this.driverName,
          driver_phone: this.driverPhone,
          pickup_address: this.pickupAddress,
          destination_address: this.destinationAddress,
          pickup_lat: this.pickupLat,
          pickup_lng: this.pickupLng,
          dest_lat: this.destLat,
          dest_lng: this.destLng,
          emergency_type: this.emergencyType,
          status: this.status,
          fare: this.fare,
          accepted_at: this.acceptedAt ? new Date(this.acceptedAt).toISOString() : null,
          completed_at: this.completedAt ? new Date(this.completedAt).toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.id)
        .select('*')
        .single();
      if (error) throw new Error(`Supabase Ambulance Save Error: ${error.message}`);
      Object.assign(this, mapAmbulanceRequestFromDb(data));
      return this;
    }
  };
  return amb;
};

// ====================================================================
// REPOSITORY SERVICE EXPORT
// ====================================================================
const SupabaseDb = {
  // --- USERS ---
  users: {
    async findOne({ email, id, roleId }) {
      const client = getSupabase();
      if (!client) return null;
      let query = client.from('users').select('*');
      if (email) query = query.eq('email', email.toLowerCase().trim());
      if (id) query = query.eq('id', String(id));
      if (roleId) query = query.eq('role_id', String(roleId));
      const { data, error } = await query.maybeSingle();
      if (error || !data) return null;
      return mapUserFromDb(data);
    },

    async findById(id) {
      if (!id) return null;
      return await this.findOne({ id: String(id) });
    },

    async create(userData) {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client not initialized');
      const payload = await mapUserToDb(userData);
      const { data, error } = await client
        .from('users')
        .insert(payload)
        .select('*')
        .single();
      if (error) throw new Error(`Supabase Create User Error: ${error.message}`);
      return mapUserFromDb(data);
    }
  },

  // --- HEALTH IDS ---
  healthIds: {
    async findOne(filter) {
      const client = getSupabase();
      if (!client) return null;
      let query = client.from('health_ids').select('*');
      if (filter.healthId) {
        query = query.eq('health_id', filter.healthId.toUpperCase().trim());
      } else if (filter.userId) {
        query = query.eq('user_id', String(filter.userId));
      } else if (filter.$or && Array.isArray(filter.$or)) {
        const id1 = filter.$or[0]?.healthId;
        const id2 = filter.$or[1]?.healthId;
        if (id1 && id2) {
          query = query.or(`health_id.eq.${id1},health_id.eq.${id2}`);
        } else if (id1) {
          query = query.eq('health_id', id1);
        }
      }
      const { data, error } = await query.maybeSingle();
      if (error || !data) return null;
      return mapHealthIdFromDb(data);
    },

    async create(data) {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client not initialized');
      const payload = mapHealthIdToDb(data);
      const { data: record, error } = await client
        .from('health_ids')
        .insert(payload)
        .select('*')
        .single();
      if (error) throw new Error(`Supabase Create HealthId Error: ${error.message}`);
      return mapHealthIdFromDb(record);
    }
  },

  // --- APPOINTMENTS ---
  appointments: {
    async create(data) {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client not initialized');
      const payload = {
        patient_id: String(data.patientId),
        patient_name: data.patientName,
        doctor_id: String(data.doctorId),
        doctor_name: data.doctorName,
        doctor_specialty: data.doctorSpecialty || 'General Medicine',
        date: data.date,
        time: data.time,
        consultation_type: data.consultationType || 'Video',
        status: data.status || 'Upcoming',
        notes: data.notes || '',
        consultation_summary: data.consultationSummary || ''
      };
      if (data.id) payload.id = String(data.id);
      const { data: appt, error } = await client
        .from('appointments')
        .insert(payload)
        .select('*')
        .single();
      if (error) throw new Error(`Supabase Create Appointment Error: ${error.message}`);
      return mapAppointmentFromDb(appt);
    },

    async find(filter = {}) {
      const client = getSupabase();
      if (!client) return [];
      let query = client.from('appointments').select('*');
      if (filter.patientId) query = query.eq('patient_id', String(filter.patientId));
      if (filter.doctorId) query = query.eq('doctor_id', String(filter.doctorId));
      if (filter.status) query = query.eq('status', filter.status);
      query = query.order('date', { ascending: false });
      const { data, error } = await query;
      if (error || !data) return [];
      return data.map(mapAppointmentFromDb);
    },

    async findById(id) {
      const client = getSupabase();
      if (!client || !id) return null;
      const { data, error } = await client
        .from('appointments')
        .select('*')
        .eq('id', String(id))
        .maybeSingle();
      if (error || !data) return null;
      return mapAppointmentFromDb(data);
    },

    async deleteById(id) {
      const client = getSupabase();
      if (!client || !id) return false;
      const { error } = await client.from('appointments').delete().eq('id', String(id));
      return !error;
    }
  },

  // --- PRESCRIPTIONS ---
  prescriptions: {
    async create(data) {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client not initialized');
      const payload = {
        patient_id: String(data.patientId),
        patient_name: data.patientName,
        doctor_id: String(data.doctorId),
        doctor_name: data.doctorName,
        appointment_id: data.appointmentId ? String(data.appointmentId) : null,
        date: data.date,
        medications: data.medications || [],
        notes: data.notes || '',
        status: data.status || 'Issued',
        follow_up_date: data.followUpDate || ''
      };
      if (data.id) payload.id = String(data.id);
      const { data: rx, error } = await client
        .from('prescriptions')
        .insert(payload)
        .select('*')
        .single();
      if (error) throw new Error(`Supabase Create Prescription Error: ${error.message}`);
      return mapPrescriptionFromDb(rx);
    },

    async find(filter = {}) {
      const client = getSupabase();
      if (!client) return [];
      let query = client.from('prescriptions').select('*');
      if (filter.patientId) query = query.eq('patient_id', String(filter.patientId));
      if (filter.doctorId) query = query.eq('doctor_id', String(filter.doctorId));
      if (filter.status) query = query.eq('status', filter.status);
      query = query.order('date', { ascending: false });
      const { data, error } = await query;
      if (error || !data) return [];
      return data.map(mapPrescriptionFromDb);
    },

    async findById(id) {
      const client = getSupabase();
      if (!client || !id) return null;
      const { data, error } = await client
        .from('prescriptions')
        .select('*')
        .eq('id', String(id))
        .maybeSingle();
      if (error || !data) return null;
      return mapPrescriptionFromDb(data);
    },

    async deleteById(id) {
      const client = getSupabase();
      if (!client || !id) return false;
      const { error } = await client.from('prescriptions').delete().eq('id', String(id));
      return !error;
    }
  },

  // --- PHARMACY ORDERS ---
  pharmacyOrders: {
    async create(data) {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client not initialized');
      const payload = {
        patient_id: String(data.patientId),
        patient_name: data.patientName,
        pharmacy_id: String(data.pharmacyId),
        pharmacy_name: data.pharmacyName,
        items: data.items || [],
        total_amount: Number(data.totalAmount || data.totalPrice || 0),
        total_price: Number(data.totalPrice || data.totalAmount || 0),
        status: data.status || 'Pending',
        delivery_address: data.deliveryAddress || '',
        payment_status: data.paymentStatus || 'Pending',
        prescription_id: data.prescriptionId || '',
        date: data.date || new Date().toISOString().split('T')[0]
      };
      if (data.id) payload.id = String(data.id);
      const { data: order, error } = await client
        .from('pharmacy_orders')
        .insert(payload)
        .select('*')
        .single();
      if (error) throw new Error(`Supabase Create PharmacyOrder Error: ${error.message}`);
      return mapPharmacyOrderFromDb(order);
    },

    async find(filter = {}) {
      const client = getSupabase();
      if (!client) return [];
      let query = client.from('pharmacy_orders').select('*');
      if (filter.patientId) query = query.eq('patient_id', String(filter.patientId));
      if (filter.pharmacyId) query = query.eq('pharmacy_id', String(filter.pharmacyId));
      if (filter.status) query = query.eq('status', filter.status);
      query = query.order('created_at', { ascending: false });
      const { data, error } = await query;
      if (error || !data) return [];
      return data.map(mapPharmacyOrderFromDb);
    },

    async findById(id) {
      const client = getSupabase();
      if (!client || !id) return null;
      const { data, error } = await client
        .from('pharmacy_orders')
        .select('*')
        .eq('id', String(id))
        .maybeSingle();
      if (error || !data) return null;
      return mapPharmacyOrderFromDb(data);
    },

    async deleteById(id) {
      const client = getSupabase();
      if (!client || !id) return false;
      const { error } = await client.from('pharmacy_orders').delete().eq('id', String(id));
      return !error;
    }
  },

  // --- AMBULANCE REQUESTS ---
  ambulanceRequests: {
    async create(data) {
      const client = getSupabase();
      if (!client) throw new Error('Supabase client not initialized');
      const payload = {
        patient_id: String(data.patientId),
        patient_name: data.patientName,
        patient_phone: data.patientPhone || '',
        jivexa_health_id: data.jivexaHealthId || '',
        ambulance_id: data.ambulanceId || '',
        ambulance_type: data.ambulanceType || 'ICU',
        vehicle_number: data.vehicleNumber || '',
        driver_name: data.driverName || '',
        driver_phone: data.driverPhone || '',
        pickup_address: data.pickupAddress,
        destination_address: data.destinationAddress,
        pickup_lat: Number(data.pickupLat || 12.9716),
        pickup_lng: Number(data.pickupLng || 77.5946),
        dest_lat: Number(data.destLat || 12.9780),
        dest_lng: Number(data.destLng || 77.6010),
        emergency_type: data.emergencyType || 'General Emergency',
        status: data.status || 'Pending',
        fare: Number(data.fare || 0),
        accepted_at: data.acceptedAt ? new Date(data.acceptedAt).toISOString() : new Date().toISOString()
      };
      if (data.id) payload.id = String(data.id);
      const { data: amb, error } = await client
        .from('ambulance_requests')
        .insert(payload)
        .select('*')
        .single();
      if (error) throw new Error(`Supabase Create Ambulance Error: ${error.message}`);
      return mapAmbulanceRequestFromDb(amb);
    },

    async find(filter = {}) {
      const client = getSupabase();
      if (!client) return [];
      let query = client.from('ambulance_requests').select('*');
      if (filter.patientId) query = query.eq('patient_id', String(filter.patientId));
      if (filter.ambulanceId) query = query.eq('ambulance_id', String(filter.ambulanceId));
      if (filter.status) query = query.eq('status', filter.status);
      query = query.order('created_at', { ascending: false });
      const { data, error } = await query;
      if (error || !data) return [];
      return data.map(mapAmbulanceRequestFromDb);
    },

    async findById(id) {
      const client = getSupabase();
      if (!client || !id) return null;
      const { data, error } = await client
        .from('ambulance_requests')
        .select('*')
        .eq('id', String(id))
        .maybeSingle();
      if (error || !data) return null;
      return mapAmbulanceRequestFromDb(data);
    },

    async deleteById(id) {
      const client = getSupabase();
      if (!client || !id) return false;
      const { error } = await client.from('ambulance_requests').delete().eq('id', String(id));
      return !error;
    }
  }
};

module.exports = {
  SupabaseDb,
  isSupabaseConfigured
};
