require('dotenv').config();
const mongoose = require('mongoose');
const Member = require('../mongoose.models/member'); // adjust path as needed

async function migrateAlertsAndWarnings() {
  if (!process.env.MONGOURL) {
    throw new Error('MONGOURL is not defined in your .env file!');
  }
  await mongoose.connect(process.env.MONGOURL); // update with your DB

  const members = await Member.find();

  for (const member of members) {
    let updated = false;

    // Migrate alerts
    if (typeof member.alerts === 'number') {
      member.alerts = [];
      updated = true;
    }

    // Migrate warnings
    if (typeof member.warnings === 'number') {
      member.warnings = [];
      updated = true;
    }

    if (updated) {
      await member.save();
      console.log(`Migrated member: ${member._id}`);
    }
  }

  await mongoose.disconnect();
  console.log('Migration complete!');
}

migrateAlertsAndWarnings();