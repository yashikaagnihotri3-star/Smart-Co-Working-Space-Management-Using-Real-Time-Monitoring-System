const sequelize = require('./database');
const { User } = require('../models/associations');

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    console.log(`SQLite connected: ${sequelize.options.storage}`);

    // Seed admin if database is empty
    const userCount = await User.count();

    if (userCount === 0) {
      console.log("Creating default users...");

      await User.create({
        name: "Platform Admin",
        email: "admin@flexospace.com",
        password: "admin123",
        role: "admin"
      });

      await User.create({
        name: "Demo User",
        email: "user1@flexospace.com",
        password: "user123",
        role: "user"
      });

      await User.create({
        name: "Demo Owner",
        email: "owner1@flexospace.com",
        password: "owner123",
        role: "space_owner"
      });

      console.log("Default users created.");
    }

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;