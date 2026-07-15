const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, profile } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    // Only allow user / space_owner at signup. Admins are seeded/promoted separately.
    const allowedRole = ['user', 'space_owner'].includes(role) ? role : 'user';

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: allowedRole,
      profileTeamSize: profile?.teamSize,
      profileBudget: profile?.budget,
      profilePreferredLocation: profile?.preferredLocation,
      profileWorkStyle: profile?.workStyle,
    });

    const token = generateToken(user.id);
    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'This account has been deactivated' });
    }

    const token = generateToken(user.id);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
};

// PUT /api/auth/me
const updateMe = async (req, res) => {
  try {
    const { name, phone, profile } = req.body;
    if (name) req.user.name = name;
    if (phone) req.user.phone = phone;
    if (profile) {
      if (profile.teamSize !== undefined) req.user.profileTeamSize = profile.teamSize;
      if (profile.budget !== undefined) req.user.profileBudget = profile.budget;
      if (profile.preferredLocation !== undefined) req.user.profilePreferredLocation = profile.preferredLocation;
      if (profile.workStyle !== undefined) req.user.profileWorkStyle = profile.workStyle;
    }
    await req.user.save();
    res.json({ user: req.user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

module.exports = { register, login, getMe, updateMe };
