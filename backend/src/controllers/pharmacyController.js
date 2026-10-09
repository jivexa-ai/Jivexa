const mongoose = require('mongoose');
const PharmacyOrder = require('../models/PharmacyOrder');
const User = require('../models/User');
const { SupabaseDb, isSupabaseConfigured } = require('../services/supabaseDbService');

// Fallback in-memory store for offline/test environments
const inMemoryOrders = [];

const formatOrder = (item) => ({
  id: String(item._id || item.id),
  _id: item._id || item.id,
  patientId: item.patientId,
  patientName: item.patientName,
  pharmacyId: item.pharmacyId,
  pharmacyName: item.pharmacyName,
  items: item.items,
  totalAmount: item.totalAmount || item.totalPrice,
  totalPrice: item.totalPrice || item.totalAmount,
  status: item.status,
  deliveryAddress: item.deliveryAddress || '',
  paymentStatus: item.paymentStatus || 'Pending',
  prescriptionId: item.prescriptionId || '',
  date: item.date,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
  toJSON() { return this; }
});

// @desc    Create a new Pharmacy Order
// @route   POST /api/pharmacy/orders
// @access  Private (Authenticated Patient / User)
const createPharmacyOrder = async (req, res) => {
  try {
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

    if (isSupabaseConfigured()) {
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
    }

    if (mongoose.connection.readyState === 1) {
      const newOrder = await PharmacyOrder.create({
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
    }

    // Memory Store Fallback
    const newId = new mongoose.Types.ObjectId();
    const orderDoc = {
      _id: newId,
      id: newId.toString(),
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
      date: orderDate,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    inMemoryOrders.push(orderDoc);

    return res.status(201).json({
      success: true,
      message: 'Pharmacy order placed successfully',
      order: formatOrder(orderDoc)
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
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role;
    const currentUserId = String(userId);

    if (isSupabaseConfigured()) {
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
    }

    if (mongoose.connection.readyState === 1) {
      let query = {};
      if (userRole === 'PATIENT') {
        query.$or = [
          { patientId: userId },
          { patientId: currentUserId }
        ];
      } else if (userRole === 'PHARMACY') {
        const pharmIdentifiers = [currentUserId];
        if (req.user.roleId) pharmIdentifiers.push(req.user.roleId);
        query.$or = [
          { pharmacyId: { $in: pharmIdentifiers } },
          { pharmacyName: req.user.name }
        ];
      } else if (userRole !== 'ADMIN') {
        query.$or = [
          { patientId: userId },
          { patientId: currentUserId }
        ];
      }

      const orders = await PharmacyOrder.find(query).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: orders.length,
        orders: orders.map((o) => o.toJSON())
      });
    }

    // Memory Store Fallback
    const filtered = inMemoryOrders.filter((ord) => {
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
      orders: filtered.map(formatOrder)
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
    const { id } = req.params;
    const currentUserId = String(req.user._id || req.user.id);
    const userRole = req.user.role;

    if (isSupabaseConfigured()) {
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
    }

    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid pharmacy order ID format'
        });
      }

      const order = await PharmacyOrder.findById(id);
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
    }

    // Memory Store
    const ord = inMemoryOrders.find((o) => String(o._id) === id || String(o.id) === id);
    if (!ord) {
      return res.status(404).json({
        success: false,
        error: 'Pharmacy order not found'
      });
    }

    const isPatientOwner = String(ord.patientId) === currentUserId;
    const isPharmacyPartner = String(ord.pharmacyId) === currentUserId ||
      (req.user.roleId && ord.pharmacyId === req.user.roleId) ||
      ord.pharmacyName === req.user.name;
    const isAdmin = userRole === 'ADMIN';

    if (!isPatientOwner && !isPharmacyPartner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this pharmacy order'
      });
    }

    return res.status(200).json({
      success: true,
      order: formatOrder(ord)
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
    const { id } = req.params;
    const currentUserId = String(req.user._id || req.user.id);
    const userRole = req.user.role;
    const { status, paymentStatus, deliveryAddress } = req.body;

    if (isSupabaseConfigured()) {
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
    }
    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid pharmacy order ID format'
        });
      }

      const order = await PharmacyOrder.findById(id);
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
    }

    // Memory Store
    const ord = inMemoryOrders.find((o) => String(o._id) === id || String(o.id) === id);
    if (!ord) {
      return res.status(404).json({
        success: false,
        error: 'Pharmacy order not found'
      });
    }

    const isPatientOwner = String(ord.patientId) === currentUserId;
    const isPharmacyPartner = String(ord.pharmacyId) === currentUserId ||
      (req.user.roleId && ord.pharmacyId === req.user.roleId) ||
      ord.pharmacyName === req.user.name;
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

    if (status) ord.status = status;
    if (paymentStatus) ord.paymentStatus = paymentStatus;
    if (deliveryAddress) ord.deliveryAddress = deliveryAddress;
    ord.updatedAt = new Date();

    return res.status(200).json({
      success: true,
      message: 'Pharmacy order updated successfully',
      order: formatOrder(ord)
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
