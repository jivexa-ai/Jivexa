const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    roleId: {
      type: String,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    role: {
      type: String,
      enum: ['PATIENT', 'DOCTOR', 'PHARMACY', 'ADMIN', 'AMBULANCE_PARTNER'],
      default: 'PATIENT'
    },
    healthId: {
      type: String,
      trim: true,
      default: '',
      index: true
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    age: {
      type: Number,
      default: null
    },
    emailVerified: {
      type: Boolean,
      default: true
    },
    verified: {
      type: Boolean,
      default: true
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    accountStatus: {
      type: String,
      default: 'ACTIVE'
    },
    otpDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date,
      default: null
    },
    professionalDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    vehicleDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    licenseDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    usage: {
      tokenUsed: { type: Number, default: 0 },
      tokenLimit: { type: Number, default: 10000 },
      totalTokenUsed: { type: Number, default: 0 },
      resetAt: { type: Date, default: null },
      avatarUrl: { type: String, default: '' },
      avatarPath: { type: String, default: '' }
    },
    avatarUrl: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual id field matching _id
userSchema.virtual('id').get(function () {
  return this._id;
});

// Pre-save hook to hash password with bcrypt (12 rounds) if modified
userSchema.pre('save', async function () {
  // Hash only when the password changes and is not already bcrypt-hashed
  if (this.isModified('password') && this.password && !this.password.startsWith('$2')) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Sync avatarUrl inside professionalDetails and usage
  if (this.avatarUrl) {
    if (this.professionalDetails) {
      this.professionalDetails.avatarUrl = this.avatarUrl;
    }
    if (this.usage) {
      this.usage.avatarUrl = this.avatarUrl;
    }
  }
});

// Instance method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password || !enteredPassword) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to check brute-force lockout status
userSchema.methods.isLocked = function () {
  return Boolean(this.lockUntil && this.lockUntil > new Date());
};

// Safe JSON representation for auth responses (never leaks password or sensitive hashes)
userSchema.methods.toAuthJSON = function () {
  return {
    id: this._id,
    _id: this._id,
    roleId: this.roleId,
    name: this.name,
    phone: this.phone || '',
    healthId: this.healthId || '',
    age: this.age,
    email: this.email,
    role: this.role,
    emailVerified: Boolean(this.emailVerified),
    verified: Boolean(this.verified || this.emailVerified),
    twoFactorEnabled: Boolean(this.twoFactorEnabled),
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

