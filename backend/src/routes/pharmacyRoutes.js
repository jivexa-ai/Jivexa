const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createPharmacyOrder,
  getPharmacyOrders,
  getPharmacyOrderById,
  updatePharmacyOrder
} = require('../controllers/pharmacyController');

// All pharmacy order routes are protected with JWT
router.use(protect);

router.route('/orders')
  .post(createPharmacyOrder)
  .get(getPharmacyOrders);

router.route('/orders/:id')
  .get(getPharmacyOrderById)
  .patch(updatePharmacyOrder);

module.exports = router;
