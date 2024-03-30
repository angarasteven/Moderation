// models/LockConfig.js
const mongoose = require('mongoose');

const lockConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  lockRoleId: { type: String, required: true }
});

const LockConfig = mongoose.model('LockConfig', lockConfigSchema);

module.exports = LockConfig;