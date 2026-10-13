const mongoose = require('mongoose');

const ambulanceRequestSchema = new mongoose.Schema(
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
    patientPhone: {
      type: String,
      default: '',
      trim: true
    },
    jivexaHealthId: {
      type: String,
      default: '',
      trim: true
    },
    ambulanceId: {
      type: String,
      default: 'amb_1',
      index: true
    },
    ambulanceType: {
      type: String,
      default: 'ICU'
    },
    vehicleNumber: {
      type: String,
      default: ''
    },
    driverName: {
      type: String,
      default: ''
    },
    driverPhone: {
      type: String,
      default: ''
    },
    pickupAddress: {
      type: String,
      required: [true, 'Pickup address is required']
    },
    destinationAddress: {
      type: String,
      required: [true, 'Destination address is required']
    },
    pickupLat: {
      type: Number,
      default: 12.9716
    },
    pickupLng: {
      type: Number,
      default: 77.5946
    },
    destLat: {
      type: Number,
      default: 12.9780
    },
    destLng: {
      type: Number,
      default: 77.6010
    },
    emergencyType: {
      type: String,
      default: 'General Emergency'
    },
    status: {
      type: String,
      default: 'Pending'
    },
    fare: {
      type: Number,
      default: 0
    },
    acceptedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

ambulanceRequestSchema.virtual('id').get(function () {
  return this._id;
});

const AmbulanceRequest = mongoose.model('AmbulanceRequest', ambulanceRequestSchema);

module.exports = AmbulanceRequest;

