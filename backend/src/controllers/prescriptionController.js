const { MongoDb } = require('../services/mongoDbService');

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
    const prescriptionDate = date || new Date().toISOString().split('T')[0];

    if (!resolvedPatientName) {
      const patientUser = await MongoDb.users.findById(patientId);
      if (patientUser) {
        resolvedPatientName = patientUser.name;
      }
    }

    if (!resolvedPatientName) {
      resolvedPatientName = 'Patient User';
    }

    const newPrescription = await MongoDb.prescriptions.create({
      patientId: targetPatientId,
      patientName: resolvedPatientName,
      doctorId,
      doctorName,
      appointmentId: appointmentId || null,
      date: prescriptionDate,
      medications,
      notes,
      status,
      followUpDate
    });

    return res.status(201).json({
      success: true,
      message: 'Prescription issued successfully',
      prescription: newPrescription.toJSON ? newPrescription.toJSON() : newPrescription
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
    const currentUserId = String(userId);

    let filter = {};
    if (userRole === 'ADMIN' || userRole === 'PHARMACY') {
      filter = {};
    } else if (userRole === 'DOCTOR') {
      filter = {
        $or: [
          { doctorId: currentUserId },
          ...(req.user.roleId ? [{ doctorId: req.user.roleId }] : []),
          { doctorName: req.user.name }
        ]
      };
    } else {
      filter = { patientId: currentUserId };
    }

    if (req.query.patientId && (userRole === 'DOCTOR' || userRole === 'PHARMACY' || userRole === 'ADMIN')) {
      filter.patientId = String(req.query.patientId);
    }

    const prescriptions = await MongoDb.prescriptions.find(filter);

    return res.status(200).json({
      success: true,
      count: prescriptions.length,
      prescriptions: prescriptions.map((p) => (p.toJSON ? p.toJSON() : p))
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

    const prescription = await MongoDb.prescriptions.findById(id);

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
      prescription: prescription.toJSON ? prescription.toJSON() : prescription
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

    const prescription = await MongoDb.prescriptions.findById(id);

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
      prescription: prescription.toJSON ? prescription.toJSON() : prescription
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
