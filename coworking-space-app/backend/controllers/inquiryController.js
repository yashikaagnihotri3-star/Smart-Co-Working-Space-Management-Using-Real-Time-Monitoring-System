const { Op } = require('sequelize');
const Inquiry = require('../models/Inquiry');
const Workspace = require('../models/Workspace');
const User = require('../models/User');

// POST /api/inquiries (user)
const createInquiry = async (req, res) => {
  try {
    const { workspaceId, message } = req.body;
    const workspace = await Workspace.findByPk(workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    const inquiry = await Inquiry.create({
      userId: req.user.id,
      workspaceId,
      message,
    });
    res.status(201).json({ inquiry: inquiry.toClientObject() });
  } catch (err) {
    res.status(400).json({ message: 'Failed to create inquiry', error: err.message });
  }
};

// GET /api/inquiries/mine (user)
const getMyInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.findAll({
      where: { userId: req.user.id },
      include: [{ model: Workspace, as: 'workspace' }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ inquiries: inquiries.map((i) => i.toClientObject()) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch inquiries', error: err.message });
  }
};

// GET /api/inquiries/owner (space_owner)
const getOwnerInquiries = async (req, res) => {
  try {
    const myWorkspaces = await Workspace.findAll({ where: { ownerId: req.user.id }, attributes: ['id'] });
    const workspaceIds = myWorkspaces.map((w) => w.id);

    const inquiries = await Inquiry.findAll({
      where: { workspaceId: { [Op.in]: workspaceIds } },
      include: [
        { model: User, as: 'user' },
        { model: Workspace, as: 'workspace' },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ inquiries: inquiries.map((i) => i.toClientObject()) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch inquiries', error: err.message });
  }
};

// PUT /api/inquiries/:id/respond (space_owner)
const respondToInquiry = async (req, res) => {
  try {
    const { response } = req.body;
    const inquiry = await Inquiry.findByPk(req.params.id, {
      include: [{ model: Workspace, as: 'workspace' }],
    });
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

    const isOwner = inquiry.workspace.ownerId === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to respond to this inquiry' });
    }

    inquiry.response = response;
    inquiry.status = 'responded';
    await inquiry.save();

    res.json({ inquiry: inquiry.toClientObject() });
  } catch (err) {
    res.status(400).json({ message: 'Failed to respond to inquiry', error: err.message });
  }
};

module.exports = { createInquiry, getMyInquiries, getOwnerInquiries, respondToInquiry };
