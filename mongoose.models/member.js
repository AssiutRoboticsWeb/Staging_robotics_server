const mongoose = require('mongoose');
const validator = require('validator');
const { config } = require('../config/environment');

// Task schema for member tasks
const memberTaskSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, "Task title is required"],
    trim: true,
    maxlength: [200, "Task title cannot exceed 200 characters"]
  },
  description: { 
    type: String,
    trim: true,
    maxlength: [1000, "Task description cannot exceed 1000 characters"]
  },
  startDate: { 
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value instanceof Date;
      },
      message: 'Start date must be a valid date'
    }
  },
  deadline: { 
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value instanceof Date;
      },
      message: 'Deadline must be a valid date'
    }
  },
  submissionDate: { 
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value instanceof Date;
      },
      message: 'Submission date must be a valid date'
    }
  },
  taskUrl: { 
    type: String,
    validate: {
      validator: function(value) {
        return !value || validator.isURL(value);
      },
      message: 'Task URL must be a valid URL'
    }
  },
  submissionLink: {
    type: String,
    default: "*",
    validate: {
      validator: function(value) {
        return value === "*" || validator.isURL(value);
      },
      message: 'Submission link must be "*" or a valid URL'
    }
  },
  downloadSubmissionUrl: {
    type: String,
    validate: {
      validator: function(value) {
        return !value || validator.isURL(value);
      },
      message: 'Download submission URL must be a valid URL'
    }
  },
  submissionFileId: String,
  headEvaluation: {
    type: Number,
    default: -1,
    min: [-1, "Head evaluation must be at least -1"],
    max: [100, "Head evaluation cannot exceed 100"]
  },
  headPercent: {
    type: Number,
    default: 50,
    min: [0, "Head percentage must be at least 0"],
    max: [100, "Head percentage cannot exceed 100"]
  },
  deadlineEvaluation: {
    type: Number,
    default: 0,
    min: [0, "Deadline evaluation must be at least 0"],
    max: [100, "Deadline evaluation cannot exceed 100"]
  },
  deadlinePercent: {
    type: Number,
    default: 20,
    min: [0, "Deadline percentage must be at least 0"],
    max: [100, "Deadline percentage cannot exceed 100"]
  },
  rate: {
    type: Number,
    min: [0, "Rate must be at least 0"],
    max: [100, "Rate cannot exceed 100"]
  },
  points: {
    type: Number,
    min: [0, "Points must be at least 0"]
  }
}, { timestamps: true });

// HR Rate schema for monthly evaluations
const hrRateSchema = new mongoose.Schema({
  month: {
    type: String,
    required: [true, "Month is required"],
    trim: true,
    validate: {
      validator: function(value) {
        const months = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months.includes(value);
      },
      message: 'Month must be a valid month name'
    }
  },
  memberId: {
    type: String,
    required: [true, "Member ID is required"],
    trim: true
  },
  socialScore: {
    type: Number,
    default: 0,
    min: [0, "Social score must be at least 0"],
    max: [100, "Social score cannot exceed 100"]
  },
  behaviorScore: {
    type: Number,
    default: 0,
    min: [0, "Behavior score must be at least 0"],
    max: [100, "Behavior score cannot exceed 100"]
  },
  interactionScore: {
    type: Number,
    default: 0,
    min: [0, "Interaction score must be at least 0"],
    max: [100, "Interaction score cannot exceed 100"]
  }
}, { timestamps: true });

// Main member schema
const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters long"],
    maxlength: [100, "Name cannot exceed 100 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, "Please enter a valid email address"]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"]
  },
  messages: [{
    title: {
      type: String,
      required: [true, "Message title is required"],
      trim: true,
      maxlength: [200, "Message title cannot exceed 200 characters"]
    },
    body: {
      type: String,
      required: [true, "Message body is required"],
      trim: true,
      maxlength: [2000, "Message body cannot exceed 2000 characters"]
    },
    date: {
      type: String,
      required: [true, "Message date is required"],
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: ["unread", "read", "archived"],
        message: "Status must be one of: unread, read, archived"
      },
      default: "unread"
    },
    links: [{
      label: {
        type: String,
        trim: true,
        maxlength: [100, "Link label cannot exceed 100 characters"]
      },
      url: {
        type: String,
        validate: {
          validator: validator.isURL,
          message: "Link URL must be a valid URL"
        }
      }
    }]
  }],
  committee: {
    type: String,
    required: [true, "Committee is required"],
    trim: true,
    enum: {
      values: ["Software", "Hardware", "Media", "HR", "Marketing", "Logistics", "web", "OC"],
      message: "Committee must be one of: Software, Hardware, Media, HR, Marketing, Logistics, web, OC"
    }
  },
  gender: {
    type: String,
    required: [true, "Gender is required"],
    enum: {
      values: ["male", "female"],
      message: "Gender must be either 'male' or 'female'"
    }
  },
  phoneNumber: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
    validate: [validator.isMobilePhone, "Please enter a valid phone number"]
  },
  role: {
    type: String,
    enum: {
      values: ["not accepted", "member", "head", "Vice"],
      message: "Role must be one of: not accepted, member, head, Vice"
    },
    default: "not accepted"
  },
  avatar: {
    type: String,
    default: "../all-images/default.png",
    validate: {
      validator: function(value) {
        return value === "../all-images/default.png" || validator.isURL(value);
      },
      message: "Avatar must be a valid URL or default path"
    }
  },
  rate: {
    type: Number,
    min: [0, "Rate must be at least 0"],
    max: [100, "Rate cannot exceed 100"]
  },
  alerts: {
    type: Number,
    min: [0, "Alerts must be at least 0"],
    default: 0
  },
  warnings: {
    type: Number,
    min: [0, "Warnings must be at least 0"],
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  secretKey: {
    type: String,
    trim: true
  },
  startedTracks: [
    {
      track: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Track',
        required: true
      },
      courses: [
        {
          course: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Course',
            required: true
          },
          submittedTasks: [
            {
              task: { 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Task',
                required: true
              },
              submissionLink: {
                type: String,
                validate: {
                  validator: function(value) {
                    return !value || validator.isURL(value);
                  },
                  message: "Submission link must be a valid URL"
                }
              },
              submittedAt: {
                type: Date,
                default: Date.now
              },
              rate: {
                type: String,
                trim: true
              },
              notes: {
                type: String,
                trim: true,
                maxlength: [500, "Notes cannot exceed 500 characters"]
              }
            }
          ]
        }
      ]
    }
  ],
  tasks: [memberTaskSchema],
  hr_rate: [hrRateSchema],
  visits: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Visits' 
  }],
  feedBacks: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'FeedBack' 
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
memberSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual for isActive
memberSchema.virtual('isActive').get(function() {
  return this.role !== "not accepted" && this.verified;
});

// Database indexes (removed duplicate email index)
memberSchema.index({ committee: 1 });
memberSchema.index({ role: 1 });
memberSchema.index({ verified: 1 });

// Pre-save middleware to check registration deadline (only for new documents)
memberSchema.pre('save', async function(next) {
  try {
    // Only check registration deadline for new documents (not updates)
    if (this.isNew) {
      const deadline = new Date(config.app.registrationDeadline);
      if (Date.now() > deadline.getTime()) {
        const error = new Error("Registration is closed");
        error.statusCode = 400;
        error.statusText = 'FAIL';
        return next(error);
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to hash password if modified
memberSchema.pre('save', async function(next) {
  try {
    if (this.isModified('password')) {
      const bcrypt = require('../middleware/bcrypt');
      this.password = await bcrypt.hashing(this.password);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to find active members
memberSchema.statics.findActiveMembers = function() {
  return this.find({ 
    verified: true, 
    role: { $ne: "not accepted" } 
  });
};

// Instance method to get member score
memberSchema.methods.getTotalScore = function() {
  if (!this.tasks || this.tasks.length === 0) return 0;
  
  return this.tasks.reduce((total, task) => {
    const taskScore = (task.rate || 0) * (task.points || 0) / 100;
    return total + taskScore;
  }, 0);
};

// Export the model
module.exports = mongoose.model('Member', memberSchema);
