const mongoose = require('mongoose');

const healthIdSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    healthId: {
      type: String,
      required: [true, 'Health ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    dateOfBirth: {
      type: String,
      default: '2000-01-01'
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Unspecified'],
      default: 'Unspecified'
    },
    bloodGroup: {
      type: String,
      default: 'O+'
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: ''
    },
    emergencyContact: {
      name: { type: String, default: '' },
      relationship: { type: String, default: '' },
      relation: { type: String, default: '' },
      phone: { type: String, default: '' },
      hospital: { type: String, default: '' }
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    healthProfile: {
      allergies: [{ type: String }],
      chronicConditions: [{ type: String }],
      currentMedications: [{ type: String }],
      bloodPressure: { type: String, default: '' },
      avatarUrl: { type: String, default: '' }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

healthIdSchema.virtual('id').get(function () {
  return this._id;
});

const HealthId = mongoose.model('HealthId', healthIdSchema);

module.exports = HealthId;

