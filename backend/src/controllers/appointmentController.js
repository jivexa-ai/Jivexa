const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { SupabaseDb, isSupabaseConfigured } = require('../services/supabaseDbService');

// Fallback in-memory store for test/offline environments
const inMemoryAppointments = [];

// Helper to format in-memory appointment item
const formatAppt = (item) => ({
  id: String(item._id || item.id),
  _id: item._id || item.id,
  patientId: item.patientId,
  patientName: item.patientName,
  doctorId: item.doctorId,
  doctorName: item.doctorName,
  doctorSpecialty: item.doctorSpecialty,
  date: item.date,
  time: item.time,
  consultationType: item.consultationType,
  status: item.status,
  notes: item.notes,
  consultationSummary: item.consultationSummary,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
  toJSON() { return this; }
});

// @desc    Create / Book a new Appointment
// @route   POST /api/appointments
// @access  Private (Authenticated Patient / Doctor)
const createAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      doctorName,
      doctorSpecialty,
      date,
      time,
      consultationType = 'Video',
      notes = ''
    } = req.body;

    if (!doctorId || !date || !time) {
      return res.status(400).json({
        success: false,
        error: 'Doctor ID, appointment date, and time are required'
      });
    }

    const patientId = req.user._id || req.user.id;
    const patientName = req.user.name || 'Patient User';

    let resolvedDoctorName = doctorName;
    let resolvedSpecialty = doctorSpecialty || 'General Medicine';

    if (isSupabaseConfigured()) {
      if (!resolvedDoctorName) {
        const docUser = await SupabaseDb.users.findById(doctorId);
        if (docUser) {
          resolvedDoctorName = docUser.name;
          resolvedSpecialty = docUser.professionalDetails?.specialty || resolvedSpecialty;
        }
      }

      if (!resolvedDoctorName) {
        resolvedDoctorName = 'Medical Specialist';
      }

      const newAppointment = await SupabaseDb.appointments.create({
        patientId,
        patientName,
        doctorId: String(doctorId),
        doctorName: resolvedDoctorName,
        doctorSpecialty: resolvedSpecialty,
        date,
        time,
        consultationType,
        status: 'Upcoming',
        notes
      });

      return res.status(201).json({
        success: true,
        message: 'Appointment booked successfully',
        appointment: newAppointment.toJSON()
      });
    }

    if (mongoose.connection.readyState === 1) {
      if (!resolvedDoctorName && mongoose.Types.ObjectId.isValid(doctorId)) {
        const docUser = await User.findById(doctorId);
        if (docUser) {
          resolvedDoctorName = docUser.name;
          resolvedSpecialty = docUser.professionalDetails?.specialty || resolvedSpecialty;
        }
      }

      if (!resolvedDoctorName) {
        resolvedDoctorName = 'Medical Specialist';
      }

      const newAppointment = await Appointment.create({
        patientId,
        patientName,
        doctorId: String(doctorId),
        doctorName: resolvedDoctorName,
        doctorSpecialty: resolvedSpecialty,
        date,
        time,
        consultationType,
        status: 'Upcoming',
        notes
      });

      return res.status(201).json({
        success: true,
        message: 'Appointment booked successfully',
        appointment: newAppointment.toJSON()
      });
    }

    // Memory Store Fallback
    const newId = new mongoose.Types.ObjectId();
    const apptDoc = {
      _id: newId,
      id: newId.toString(),
      patientId,
      patientName,
      doctorId: String(doctorId),
      doctorName: resolvedDoctorName || 'Medical Specialist',
      doctorSpecialty: resolvedSpecialty,
      date,
      time,
      consultationType,
      status: 'Upcoming',
      notes,
      consultationSummary: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryAppointments.push(apptDoc);

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: formatAppt(apptDoc)
    });
  } catch (error) {
    console.error('[Appointment Controller Create Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to book appointment'
    });
  }
};

// @desc    Get all appointments for the authenticated user (Patient / Doctor / Admin)
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role;

    if (isSupabaseConfigured()) {
      const allAppts = await SupabaseDb.appointments.find();
      const currentUserId = String(userId);
      const filtered = allAppts.filter((appt) => {
        if (userRole === 'ADMIN') return true;
        if (userRole === 'PATIENT') return String(appt.patientId) === currentUserId;
        if (userRole === 'DOCTOR') {
          return (
            String(appt.doctorId) === currentUserId ||
            (req.user.roleId && appt.doctorId === req.user.roleId) ||
            appt.doctorName === req.user.name
          );
        }
        return String(appt.patientId) === currentUserId;
      });

      return res.status(200).json({
        success: true,
        count: filtered.length,
        appointments: filtered.map((a) => a.toJSON())
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
      } else if (userRole !== 'ADMIN') {
        query.$or = [
          { patientId: userId },
          { patientId: String(userId) }
        ];
      }

      const appointments = await Appointment.find(query).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: appointments.length,
        appointments: appointments.map((a) => a.toJSON())
      });
    }

    // Memory store fallback
    const currentUserId = String(userId);
    const filtered = inMemoryAppointments.filter((appt) => {
      if (userRole === 'ADMIN') return true;
      if (userRole === 'PATIENT') return String(appt.patientId) === currentUserId;
      if (userRole === 'DOCTOR') {
        return (
          String(appt.doctorId) === currentUserId ||
          (req.user.roleId && appt.doctorId === req.user.roleId) ||
          appt.doctorName === req.user.name
        );
      }
      return String(appt.patientId) === currentUserId;
    });

    return res.status(200).json({
      success: true,
      count: filtered.length,
      appointments: filtered.map(formatAppt)
    });
  } catch (error) {
    console.error('[Appointment Controller Get Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch appointments'
    });
  }
};

// @desc    Get single appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = String(req.user._id || req.user.id);

    if (isSupabaseConfigured()) {
      const appointment = await SupabaseDb.appointments.findById(id);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Appointment not found'
        });
      }

      const isPatient = String(appointment.patientId) === currentUserId;
      const isDoctor = String(appointment.doctorId) === currentUserId ||
        (req.user.roleId && appointment.doctorId === req.user.roleId) ||
        appointment.doctorName === req.user.name;
      const isAdmin = req.user.role === 'ADMIN';

      if (!isPatient && !isDoctor && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this appointment record'
        });
      }

      return res.status(200).json({
        success: true,
        appointment: appointment.toJSON()
      });
    }

    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid appointment ID format'
        });
      }

      const appointment = await Appointment.findById(id);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Appointment not found'
        });
      }

      const isPatient = String(appointment.patientId) === currentUserId;
      const isDoctor = String(appointment.doctorId) === currentUserId ||
        (req.user.roleId && appointment.doctorId === req.user.roleId) ||
        appointment.doctorName === req.user.name;
      const isAdmin = req.user.role === 'ADMIN';

      if (!isPatient && !isDoctor && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this appointment record'
        });
      }

      return res.status(200).json({
        success: true,
        appointment: appointment.toJSON()
      });
    }

    // Memory Store
    const appt = inMemoryAppointments.find((a) => String(a._id) === id || String(a.id) === id);
    if (!appt) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    const isPatient = String(appt.patientId) === currentUserId;
    const isDoctor = String(appt.doctorId) === currentUserId ||
      (req.user.roleId && appt.doctorId === req.user.roleId) ||
      appt.doctorName === req.user.name;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this appointment record'
      });
    }

    return res.status(200).json({
      success: true,
      appointment: formatAppt(appt)
    });
  } catch (error) {
    console.error('[Appointment Controller GetById Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch appointment details'
    });
  }
};

// @desc    Update appointment (status, date, time, notes, consultationSummary)
// @route   PATCH /api/appointments/:id
// @access  Private
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = String(req.user._id || req.user.id);
    const { status, date, time, notes, consultationSummary, consultationType } = req.body;

    if (isSupabaseConfigured()) {
      const appointment = await SupabaseDb.appointments.findById(id);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Appointment not found'
        });
      }

      const isPatient = String(appointment.patientId) === currentUserId;
      const isDoctor = String(appointment.doctorId) === currentUserId ||
        (req.user.roleId && appointment.doctorId === req.user.roleId) ||
        appointment.doctorName === req.user.name;
      const isAdmin = req.user.role === 'ADMIN';

      if (!isPatient && !isDoctor && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to modify this appointment'
        });
      }

      if (status) appointment.status = status;
      if (date) appointment.date = date;
      if (time) appointment.time = time;
      if (notes !== undefined) appointment.notes = notes;
      if (consultationSummary !== undefined) appointment.consultationSummary = consultationSummary;
      if (consultationType) appointment.consultationType = consultationType;

      await appointment.save();

      return res.status(200).json({
        success: true,
        message: 'Appointment updated successfully',
        appointment: appointment.toJSON()
      });
    }

    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid appointment ID format'
        });
      }

      const appointment = await Appointment.findById(id);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Appointment not found'
        });
      }

      const isPatient = String(appointment.patientId) === currentUserId;
      const isDoctor = String(appointment.doctorId) === currentUserId ||
        (req.user.roleId && appointment.doctorId === req.user.roleId) ||
        appointment.doctorName === req.user.name;
      const isAdmin = req.user.role === 'ADMIN';

      if (!isPatient && !isDoctor && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to modify this appointment'
        });
      }

      if (status) appointment.status = status;
      if (date) appointment.date = date;
      if (time) appointment.time = time;
      if (notes !== undefined) appointment.notes = notes;
      if (consultationSummary !== undefined) appointment.consultationSummary = consultationSummary;
      if (consultationType) appointment.consultationType = consultationType;

      await appointment.save();

      return res.status(200).json({
        success: true,
        message: 'Appointment updated successfully',
        appointment: appointment.toJSON()
      });
    }

    // Memory Store
    const appt = inMemoryAppointments.find((a) => String(a._id) === id || String(a.id) === id);
    if (!appt) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    const isPatient = String(appt.patientId) === currentUserId;
    const isDoctor = String(appt.doctorId) === currentUserId ||
      (req.user.roleId && appt.doctorId === req.user.roleId) ||
      appt.doctorName === req.user.name;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify this appointment'
      });
    }

    if (status) appt.status = status;
    if (date) appt.date = date;
    if (time) appt.time = time;
    if (notes !== undefined) appt.notes = notes;
    if (consultationSummary !== undefined) appt.consultationSummary = consultationSummary;
    if (consultationType) appt.consultationType = consultationType;
    appt.updatedAt = new Date();

    return res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      appointment: formatAppt(appt)
    });
  } catch (error) {
    console.error('[Appointment Controller Update Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update appointment'
    });
  }
};

// @desc    Cancel or Delete an appointment
// @route   DELETE /api/appointments/:id
// @access  Private
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = String(req.user._id || req.user.id);

    if (isSupabaseConfigured()) {
      const appointment = await SupabaseDb.appointments.findById(id);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Appointment not found'
        });
      }

      const isPatient = String(appointment.patientId) === currentUserId;
      const isDoctor = String(appointment.doctorId) === currentUserId ||
        (req.user.roleId && appointment.doctorId === req.user.roleId) ||
        appointment.doctorName === req.user.name;
      const isAdmin = req.user.role === 'ADMIN';

      if (!isPatient && !isDoctor && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to cancel this appointment'
        });
      }

      appointment.status = 'Cancelled';
      await appointment.save();

      return res.status(200).json({
        success: true,
        message: 'Appointment cancelled successfully',
        appointment: appointment.toJSON()
      });
    }

    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid appointment ID format'
        });
      }

      const appointment = await Appointment.findById(id);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          error: 'Appointment not found'
        });
      }

      const isPatient = String(appointment.patientId) === currentUserId;
      const isDoctor = String(appointment.doctorId) === currentUserId ||
        (req.user.roleId && appointment.doctorId === req.user.roleId) ||
        appointment.doctorName === req.user.name;
      const isAdmin = req.user.role === 'ADMIN';

      if (!isPatient && !isDoctor && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to cancel this appointment'
        });
      }

      appointment.status = 'Cancelled';
      await appointment.save();

      return res.status(200).json({
        success: true,
        message: 'Appointment cancelled successfully',
        appointment: appointment.toJSON()
      });
    }

    // Memory Store
    const appt = inMemoryAppointments.find((a) => String(a._id) === id || String(a.id) === id);
    if (!appt) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    const isPatient = String(appt.patientId) === currentUserId;
    const isDoctor = String(appt.doctorId) === currentUserId ||
      (req.user.roleId && appt.doctorId === req.user.roleId) ||
      appt.doctorName === req.user.name;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isPatient && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to cancel this appointment'
      });
    }

    appt.status = 'Cancelled';
    appt.updatedAt = new Date();

    return res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment: formatAppt(appt)
    });
  } catch (error) {
    console.error('[Appointment Controller Delete Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to cancel appointment'
    });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment
};
