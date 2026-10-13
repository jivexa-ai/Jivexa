const { MongoDb } = require('../services/mongoDbService');

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

    const newRequest = await MongoDb.ambulanceRequests.create({
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
      request: newRequest.toJSON ? newRequest.toJSON() : newRequest,
      booking: newRequest.toJSON ? newRequest.toJSON() : newRequest
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

    let requests = [];
    if (userRole === 'PATIENT') {
      requests = await MongoDb.ambulanceRequests.find({ patientId: currentUserId });
    } else if (userRole === 'AMBULANCE_PARTNER') {
      const all = await MongoDb.ambulanceRequests.find({});
      requests = all.filter((r) => {
        return (
          String(r.ambulanceId) === currentUserId ||
          (req.user.roleId && r.ambulanceId === req.user.roleId) ||
          r.driverName === req.user.name ||
          ['PENDING', 'Pending', 'REQUESTED', 'Requested', 'DISPATCHED', 'In Transit', 'IN_TRANSIT'].includes(r.status)
        );
      });
    } else {
      requests = await MongoDb.ambulanceRequests.find({});
    }

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests: requests.map((r) => (r.toJSON ? r.toJSON() : r)),
      bookings: requests.map((r) => (r.toJSON ? r.toJSON() : r))
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

    const request = await MongoDb.ambulanceRequests.findById(id);
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
      request: request.toJSON ? request.toJSON() : request,
      booking: request.toJSON ? request.toJSON() : request
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

    const request = await MongoDb.ambulanceRequests.findById(id);
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
      request: request.toJSON ? request.toJSON() : request,
      booking: request.toJSON ? request.toJSON() : request
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
