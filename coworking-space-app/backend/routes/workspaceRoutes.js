const express = require('express');
const {
  getWorkspaces,
  getWorkspaceById,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getMyWorkspaces,
} = require('../controllers/workspaceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public: browse & search
router.get('/', getWorkspaces);

// Owner: manage own listings (must be before /:id to avoid route collision)
router.get('/mine/list', protect, authorize('space_owner', 'admin'), getMyWorkspaces);

router.get('/:id', getWorkspaceById);

router.post('/', protect, authorize('space_owner', 'admin'), createWorkspace);
router.put('/:id', protect, authorize('space_owner', 'admin'), updateWorkspace);
router.delete('/:id', protect, authorize('space_owner', 'admin'), deleteWorkspace);

module.exports = router;
