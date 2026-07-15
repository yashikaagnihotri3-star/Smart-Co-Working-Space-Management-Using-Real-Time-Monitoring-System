const path = require('path');
const { Sequelize } = require('sequelize');

// SQLite stores the entire database in a single file on disk.
// No separate database server needs to be installed or running.
const storagePath =
  process.env.DB_STORAGE || path.join(__dirname, '..', 'data', 'coworking.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storagePath,
  logging: false,
});

module.exports = sequelize;
