import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  age: {
    type: Number
  },

  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['PATIENT', 'DOCTOR', 'PHARMACY', 'ADMIN', 'AMBULANCE_PARTNER'],
    default: 'PATIENT'
  },

  verified: {
    type: Boolean,
    default: true
  },

  emailVerified: {
    type: Boolean,
    default: true
  },

  accountStatus: {
    type: String,
    default: 'ACTIVE'
  },

  nmcRegistrationNumber: {
    type: String
  },

  stateMedicalCouncil: {
    type: String
  },

  vehicleNumber: {
    type: String
  },

  drugLicenseNumber: {
    type: String
  },

  gstin: {
    type: String
  },

  usage: {
    tokenUsed: {
      type: Number,
      default: 0
    },

    tokenLimit: {
      type: Number,
      default: 10000
    },

    resetAt: {
      type: Date,
      default: () => new Date(Date.now() + 5 * 60 * 60 * 1000)
    },

    totalTokenUsed: {
      type: Number,
      default: 0
    }
  },

  otpHash: {
    type: String
  },

  otpExpiresAt: {
    type: Date
  },

  otpLastSentAt: {
    type: Date
  }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;