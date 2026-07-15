const User = require('./User');
const Workspace = require('./Workspace');
const Booking = require('./Booking');
const Inquiry = require('./Inquiry');

User.hasMany(Workspace, { foreignKey: 'ownerId', as: 'workspaces', onDelete: 'CASCADE' });
Workspace.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings', onDelete: 'CASCADE' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Workspace.hasMany(Booking, { foreignKey: 'workspaceId', as: 'bookings', onDelete: 'CASCADE' });
Booking.belongsTo(Workspace, { foreignKey: 'workspaceId', as: 'workspace' });

User.hasMany(Inquiry, { foreignKey: 'userId', as: 'inquiries', onDelete: 'CASCADE' });
Inquiry.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Workspace.hasMany(Inquiry, { foreignKey: 'workspaceId', as: 'inquiries', onDelete: 'CASCADE' });
Inquiry.belongsTo(Workspace, { foreignKey: 'workspaceId', as: 'workspace' });

module.exports = { User, Workspace, Booking, Inquiry };
