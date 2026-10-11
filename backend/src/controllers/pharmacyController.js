const { SupabaseDb, isSupabaseConfigured } = require('../services/supabaseDbService');

// @desc    Create a new Pharmacy Order
// @route   POST /api/pharmacy/orders
// @access  Private (Authenticated Patient / User)
const createPharmacyOrder = async (req, res) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(500).json({
        success: false,
        error: 'Database service is unconfigured. Supabase PostgreSQL is required.'
      });
    }

    const {
      pharmacyId,
      pharmacyName,
      items,
      totalAmount,
      totalPrice,
      deliveryAddress = '',
      prescriptionId = '',
      date
    } = req.body;

    if (!pharmacyId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Pharmacy ID and a non-empty items array are required'
      });
    }

    const calculatedTotal = (totalAmount !== undefined && totalAmount !== null)
      ? Number(totalAmount)
      : (totalPrice !== undefined && totalPrice !== null)
        ? Number(totalPrice)
        : items.reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.quantity || 1)), 0);

    const patientId = req.user._id || req.user.id;
    const patientName = req.user.name || 'Patient User';
    const orderDate = date || new Date().toISOString().split('T')[0];
    const resolvedPharmacyName = pharmacyName || 'Jivexa Partner Pharmacy';

    const newOrder = await SupabaseDb.pharmacyOrders.create({
      patientId,
      patientName,
      pharmacyId: String(pharmacyId),
      pharmacyName: resolvedPharmacyName,
      items,
      totalAmount: calculatedTotal,
      totalPrice: calculatedTotal,
      status: 'Pending',
      deliveryAddress,
      paymentStatus: 'Pending',
      prescriptionId,
      date: orderDate
    });

    return res.status(201).json({
      success: true,
      message: 'Pharmacy order placed successfully',
      order: newOrder.toJSON()
    });
  } catch (error) {
    console.error('[Pharmacy Controller Create Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to place pharmacy order'
    });
  }
};

// @desc    Get pharmacy orders (Role-scoped: Patient sees own, Pharmacy sees assigned, Admin sees all)
// @route   GET /api/pharmacy/orders
// @access  Private
const getPharmacyOrders = async (req, res) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(500).json({
        success: false,
        error: 'Database service is unconfigured. Supabase PostgreSQL is required.'
      });
    }

    const userId = req.user._id || req.user.id;
    const userRole = req.user.role;
    const currentUserId = String(userId);

    const allOrders = await SupabaseDb.pharmacyOrders.find();
    const filtered = allOrders.filter((ord) => {
      if (userRole === 'ADMIN') return true;
      if (userRole === 'PATIENT') return String(ord.patientId) === currentUserId;
      if (userRole === 'PHARMACY') {
        return (
          String(ord.pharmacyId) === currentUserId ||
          (req.user.roleId && ord.pharmacyId === req.user.roleId) ||
          ord.pharmacyName === req.user.name
        );
      }
      return String(ord.patientId) === currentUserId;
    });

    return res.status(200).json({
      success: true,
      count: filtered.length,
      orders: filtered.map((o) => o.toJSON())
    });
  } catch (error) {
    console.error('[Pharmacy Controller Get Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch pharmacy orders'
    });
  }
};

// @desc    Get single pharmacy order by ID
// @route   GET /api/pharmacy/orders/:id
// @access  Private
const getPharmacyOrderById = async (req, res) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(500).json({
        success: false,
        error: 'Database service is unconfigured. Supabase PostgreSQL is required.'
      });
    }

    const { id } = req.params;
    const currentUserId = String(req.user._id || req.user.id);
    const userRole = req.user.role;

    const order = await SupabaseDb.pharmacyOrders.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Pharmacy order not found'
      });
    }

    const isPatientOwner = String(order.patientId) === currentUserId;
    const isPharmacyPartner = String(order.pharmacyId) === currentUserId ||
      (req.user.roleId && order.pharmacyId === req.user.roleId) ||
      order.pharmacyName === req.user.name;
    const isAdmin = userRole === 'ADMIN';

    if (!isPatientOwner && !isPharmacyPartner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this pharmacy order'
      });
    }

    return res.status(200).json({
      success: true,
      order: order.toJSON()
    });
  } catch (error) {
    console.error('[Pharmacy Controller GetById Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch pharmacy order details'
    });
  }
};

// @desc    Update pharmacy order status
// @route   PATCH /api/pharmacy/orders/:id
// @access  Private
const updatePharmacyOrder = async (req, res) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(500).json({
        success: false,
        error: 'Database service is unconfigured. Supabase PostgreSQL is required.'
      });
    }

    const { id } = req.params;
    const currentUserId = String(req.user._id || req.user.id);
    const userRole = req.user.role;
    const { status, paymentStatus, deliveryAddress } = req.body;

    const order = await SupabaseDb.pharmacyOrders.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Pharmacy order not found'
      });
    }

    const isPatientOwner = String(order.patientId) === currentUserId;
    const isPharmacyPartner = String(order.pharmacyId) === currentUserId ||
      (req.user.roleId && order.pharmacyId === req.user.roleId) ||
      order.pharmacyName === req.user.name;
    const isAdmin = userRole === 'ADMIN';

    if (!isPatientOwner && !isPharmacyPartner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify this pharmacy order'
      });
    }

    if (isPatientOwner && !isPharmacyPartner && !isAdmin && status && status !== 'Cancelled') {
      return res.status(403).json({
        success: false,
        error: 'Patients can only cancel pending orders'
      });
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (deliveryAddress) order.deliveryAddress = deliveryAddress;

    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Pharmacy order updated successfully',
      order: order.toJSON()
    });
  } catch (error) {
    console.error('[Pharmacy Controller Update Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update pharmacy order'
    });
  }
};

module.exports = {
  createPharmacyOrder,
  getPharmacyOrders,
  getPharmacyOrderById,
  updatePharmacyOrder
};
