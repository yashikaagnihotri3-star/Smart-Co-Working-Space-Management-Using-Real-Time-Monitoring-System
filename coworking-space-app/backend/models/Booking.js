const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Booking = sequelize.define('Booking', {
  numberOfPersons: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  startDate: { type: DataTypes.DATE, allowNull: false },
  endDate: { type: DataTypes.DATE, allowNull: false },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
    validate: { isIn: [['pending', 'confirmed', 'rejected', 'cancelled', 'completed']] },
  },
  totalPrice: { type: DataTypes.FLOAT, allowNull: false },
  notes: { type: DataTypes.TEXT, defaultValue: '' },
});

// Shapes the response to match what the frontend expects (nested user/workspace, `_id`)
Booking.prototype.toClientObject = function () {
  return {
    _id: this.id,
    user: this.user
      ? { _id: this.user.id, name: this.user.name, email: this.user.email, phone: this.user.phone }
      : this.userId,
    workspace: this.workspace
      ? {
          _id: this.workspace.id,
          name: this.workspace.name,
          location: { city: this.workspace.city, address: this.workspace.address },
          pricing: { amount: this.workspace.priceAmount, unit: this.workspace.priceUnit },
          images: this.workspace.images || [],
        }
      : this.workspaceId,
    numberOfPersons: this.numberOfPersons,
    startDate: this.startDate,
    endDate: this.endDate,
    status: this.status,
    totalPrice: this.totalPrice,
    notes: this.notes,
    createdAt: this.createdAt,
  };
};

module.exports = Booking;
