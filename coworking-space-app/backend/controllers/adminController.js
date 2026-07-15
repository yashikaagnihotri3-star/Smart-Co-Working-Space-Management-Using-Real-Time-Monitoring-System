const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Booking = require('../models/Booking');
const Inquiry = require('../models/Inquiry');

// GET /api/admin/stats - Key Performance Indicators
const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalOwners,
      totalWorkspaces,
      totalBookings,
      confirmedBookings,
      completedBookings,
      totalInquiries,
    ] = await Promise.all([
      User.count({ where: { role: 'user' } }),
      User.count({ where: { role: 'space_owner' } }),
      Workspace.count(),
      Booking.count(),
      Booking.count({ where: { status: 'confirmed' } }),
      Booking.count({ where: { status: 'completed' } }),
      Inquiry.count(),
    ]);

    const bookingCompletionRate =
      totalBookings === 0 ? 0 : Math.round((completedBookings / totalBookings) * 100);

    const conversionRate =
      totalBookings === 0
        ? 0
        : Math.round(((confirmedBookings + completedBookings) / totalBookings) * 100);

    res.json({
      registeredUsers: totalUsers,
      registeredOwners: totalOwners,
      totalWorkspaces,
      totalBookings,
      confirmedBookings,
      completedBookings,
      bookingCompletionRate,
      searchToBookingConversionRate: conversionRate,
      totalInquiries,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats', error: err.message });
  }
};

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ users: users.map((u) => u.toSafeObject()) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

// PUT /api/admin/users/:id/toggle-active
const toggleUserActive = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
};

// GET /api/admin/workspaces
const getAllWorkspacesAdmin = async (req, res) => {
  try {
    const workspaces = await Workspace.findAll({
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ workspaces: workspaces.map((w) => w.toClientObject()) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch workspaces', error: err.message });
  }
};

// PUT /api/admin/workspaces/:id/toggle-active
const toggleWorkspaceActive = async (req, res) => {
  try {
    const workspace = await Workspace.findByPk(req.params.id);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    workspace.isActive = !workspace.isActive;
    await workspace.save();
    res.json({ workspace: workspace.toClientObject() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update workspace', error: err.message });
  }
};

module.exports = {
  getStats,
  getAllUsers,
  toggleUserActive,
  getAllWorkspacesAdmin,
  toggleWorkspaceActive,
};
