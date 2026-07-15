const { Op } = require('sequelize');
const Workspace = require('../models/Workspace');
const User = require('../models/User');

// Computes a 0-100 match score for a workspace against user-supplied criteria.
const computeMatchScore = (workspace, criteria) => {
  let score = 0;
  let maxScore = 0;

  if (criteria.teamSize) {
    maxScore += 30;
    if (workspace.seatingCapacity >= criteria.teamSize) {
      const slack = workspace.seatingCapacity - criteria.teamSize;
      score += slack <= 5 ? 30 : slack <= 15 ? 22 : 12;
    }
  }

  if (criteria.budget) {
    maxScore += 30;
    if (workspace.priceAmount <= criteria.budget) {
      const ratio = workspace.priceAmount / criteria.budget;
      score += ratio >= 0.6 ? 30 : 22;
    }
  }

  if (criteria.location) {
    maxScore += 20;
    if (workspace.city.toLowerCase() === criteria.location.toLowerCase()) {
      score += 20;
    }
  }

  if (criteria.amenities && criteria.amenities.length) {
    maxScore += 15;
    const workspaceAmenities = workspace.amenities || [];
    const overlap = criteria.amenities.filter((a) => workspaceAmenities.includes(a));
    score += (overlap.length / criteria.amenities.length) * 15;
  }

  if (criteria.workStyle) {
    maxScore += 5;
    const tags = workspace.workStyleTags || [];
    if (tags.some((tag) => tag.toLowerCase() === criteria.workStyle.toLowerCase())) {
      score += 5;
    }
  }

  if (maxScore === 0) return null;
  return Math.round((score / maxScore) * 100);
};

// GET /api/workspaces
const getWorkspaces = async (req, res) => {
  try {
    const {
      city,
      workspaceType,
      minBudget,
      maxBudget,
      teamSize,
      amenities,
      workStyle,
      sortByMatch,
      page = 1,
      limit = 12,
    } = req.query;

    const where = { isActive: true };
    if (city) where.city = city;
    if (workspaceType) where.workspaceType = workspaceType;
    if (teamSize) where.seatingCapacity = { [Op.gte]: Number(teamSize) };
    if (minBudget || maxBudget) {
      where.priceAmount = {};
      if (minBudget) where.priceAmount[Op.gte] = Number(minBudget);
      if (maxBudget) where.priceAmount[Op.lte] = Number(maxBudget);
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { rows, count } = await Workspace.findAndCountAll({
      where,
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email', 'phone'] }],
      offset,
      limit: Number(limit),
      order: [['createdAt', 'DESC']],
    });

    const amenityList = amenities ? amenities.split(',').map((a) => a.trim()) : [];

    let filtered = rows;
    if (amenityList.length) {
      filtered = rows.filter((w) => amenityList.every((a) => (w.amenities || []).includes(a)));
    }

    const criteria = {
      teamSize: teamSize ? Number(teamSize) : null,
      budget: maxBudget ? Number(maxBudget) : null,
      location: city || null,
      amenities: amenityList,
      workStyle: workStyle || null,
    };

    let results = filtered.map((w) => w.toClientObject({ matchScore: computeMatchScore(w, criteria) }));

    if (sortByMatch === 'true') {
      results = results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    res.json({
      results,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(count / Number(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch workspaces', error: err.message });
  }
};

// GET /api/workspaces/:id
const getWorkspaceById = async (req, res) => {
  try {
    const workspace = await Workspace.findByPk(req.params.id, {
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'email', 'phone'] }],
    });
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    res.json({ workspace: workspace.toClientObject() });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch workspace', error: err.message });
  }
};

// POST /api/workspaces (space_owner only)
const createWorkspace = async (req, res) => {
  try {
    const { location, pricing, availability, ...rest } = req.body;

    const workspace = await Workspace.create({
      ...rest,
      ownerId: req.user.id,
      city: location?.city,
      address: location?.address,
      lat: location?.lat,
      lng: location?.lng,
      priceAmount: pricing?.amount,
      priceUnit: pricing?.unit,
      totalSlots: availability?.totalSlots,
      availableSlots: availability?.availableSlots || availability?.totalSlots,
    });

    res.status(201).json({ workspace: workspace.toClientObject() });
  } catch (err) {
    res.status(400).json({ message: 'Failed to create workspace', error: err.message });
  }
};

// PUT /api/workspaces/:id (owner of the workspace, or admin)
const updateWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findByPk(req.params.id);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    const isOwner = workspace.ownerId === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this workspace' });
    }

    const { location, pricing, availability, ...rest } = req.body;

    Object.assign(workspace, rest);
    if (location) {
      if (location.city !== undefined) workspace.city = location.city;
      if (location.address !== undefined) workspace.address = location.address;
      if (location.lat !== undefined) workspace.lat = location.lat;
      if (location.lng !== undefined) workspace.lng = location.lng;
    }
    if (pricing) {
      if (pricing.amount !== undefined) workspace.priceAmount = pricing.amount;
      if (pricing.unit !== undefined) workspace.priceUnit = pricing.unit;
    }
    if (availability) {
      if (availability.totalSlots !== undefined) workspace.totalSlots = availability.totalSlots;
      if (availability.availableSlots !== undefined) workspace.availableSlots = availability.availableSlots;
    }

    await workspace.save();
    res.json({ workspace: workspace.toClientObject() });
  } catch (err) {
    res.status(400).json({ message: 'Failed to update workspace', error: err.message });
  }
};

// DELETE /api/workspaces/:id (owner or admin)
const deleteWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findByPk(req.params.id);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    const isOwner = workspace.ownerId === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this workspace' });
    }

    await workspace.destroy();
    res.json({ message: 'Workspace deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete workspace', error: err.message });
  }
};

// GET /api/workspaces/mine/list (space_owner)
const getMyWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.findAll({
      where: { ownerId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json({ workspaces: workspaces.map((w) => w.toClientObject()) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your workspaces', error: err.message });
  }
};

module.exports = {
  getWorkspaces,
  getWorkspaceById,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getMyWorkspaces,
};
