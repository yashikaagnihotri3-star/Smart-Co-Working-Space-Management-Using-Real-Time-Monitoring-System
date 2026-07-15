const express = require('express');
const {
  getStats,
  getAllUsers,
  toggleUserActive,
  getAllWorkspacesAdmin,
  toggleWorkspaceActive,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-active', toggleUserActive);
router.get('/workspaces', getAllWorkspacesAdmin);
router.put('/workspaces/:id/toggle-active', toggleWorkspaceActive);

module.exports = router;
