/**
 * JIVEXA HEALTH - SUPABASE TO MONGODB ATLAS DATA MIGRATION SCRIPT
 *
 * Imports exported records from backend/backup/supabase_data_export.json
 * into MongoDB Atlas collections idempotently using upserts.
 *
 * Usage:
 *   node scripts/migrate-supabase-to-mongo.js
 */
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { connectDB, disconnectDB, isMongoConfigured } = require('../src/config/db');
const User = require('../src/models/User');
const HealthId = require('../src/models/HealthId');
const Appointment = require('../src/models/Appointment');
const Prescription = require('../src/models/Prescription');
const PharmacyOrder = require('../src/models/PharmacyOrder');
const AmbulanceRequest = require('../src/models/AmbulanceRequest');

const runMigration = async () => {
  console.log('========================================================');
  console.log('🔄 JIVEXA HEALTH - SUPABASE TO MONGODB ATLAS DATA IMPORT');
  console.log('========================================================\n');

  if (!isMongoConfigured()) {
    console.error('❌ Error: MONGO_URI is not set in backend/.env.');
    console.error('Please configure your MongoDB Atlas connection string in backend/.env:');
    console.error('MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/jivexa?retryWrites=true&w=majority\n');
    process.exit(1);
  }

  const backupFilePath = path.join(__dirname, '../backup/supabase_data_export.json');
  if (!fs.existsSync(backupFilePath)) {
    console.error(`❌ Backup file not found at: ${backupFilePath}`);
    process.exit(1);
  }

  console.log(`📦 Reading export archive from: ${backupFilePath}`);
  const rawData = fs.readFileSync(backupFilePath, 'utf8');
  const exportData = JSON.parse(rawData);

  console.log('📡 Connecting to MongoDB Atlas...');
  await connectDB();
  console.log('✅ Connected to MongoDB Atlas.\n');

  const stats = { users: 0, healthIds: 0, appointments: 0, prescriptions: 0, pharmacyOrders: 0, ambulanceRequests: 0 };

  // 1. MIGRATE USERS
  if (Array.isArray(exportData.users) && exportData.users.length > 0) {
    console.log(`⏳ Processing ${exportData.users.length} users...`);
    for (const u of exportData.users) {
      const doc = {
        _id: u.id,
        roleId: u.role_id || u.roleId,
        name: u.name,
        phone: u.phone || '',
        healthId: u.health_id || u.healthId || '',
        age: u.age || null,
        email: u.email.toLowerCase().trim(),
        password: u.password,
        role: u.role,
        emailVerified: u.email_verified !== undefined ? u.email_verified : true,
        verified: u.verified !== undefined ? u.verified : true,
        twoFactorEnabled: u.two_factor_enabled || false,
        accountStatus: u.account_status || 'ACTIVE',
        otpDetails: u.otp_details || null,
        failedLoginAttempts: u.failed_login_attempts || 0,
        lockUntil: u.lock_until || null,
        professionalDetails: u.professional_details || null,
        vehicleDetails: u.vehicle_details || null,
        licenseDetails: u.license_details || null,
        usage: u.usage || { tokenUsed: 0, tokenLimit: 10000 },
        avatarUrl: u.avatar_url || u.avatarUrl || null,
        createdAt: u.created_at ? new Date(u.created_at) : new Date(),
        updatedAt: u.updated_at ? new Date(u.updated_at) : new Date()
      };

      await User.findOneAndUpdate(
        { email: doc.email },
        { $set: doc },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      stats.users++;
    }
    console.log(`✅ Users migrated: ${stats.users}`);
  }

  // 2. MIGRATE HEALTH IDS
  const rawHealthIds = exportData.health_ids || exportData.healthIds || [];
  if (Array.isArray(rawHealthIds) && rawHealthIds.length > 0) {
    console.log(`⏳ Processing ${rawHealthIds.length} health IDs...`);
    for (const h of rawHealthIds) {
      const cleanHid = (h.health_id || h.healthId).toUpperCase().trim();
      const doc = {
        _id: h.id,
        healthId: cleanHid,
        userId: h.user_id || h.userId,
        fullName: h.full_name || h.fullName || h.name || 'Patient',
        dateOfBirth: h.date_of_birth || h.dateOfBirth || '',
        gender: h.gender || 'Unspecified',
        phoneNumber: h.phone_number || h.phoneNumber || h.phone || '',
        email: (h.email || '').toLowerCase().trim(),
        bloodGroup: h.blood_group || h.bloodGroup || '',
        emergencyContact: h.emergency_contact || h.emergencyContact || null,
        address: h.address || '',
        healthProfile: h.health_profile || h.healthProfile || {},
        createdAt: h.created_at ? new Date(h.created_at) : new Date(),
        updatedAt: h.updated_at ? new Date(h.updated_at) : new Date()
      };

      await HealthId.findOneAndUpdate(
        { healthId: cleanHid },
        { $set: doc },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      stats.healthIds++;
    }
    console.log(`✅ Health IDs migrated: ${stats.healthIds}`);
  }

  // 3. MIGRATE APPOINTMENTS
  if (Array.isArray(exportData.appointments) && exportData.appointments.length > 0) {
    for (const a of exportData.appointments) {
      await Appointment.findOneAndUpdate(
        { _id: a.id },
        { $set: { ...a, _id: a.id } },
        { upsert: true, new: true }
      );
      stats.appointments++;
    }
    console.log(`✅ Appointments migrated: ${stats.appointments}`);
  }

  // 4. MIGRATE PRESCRIPTIONS
  if (Array.isArray(exportData.prescriptions) && exportData.prescriptions.length > 0) {
    for (const p of exportData.prescriptions) {
      await Prescription.findOneAndUpdate(
        { _id: p.id },
        { $set: { ...p, _id: p.id } },
        { upsert: true, new: true }
      );
      stats.prescriptions++;
    }
    console.log(`✅ Prescriptions migrated: ${stats.prescriptions}`);
  }

  // 5. MIGRATE PHARMACY ORDERS
  const rawOrders = exportData.pharmacy_orders || exportData.pharmacyOrders || [];
  if (Array.isArray(rawOrders) && rawOrders.length > 0) {
    for (const o of rawOrders) {
      await PharmacyOrder.findOneAndUpdate(
        { _id: o.id },
        { $set: { ...o, _id: o.id } },
        { upsert: true, new: true }
      );
      stats.pharmacyOrders++;
    }
    console.log(`✅ Pharmacy Orders migrated: ${stats.pharmacyOrders}`);
  }

  // 6. MIGRATE AMBULANCE REQUESTS
  const rawAmbulance = exportData.ambulance_requests || exportData.ambulanceRequests || [];
  if (Array.isArray(rawAmbulance) && rawAmbulance.length > 0) {
    for (const amb of rawAmbulance) {
      await AmbulanceRequest.findOneAndUpdate(
        { _id: amb.id },
        { $set: { ...amb, _id: amb.id } },
        { upsert: true, new: true }
      );
      stats.ambulanceRequests++;
    }
    console.log(`✅ Ambulance Requests migrated: ${stats.ambulanceRequests}`);
  }

  console.log('\n========================================================');
  console.log('🎉 MIGRATION COMPLETED SUCCESSFULLY!');
  console.log(`📊 Summary: ${stats.users} Users, ${stats.healthIds} Health IDs, ${stats.appointments} Appointments`);
  console.log('========================================================\n');

  await disconnectDB();
  process.exit(0);
};

runMigration().catch((err) => {
  console.error('❌ Migration failed with uncaught exception:', err);
  process.exit(1);
});
