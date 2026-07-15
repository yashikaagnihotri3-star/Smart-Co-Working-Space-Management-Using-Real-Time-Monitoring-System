const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define(
  'User',
  {
    name: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue('email', value.toLowerCase().trim());
      },
    },
    password: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'user',
      validate: { isIn: [['user', 'space_owner', 'admin']] },
    },
    // Flattened "profile" fields, reassembled into a nested object in toSafeObject()
    profileTeamSize: { type: DataTypes.INTEGER, defaultValue: 1 },
    profileBudget: { type: DataTypes.FLOAT, defaultValue: 0 },
    profilePreferredLocation: { type: DataTypes.STRING, defaultValue: '' },
    profileWorkStyle: { type: DataTypes.STRING, defaultValue: '' },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  {
    hooks: {
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(user.password, 10);
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Shapes the response to match what the frontend expects (nested `profile`, `_id`)
User.prototype.toSafeObject = function () {
  return {
    _id: this.id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    role: this.role,
    isActive: this.isActive,
    createdAt: this.createdAt,
    profile: {
      teamSize: this.profileTeamSize,
      budget: this.profileBudget,
      preferredLocation: this.profilePreferredLocation,
      workStyle: this.profileWorkStyle,
    },
  };
};

module.exports = User;
