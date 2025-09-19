const mongoose = require('mongoose');
const Member = require('./member');

// Define Submission schema
const submissionSchema = new mongoose.Schema({
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    submissionLink: { type: String, default: '*' },
    submissionDate: { type: Date },
    headEvaluation: { type: Number, min: 0, max: 100, default: 0 },
    deadlineEvaluation: { type: Number, min: 0, max: 100, default: 0 },
    rate: { type: Number },
    notes: { type: String },
    marker: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' }
});

const Submission = mongoose.model('Submission', submissionSchema);

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
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Submission'
                }
            ]
        }
    ],
    admins:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Member',
            markedTasks : [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Submission'
                }
            ]
        }
    ]
});

const Course = mongoose.model('Course', courseSchema);
module.exports = {Course, Submission};
    