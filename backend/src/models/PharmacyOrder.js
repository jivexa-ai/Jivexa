const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const pharmacyOrderSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Patient ID is required'],
      index: true
    },
    patientName: {
      type: String,
      required: true,
      trim: true
    },
    pharmacyId: {
      type: String,
      required: [true, 'Pharmacy ID is required'],
      index: true
    },
    pharmacyName: {
      type: String,
      required: true,
      trim: true
    },
    items: {
      type: [orderItemSchema],
      required: [true, 'Order items are required'],
      validate: [arr => arr.length > 0, 'Order must contain at least one medication item']
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      default: function() { return this.totalAmount; }
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Processing', 'Ready', 'Completed', 'Cancelled', 'PENDING', 'CONFIRMED', 'PROCESSING', 'READY', 'COMPLETED', 'CANCELLED'],
      default: 'Pending',
      index: true
    },
    deliveryAddress: {
      type: String,
      trim: true,
      default: ''
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Cash on Delivery'],
      default: 'Pending'
    },
    prescriptionId: {
      type: String,
      trim: true,
      default: ''
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0]
    }
  },
  {
    timestamps: true
  }
);

pharmacyOrderSchema.index({ patientId: 1, createdAt: -1 });
pharmacyOrderSchema.index({ pharmacyId: 1, createdAt: -1 });

pharmacyOrderSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id.toString();
  return obj;
};

const PharmacyOrder = mongoose.model('PharmacyOrder', pharmacyOrderSchema);

module.exports = PharmacyOrder;
