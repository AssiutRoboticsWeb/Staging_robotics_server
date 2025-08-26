const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  dateOfDelete: {
    type: Date,
    default: Date.now
  },
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Member' // لأن Admin و Student و Assistant كلهم من member
  },
  track: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track',
    required: true
  }
});

const Announcement = mongoose.model("Announcement", announcementSchema);

module.exports = Announcement;
