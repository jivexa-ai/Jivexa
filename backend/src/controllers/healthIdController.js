const mongoose = require('mongoose');
const HealthId = require('../models/HealthId');
const User = require('../models/User');
const { SupabaseDb, isSupabaseConfigured } = require('../services/supabaseDbService');

// Helper to generate a random 8-character uppercase alphanumeric string for Health ID
const generateRandomId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous chars like I, O, 0, 1
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `JXV-${result}`;
};

// Server-side unique Health ID generator with MongoDB & Supabase collision prevention
const generateUniqueHealthId = async () => {
  let isUnique = false;
  let newHealthId = '';
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    newHealthId = generateRandomId();
    attempts++;

    if (isSupabaseConfigured()) {
      const existing = await SupabaseDb.healthIds.findOne({ healthId: newHealthId });
      if (!existing) {
        isUnique = true;
      }
    } else if (mongoose.connection.readyState === 1) {
      const existing = await HealthId.findOne({ healthId: newHealthId });
      if (!existing) {
        isUnique = true;
      }
    } else {
      isUnique = true;
    }
  }

  return newHealthId;
};

// Memory fallback store if local MongoDB daemon is disconnected
const inMemoryHealthIds = [];

// @desc    Register / Create Digital Health ID for authenticated patient
// @route   POST /api/health-id
// @access  Private (Authenticated Patient)
const createHealthId = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { dateOfBirth, gender, phoneNumber, bloodGroup, emergencyContact, address, healthProfile } = req.body;

    if (isSupabaseConfigured()) {
      let userRecord = await SupabaseDb.users.findById(userId);
      const fullName = req.body.fullName || (userRecord ? userRecord.name : req.user.name) || 'Patient User';
      const email = (req.body.email || (userRecord ? userRecord.email : req.user.email) || '').toLowerCase().trim();

      const existingRecord = await SupabaseDb.healthIds.findOne({ userId });
      if (existingRecord) {
        return res.status(400).json({
          success: false,
          message: 'Health ID already exists',
          healthId: existingRecord.healthId,
          patient: {
            name: existingRecord.fullName,
            dateOfBirth: existingRecord.dateOfBirth,
            gender: existingRecord.gender,
            bloodGroup: existingRecord.bloodGroup,
            email: existingRecord.email,
            phoneNumber: existingRecord.phoneNumber,
            emergencyContact: existingRecord.emergencyContact,
            address: existingRecord.address,
            healthProfile: existingRecord.healthProfile
          }
        });
      }

      const newHealthIdStr = await generateUniqueHealthId();
      const healthIdRecord = await SupabaseDb.healthIds.create({
        healthId: newHealthIdStr,
        userId,
        fullName,
        dateOfBirth: dateOfBirth || '2000-01-01',
        gender: gender || 'Unspecified',
        phoneNumber: phoneNumber || '',
        email,
        bloodGroup: bloodGroup || 'O+',
        emergencyContact: emergencyContact || {},
        address: address || '',
        healthProfile: healthProfile || {}
      });

      return res.status(201).json({
        success: true,
        message: 'Digital Health ID created successfully',
        healthId: healthIdRecord.healthId,
        patient: {
          name: healthIdRecord.fullName,
          dateOfBirth: healthIdRecord.dateOfBirth,
          gender: healthIdRecord.gender,
          bloodGroup: healthIdRecord.bloodGroup,
          email: healthIdRecord.email,
          phoneNumber: healthIdRecord.phoneNumber,
          emergencyContact: healthIdRecord.emergencyContact,
          address: healthIdRecord.address,
          healthProfile: healthIdRecord.healthProfile
        }
      });
    }

    let userRecord = null;
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(userId)) {
      userRecord = await User.findById(userId);
    }
    const fullName = req.body.fullName || (userRecord ? userRecord.name : req.user.name) || 'Patient User';
    const email = (req.body.email || (userRecord ? userRecord.email : req.user.email) || '').toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      // 1. Check if patient already has a Health ID in MongoDB
      const existingRecord = mongoose.Types.ObjectId.isValid(userId)
        ? await HealthId.findOne({ userId })
        : null;
      if (existingRecord) {
        return res.status(400).json({
          success: false,
          message: 'Health ID already exists',
          healthId: existingRecord.healthId,
          patient: {
            name: existingRecord.fullName,
            dateOfBirth: existingRecord.dateOfBirth,
            gender: existingRecord.gender,
            bloodGroup: existingRecord.bloodGroup,
            email: existingRecord.email,
            phoneNumber: existingRecord.phoneNumber,
            emergencyContact: existingRecord.emergencyContact,
            address: existingRecord.address,
            healthProfile: existingRecord.healthProfile
          }
        });
      }

      // 2. Generate globally unique Health ID
      const newHealthIdStr = await generateUniqueHealthId();

      // 3. Save permanently in MongoDB
      const healthIdRecord = await HealthId.create({
        healthId: newHealthIdStr,
        userId,
        fullName,
        dateOfBirth: dateOfBirth || '2000-01-01',
        gender: gender || 'Unspecified',
        phoneNumber: phoneNumber || '',
        email,
        bloodGroup: bloodGroup || 'O+',
        emergencyContact: emergencyContact || {},
        address: address || '',
        healthProfile: healthProfile || {}
      });

      return res.status(201).json({
        success: true,
        message: 'Digital Health ID created successfully',
        healthId: healthIdRecord.healthId,
        patient: {
          name: healthIdRecord.fullName,
          dateOfBirth: healthIdRecord.dateOfBirth,
          gender: healthIdRecord.gender,
          bloodGroup: healthIdRecord.bloodGroup,
          email: healthIdRecord.email,
          phoneNumber: healthIdRecord.phoneNumber,
          emergencyContact: healthIdRecord.emergencyContact,
          address: healthIdRecord.address,
          healthProfile: healthIdRecord.healthProfile
        }
      });
    } else {
      // Memory Store Fallback
      let existingRecord = inMemoryHealthIds.find((h) => String(h.userId) === String(userId));
      if (existingRecord) {
        return res.status(400).json({
          success: false,
          message: 'Health ID already exists',
          healthId: existingRecord.healthId,
          patient: {
            name: existingRecord.fullName,
            dateOfBirth: existingRecord.dateOfBirth,
            gender: existingRecord.gender,
            bloodGroup: existingRecord.bloodGroup
          }
        });
      }

      const newHealthIdStr = generateRandomId();
      existingRecord = {
        healthId: newHealthIdStr,
        userId,
        fullName,
        dateOfBirth: dateOfBirth || '2000-01-01',
        gender: gender || 'Unspecified',
        phoneNumber: phoneNumber || '',
        email,
        bloodGroup: bloodGroup || 'O+',
        emergencyContact: emergencyContact || {},
        address: address || '',
        healthProfile: healthProfile || {}
      };
      inMemoryHealthIds.push(existingRecord);

      return res.status(201).json({
        success: true,
        message: 'Digital Health ID created successfully',
        healthId: existingRecord.healthId,
        patient: {
          name: existingRecord.fullName,
          dateOfBirth: existingRecord.dateOfBirth,
          gender: existingRecord.gender,
          bloodGroup: existingRecord.bloodGroup
        }
      });
    }
  } catch (error) {
    console.error('[Health ID API] Create Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to process request'
    });
  }
};

// @desc    Get authenticated patient's own Health ID from MongoDB
// @route   GET /api/health-id/me
// @access  Private (Authenticated Patient)
const getMyHealthId = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    if (isSupabaseConfigured()) {
      let record = await SupabaseDb.healthIds.findOne({ userId });

      // Auto-generate Health ID if patient signed up but hasn't initialized one yet
      if (!record) {
        const userRecord = await SupabaseDb.users.findById(userId);
        const newHealthIdStr = await generateUniqueHealthId();
        record = await SupabaseDb.healthIds.create({
          healthId: newHealthIdStr,
          userId,
          fullName: userRecord ? userRecord.name : (req.user ? req.user.name : 'Patient User'),
          email: userRecord ? userRecord.email : (req.user ? req.user.email : ''),
          dateOfBirth: '2000-01-01',
          gender: 'Unspecified',
          bloodGroup: 'O+'
        });
      }

      return res.status(200).json({
        success: true,
        healthId: record.healthId,
        patient: {
          name: record.fullName,
          dateOfBirth: record.dateOfBirth,
          gender: record.gender,
          bloodGroup: record.bloodGroup,
          email: record.email,
          phoneNumber: record.phoneNumber,
          emergencyContact: record.emergencyContact,
          address: record.address,
          healthProfile: record.healthProfile,
          createdAt: record.createdAt
        }
      });
    } else if (mongoose.connection.readyState === 1) {
      let record = mongoose.Types.ObjectId.isValid(userId) ? await HealthId.findOne({ userId }) : null;

      // Auto-generate Health ID if patient signed up but hasn't initialized one yet
      if (!record && mongoose.Types.ObjectId.isValid(userId)) {
        const userRecord = await User.findById(userId);
        const newHealthIdStr = await generateUniqueHealthId();
        record = await HealthId.create({
          healthId: newHealthIdStr,
          userId,
          fullName: userRecord ? userRecord.name : (req.user ? req.user.name : 'Patient User'),
          email: userRecord ? userRecord.email : (req.user ? req.user.email : ''),
          dateOfBirth: '2000-01-01',
          gender: 'Unspecified',
          bloodGroup: 'O+'
        });
      }

      return res.status(200).json({
        success: true,
        healthId: record.healthId,
        patient: {
          name: record.fullName,
          dateOfBirth: record.dateOfBirth,
          gender: record.gender,
          bloodGroup: record.bloodGroup,
          email: record.email,
          phoneNumber: record.phoneNumber,
          emergencyContact: record.emergencyContact,
          address: record.address,
          healthProfile: record.healthProfile,
          createdAt: record.createdAt
        }
      });
    } else {
      let record = inMemoryHealthIds.find((h) => String(h.userId) === String(userId));
      if (!record) {
        const newHealthIdStr = generateRandomId();
        record = {
          healthId: newHealthIdStr,
          userId,
          fullName: req.user.name || 'Patient User',
          email: req.user.email || '',
          dateOfBirth: '2000-01-01',
          gender: 'Unspecified',
          bloodGroup: 'O+'
        };
        inMemoryHealthIds.push(record);
      }

      return res.status(200).json({
        success: true,
        healthId: record.healthId,
        patient: {
          name: record.fullName,
          dateOfBirth: record.dateOfBirth,
          gender: record.gender,
          bloodGroup: record.bloodGroup
        }
      });
    }
  } catch (error) {
    console.error('[Health ID API] Get Me Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to process request'
    });
  }
};

// @desc    Search patient Health ID in MongoDB & Supabase
// @route   GET /api/health-id/search?healthId=JXV-XXXXXXXX
// @access  Public / Private (Healthcare Professionals & Verified Users)
const searchHealthId = async (req, res) => {
  try {
    const rawHealthId = req.query.healthId || req.query.id || req.params.healthId || '';
    const sanitizedHealthId = String(rawHealthId).trim().toUpperCase();

    if (!sanitizedHealthId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Health ID to search'
      });
    }

    if (isSupabaseConfigured()) {
      const record = await SupabaseDb.healthIds.findOne({
        $or: [
          { healthId: sanitizedHealthId },
          { healthId: sanitizedHealthId.replace(/[^A-Z0-9]/g, '') }
        ]
      });

      if (!record) {
        return res.status(404).json({
          success: false,
          message: `Health ID "${sanitizedHealthId}" not found. No patient record registered with this ID.`
        });
      }

      return res.status(200).json({
        success: true,
        healthId: record.healthId,
        patient: {
          name: record.fullName,
          dateOfBirth: record.dateOfBirth,
          gender: record.gender,
          bloodGroup: record.bloodGroup,
          email: record.email,
          phoneNumber: record.phoneNumber,
          emergencyContact: record.emergencyContact,
          address: record.address,
          healthProfile: record.healthProfile,
          createdAt: record.createdAt
        }
      });
    } else if (mongoose.connection.readyState === 1) {
      const record = await HealthId.findOne({
        $or: [
          { healthId: sanitizedHealthId },
          { healthId: sanitizedHealthId.replace(/[^A-Z0-9]/g, '') }
        ]
      });

      if (!record) {
        return res.status(404).json({
          success: false,
          message: `Health ID "${sanitizedHealthId}" not found. No patient record registered with this ID.`
        });
      }

      return res.status(200).json({
        success: true,
        healthId: record.healthId,
        patient: {
          name: record.fullName,
          dateOfBirth: record.dateOfBirth,
          gender: record.gender,
          bloodGroup: record.bloodGroup,
          email: record.email,
          phoneNumber: record.phoneNumber,
          emergencyContact: record.emergencyContact,
          address: record.address,
          healthProfile: record.healthProfile,
          createdAt: record.createdAt
        }
      });
    } else {
      const record = inMemoryHealthIds.find(
        (h) => h.healthId.toUpperCase() === sanitizedHealthId || h.healthId.toUpperCase().replace(/[^A-Z0-9]/g, '') === sanitizedHealthId.replace(/[^A-Z0-9]/g, '')
      );

      if (!record) {
        return res.status(404).json({
          success: false,
          message: `Health ID "${sanitizedHealthId}" not found. No patient record registered with this ID.`
        });
      }

      return res.status(200).json({
        success: true,
        healthId: record.healthId,
        patient: {
          name: record.fullName,
          dateOfBirth: record.dateOfBirth,
          gender: record.gender,
          bloodGroup: record.bloodGroup,
          email: record.email,
          phoneNumber: record.phoneNumber,
          emergencyContact: record.emergencyContact,
          address: record.address,
          healthProfile: record.healthProfile
        }
      });
    }
  } catch (error) {
    console.error('[Health ID API] Search Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to process request'
    });
  }
};

module.exports = {
  createHealthId,
  getMyHealthId,
  searchHealthId
};
