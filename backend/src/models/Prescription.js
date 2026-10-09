const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medication name is required'],
      trim: true
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required'],
      trim: true
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
      trim: true
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      trim: true
    },
    instructions: {
      type: String,
      default: '',
      trim: true
    }
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
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
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      index: true
    },
    date: {
      type: String,
      required: [true, 'Prescription date is required'],
      trim: true
    },
    medications: {
      type: [medicationSchema],
      default: []
    },
    notes: {
      type: String,
      default: '',
      trim: true
    },
    status: {
      type: String,
      enum: ['Draft', 'Issued', 'Active', 'Expired', 'Cancelled'],
      default: 'Issued',
      index: true
    },
    followUpDate: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for querying prescriptions
prescriptionSchema.index({ patientId: 1, date: -1 });
prescriptionSchema.index({ doctorId: 1, date: -1 });

// Clean public JSON representation
prescriptionSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  delete obj.__v;
  return obj;
};

const Prescription = mongoose.model('Prescription', prescriptionSchema);

module.exports = Prescription;
