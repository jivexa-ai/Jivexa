const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Patient ID is required'],
      index: true
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true
    },
    doctorId: {
      type: String,
      required: [true, 'Doctor ID is required'],
      index: true,
      trim: true
    },
    doctorName: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true
    },
    doctorSpecialty: {
      type: String,
      trim: true,
      default: 'General Medicine'
    },
    date: {
      type: String,
      required: [true, 'Appointment date is required'],
      trim: true
    },
    time: {
      type: String,
      required: [true, 'Appointment time is required'],
      trim: true
    },
    consultationType: {
      type: String,
      enum: ['Video', 'In-Person', 'Both'],
      default: 'Video'
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Completed', 'Cancelled', 'Pending', 'Confirmed', 'In Consultation', 'UPCOMING', 'COMPLETED', 'CANCELLED', 'PENDING', 'CONFIRMED', 'IN_CONSULTATION'],
      default: 'Upcoming',
      index: true
    },
    notes: {
      type: String,
      default: '',
      trim: true
    },
    consultationSummary: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for querying user appointments by date
appointmentSchema.index({ patientId: 1, date: -1 });
appointmentSchema.index({ doctorId: 1, date: -1 });

// Clean public JSON representation
appointmentSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj.__v;
  return obj;
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
