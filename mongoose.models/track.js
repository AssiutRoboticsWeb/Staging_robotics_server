const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    }
  ],
  committee: {
    type: String
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member'
    }
  ],
  applicants: [
    {
      member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member'
      },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
      }
    }
  ],
  superVisors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member'
    }
  ],
  HRs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member'
    }
  ]
});

const Track = mongoose.model('Track', trackSchema);
module.exports = Track;
