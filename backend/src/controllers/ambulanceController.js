const mongoose = require('mongoose');
const AmbulanceRequest = require('../models/AmbulanceRequest');
const User = require('../models/User');
const { SupabaseDb, isSupabaseConfigured } = require('../services/supabaseDbService');

// Fallback in-memory store for offline/test environments
const inMemoryAmbulanceRequests = [];

const formatRequest = (item) => ({
  id: String(item._id || item.id),
  _id: item._id || item.id,
  patientId: item.patientId,
  patientName: item.patientName,
  patientPhone: item.patientPhone || '',
  jivexaHealthId: item.jivexaHealthId || '',
  ambulanceId: item.ambulanceId || '',
  ambulanceType: item.ambulanceType || 'ICU',
  vehicleNumber: item.vehicleNumber || '',
  driverName: item.driverName || '',
  driverPhone: item.driverPhone || '',
  pickupAddress: item.pickupAddress,
  destinationAddress: item.destinationAddress,
  pickupLat: item.pickupLat,
  pickupLng: item.pickupLng,
  destLat: item.destLat,
  destLng: item.destLng,
  emergencyType: item.emergencyType || 'General Emergency',
  status: item.status || 'Pending',
  fare: item.fare || 0,
  acceptedAt: item.acceptedAt,
  completedAt: item.completedAt,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
  toJSON() { return this; }
});

// @desc    Create a new Ambulance / Emergency Request
// @route   POST /api/ambulance/requests
// @access  Private (Authenticated Patient / User)
const createAmbulanceRequest = async (req, res) => {
  try {
    const {
      ambulanceType = 'ICU',
      pickupAddress,
      destinationAddress,
      pickupLat = 12.9716,
      pickupLng = 77.5946,
      destLat = 12.9780,
      destLng = 77.6010,
      emergencyType = 'General Emergency',
      fare = 1200,
      jivexaHealthId = '',
      ambulanceId = '',
      vehicleNumber = '',
      driverName = '',
      driverPhone = ''
    } = req.body;

    if (!pickupAddress || !destinationAddress) {
      return res.status(400).json({
        success: false,
        error: 'Pickup address and destination hospital address are required'
      });
    }

    const patientId = req.user._id || req.user.id;
    const patientName = req.user.name || 'Patient User';
    const patientPhone = req.user.phone || '';
    const healthId = jivexaHealthId || req.user.healthId || '';

    // Smart auto-dispatch details
    const resolvedVehicleNumber = vehicleNumber || 'KA-01-EQ-9112';
    const resolvedDriverName = driverName || 'Ramesh Singh (Apollo Partner)';
    const resolvedDriverPhone = driverPhone || '+91 98765 43210';
    const initialStatus = 'Accepted';

    if (isSupabaseConfigured()) {
      const newRequest = await SupabaseDb.ambulanceRequests.create({
        patientId,
        patientName,
        patientPhone,
        jivexaHealthId: healthId,
        ambulanceId: ambulanceId || 'amb_1',
        ambulanceType,
        vehicleNumber: resolvedVehicleNumber,
        driverName: resolvedDriverName,
        driverPhone: resolvedDriverPhone,
        pickupAddress,
        destinationAddress,
        pickupLat,
        pickupLng,
        destLat,
        destLng,
        emergencyType,
        status: initialStatus,
        fare,
        acceptedAt: new Date()
      });

      return res.status(201).json({
        success: true,
        message: 'Ambulance dispatched successfully',
        request: newRequest.toJSON(),
        booking: newRequest.toJSON()
      });
    }

    if (mongoose.connection.readyState === 1) {
      const newRequest = await AmbulanceRequest.create({
        patientId,
        patientName,
        patientPhone,
        jivexaHealthId: healthId,
        ambulanceId: ambulanceId || 'amb_1',
        ambulanceType,
        vehicleNumber: resolvedVehicleNumber,
        driverName: resolvedDriverName,
        driverPhone: resolvedDriverPhone,
        pickupAddress,
        destinationAddress,
        pickupLat,
        pickupLng,
        destLat,
        destLng,
        emergencyType,
        status: initialStatus,
        fare,
        acceptedAt: new Date()
      });

      return res.status(201).json({
        success: true,
        message: 'Ambulance dispatched successfully',
        request: newRequest.toJSON(),
        booking: newRequest.toJSON()
      });
    }

    // Memory Store Fallback
    const newId = new mongoose.Types.ObjectId();
    const reqDoc = {
      _id: newId,
      id: newId.toString(),
      patientId,
      patientName,
      patientPhone,
      jivexaHealthId: healthId,
      ambulanceId: ambulanceId || 'amb_1',
      ambulanceType,
      vehicleNumber: resolvedVehicleNumber,
      driverName: resolvedDriverName,
      driverPhone: resolvedDriverPhone,
      pickupAddress,
      destinationAddress,
      pickupLat,
      pickupLng,
      destLat,
      destLng,
      emergencyType,
      status: initialStatus,
      fare,
      acceptedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryAmbulanceRequests.push(reqDoc);

    return res.status(201).json({
      success: true,
      message: 'Ambulance dispatched successfully',
      request: formatRequest(reqDoc),
      booking: formatRequest(reqDoc)
    });
  } catch (error) {
    console.error('[Ambulance Controller Create Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to dispatch ambulance request'
    });
  }
};

// @desc    Get ambulance requests (Role-scoped: Patient sees own, Partner sees assigned, Admin sees all)
// @route   GET /api/ambulance/requests
// @access  Private
const getAmbulanceRequests = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role;
    const currentUserId = String(userId);

    if (isSupabaseConfigured()) {
      let requests = [];
      if (userRole === 'PATIENT') {
        requests = await SupabaseDb.ambulanceRequests.find({ patientId: userId });
      } else if (userRole === 'AMBULANCE_PARTNER') {
        const all = await SupabaseDb.ambulanceRequests.find({});
        requests = all.filter((r) => {
          return (
            String(r.ambulanceId) === currentUserId ||
            (req.user.roleId && r.ambulanceId === req.user.roleId) ||
            r.driverName === req.user.name ||
            ['PENDING', 'Pending', 'REQUESTED', 'Requested', 'DISPATCHED', 'In Transit', 'IN_TRANSIT'].includes(r.status)
          );
        });
      } else {
        requests = await SupabaseDb.ambulanceRequests.find({});
      }

      return res.status(200).json({
        success: true,
        count: requests.length,
        requests: requests.map((r) => r.toJSON()),
        bookings: requests.map((r) => r.toJSON())
      });
    }

    if (mongoose.connection.readyState === 1) {
      let query = {};
      if (userRole === 'PATIENT') {
        query.$or = [
          { patientId: userId },
          { patientId: currentUserId }
        ];
      } else if (userRole === 'AMBULANCE_PARTNER') {
        const partnerIdentifiers = [currentUserId];
        if (req.user.roleId) partnerIdentifiers.push(req.user.roleId);
        query.$or = [
          { ambulanceId: { $in: partnerIdentifiers } },
          { driverName: req.user.name },
          { status: { $in: ['PENDING', 'Pending', 'REQUESTED', 'Requested', 'DISPATCHED', 'In Transit', 'IN_TRANSIT'] } }
        ];
      } else if (userRole !== 'ADMIN') {
        query.$or = [
          { patientId: userId },
          { patientId: currentUserId }
        ];
      }

      const requests = await AmbulanceRequest.find(query).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: requests.length,
        requests: requests.map((r) => r.toJSON()),
        bookings: requests.map((r) => r.toJSON())
      });
    }

    // Memory Store Fallback
    const filtered = inMemoryAmbulanceRequests.filter((r) => {
      if (userRole === 'ADMIN') return true;
      if (userRole === 'PATIENT') return String(r.patientId) === currentUserId;
      if (userRole === 'AMBULANCE_PARTNER') {
        return (
          String(r.ambulanceId) === currentUserId ||
          (req.user.roleId && r.ambulanceId === req.user.roleId) ||
          r.driverName === req.user.name ||
          r.status === 'Pending'
        );
      }
      return String(r.patientId) === currentUserId;
    });

    return res.status(200).json({
      success: true,
      count: filtered.length,
      requests: filtered.map(formatRequest),
      bookings: filtered.map(formatRequest)
    });
  } catch (error) {
    console.error('[Ambulance Controller Get Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch ambulance requests'
    });
  }
};

// @desc    Get single ambulance request by ID
// @route   GET /api/ambulance/requests/:id
// @access  Private
const getAmbulanceRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = String(req.user._id || req.user.id);
    const userRole = req.user.role;

    if (isSupabaseConfigured()) {
      const request = await SupabaseDb.ambulanceRequests.findById(id);
      if (!request) {
        return res.status(404).json({
          success: false,
          error: 'Ambulance request not found'
        });
      }

      const isPatientOwner = String(request.patientId) === currentUserId;
      const isAssignedDriver = String(request.ambulanceId) === currentUserId ||
        (req.user.roleId && request.ambulanceId === req.user.roleId) ||
        request.driverName === req.user.name;
      const isAdmin = userRole === 'ADMIN' || userRole === 'AMBULANCE_PARTNER';

      if (!isPatientOwner && !isAssignedDriver && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this ambulance emergency request'
        });
      }

      return res.status(200).json({
        success: true,
        request: request.toJSON(),
        booking: request.toJSON()
      });
    }

    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ambulance request ID format'
        });
      }

      const request = await AmbulanceRequest.findById(id);
      if (!request) {
        return res.status(404).json({
          success: false,
          error: 'Ambulance request not found'
        });
      }

      const isPatientOwner = String(request.patientId) === currentUserId;
      const isAssignedDriver = String(request.ambulanceId) === currentUserId ||
        (req.user.roleId && request.ambulanceId === req.user.roleId) ||
        request.driverName === req.user.name;
      const isAdmin = userRole === 'ADMIN' || userRole === 'AMBULANCE_PARTNER';

      if (!isPatientOwner && !isAssignedDriver && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this ambulance emergency request'
        });
      }

      return res.status(200).json({
        success: true,
        request: request.toJSON(),
        booking: request.toJSON()
      });
    }

    // Memory Store
    const reqItem = inMemoryAmbulanceRequests.find((r) => String(r._id) === id || String(r.id) === id);
    if (!reqItem) {
      return res.status(404).json({
        success: false,
        error: 'Ambulance request not found'
      });
    }

    const isPatientOwner = String(reqItem.patientId) === currentUserId;
    const isAssignedDriver = String(reqItem.ambulanceId) === currentUserId ||
      (req.user.roleId && reqItem.ambulanceId === req.user.roleId) ||
      reqItem.driverName === req.user.name;
    const isAdmin = userRole === 'ADMIN' || userRole === 'AMBULANCE_PARTNER';

    if (!isPatientOwner && !isAssignedDriver && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this ambulance emergency request'
      });
    }

    return res.status(200).json({
      success: true,
      request: formatRequest(reqItem),
      booking: formatRequest(reqItem)
    });
  } catch (error) {
    console.error('[Ambulance Controller GetById Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch ambulance request details'
    });
  }
};

// @desc    Update ambulance request status
// @route   PATCH /api/ambulance/requests/:id
// @access  Private
const updateAmbulanceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = String(req.user._id || req.user.id);
    const userRole = req.user.role;
    const { status, ambulanceId, vehicleNumber, driverName, driverPhone } = req.body;

    if (isSupabaseConfigured()) {
      const request = await SupabaseDb.ambulanceRequests.findById(id);
      if (!request) {
        return res.status(404).json({
          success: false,
          error: 'Ambulance request not found'
        });
      }

      const isPatientOwner = String(request.patientId) === currentUserId;
      const isAssignedDriver = String(request.ambulanceId) === currentUserId ||
        (req.user.roleId && request.ambulanceId === req.user.roleId) ||
        request.driverName === req.user.name;
      const isPartnerOrAdmin = userRole === 'AMBULANCE_PARTNER' || userRole === 'ADMIN';

      if (!isPatientOwner && !isAssignedDriver && !isPartnerOrAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to modify this ambulance request'
        });
      }

      if (isPatientOwner && !isPartnerOrAdmin && status && status !== 'Cancelled') {
        return res.status(403).json({
          success: false,
          error: 'Patients can only cancel ambulance requests'
        });
      }

      if (status) {
        request.status = status;
        if (status === 'Accepted' && !request.acceptedAt) request.acceptedAt = new Date();
        if (status === 'Completed') request.completedAt = new Date();
      }
      if (ambulanceId) request.ambulanceId = ambulanceId;
      if (vehicleNumber) request.vehicleNumber = vehicleNumber;
      if (driverName) request.driverName = driverName;
      if (driverPhone) request.driverPhone = driverPhone;

      await request.save();

      return res.status(200).json({
        success: true,
        message: 'Ambulance request updated successfully',
        request: request.toJSON(),
        booking: request.toJSON()
      });
    }

    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ambulance request ID format'
        });
      }

      const request = await AmbulanceRequest.findById(id);
      if (!request) {
        return res.status(404).json({
          success: false,
          error: 'Ambulance request not found'
        });
      }

      const isPatientOwner = String(request.patientId) === currentUserId;
      const isAssignedDriver = String(request.ambulanceId) === currentUserId ||
        (req.user.roleId && request.ambulanceId === req.user.roleId) ||
        request.driverName === req.user.name;
      const isPartnerOrAdmin = userRole === 'AMBULANCE_PARTNER' || userRole === 'ADMIN';

      if (!isPatientOwner && !isAssignedDriver && !isPartnerOrAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to modify this ambulance request'
        });
      }

      if (isPatientOwner && !isPartnerOrAdmin && status && status !== 'Cancelled') {
        return res.status(403).json({
          success: false,
          error: 'Patients can only cancel ambulance requests'
        });
      }

      if (status) {
        request.status = status;
        if (status === 'Accepted' && !request.acceptedAt) request.acceptedAt = new Date();
        if (status === 'Completed') request.completedAt = new Date();
      }
      if (ambulanceId) request.ambulanceId = ambulanceId;
      if (vehicleNumber) request.vehicleNumber = vehicleNumber;
      if (driverName) request.driverName = driverName;
      if (driverPhone) request.driverPhone = driverPhone;

      await request.save();

      return res.status(200).json({
        success: true,
        message: 'Ambulance request updated successfully',
        request: request.toJSON(),
        booking: request.toJSON()
      });
    }

    // Memory Store
    const reqDoc = inMemoryAmbulanceRequests.find((r) => String(r._id) === id || String(r.id) === id);
    if (!reqDoc) {
      return res.status(404).json({
        success: false,
        error: 'Ambulance request not found'
      });
    }

    const isPatientOwner = String(reqDoc.patientId) === currentUserId;
    const isAssignedDriver = String(reqDoc.ambulanceId) === currentUserId ||
      (req.user.roleId && reqDoc.ambulanceId === req.user.roleId) ||
      reqDoc.driverName === req.user.name;
    const isPartnerOrAdmin = userRole === 'AMBULANCE_PARTNER' || userRole === 'ADMIN';

    if (!isPatientOwner && !isAssignedDriver && !isPartnerOrAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify this ambulance request'
      });
    }

    if (isPatientOwner && !isPartnerOrAdmin && status && status !== 'Cancelled') {
      return res.status(403).json({
        success: false,
        error: 'Patients can only cancel ambulance requests'
      });
    }

    if (status) {
      reqDoc.status = status;
      if (status === 'Accepted' && !reqDoc.acceptedAt) reqDoc.acceptedAt = new Date();
      if (status === 'Completed') reqDoc.completedAt = new Date();
    }
    if (ambulanceId) reqDoc.ambulanceId = ambulanceId;
    if (vehicleNumber) reqDoc.vehicleNumber = vehicleNumber;
    if (driverName) reqDoc.driverName = driverName;
    if (driverPhone) reqDoc.driverPhone = driverPhone;
    reqDoc.updatedAt = new Date();

    return res.status(200).json({
      success: true,
      message: 'Ambulance request updated successfully',
      request: formatRequest(reqDoc),
      booking: formatRequest(reqDoc)
    });
  } catch (error) {
    console.error('[Ambulance Controller Update Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update ambulance request'
    });
  }
};

module.exports = {
  createAmbulanceRequest,
  getAmbulanceRequests,
  getAmbulanceRequestById,
  updateAmbulanceRequest
};
