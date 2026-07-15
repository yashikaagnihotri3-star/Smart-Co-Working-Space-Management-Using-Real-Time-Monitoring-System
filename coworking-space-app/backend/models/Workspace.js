const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Workspace = sequelize.define(
  'Workspace',
  {
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, defaultValue: '' },

    city: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
    lat: { type: DataTypes.FLOAT },
    lng: { type: DataTypes.FLOAT },

    areaSize: { type: DataTypes.FLOAT, allowNull: false },
    seatingCapacity: { type: DataTypes.INTEGER, allowNull: false },
    workspaceType: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isIn: [['private_cabin', 'shared_desk', 'meeting_room']] },
    },

    priceAmount: { type: DataTypes.FLOAT, allowNull: false },
    priceUnit: {
      type: DataTypes.STRING,
      defaultValue: 'day',
      validate: { isIn: [['hour', 'day', 'month']] },
    },

    // Stored as JSON text, parsed back into arrays automatically by Sequelize
    amenities: { type: DataTypes.JSON, defaultValue: [] },
    workStyleTags: { type: DataTypes.JSON, defaultValue: [] },
    images: { type: DataTypes.JSON, defaultValue: [] },

    totalSlots: { type: DataTypes.INTEGER, defaultValue: 1 },
    availableSlots: { type: DataTypes.INTEGER, defaultValue: 1 },

    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    ratingAverage: { type: DataTypes.FLOAT, defaultValue: 0 },
    ratingCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  }
);

const statusFor = (availableSlots, totalSlots) => {
  if (availableSlots <= 0) return 'full';
  if (availableSlots < totalSlots * 0.3) return 'limited';
  return 'available';
};

// Shapes the response to match what the frontend expects (nested location/pricing/availability, `_id`)
Workspace.prototype.toClientObject = function (extra = {}) {
  const owner = this.owner
    ? { _id: this.owner.id, name: this.owner.name, email: this.owner.email, phone: this.owner.phone }
    : this.ownerId;

  return {
    _id: this.id,
    name: this.name,
    description: this.description,
    owner,
    location: { city: this.city, address: this.address, lat: this.lat, lng: this.lng },
    areaSize: this.areaSize,
    seatingCapacity: this.seatingCapacity,
    workspaceType: this.workspaceType,
    pricing: { amount: this.priceAmount, unit: this.priceUnit },
    amenities: this.amenities || [],
    workStyleTags: this.workStyleTags || [],
    images: this.images || [],
    availability: {
      totalSlots: this.totalSlots,
      availableSlots: this.availableSlots,
      status: statusFor(this.availableSlots, this.totalSlots),
    },
    isActive: this.isActive,
    ratingAverage: this.ratingAverage,
    ratingCount: this.ratingCount,
    createdAt: this.createdAt,
    ...extra,
  };
};

module.exports = Workspace;
