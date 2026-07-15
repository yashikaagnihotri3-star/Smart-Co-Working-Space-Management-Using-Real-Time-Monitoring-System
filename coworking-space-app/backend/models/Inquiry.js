const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inquiry = sequelize.define('Inquiry', {
  message: { type: DataTypes.TEXT, allowNull: false },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'open',
    validate: { isIn: [['open', 'responded', 'closed']] },
  },
  response: { type: DataTypes.TEXT, defaultValue: '' },
});

// Shapes the response to match what the frontend expects (nested user/workspace, `_id`)
Inquiry.prototype.toClientObject = function () {
  return {
    _id: this.id,
    user: this.user
      ? {
          _id: this.user.id,
          name: this.user.name,
          email: this.user.email,
          phone: this.user.phone,
          profile: {
            teamSize: this.user.profileTeamSize,
            budget: this.user.profileBudget,
            preferredLocation: this.user.profilePreferredLocation,
            workStyle: this.user.profileWorkStyle,
          },
        }
      : this.userId,
    workspace: this.workspace ? { _id: this.workspace.id, name: this.workspace.name } : this.workspaceId,
    message: this.message,
    status: this.status,
    response: this.response,
    createdAt: this.createdAt,
  };
};

module.exports = Inquiry;
