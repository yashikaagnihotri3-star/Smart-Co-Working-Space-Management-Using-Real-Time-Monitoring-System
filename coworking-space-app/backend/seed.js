require('dotenv').config();
const sequelize = require('./config/database');
const { User, Workspace, Booking, Inquiry } = require('./models/associations');

const seed = async () => {
  await sequelize.authenticate();

  console.log('Resetting database...');
  await sequelize.sync({ force: true });

  console.log('Creating users...');
  await User.create({
    name: 'Platform Admin',
    email: 'admin@flexospace.com',
    password: 'admin123',
    role: 'admin',
  });

  const owner1 = await User.create({
    name: 'Ravi Sharma',
    email: 'owner1@flexospace.com',
    password: 'owner123',
    role: 'space_owner',
    phone: '9876543210',
  });

  const owner2 = await User.create({
    name: 'Priya Nair',
    email: 'owner2@flexospace.com',
    password: 'owner123',
    role: 'space_owner',
    phone: '9876500000',
  });

  const user1 = await User.create({
    name: 'Amit Verma',
    email: 'user1@flexospace.com',
    password: 'user123',
    role: 'user',
    profileTeamSize: 4,
    profileBudget: 1500,
    profilePreferredLocation: 'Bengaluru',
    profileWorkStyle: 'collaborative',
  });

  console.log('Creating workspaces...');
  const ws1 = await Workspace.create({
    ownerId: owner1.id,
    name: 'FlexoSpace Koramangala',
    description:
      'A vibrant co-working hub in the heart of Koramangala with high-speed internet and 24/7 access.',
    city: 'Bengaluru',
    address: '5th Block, Koramangala',
    lat: 12.9352,
    lng: 77.6146,
    areaSize: 2500,
    seatingCapacity: 40,
    workspaceType: 'shared_desk',
    priceAmount: 800,
    priceUnit: 'day',
    amenities: ['wifi', 'meeting_rooms', 'power_backup', 'cafeteria', 'security'],
    workStyleTags: ['collaborative', 'startup-friendly'],
    images: [],
    totalSlots: 40,
    availableSlots: 25,
  });

  await Workspace.create({
    ownerId: owner1.id,
    name: 'FlexoSpace Private Suites',
    description: 'Private cabins ideal for small teams needing focus and confidentiality.',
    city: 'Bengaluru',
    address: 'Indiranagar',
    lat: 12.9719,
    lng: 77.6412,
    areaSize: 600,
    seatingCapacity: 6,
    workspaceType: 'private_cabin',
    priceAmount: 2500,
    priceUnit: 'day',
    amenities: ['wifi', 'parking', 'power_backup', 'security'],
    workStyleTags: ['quiet', 'focused'],
    images: [],
    totalSlots: 8,
    availableSlots: 3,
  });

  await Workspace.create({
    ownerId: owner2.id,
    name: 'HiveDesk Andheri',
    description: 'Modern shared desks and meeting rooms close to Andheri station.',
    city: 'Mumbai',
    address: 'Andheri East',
    lat: 19.1197,
    lng: 72.8468,
    areaSize: 3200,
    seatingCapacity: 60,
    workspaceType: 'shared_desk',
    priceAmount: 600,
    priceUnit: 'day',
    amenities: ['wifi', 'meeting_rooms', 'cafeteria'],
    workStyleTags: ['collaborative', 'networking'],
    images: [],
    totalSlots: 60,
    availableSlots: 50,
  });

  await Workspace.create({
    ownerId: owner2.id,
    name: 'HiveDesk Meeting Rooms',
    description: 'Book meeting rooms by the hour, fully equipped with AV setup.',
    city: 'Mumbai',
    address: 'Bandra Kurla Complex',
    lat: 19.0662,
    lng: 72.8686,
    areaSize: 400,
    seatingCapacity: 12,
    workspaceType: 'meeting_room',
    priceAmount: 500,
    priceUnit: 'hour',
    amenities: ['wifi', 'meeting_rooms', 'power_backup', 'security'],
    workStyleTags: ['formal', 'client-facing'],
    images: [],
    totalSlots: 4,
    availableSlots: 4,
  });

  console.log('Creating a sample booking & inquiry...');
  await Booking.create({
    userId: user1.id,
    workspaceId: ws1.id,
    numberOfPersons: 4,
    startDate: new Date(),
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    status: 'pending',
    totalPrice: 800 * 3,
    notes: 'Need a quiet corner if possible.',
  });

  await Inquiry.create({
    userId: user1.id,
    workspaceId: ws1.id,
    message: 'Do you support teams that work in a hybrid, partly-remote style?',
  });

  console.log('Seed complete!');
  console.log('---------------------------------------------');
  console.log('Admin login:       admin@flexospace.com / admin123');
  console.log('Space owner login: owner1@flexospace.com / owner123');
  console.log('Space owner login: owner2@flexospace.com / owner123');
  console.log('User login:        user1@flexospace.com / user123');
  console.log('---------------------------------------------');

  await sequelize.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
