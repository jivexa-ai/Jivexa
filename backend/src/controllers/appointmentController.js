const { MongoDb } = require('../services/mongoDbService');

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

    if (!resolvedDoctorName) {
      const docUser = await MongoDb.users.findById(doctorId);
      if (docUser) {
        resolvedDoctorName = docUser.name;
        resolvedSpecialty = docUser.professionalDetails?.specialty || resolvedSpecialty;
      }
    }

    if (!resolvedDoctorName) {
      resolvedDoctorName = 'Medical Specialist';
    }

    const newAppointment = await MongoDb.appointments.create({
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
    const currentUserId = String(userId);

    let filter = {};
    if (userRole === 'ADMIN') {
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
      // Default to PATIENT
      filter = { patientId: currentUserId };
    }

    const appointments = await MongoDb.appointments.find(filter);

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments: appointments.map((a) => (a.toJSON ? a.toJSON() : a))
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

    const appointment = await MongoDb.appointments.findById(id);
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
      appointment: appointment.toJSON ? appointment.toJSON() : appointment
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

    const appointment = await MongoDb.appointments.findById(id);
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
      appointment: appointment.toJSON ? appointment.toJSON() : appointment
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

    const appointment = await MongoDb.appointments.findById(id);
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
      appointment: appointment.toJSON ? appointment.toJSON() : appointment
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
