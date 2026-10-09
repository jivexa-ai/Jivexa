const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createAmbulanceRequest,
  getAmbulanceRequests,
  getAmbulanceRequestById,
  updateAmbulanceRequest
} = require('../controllers/ambulanceController');

// All ambulance endpoints are protected with JWT
router.use(protect);

router.route('/requests')
  .post(createAmbulanceRequest)
  .get(getAmbulanceRequests);

router.route('/requests/:id')
  .get(getAmbulanceRequestById)
  .patch(updateAmbulanceRequest);

module.exports = router;
