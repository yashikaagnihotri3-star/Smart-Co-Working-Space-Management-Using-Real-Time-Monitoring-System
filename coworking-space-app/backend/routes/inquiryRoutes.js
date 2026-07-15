const express = require('express');
const {
  createInquiry,
  getMyInquiries,
  getOwnerInquiries,
  respondToInquiry,
} = require('../controllers/inquiryController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('user'), createInquiry);
router.get('/mine', protect, authorize('user'), getMyInquiries);
router.get('/owner', protect, authorize('space_owner', 'admin'), getOwnerInquiries);
router.put('/:id/respond', protect, authorize('space_owner', 'admin'), respondToInquiry);

module.exports = router;
