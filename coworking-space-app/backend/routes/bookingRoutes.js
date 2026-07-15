const express = require('express');
const {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  updateBookingStatus,
  cancelBooking,
  getAllBookings,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('user'), createBooking);
router.get('/mine', protect, authorize('user'), getMyBookings);
router.get('/owner', protect, authorize('space_owner', 'admin'), getOwnerBookings);
router.put('/:id/status', protect, authorize('space_owner', 'admin'), updateBookingStatus);
router.put('/:id/cancel', protect, authorize('user'), cancelBooking);
router.get('/', protect, authorize('admin'), getAllBookings);

module.exports = router;
