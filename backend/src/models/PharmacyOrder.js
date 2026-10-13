const mongoose = require('mongoose');

const pharmacyOrderSchema = new mongoose.Schema(
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
    pharmacyId: {
      type: String,
      required: [true, 'Pharmacy ID is required'],
      index: true
    },
    pharmacyName: {
      type: String,
      required: [true, 'Pharmacy name is required'],
      trim: true
    },
    items: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    totalPrice: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      default: 'Pending'
    },
    deliveryAddress: {
      type: String,
      default: ''
    },
    paymentStatus: {
      type: String,
      default: 'Pending'
    },
    prescriptionId: {
      type: String,
      default: ''
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

pharmacyOrderSchema.virtual('id').get(function () {
  return this._id;
});

const PharmacyOrder = mongoose.model('PharmacyOrder', pharmacyOrderSchema);

module.exports = PharmacyOrder;

