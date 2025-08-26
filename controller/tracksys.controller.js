const asyncWrapper = require('../middleware/asyncWrapper');
const Track = require('../mongoose.models/track');
const Course = require('../mongoose.models/course');
const Member = require('../mongoose.models/member');
const createError = require('../utils/createError');
const httpStatusText = require('../utils/httpStatusText');

// API to get all track system data
const getAllTrackSystemData = asyncWrapper(async (req, res) => {
    const tracks = await Track.find()
        .populate('members', 'name email committee role rate')
        .populate('applicants.member', 'name email committee')
        .populate('supervisors', 'name email')
        .populate('HRs', 'name email');

    const courses = await Course.find()
        .populate('tracks', 'name description committee');

    const members = await Member.find({ role: { $ne: 'not accepted' } }, 
        'name email committee role rate startedTracks tasks hr_rate')
        .populate('startedTracks.track', 'name description committee')
        .populate('startedTracks.courses.course', 'name description');

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            tracks,
            courses,
            members,
            summary: {
                totalTracks: tracks.length,
                totalCourses: courses.length,
                totalMembers: members.length,
                totalApplicants: tracks.reduce((sum, track) => sum + track.applicants.length, 0)
            }
        },
        message: "Track system data retrieved successfully"
    });
});

// API to get Awa2l (top performers) for all tracks
const getAllAwa2l = asyncWrapper(async (req, res) => {
    const tracks = await Track.find()
        .populate({
            path: 'members',
            select: 'name email committee role rate tasks',
            match: { rate: { $exists: true, $ne: null } },
            options: { sort: { rate: -1 }, limit: 5 }
        });

    const awa2lData = tracks.map(track => ({
        trackId: track._id,
        trackName: track.name,
        committee: track.committee,
        topPerformers: track.members.map((member, index) => ({
            rank: index + 1,
            memberId: member._id,
            name: member.name,
            email: member.email,
            committee: member.committee,
            rate: member.rate,
            completedTasks: member.tasks ? member.tasks.filter(task => task.submissionLink && task.submissionLink !== "*").length : 0
        }))
    }));

    // Overall top performers across all tracks
    const allMembers = await Member.find({ 
        role: { $ne: 'not accepted' },
        rate: { $exists: true, $ne: null }
    }, 'name email committee role rate tasks')
        .sort({ rate: -1 })
        .limit(10);

    const overallAwa2l = allMembers.map((member, index) => ({
        rank: index + 1,
        memberId: member._id,
        name: member.name,
        email: member.email,
        committee: member.committee,
        rate: member.rate,
        completedTasks: member.tasks ? member.tasks.filter(task => task.submissionLink && task.submissionLink !== "*").length : 0
    }));

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            trackAwa2l: awa2lData,
            overallAwa2l
        },
        message: "Top performers data retrieved successfully"
    });
});

// API to get Awa2l for specific track
const getTrackAwa2l = asyncWrapper(async (req, res) => {
    const { trackId } = req.params;

    const track = await Track.findById(trackId)
        .populate({
            path: 'members',
            select: 'name email committee role rate tasks',
            match: { rate: { $exists: true, $ne: null } },
            options: { sort: { rate: -1 } }
        });

    if (!track) {
        throw createError(404, httpStatusText.FAIL, "Track not found");
    }

    const topPerformers = track.members.map((member, index) => ({
        rank: index + 1,
        memberId: member._id,
        name: member.name,
        email: member.email,
        committee: member.committee,
        rate: member.rate,
        completedTasks: member.tasks ? member.tasks.filter(task => task.submissionLink && task.submissionLink !== "*").length : 0
    }));

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            trackId: track._id,
            trackName: track.name,
            committee: track.committee,
            topPerformers
        },
        message: "Track top performers retrieved successfully"
    });
});

module.exports = {
    getAllTrackSystemData,
    getAllAwa2l,
    getTrackAwa2l
};
