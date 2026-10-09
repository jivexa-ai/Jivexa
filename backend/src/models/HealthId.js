const mongoose = require('mongoose');

const healthIdSchema = new mongoose.Schema(
  {
    healthId: {
      type: String,
      required: [true, 'Health ID is required'],
      unique: true,
      index: true,
      uppercase: true,
      trim: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID / Patient ID is required']
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    dateOfBirth: {
      type: String,
      default: ''
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say', 'Unspecified'],
      default: 'Unspecified'
    },
    phoneNumber: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: ''
    },
    bloodGroup: {
      type: String,
      default: 'Not Set'
    },
    emergencyContact: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    address: {
      type: String,
      default: ''
    },
    healthProfile: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

const HealthId = mongoose.model('HealthId', healthIdSchema);

module.exports = HealthId;
