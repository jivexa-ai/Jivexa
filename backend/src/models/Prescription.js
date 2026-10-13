const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
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
    appointmentId: {
      type: String,
      default: null
    },
    date: {
      type: String,
      required: [true, 'Prescription date is required']
    },
    medications: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    notes: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: 'Issued'
    },
    followUpDate: {
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

prescriptionSchema.virtual('id').get(function () {
  return this._id;
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;

