const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    roleId: {
      type: String,
      unique: true,
      sparse: true
    },
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    healthId: {
      type: String,
      trim: true,
      uppercase: true,
      default: ''
    },
    age: {
      type: Number,
      min: 1,
      max: 120
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    role: {
      type: String,
      enum: ['PATIENT', 'DOCTOR', 'PHARMACY', 'AMBULANCE_PARTNER', 'ADMIN'],
      default: 'PATIENT'
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    verified: {
      type: Boolean,
      default: false
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    avatarUrl: {
      type: String,
      default: ''
    },
    accountStatus: {
      type: String,
      enum: [
        'PENDING_EMAIL_VERIFICATION',
        'PENDING_DOCUMENT_REVIEW',
        'PENDING_PROFESSIONAL_VERIFICATION',
        'PENDING_VEHICLE_VERIFICATION',
        'PENDING_LICENSE_VERIFICATION',
        'VERIFIED',
        'ACTIVE',
        'REJECTED',
        'SUSPENDED'
      ],
      default: 'PENDING_EMAIL_VERIFICATION'
    },
    otpDetails: {
      codeHash: { type: String },
      purpose: { type: String, enum: ['signup_verification', 'login_2fa', 'password_reset'] },
      expiresAt: { type: Date },
      resendAvailableAt: { type: Date },
      attempts: { type: Number, default: 0 }
    },
    // Brute-force Login Protection & Lockout
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date
    },
    // Stage 2 Professional / Business Verification Sub-Documents
    professionalDetails: {
      nmcRegistrationNumber: { type: String, trim: true },
      stateMedicalCouncil: { type: String, trim: true },
      qualifications: { type: String, trim: true },
      specialty: { type: String, trim: true },
      documentUrl: { type: String, trim: true },
      verifiedAt: { type: Date }
    },
    vehicleDetails: {
      vehicleNumber: { type: String, trim: true },
      category: { type: String, trim: true },
      permitNumber: { type: String, trim: true },
      hospitalPartner: { type: String, trim: true },
      documentUrl: { type: String, trim: true },
      verifiedAt: { type: Date }
    },
    licenseDetails: {
      pharmacyName: { type: String, trim: true },
      drugLicenseNumber: { type: String, trim: true },
      gstin: { type: String, trim: true },
      pharmacistName: { type: String, trim: true },
      documentUrl: { type: String, trim: true },
      verifiedAt: { type: Date }
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
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook: Hash password before saving to MongoDB using 12 salt rounds
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Helper method: Match entered password with hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if account is currently locked due to failed login attempts
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

// Return clean sanitized public user profile JSON
userSchema.methods.toAuthJSON = function () {
  return {
    id: this._id,
    roleId: this.roleId,
    name: this.name,
    phone: this.phone || '',
    healthId: this.healthId || '',
    age: this.age,
    email: this.email,
    role: this.role,
    emailVerified: this.emailVerified,
    verified: this.verified || this.emailVerified,
    twoFactorEnabled: this.twoFactorEnabled,
    accountStatus: this.accountStatus,
    professionalDetails: this.professionalDetails,
    vehicleDetails: this.vehicleDetails,
    licenseDetails: this.licenseDetails,
    usage: this.usage,
    avatarUrl: this.avatarUrl || this.professionalDetails?.avatarUrl || this.usage?.avatarUrl || '',
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
