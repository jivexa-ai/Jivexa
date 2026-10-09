const mongoose = require('mongoose');

const ambulanceRequestSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Patient identifier is required'],
      index: true
    },
    patientName: {
      type: String,
      required: true,
      trim: true
    },
    patientPhone: {
      type: String,
      trim: true,
      default: ''
    },
    jivexaHealthId: {
      type: String,
      trim: true,
      uppercase: true,
      default: ''
    },
    ambulanceId: {
      type: String,
      trim: true,
      index: true
    },
    ambulanceType: {
      type: String,
      enum: ['Basic', 'Oxygen', 'ICU', 'ALS'],
      default: 'ICU'
    },
    vehicleNumber: {
      type: String,
      trim: true,
      default: ''
    },
    driverName: {
      type: String,
      trim: true,
      default: ''
    },
    driverPhone: {
      type: String,
      trim: true,
      default: ''
    },
    pickupAddress: {
      type: String,
      required: [true, 'Pickup address is required'],
      trim: true
    },
    destinationAddress: {
      type: String,
      required: [true, 'Destination hospital address is required'],
      trim: true
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
      trim: true,
      default: 'General Emergency'
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Arrived', 'In Transit', 'Completed', 'Cancelled', 'PENDING', 'ACCEPTED', 'ARRIVED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'],
      default: 'Pending',
      index: true
    },
    fare: {
      type: Number,
      default: 0
    },
    acceptedAt: {
      type: Date
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

ambulanceRequestSchema.index({ patientId: 1, createdAt: -1 });
ambulanceRequestSchema.index({ ambulanceId: 1, createdAt: -1 });

ambulanceRequestSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  return obj;
};

const AmbulanceRequest = mongoose.model('AmbulanceRequest', ambulanceRequestSchema);

module.exports = AmbulanceRequest;
