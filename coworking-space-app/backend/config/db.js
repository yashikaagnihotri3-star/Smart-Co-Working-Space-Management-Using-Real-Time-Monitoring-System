const sequelize = require('./database');
require('../models/associations');

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    // Creates tables only if they don't already exist - never touches existing data.
    // (alter:true was rebuilding tables on every restart and wiping rows - avoid it here.)
    await sequelize.sync();
    console.log(`SQLite connected: ${sequelize.options.storage}`);
  } catch (err) {
    console.error('Database connection failed.');
    console.error(`Reason: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
