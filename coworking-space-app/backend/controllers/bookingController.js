const { Op } = require('sequelize');
const Booking = require('../models/Booking');
const Workspace = require('../models/Workspace');
const User = require('../models/User');

const priceMultiplier = (unit, startDate, endDate) => {
  const ms = new Date(endDate) - new Date(startDate);
  const days = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  if (unit === 'hour') return Math.max(1, Math.ceil(ms / (1000 * 60 * 60)));
  if (unit === 'month') return Math.max(1, Math.ceil(days / 30));
  return days;
};

// POST /api/bookings (user)
const createBooking = async (req, res) => {
  try {
    const { workspaceId, numberOfPersons, startDate, endDate, notes } = req.body;

    const workspace = await Workspace.findByPk(workspaceId);
    if (!workspace || !workspace.isActive) {
      return res.status(404).json({ message: 'Workspace not found or unavailable' });
    }
    if (workspace.availableSlots <= 0) {
      return res.status(400).json({ message: 'No availability for this workspace right now' });
    }
    if (numberOfPersons > workspace.seatingCapacity) {
      return res.status(400).json({
        message: `This workspace seats up to ${workspace.seatingCapacity} people`,
      });
    }

    const units = priceMultiplier(workspace.priceUnit, startDate, endDate);
    const totalPrice = units * workspace.priceAmount;

    const booking = await Booking.create({
      userId: req.user.id,
      workspaceId: workspace.id,
      numberOfPersons,
      startDate,
      endDate,
      totalPrice,
      notes,
    });

    res.status(201).json({ booking: booking.toClientObject() });
  } catch (err) {
    res.status(400).json({ message: 'Failed to create booking', error: err.message });
  }
};

// GET /api/bookings/mine (user)
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [{ model: Workspace, as: 'workspace' }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ bookings: bookings.map((b) => b.toClientObject()) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: err.message });
  }
};

// GET /api/bookings/owner (space_owner) - bookings for workspaces they own
const getOwnerBookings = async (req, res) => {
  try {
    const myWorkspaces = await Workspace.findAll({ where: { ownerId: req.user.id }, attributes: ['id'] });
    const workspaceIds = myWorkspaces.map((w) => w.id);

    const bookings = await Booking.findAll({
      where: { workspaceId: { [Op.in]: workspaceIds } },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { model: Workspace, as: 'workspace' },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ bookings: bookings.map((b) => b.toClientObject()) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: err.message });
  }
};

// PUT /api/bookings/:id/status (space_owner) - confirm / reject
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Workspace, as: 'workspace' }],
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const isOwner = booking.workspace.ownerId === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    const wasConfirmed = booking.status === 'confirmed';
    booking.status = status;
    await booking.save();

    const workspace = booking.workspace;
    if (status === 'confirmed' && !wasConfirmed) {
      workspace.availableSlots = Math.max(0, workspace.availableSlots - 1);
      await workspace.save();
    } else if (['rejected', 'cancelled'].includes(status) && wasConfirmed) {
      workspace.availableSlots += 1;
      await workspace.save();
    }

    res.json({ booking: booking.toClientObject() });
  } catch (err) {
    res.status(400).json({ message: 'Failed to update booking status', error: err.message });
  }
};

// PUT /api/bookings/:id/cancel (user - cancel their own booking)
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id, {
      include: [{ model: Workspace, as: 'workspace' }],
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    const wasConfirmed = booking.status === 'confirmed';
    booking.status = 'cancelled';
    await booking.save();

    if (wasConfirmed) {
      const workspace = booking.workspace;
      workspace.availableSlots += 1;
      await workspace.save();
    }

    res.json({ booking: booking.toClientObject() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel booking', error: err.message });
  }
};

// GET /api/bookings (admin) - all bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Workspace, as: 'workspace' },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ bookings: bookings.map((b) => b.toClientObject()) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: err.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  updateBookingStatus,
  cancelBooking,
  getAllBookings,
};
