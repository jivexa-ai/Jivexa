import mongoose from 'mongoose';

const healthIdSchema = new mongoose.Schema(
  {
    healthId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    userId: {
      type: String,
      required: true,
      index: true
    },
    fullName: {
      type: String,
      required: true,
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
      lowercase: true
    },
    phoneNumber: {
      type: String,
      trim: true
    },
    emergencyContact: {
      name: { type: String },
      relation: { type: String },
      phone: { type: String },
      hospital: { type: String }
    },
    address: {
      type: String,
      trim: true
    },
    healthProfile: {
      allergies: [{ type: String }],
      chronicConditions: [{ type: String }],
      bloodPressure: { type: String }
    }
  },
  {
    timestamps: true
  }
);

const HealthId = mongoose.model('HealthId', healthIdSchema);

export default HealthId;
