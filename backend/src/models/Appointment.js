const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    patientId: {
      type: String,
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
      index: true
    },
    doctorName: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true
    },
    doctorSpecialty: {
      type: String,
      default: 'General Medicine',
      trim: true
    },
    date: {
      type: String,
      required: [true, 'Appointment date is required'],
      index: true
    },
    time: {
      type: String,
      required: [true, 'Appointment time is required']
    },
    consultationType: {
      type: String,
      default: 'Video'
    },
    status: {
      type: String,
      default: 'Upcoming'
    },
    notes: {
      type: String,
      default: ''
    },
    consultationSummary: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

appointmentSchema.virtual('id').get(function () {
  return this._id;
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;

