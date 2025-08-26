const asyncWrapper = require('../middleware/asyncWrapper');
const Track = require('../mongoose.models/track');
const createError = require('../utils/createError');
const Member = require('../mongoose.models/member');

// apply for track
const createApplicant = asyncWrapper(async (req, res, next) => {
    const { trackId } = req.params;

    const track = await Track.findById(trackId);

    const { email } = req.decoded;

    const member = await Member.findOne({ email });
    if (!member) {
        return res.status(404).json({
            success: false,
            message: 'Member not found'
        });
    }
    // Check if member already applied
    const existingApplication = track.applicants.find(app => app.member.equals(member._id));
    if (existingApplication) {
        return res.status(400).json({
            success: false,
            message: 'Member has already applied to this track'
        });
    }

    track.applicants.push({
        member: member._id,
        status: 'pending'
    });
    await track.save();

    res.status(200).json({
        success: true,
        message: 'Applicant created successfully',
        data: track
    });
});

const acceptApplicant = asyncWrapper(async (req, res, next) => {
    const { trackId, memberId } = req.params;

    const track = await Track.findById(trackId);

    if (!track) {
        return res.status(404).json({
            success: false,
            message: 'Track not found'
        });
    }

    const member = await Member.findById(memberId);
    if (!member) {
        return res.status(404).json({
            success: false,
            message: 'Member not found'
        });
    }

    // Validate that the requester is head and committees match
    const requester = await Member.findOne({ email: req.decoded.email });
    if (!requester || requester.role !== "head" || requester.committee !== track.committee) {
        return res.status(403).json({
            success: false,
            message: 'You are not allowed to accept applicants for this track'
        });
    }

    const applicant = track.applicants.find((applicant) => applicant.member.equals(member._id));
    if (!applicant) {
        return res.status(404).json({
            success: false,
            message: 'Applicant not found in this track'
        });
    }
    applicant.status = 'accepted';

    // Send acceptance message to the member
    const acceptanceMessage = {
        title: `Application Accepted - ${track.name}`,
        body: `Congratulations! Your application to join ${track.name} track has been accepted. Welcome to the team!`,
        date: new Date().toISOString()
    };

    await Member.findByIdAndUpdate(
        memberId,
        { $push: { messages: acceptanceMessage } }
    );

    await track.save();

    res.status(200).json({
        success: true,
        message: 'Applicant accepted successfully and notification sent',
        data: track
    });
});

const rejectApplicant = asyncWrapper(async (req, res, next) => {
    const { trackId, memberId } = req.params;

    const track = await Track.findById(trackId);

    if (!track) {
        return res.status(404).json({
            success: false,
            message: 'Track not found'
        });
    }

    const member = await Member.findById(memberId);
    if (!member) {
        return res.status(404).json({
            success: false,
            message: 'Member not found'
        });
    }

    // Validate that the requester is head and committees match
    const requester = await Member.findOne({ email: req.decoded.email });
    if (!requester || requester.role !== "head" || requester.committee !== track.committee) {
        return res.status(403).json({
            success: false,
            message: 'You are not allowed to reject applicants for this track'
        });
    }

    const applicant = track.applicants.find((applicant) => applicant.member.equals(member._id));
    if (!applicant) {
        return res.status(404).json({
            success: false,
            message: 'Applicant not found in this track'
        });
    }
    applicant.status = 'rejected';

    // Send rejection message to the member
    const rejectionMessage = {
        title: `Application Update - ${track.name}`,
        body: `Thank you for your interest in joining ${track.name} track. Unfortunately, your application was not accepted at this time. We encourage you to apply again in the future.`,
        date: new Date().toISOString()
    };

    await Member.findByIdAndUpdate(
        memberId,
        { $push: { messages: rejectionMessage } }
    );

    await track.save();

    res.status(200).json({
        success: true,
        message: 'Applicant rejected successfully and notification sent',
        data: track
    });
});

const getApplicants = asyncWrapper(async (req, res, next) => {
    const { email } = req.decoded;
    const member = await Member.findOne({ email });
    if (!member) {
        return res.status(404).json({
            success: false,
            message: 'Member not found'
        });
    }

    if (member.role !== "head") {
        return res.status(403).json({
            success: false,
            message: 'You are not allowed to get applicants'
        });
    }

    const tracks = await Track.find({ committee: member.committee }, { name: 1, applicants: 1, committee: 1 })
        .populate('applicants.member', 'name email phoneNumber committee gender');

    res.status(200).json({
        success: true,
        data: tracks,
        message: 'Applicants fetched successfully'
    });
});

// Get applicants for a specific track
const getTrackApplicants = asyncWrapper(async (req, res, next) => {
    const { trackId } = req.params;
    const { email } = req.decoded;

    const member = await Member.findOne({ email });
    if (!member) {
        return res.status(404).json({
            success: false,
            message: 'Member not found'
        });
    }

    const track = await Track.findById(trackId)
        .populate('applicants.member', 'name email phoneNumber committee gender avatar');

    if (!track) {
        return res.status(404).json({
            success: false,
            message: 'Track not found'
        });
    }

    // Check if user has permission (head of same committee)
    if (member.role !== "head" || member.committee !== track.committee) {
        return res.status(403).json({
            success: false,
            message: 'You are not allowed to view applicants for this track'
        });
    }

    res.status(200).json({
        success: true,
        data: {
            track: {
                _id: track._id,
                name: track.name,
                committee: track.committee
            },
            applicants: track.applicants
        },
        message: 'Track applicants fetched successfully'
    });
});

// Get user's own applications
const getMyApplications = asyncWrapper(async (req, res, next) => {
    const { email } = req.decoded;

    const member = await Member.findOne({ email });
    if (!member) {
        return res.status(404).json({
            success: false,
            message: 'Member not found'
        });
    }

    // Find all tracks where this member has applied
    const tracks = await Track.find({
        'applicants.member': member._id
    }, { name: 1, description: 1, committee: 1, applicants: 1 })
        .populate('applicants.member', 'name email');

    // Filter to show only this member's applications
    const myApplications = tracks.map(track => {
        const myApplication = track.applicants.find(app => app.member._id.equals(member._id));
        return {
            track: {
                _id: track._id,
                name: track.name,
                description: track.description,
                committee: track.committee
            },
            application: {
                status: myApplication.status,
                appliedAt: myApplication._id.getTimestamp()
            }
        };
    });

    res.status(200).json({
        success: true,
        data: myApplications,
        message: 'Your applications fetched successfully'
    });
});

module.exports = {
    createApplicant,
    acceptApplicant,
    rejectApplicant,
    getApplicants,
    getTrackApplicants,
    getMyApplications
};


// API: POST /tracks/:trackId/apply
// Header: Authorization: Bearer <token>
// Body: none

// API: POST /tracks/:trackId/applicants/:memberId/accept
// Header: Authorization: Bearer <token>
// Body: none

// API: POST /tracks/:trackId/applicants/:memberId/reject
// Header: Authorization: Bearer <token>
// Body: none

// API: GET /applicants
// Header: Authorization: Bearer <token>
// Body: none

// API: GET /tracks/:trackId/applicants
// Header: Authorization: Bearer <token>
// Body: none

// API: GET /my-applications
// Header: Authorization: Bearer <token>
// Body: none