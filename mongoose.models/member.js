const mongoose = require('mongoose');
const validator = require('validator');





// const taskSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   description: String,
//   time:String,
//   score:String,
//   materialLink: String,
//   // evaluation: String, // تقييم المسؤول
// });

// const courseSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   description: String,
//   tasks: [taskSchema], // كل كورس يحتوي على مجموعة من التاسكات
// });

// const trackSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   description: String,
//   courses: [courseSchema], // كل تراك يحتوي على مجموعة من الكورسات
//   committee:String,
//   members:[
//     {}
//   ]
// });




const memberTaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  startDate: Date,
  deadline: Date,
  submissionDate: Date,
  taskUrl: String,
  submissionLink: {
    type: String,
    default: "*"
  },
  downloadSubmissionUrl:String,
  submissionFileId:String,
  headEvaluation: {
    type: Number,
    default: -1
  },
  headPercent: {
    type: Number,
    default: 60
  },
  deadlineEvaluation: {
    type: Number,
    default: 0
  },
  deadlinePercent: {
    type: Number,
    default: 40,
  },
  rate: Number,
  points: Number, 
});


const hrRateSchema = new mongoose.Schema({
  month: {
    type: String,
    required: [true, "month is required"]
  },
  memberId: {
    type: String,
    required: [true, "member ID is required"]
  },
  meetingScore: {
    type: Number,
    default: 0,
  },
  behaviorScore: {
    type: Number,
    default: 0,
  },
  interactionScore: {
    type: Number,
    default: 0,
  },
});


const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "name is required"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    validate: [validator.isEmail, "enter a valid Email"]
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },
  messages: [{
    title: {
      type: String,
      required: [true, "message title is required"]
    },
    body: {
      type: String,
      required: [true, "message body is required"]
    },
    date: {
      type: String,
      required: [true, "message date is required"]
    }
    ,
    status: {
      type: String,
      enum: ["unread", "read", "archived"],
      default: "unread"
    },
    links: [{
      label: String,
      url: String
    }]
  }],

  committee: {
    type: String,
    required: [true, "committee is required"]
  },
  gender: {
    type: String,
    required: [true, "gender is required"]
  },
  phoneNumber: {
    type: String,
    required: [true, "phone number is required"],
    validate: [validator.isMobilePhone, "enter a valid phone number"]
  },
 role: {
  type: String,
  enum: ["not accepted", "member", "head","Vice" ], // حطيت head بدل admin
  default: "not accepted"
},

  avatar: {
    type: String,
    default: "../all-images/default.png"
  },
  avg_rate: [
    {
      value: { type: Number, required: true },
      month: { type: String, required: true }
    }
  ],  
  alerts: {
    type: [
      {
        addDate: { type: String, required: true },
        header: { type: String, required: true },
        body: { type: String },
        link: { type: String, default: "#" }
      }
    ],
    default: []
  },
  warnings: {
    type: [
      {
        header: { type: String, required: true },
        body: { type: String },
        link: { type: String, default: "#" }
      }
    ],
    default: []
  },
  verified: {
    type: Boolean,
    default: false
  },
  secretKey: {
    type: String,
  },
  startedTracks: [
    {
      track: { type: mongoose.Schema.Types.ObjectId, ref: 'Track' },
      courses: [
        {
          course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
          submittedTasks: [
            {
              task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
              submissionLink: String,
              submittedAt: {
                type: Date,
                default: Date.now
              }
              ,
              rate: String,
              notes: String,
            },
          ],
        },
      ],
    },
  ],

  tasks: [memberTaskSchema],
  hr_rate: [hrRateSchema],



  visits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Visits' }],
  feedBacks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FeedBack' }],
})

const createError = require("../utils/createError");
const { required } = require('nodemon/lib/config');

memberSchema.pre('save', async function (next) {
  if (Date.now() > new Date("2026-09-27")) {
    const error = createError(400, 'FAIL', "Registration is closed");
    return next(error); 
  }
  next();
});

// Export the model
module.exports = mongoose.model('Member', memberSchema);
