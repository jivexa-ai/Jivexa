const mongoose = require('mongoose');
const Prescription = require('../models/Prescription');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { SupabaseDb, isSupabaseConfigured } = require('../services/supabaseDbService');

// Fallback in-memory store for test/offline environments
const inMemoryPrescriptions = [];

// Helper to format in-memory prescription item
const formatPrescription = (item) => ({
  id: String(item._id || item.id),
  _id: item._id || item.id,
  patientId: item.patientId,
  patientName: item.patientName,
  doctorId: item.doctorId,
  doctorName: item.doctorName,
  appointmentId: item.appointmentId,
  date: item.date,
  medications: item.medications,
  notes: item.notes,
  status: item.status,
  followUpDate: item.followUpDate,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
  toJSON() { return this; }
});

// @desc    Create / Issue a new Digital Prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor / Admin / Practitioner)
const createPrescription = async (req, res) => {
  try {
    const {
      patientId,
      patientName,
      appointmentId,
      date,
      medications = [],
      notes = '',
      status = 'Issued',
      followUpDate = ''
    } = req.body;

    if (!patientId || !medications || !Array.isArray(medications)) {
      return res.status(400).json({
        success: false,
        error: 'Patient ID and a valid list of medications are required'
      });
    }

    let targetPatientId = patientId;
    let resolvedPatientName = patientName;

    const doctorId = String(req.user._id || req.user.id);
    const doctorName = req.user.name || 'Practitioner Doctor';

    let validAppointmentId = null;
    if (appointmentId && mongoose.Types.ObjectId.isValid(appointmentId)) {
      validAppointmentId = appointmentId;
    }

    const prescriptionDate = date || new Date().toISOString().split('T')[0];

    if (isSupabaseConfigured()) {
      if (!resolvedPatientName) {
        const patientUser = await SupabaseDb.users.findById(patientId);
        if (patientUser) {
          resolvedPatientName = patientUser.name;
        }
      }

      if (!resolvedPatientName) {
        resolvedPatientName = 'Patient User';
      }

      const newPrescription = await SupabaseDb.prescriptions.create({
        patientId: targetPatientId,
        patientName: resolvedPatientName,
        doctorId,
        doctorName,
        appointmentId: validAppointmentId,
        date: prescriptionDate,
        medications,
        notes,
        status,
        followUpDate
      });

      return res.status(201).json({
        success: true,
        message: 'Prescription issued successfully',
        prescription: newPrescription.toJSON()
      });
    }

    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(patientId)) {
        const patientUser = await User.findById(patientId);
        if (patientUser) {
          resolvedPatientName = patientUser.name;
        }
      }

      if (!resolvedPatientName) {
        resolvedPatientName = 'Patient User';
      }

      const newPrescription = await Prescription.create({
        patientId: targetPatientId,
        patientName: resolvedPatientName,
        doctorId,
        doctorName,
        appointmentId: validAppointmentId,
        date: prescriptionDate,
        medications,
        notes,
        status,
        followUpDate
      });

      return res.status(201).json({
        success: true,
        message: 'Prescription issued successfully',
        prescription: newPrescription.toJSON()
      });
    }

    // Memory Store Fallback
    const newId = new mongoose.Types.ObjectId();
    const presDoc = {
      _id: newId,
      id: newId.toString(),
      patientId: targetPatientId,
      patientName: resolvedPatientName || 'Patient User',
      doctorId,
      doctorName,
      appointmentId: validAppointmentId,
      date: prescriptionDate,
      medications,
      notes,
      status,
      followUpDate,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryPrescriptions.push(presDoc);

    return res.status(201).json({
      success: true,
      message: 'Prescription issued successfully',
      prescription: formatPrescription(presDoc)
    });
  } catch (error) {
    console.error('[Prescription Controller Create Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create prescription'
    });
  }
};

// @desc    Get prescriptions for the authenticated user (Patient / Doctor / Pharmacy / Admin)
// @route   GET /api/prescriptions
// @access  Private
const getPrescriptions = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role;

    if (isSupabaseConfigured()) {
      const allPres = await SupabaseDb.prescriptions.find();
      const currentUserId = String(userId);
      let filtered = allPres.filter((pres) => {
        if (userRole === 'ADMIN' || userRole === 'PHARMACY') return true;
        if (userRole === 'PATIENT') {
          return String(pres.patientId) === currentUserId;
        }
        if (userRole === 'DOCTOR') {
          return (
            String(pres.doctorId) === currentUserId ||
            (req.user.roleId && pres.doctorId === req.user.roleId) ||
            pres.doctorName === req.user.name
          );
        }
        return String(pres.patientId) === currentUserId;
      });

      if (req.query.patientId && (userRole === 'DOCTOR' || userRole === 'PHARMACY' || userRole === 'ADMIN')) {
        filtered = filtered.filter((p) => String(p.patientId) === String(req.query.patientId));
      }

      return res.status(200).json({
        success: true,
        count: filtered.length,
        prescriptions: filtered.map((p) => p.toJSON())
      });
    }

    if (mongoose.connection.readyState === 1) {
      let query = {};
      if (userRole === 'PATIENT') {
        query.$or = [
          { patientId: userId },
          { patientId: String(userId) }
        ];
      } else if (userRole === 'DOCTOR') {
        const doctorIdentifiers = [String(userId)];
        if (req.user.roleId) doctorIdentifiers.push(req.user.roleId);
        if (req.user.id) doctorIdentifiers.push(String(req.user.id));

        query.$or = [
          { doctorId: { $in: doctorIdentifiers } },
          { doctorName: req.user.name }
        ];
      }

      if (req.query.patientId && (userRole === 'DOCTOR' || userRole === 'PHARMACY' || userRole === 'ADMIN')) {
        if (mongoose.Types.ObjectId.isValid(req.query.patientId)) {
          query = { patientId: req.query.patientId };
        } else {
          query = { patientId: String(req.query.patientId) };
        }
      }

      const prescriptions = await Prescription.find(query).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: prescriptions.length,
        prescriptions: prescriptions.map((p) => p.toJSON())
      });
    }

    // Memory store fallback
    const currentUserId = String(userId);
    let filtered = inMemoryPrescriptions.filter((pres) => {
      if (userRole === 'ADMIN' || userRole === 'PHARMACY') return true;
      if (userRole === 'PATIENT') {
        return String(pres.patientId) === currentUserId;
      }
      if (userRole === 'DOCTOR') {
        return (
          String(pres.doctorId) === currentUserId ||
          (req.user.roleId && pres.doctorId === req.user.roleId) ||
          pres.doctorName === req.user.name
        );
      }
      return String(pres.patientId) === currentUserId;
    });

    if (req.query.patientId && (userRole === 'DOCTOR' || userRole === 'PHARMACY' || userRole === 'ADMIN')) {
      filtered = filtered.filter((p) => String(p.patientId) === String(req.query.patientId));
    }

    return res.status(200).json({
      success: true,
      count: filtered.length,
      prescriptions: filtered.map(formatPrescription)
    });
  } catch (error) {
    console.error('[Prescription Controller Get Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch prescriptions'
    });
  }
};

// @desc    Get single prescription by ID
// @route   GET /api/prescriptions/:id
// @access  Private
const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = String(req.user._id || req.user.id);

    if (isSupabaseConfigured()) {
      const prescription = await SupabaseDb.prescriptions.findById(id);

      if (!prescription) {
        return res.status(404).json({
          success: false,
          error: 'Prescription not found'
        });
      }

      const isPatient = String(prescription.patientId) === currentUserId;
      const isDoctor = String(prescription.doctorId) === currentUserId ||
        (req.user.roleId && prescription.doctorId === req.user.roleId) ||
        prescription.doctorName === req.user.name;
      const isPharmacyOrAdmin = req.user.role === 'PHARMACY' || req.user.role === 'ADMIN';

      if (!isPatient && !isDoctor && !isPharmacyOrAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this prescription record'
        });
      }

      return res.status(200).json({
        success: true,
        prescription: prescription.toJSON()
      });
    }

    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid prescription ID format'
        });
      }

      const prescription = await Prescription.findById(id);

      if (!prescription) {
        return res.status(404).json({
          success: false,
          error: 'Prescription not found'
        });
      }

      const isPatient = String(prescription.patientId) === currentUserId;
      const isDoctor = String(prescription.doctorId) === currentUserId ||
        (req.user.roleId && prescription.doctorId === req.user.roleId) ||
        prescription.doctorName === req.user.name;
      const isPharmacyOrAdmin = req.user.role === 'PHARMACY' || req.user.role === 'ADMIN';

      if (!isPatient && !isDoctor && !isPharmacyOrAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this prescription record'
        });
      }

      return res.status(200).json({
        success: true,
        prescription: prescription.toJSON()
      });
    }

    // Memory Store
    const pres = inMemoryPrescriptions.find((p) => String(p._id) === id || String(p.id) === id);
    if (!pres) {
      return res.status(404).json({
        success: false,
        error: 'Prescription not found'
      });
    }

    const isPatient = String(pres.patientId) === currentUserId;
    const isDoctor = String(pres.doctorId) === currentUserId ||
      (req.user.roleId && pres.doctorId === req.user.roleId) ||
      pres.doctorName === req.user.name;
    const isPharmacyOrAdmin = req.user.role === 'PHARMACY' || req.user.role === 'ADMIN';

    if (!isPatient && !isDoctor && !isPharmacyOrAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this prescription record'
      });
    }

    return res.status(200).json({
      success: true,
      prescription: formatPrescription(pres)
    });
  } catch (error) {
    console.error('[Prescription Controller GetById Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch prescription details'
    });
  }
};

// @desc    Update prescription status
// @route   PATCH /api/prescriptions/:id
// @access  Private
const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = String(req.user._id || req.user.id);
    const { status, medications, notes, followUpDate } = req.body;

    if (isSupabaseConfigured()) {
      const prescription = await SupabaseDb.prescriptions.findById(id);

      if (!prescription) {
        return res.status(404).json({
          success: false,
          error: 'Prescription not found'
        });
      }

      const isDoctor = String(prescription.doctorId) === currentUserId ||
        (req.user.roleId && prescription.doctorId === req.user.roleId) ||
        prescription.doctorName === req.user.name;
      const isPharmacyOrAdmin = req.user.role === 'PHARMACY' || req.user.role === 'ADMIN';

      if (!isDoctor && !isPharmacyOrAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to modify this prescription'
        });
      }

      if (status) prescription.status = status;
      if (medications && Array.isArray(medications)) prescription.medications = medications;
      if (notes !== undefined) prescription.notes = notes;
      if (followUpDate !== undefined) prescription.followUpDate = followUpDate;

      await prescription.save();

      return res.status(200).json({
        success: true,
        message: 'Prescription updated successfully',
        prescription: prescription.toJSON()
      });
    }
    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid prescription ID format'
        });
      }

      const prescription = await Prescription.findById(id);

      if (!prescription) {
        return res.status(404).json({
          success: false,
          error: 'Prescription not found'
        });
      }

      const isDoctor = String(prescription.doctorId) === currentUserId ||
        (req.user.roleId && prescription.doctorId === req.user.roleId) ||
        prescription.doctorName === req.user.name;
      const isPharmacyOrAdmin = req.user.role === 'PHARMACY' || req.user.role === 'ADMIN';

      if (!isDoctor && !isPharmacyOrAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to modify this prescription'
        });
      }

      if (status) prescription.status = status;
      if (medications && Array.isArray(medications)) prescription.medications = medications;
      if (notes !== undefined) prescription.notes = notes;
      if (followUpDate !== undefined) prescription.followUpDate = followUpDate;

      await prescription.save();

      return res.status(200).json({
        success: true,
        message: 'Prescription updated successfully',
        prescription: prescription.toJSON()
      });
    }

    // Memory Store
    const pres = inMemoryPrescriptions.find((p) => String(p._id) === id || String(p.id) === id);
    if (!pres) {
      return res.status(404).json({
        success: false,
        error: 'Prescription not found'
      });
    }

    const isDoctor = String(pres.doctorId) === currentUserId ||
      (req.user.roleId && pres.doctorId === req.user.roleId) ||
      pres.doctorName === req.user.name;
    const isPharmacyOrAdmin = req.user.role === 'PHARMACY' || req.user.role === 'ADMIN';

    if (!isDoctor && !isPharmacyOrAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify this prescription'
      });
    }

    if (status) pres.status = status;
    if (medications && Array.isArray(medications)) pres.medications = medications;
    if (notes !== undefined) pres.notes = notes;
    if (followUpDate !== undefined) pres.followUpDate = followUpDate;
    pres.updatedAt = new Date();

    return res.status(200).json({
      success: true,
      message: 'Prescription updated successfully',
      prescription: formatPrescription(pres)
    });
  } catch (error) {
    console.error('[Prescription Controller Update Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update prescription'
    });
  }
};

module.exports = {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  updatePrescription
};
