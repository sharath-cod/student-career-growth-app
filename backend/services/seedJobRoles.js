const JobRole = require('../models/JobRole');
const { buildJobRoles } = require('../utils/jobRolesData');

// Keeps the jobRoles collection in sync with utils/jobRolesData.js on every start.
module.exports = async function seedJobRoles() {
  const roles = buildJobRoles();
  await JobRole.bulkWrite(roles.map((r) => ({ updateOne: { filter: { name: r.name }, update: { $set: r }, upsert: true } })));
  console.log(`Job roles synced: ${roles.length}`);
};
