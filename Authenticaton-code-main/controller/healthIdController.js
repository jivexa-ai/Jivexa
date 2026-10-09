import mongoose from 'mongoose';
import HealthId from '../model/healthIdSchema.js';
import User from '../model/userSchema.js';

// Memory store with distinct demo records
const inMemoryHealthIds = [
  {
    healthId: 'JXV-STVAZREW',
    userId: 'usr_demo_aarav_001',
    fullName: 'Aarav Sharma',
    dateOfBirth: '1992-08-14',
    gender: 'Male',
    phoneNumber: '+91 98111 22334',
    email: 'aarav.sharma@example.com',
    bloodGroup: 'B+',
    emergencyContact: {
      name: 'Sunita Sharma',
      relationship: 'Spouse',
      phone: '+91 98111 22335',
      hospital: 'Apollo Hospital, Bangalore'
    },
    address: 'Koramangala, Bangalore',
    healthProfile: {
      chronicConditions: ['Hypertension (Managed)'],
      allergies: ['Penicillin'],
      currentMedications: ['Amlodipine 5mg']
    },
    createdAt: new Date().toISOString()
  },
  {
    healthId: 'PAT-202608-F4A1B',
    userId: 'usr_demo_meera_002',
    fullName: 'Meera Nair',
    dateOfBirth: '1998-11-22',
    gender: 'Female',
    phoneNumber: '+91 97444 55667',
    email: 'meera.nair@example.com',
    bloodGroup: 'O+',
    emergencyContact: {
      name: 'Ramesh Nair',
      relationship: 'Father',
      phone: '+91 97444 55668',
      hospital: 'Fortis Healthcare, Bannerghatta'
    },
    address: 'Indiranagar, Bangalore',
    healthProfile: {
      chronicConditions: ['None Logged'],
      allergies: ['Sulfa drugs (mild rash)'],
      currentMedications: []
    },
    createdAt: new Date().toISOString()
  }
];

// Helper to generate a unique random Health ID (JXV-XXXXXXXX)
const generateRandomId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `JXV-${result}`;
};

// 1. Create a new unique Health ID in MongoDB / Memory
export const createHealthId = async (req, res) => {
  try {
    const userId = req.user._id?.toString() || req.user.id;
    const { dateOfBirth, gender, phoneNumber, bloodGroup, emergencyContact, address, healthProfile, fullName } = req.body;

    let userRecord = null;
    if (mongoose.connection.readyState === 1) {
      try {
        userRecord = await User.findById(userId);
      } catch (e) {}
    }
    const resolvedName = fullName || (userRecord ? userRecord.name : req.user.name) || 'Patient User';
    const resolvedEmail = (req.body.email || (userRecord ? userRecord.email : req.user.email) || '').toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      const existing = await HealthId.findOne({ userId });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Health ID already exists for this account',
          healthId: existing.healthId,
          patient: {
            name: existing.fullName,
            dateOfBirth: existing.dateOfBirth,
            gender: existing.gender,
            bloodGroup: existing.bloodGroup,
            email: existing.email,
            phoneNumber: existing.phoneNumber,
            emergencyContact: existing.emergencyContact,
            address: existing.address,
            healthProfile: existing.healthProfile
          }
        });
      }

      let isUnique = false;
      let newHealthId = '';
      let attempts = 0;
      while (!isUnique && attempts < 10) {
        newHealthId = generateRandomId();
        attempts++;
        const dup = await HealthId.findOne({ healthId: newHealthId });
        if (!dup) isUnique = true;
      }

      const record = await HealthId.create({
        healthId: newHealthId,
        userId,
        fullName: resolvedName,
        dateOfBirth: dateOfBirth || '2000-01-01',
        gender: gender || 'Unspecified',
        phoneNumber: phoneNumber || '',
        email: resolvedEmail,
        bloodGroup: bloodGroup || 'O+',
        emergencyContact: emergencyContact || {},
        address: address || '',
        healthProfile: healthProfile || {}
      });

      return res.status(201).json({
        success: true,
        message: 'Digital Health ID created successfully',
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
    } else {
      const existing = inMemoryHealthIds.find(h => h.userId === userId);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Health ID already exists for this account',
          healthId: existing.healthId,
          patient: {
            name: existing.fullName,
            dateOfBirth: existing.dateOfBirth,
            gender: existing.gender,
            bloodGroup: existing.bloodGroup,
            email: existing.email,
            phoneNumber: existing.phoneNumber,
            emergencyContact: existing.emergencyContact,
            address: existing.address,
            healthProfile: existing.healthProfile
          }
        });
      }

      const newHealthId = generateRandomId();
      const record = {
        healthId: newHealthId,
        userId,
        fullName: resolvedName,
        dateOfBirth: dateOfBirth || '2000-01-01',
        gender: gender || 'Unspecified',
        phoneNumber: phoneNumber || '',
        email: resolvedEmail,
        bloodGroup: bloodGroup || 'O+',
        emergencyContact: emergencyContact || {},
        address: address || '',
        healthProfile: healthProfile || {},
        createdAt: new Date().toISOString()
      };
      inMemoryHealthIds.push(record);

      return res.status(201).json({
        success: true,
        message: 'Digital Health ID created successfully',
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
    console.error('[Health ID API] Create Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error creating Health ID' });
  }
};

// 2. Fetch authenticated patient's Health ID
export const getMyHealthId = async (req, res) => {
  try {
    const userId = req.user._id?.toString() || req.user.id;

    if (mongoose.connection.readyState === 1) {
      let record = await HealthId.findOne({ userId });

      if (!record) {
        const userRecord = await User.findById(userId);
        let newHealthId = generateRandomId();
        record = await HealthId.create({
          healthId: newHealthId,
          userId,
          fullName: userRecord ? userRecord.name : req.user.name || 'Patient User',
          email: userRecord ? userRecord.email : req.user.email || '',
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
      let record = inMemoryHealthIds.find(h => h.userId === userId);
      if (!record) {
        let newHealthId = generateRandomId();
        record = {
          healthId: newHealthId,
          userId,
          fullName: req.user.name || 'Patient User',
          email: req.user.email || '',
          dateOfBirth: '2000-01-01',
          gender: 'Unspecified',
          bloodGroup: 'O+',
          emergencyContact: {},
          address: '',
          healthProfile: {},
          createdAt: new Date().toISOString()
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
          bloodGroup: record.bloodGroup,
          email: record.email,
          phoneNumber: record.phoneNumber,
          emergencyContact: record.emergencyContact,
          address: record.address,
          healthProfile: record.healthProfile,
          createdAt: record.createdAt
        }
      });
    }
  } catch (error) {
    console.error('[Health ID API] Get Me Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error retrieving Health ID' });
  }
};

// 3. Search patient by exact Health ID
export const searchHealthId = async (req, res) => {
  try {
    const rawHealthId = req.query.healthId || req.query.id || req.params.healthId || '';
    const sanitizedHealthId = String(rawHealthId).trim().toUpperCase();

    if (!sanitizedHealthId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Health ID to search'
      });
    }

    if (mongoose.connection.readyState === 1) {
      const record = await HealthId.findOne({
        $or: [
          { healthId: sanitizedHealthId },
          { healthId: sanitizedHealthId.replace(/[^A-Z0-9]/g, '') }
        ]
      });

      if (!record) {
        // Fallback to in-memory demo records if not found in db
        const memRecord = inMemoryHealthIds.find(
          h => h.healthId.toUpperCase() === sanitizedHealthId ||
               h.healthId.toUpperCase().replace(/[^A-Z0-9]/g, '') === sanitizedHealthId.replace(/[^A-Z0-9]/g, '')
        );

        if (!memRecord) {
          return res.status(404).json({
            success: false,
            message: `Health ID "${sanitizedHealthId}" not found. No patient record registered with this ID.`
          });
        }

        return res.status(200).json({
          success: true,
          healthId: memRecord.healthId,
          patient: {
            name: memRecord.fullName,
            dateOfBirth: memRecord.dateOfBirth,
            gender: memRecord.gender,
            bloodGroup: memRecord.bloodGroup,
            email: memRecord.email,
            phoneNumber: memRecord.phoneNumber,
            emergencyContact: memRecord.emergencyContact,
            address: memRecord.address,
            healthProfile: memRecord.healthProfile,
            createdAt: memRecord.createdAt
          }
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
        h => h.healthId.toUpperCase() === sanitizedHealthId ||
             h.healthId.toUpperCase().replace(/[^A-Z0-9]/g, '') === sanitizedHealthId.replace(/[^A-Z0-9]/g, '')
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
          healthProfile: record.healthProfile,
          createdAt: record.createdAt
        }
      });
    }
  } catch (error) {
    console.error('[Health ID API] Search Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error searching Health ID'
    });
  }
};
