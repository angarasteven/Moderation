// models/userWarns.js
const mongoose = require('mongoose');

const userWarnsSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  warns: [
    {
      warnNumber: Number,
      reason: String, // Optional reason for the warning
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const UserWarns = mongoose.model('UserWarns', userWarnsSchema);

module.exports = UserWarns;