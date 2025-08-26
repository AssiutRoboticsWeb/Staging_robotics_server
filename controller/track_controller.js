
const Track = require('../mongoose.models/track');
const Course = require('../mongoose.models/course'); 
const asyncWrapper = require('../middleware/asyncWrapper');
const createError = require('../utils/createError');
const Member = require('../mongoose.models/member');

// Create a new track
const createTrack = asyncWrapper(async (req, res, next) => {
    const {email} = req.decoded;
    const member = await Member.findOne({ email });
    if (!member) {
        return res.status(404).json({
            success: false,
            message: 'Member not found'
        });
    }
    if(member.role != "head")
        return res.status(403).json({
            success: false,
            message: 'Forbidden'
        });
    const { name, description, courses, members, applicants, superVisors, HRs } = req.body;

    const track = new Track({
        name,
        description,
        courses: courses || [],
        committee:member.committee,
        members: members || [],
        applicants: applicants || [],
        superVisors: superVisors || [],
        HRs: HRs || []
    });
    
    const savedTrack = await track.save();
    
    res.status(201).json({
        success: true,
        message: 'Track created successfully',
        data: savedTrack
    });
});

// Get all tracks
const getAllTracks = asyncWrapper(async (req, res, next) => {
    const {email} = req.decoded;
    const member = await Member.findOne({ email });
    if (!member) {
        return res.status(404).json({
            success: false,
            message: 'Member not found'
        });

    }
    let tracks=[];
    // if(member.role === "member"){
    //     tracks = await Track.find();
    // }
    // else{
    //     tracks = await Track.find({
    //         committee: member.committee
    //     });
    tracks = await Track.find()
        .populate({
            path: 'courses',
            select: '-tracks', // exclude 'tracks' field from courses
            populate: {
                path: 'tasks',
                select: '-submissions', // exclude 'submissions' field from tasks
            }
        })
        .populate('committee')
        .populate('members')
        .populate('applicants')
        .populate('superVisors')
        .populate('HRs');
    
    res.status(200).json({
        success: true,
        count: tracks.length,
        data: tracks
    });
});

// Get single track by ID
const getTrackById = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    
    const track = await Track.findById(id)
        .populate('courses', 'name description')
        .populate('committee', 'name email')
        .populate('members', 'name email')
        .populate('applicants', 'name email')
        .populate('superVisors', 'name email')
        .populate('HRs', 'name email');
    
    if (!track) {
        return res.status(404).json({
            success: false,
            message: 'Track not found'
        });
    }
    
    res.status(200).json({
        success: true,
        data: track
    });
});

// Update track by ID
const updateTrack = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    const updateData = req.body;
    
    const editor = await Member.findOne({ email: req.decoded.email });
    if (!editor) {
        return res.status(404).json({
            success: false,
            message: 'Editor (member) not found'
        });
    }
    if (editor.role !== "head") {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Only head can update track'
        });
    }
    if (track && String(editor.committee) !== String(track.committee)) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: You can only edit tracks in your committee'
        });
    }

    const track = await Track.findByIdAndUpdate(
        id,
        updateData,
        { 
            new: true, 
            runValidators: true 
        }
    )
    
    .populate('courses', 'name description')
    .populate('committee', 'name email')
    .populate('members', 'name email')
    .populate('applicants', 'name email')
    .populate('superVisors', 'name email')
    .populate('HRs', 'name email');
    
    if (!track) {
        return res.status(404).json({
            success: false,
            message: 'Track not found'
        });
    }
    
    res.status(200).json({
        success: true,
        message: 'Track updated successfully',
        data: track
    });
});

// Delete track by ID
const deleteTrack = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    
    const editor = await Member.findOne({ email: req.decoded.email });
    if (!editor) {
        return res.status(404).json({
            success: false,
            message: 'Editor (member) not found'
        });
    }
    if (editor.role !== "head") {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Only head can delete track'
        });
    }
    const track = await Track.findById(id);
    if (!track) {
        return res.status(404).json({
            success: false,
            message: 'Track not found'
        });
    }
    if (String(editor.committee) !== String(track.committee)) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: You can only delete tracks in your committee'
        });
    }
    await Track.findByIdAndDelete(id);  if (!track) {
        return res.status(404).json({
            success: false,
            message: 'Track not found'
        });
    }
    
    res.status(200).json({
        success: true,
        message: 'Track deleted successfully',
        data: track
    });
});

// Add member to track
/**
 * All APIs below (add/remove member/applicant to/from track) were already present in your code.
 * No new APIs were added, only validation for "head" role and committee match is enforced.
 */

// Add member to track
const addMemberToTrack = asyncWrapper(async (req, res, next) => {
    const { trackId, memberId } = req.params;

    // Validate editor
    const editor = await Member.findOne({ email: req.decoded.email });
    if (!editor) {
        return res.status(404).json({
            success: false,
            message: 'Editor (member) not found'
        });
    }
    if (editor.role !== "head") {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Only head can add members to track'
        });
    }

    const track = await Track.findById(trackId);
    if (!track) {
        return res.status(404).json({
            success: false,
            message: 'Track not found'
        });
    }
    if (String(editor.committee) !== String(track.committee)) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: You can only modify tracks in your committee'
        });
    }

    const updatedTrack = await Track.findByIdAndUpdate(
        trackId,
        { $addToSet: { members: memberId } },
        { new: true }
    ).populate('members', 'name email');

    res.status(200).json({
        success: true,
        message: 'Member added to track successfully',
        data: updatedTrack
    });
});

// Remove member from track
const removeMemberFromTrack = asyncWrapper(async (req, res, next) => {
    const { trackId, memberId } = req.params;

    // Validate editor
    const editor = await Member.findOne({ email: req.decoded.email });
    if (!editor) {
        return res.status(404).json({
            success: false,
            message: 'Editor (member) not found'
        });
    }
    if (editor.role !== "head") {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Only head can remove members from track'
        });
    }

    const track = await Track.findById(trackId);
    if (!track) {
        return res.status(404).json({
            success: false,
            message: 'Track not found'
        });
    }
    if (String(editor.committee) !== String(track.committee)) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: You can only modify tracks in your committee'
        });
    }

    const updatedTrack = await Track.findByIdAndUpdate(
        trackId,
        { $pull: { members: memberId } },
        { new: true }
    ).populate('members', 'name email');

    res.status(200).json({
        success: true,
        message: 'Member removed from track successfully',
        data: updatedTrack
    });
});

// Add applicant to track
const addApplicantToTrack = asyncWrapper(async (req, res, next) => {
    const { trackId, memberId } = req.params;

    // Validate editor
    const editor = await Member.findOne({ email: req.decoded.email });
    if (!editor) {
        return res.status(404).json({
            success: false,
            message: 'Editor (member) not found'
        });
    }
    if (editor.role !== "head") {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Only head can add applicants to track'
        });
    }

    const track = await Track.findById(trackId);
    if (!track) {
        return res.status(404).json({
            success: false,
            message: 'Track not found'
        });
    }
    if (String(editor.committee) !== String(track.committee)) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: You can only modify tracks in your committee'
        });
    }

    const updatedTrack = await Track.findByIdAndUpdate(
        trackId,
        { $addToSet: { applicants: memberId } },
        { new: true }
    ).populate('applicants', 'name email');

    res.status(200).json({
        success: true,
        message: 'Applicant added to track successfully',
        data: updatedTrack
    });
});

// Remove applicant from track
const removeApplicantFromTrack = asyncWrapper(async (req, res, next) => {
    const { trackId, memberId } = req.params;

    // Validate editor
    const editor = await Member.findOne({ email: req.decoded.email });
    if (!editor) {
        return res.status(404).json({
            success: false,
            message: 'Editor (member) not found'
        });
    }
    if (editor.role !== "head") {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Only head can remove applicants from track'
        });
    }

    const track = await Track.findById(trackId);
    if (!track) {
        return res.status(404).json({
            success: false,
            message: 'Track not found'
        });
    }
    if (String(editor.committee) !== String(track.committee)) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: You can only modify tracks in your committee'
        });
    }

    const updatedTrack = await Track.findByIdAndUpdate(
        trackId,
        { $pull: { applicants: memberId } },
        { new: true }
    ).populate('applicants', 'name email');

    res.status(200).json({
        success: true,
        message: 'Applicant removed from track successfully',
        data: updatedTrack
    });
});


module.exports = {
    createTrack,
    getAllTracks,
    getTrackById,
    updateTrack,
    deleteTrack,
    addMemberToTrack,
    removeMemberFromTrack,
    addApplicantToTrack,
    removeApplicantFromTrack,
};

/**
 * =========================
 * API Expected Body & Headers
 * =========================
 * 
 * All APIs expect the following header:
 *   Authorization: Bearer <JWT>
 * The JWT must decode to an object with at least an "email" property.
 * 
 * ----------------------------------------
 * POST /tracks
 *   - Headers: Authorization: Bearer <JWT>
 *   - Body (JSON):
 *     {
 *       "name": String,                // required
 *       "description": String,         // optional
 *       "courses": [courseId],         // optional, array of ObjectId
 *       "members": [memberId],         // optional, array of ObjectId
 *       "applicants": [memberId],      // optional, array of ObjectId
 *       "superVisors": [memberId],     // optional, array of ObjectId
 *       "HRs": [memberId]              // optional, array of ObjectId
 *     }
 * 
 * ----------------------------------------
 * GET /tracks
 *   - Headers: Authorization: Bearer <JWT>
 *   - Body: none
 * 
 * ----------------------------------------
 * GET /tracks/:id
 *   - Headers: Authorization: Bearer <JWT>
 *   - Body: none
 * 
 * ----------------------------------------
 * PATCH /tracks/:id
 *   - Headers: Authorization: Bearer <JWT>
 *   - Body (JSON): Any subset of:
 *     {
 *       "name": String,
 *       "description": String,
 *       "courses": [courseId],
 *       "members": [memberId],
 *       "applicants": [memberId],
 *       "superVisors": [memberId],
 *       "HRs": [memberId]
 *     }
 * 
 * ----------------------------------------
 * DELETE /tracks/:id
 *   - Headers: Authorization: Bearer <JWT>
 *   - Body: none
 * 
 * ----------------------------------------
 * POST /tracks/:trackId/members/:memberId
 *   - Headers: Authorization: Bearer <JWT>
 *   - Body: none
 * 
 * DELETE /tracks/:trackId/members/:memberId
 *   - Headers: Authorization: Bearer <JWT>
 *   - Body: none
 * 
 * POST /tracks/:trackId/applicants/:memberId
 *   - Headers: Authorization: Bearer <JWT>
 *   - Body: none
 * 
 * DELETE /tracks/:trackId/applicants/:memberId
 *   - Headers: Authorization: Bearer <JWT>
 *   - Body: none
 * 
 * ----------------------------------------
 * Notes:
 * - All endpoints require a valid JWT in the Authorization header.
 * - Only users with role "head" can create, update, delete, or modify members/applicants of a track.
 * - The "email" in the JWT is used to identify the acting member.
 */