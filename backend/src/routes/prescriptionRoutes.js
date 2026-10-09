const express = require('express');
const router = express.Router();
const {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  updatePrescription
} = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');

// All prescription routes require authentication
router.use(protect);

router.post('/', createPrescription);
router.get('/', getPrescriptions);
router.get('/:id', getPrescriptionById);
router.patch('/:id', updatePrescription);

module.exports = router;
