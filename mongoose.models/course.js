const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    tracks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Track'
        }
    ],
    tasks: [
        {
            title: { type: String, required: true },
            description: { type: String },
            startDate: { type: Date },
            dueDate: { type: Date },
            taskUrl: { type: String },
            file:{
                type: String,

            },
            headPercent: { type: Number, default: 50 },
            deadlinePercent: { type: Number, default: 20 },
            submissions: [
                {
                    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
                    submissionLink: { type: String, default: '*' },
                    submissionDate: { type: Date },
                    headEvaluation: { type: Number, min: 0, max: 100, default: 0 },       // بدل -1 خلي 0 و تحديد المدى
                    deadlineEvaluation: { type: Number, min: 0, max: 100, default: 0 },   // بدل 0 زي ما هو بس مع تحديد المدى
                    rate: { type: Number },
                    notes: { type: String }
                }
            ]
        }
    ]
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
