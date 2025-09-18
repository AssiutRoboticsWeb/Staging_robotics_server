const Announcement = require("../mongoose.models/announcement");
const asyncWrapper = require("../middleware/asyncWrapper");
const httpStatusText = require("../utils/httpStatusText");
const createError = require("../utils/createError");
const Member = require("../mongoose.models/member");
const Track = require("../mongoose.models/track");
// إضافة إعلان
const addAnnouncement = asyncWrapper(async (req, res) => {
    const { title, content, dateOfDelete, trackId } = req.body;
    const email = req.decoded.email;

    const member = await Member.findOne({ email });
    if (!member) throw createError(404, httpStatusText.FAIL, "Member not found");

    let track = null;
    if (trackId) {
        track = await Track.findById(trackId);
        if (!track) throw createError(404, httpStatusText.FAIL, "Track not found");
        // Validate member is head and committee matches track's committee
        if (!(member.role === 'head' && String(track.committee) === String(member.committee))) {
            throw createError(403, httpStatusText.FAIL, "You are not authorized to add this track announcement");
        }
    }

    const newAnnouncement = await Announcement.create({
        title,
        content,
        dateOfDelete,
        creator: member._id,
        track: trackId,
        CreationDate: new Date()
    });
    const messageData = {
        title,
        body: content,
        date: new Date().toISOString(),
        status: "unread", //  unread , read , archived
        links: track ? [{
            name: track.name,
            url: `/apply/${track._id}` // edit to fit apply api
        }] : []
    };
    // Add the announcement message to all members' messages array without overwriting old messages
    await Member.updateMany(
        {},
        { $push: { messages: messageData } }
    );
    res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: newAnnouncement,
        message: "Announcement added successfully"
    });
});

// جلب كل الإعلانات
const getAnnouncements = asyncWrapper(async (req, res) => {
    await Announcement.deleteMany({ dateOfDelete: { $lt: new Date() } });

    const email = req.decoded.email;
    console.log(email);
    const member = await Member.findOne({ email });
    if (!member) throw createError(404, httpStatusText.FAIL, "Member not found");

    // Only allow heads to fetch all announcements for their committee
    if (member.role !== 'head') {
        throw createError(403, httpStatusText.FAIL, "You are not authorized to view all announcements");
    }

    // Fetch only announcements for tracks in the member's committee
    const tracks = await Track.find({ committee: member.committee }).select('_id');
    const trackIds = tracks.map(t => t._id);

    const announcements = await Announcement.find({ track: { $in: trackIds } })
        .populate('creator', 'name email role committee phoneNumber avatar')
        .populate('track', 'name description committee');

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: announcements,
        message: "Announcements fetched successfully"
    });
});

// جلب إعلانات تراك محدد
const getTrackAnnouncements = asyncWrapper(async (req, res) => {
    const { trackId } = req.params;
    const email = req.decoded.email;

    const member = await Member.findOne({ email });
    if (!member) throw createError(404, httpStatusText.FAIL, "Member not found");

    const track = await Track.findById(trackId);
    if (!track) throw createError(404, httpStatusText.FAIL, "Track not found");

    // Validate member is head and committee matches track's committee
    if (!(member.role === 'head' && String(track.committee) === String(member.committee))) {
        throw createError(403, httpStatusText.FAIL, "You are not authorized to view this track's announcements");
    }

    await Announcement.deleteMany({ track: trackId, dateOfDelete: { $lt: new Date() } });

    const announcements = await Announcement.find({ track: trackId })
        .populate('creator', 'name email role committee phoneNumber avatar')
        .populate('track', 'name description committee');

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: announcements,
        message: "Track announcements fetched successfully"
    });
});

// تعديل إعلان
const updateAnnouncement = asyncWrapper(async (req, res) => {
    const { title, content, dateOfDelete } = req.body;
    const announcementId = req.params.id;
    const email = req.decoded.email;

    const member = await Member.findOne({ email });
    if (!member) throw createError(404, httpStatusText.FAIL, "Member not found");

    const announcement = await Announcement.findById(announcementId);
    if (!announcement) throw createError(404, httpStatusText.FAIL, "Announcement not found");

    let track = null;
    if (announcement.track) {
        track = await Track.findById(announcement.track);
        if (!track) throw createError(404, httpStatusText.FAIL, "Track not found");
        // Validate member is head and committee matches track's committee
        if (!(member.role === 'head' && String(track.committee) === String(member.committee))) {
            throw createError(403, httpStatusText.FAIL, "You are not authorized to update this announcement");
        }
    }

    announcement.title = title;
    announcement.content = content;
    announcement.dateOfDelete = dateOfDelete;
    await announcement.save();
    // Create a new message reflecting the updated announcement
    const messageData = {
        title: announcement.title,
        body: announcement.content,
        date: new Date().toISOString(),
        status: "unread",
        links: track ? [{
            name: track.name,
            url: `/apply/${track._id}`
        }] : []
    };
    // Optionally, you may want to remove old messages related to this announcement before pushing the new one.
    // For now, just push the new message to all members
    await Member.updateMany(
        {},
        { $push: { messages: messageData } }
    );
    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: announcement,
        message: "Announcement updated successfully"
    });
});

// حذف إعلان
const deleteAnnouncement = asyncWrapper(async (req, res) => {
    const announcementId = req.params.id;
    const email = req.decoded.email;

    const member = await Member.findOne({ email });
    if (!member) throw createError(404, httpStatusText.FAIL, "Member not found");

    const announcement = await Announcement.findById(announcementId);
    if (!announcement) throw createError(404, httpStatusText.FAIL, "Announcement not found");

    let track = null;
    if (announcement.track) {
        track = await Track.findById(announcement.track);
        if (!track) throw createError(404, httpStatusText.FAIL, "Track not found");
        // Validate member is head and committee matches track's committee
        if (!(member.role === 'head' && String(track.committee) === String(member.committee))) {
            throw createError(403, httpStatusText.FAIL, "You are not authorized to delete this announcement");
        }
    }

    await Announcement.findByIdAndDelete(announcementId);

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: announcement,
        message: "Announcement deleted successfully"
    });
});

module.exports = {
    addAnnouncement,
    getAnnouncements,
    getTrackAnnouncements,
    // sendTrackAnnouncementToMembers,
    updateAnnouncement,
    deleteAnnouncement
};


/**
 * API Documentation: Announcement Controller
 *
 * 1. Add Announcement (POST /announcements)
 *    Headers:
 *      - Authorization: Bearer <token>
 *    Body:
 *      {
 *        "title": String,
 *        "content": String,
 *        "trackId": String (optional)
 *      }
 *
 * 2. Get All Announcements (GET /announcements)
 *    Headers:
 *      - Authorization: Bearer <token>
 *    Body: none
 *
 * 3. Get Track Announcements (GET /announcements/track/:trackId)
 *    Headers:
 *      - Authorization: Bearer <token>
 *    Body: none
 *
 * 4. Update Announcement (PUT /announcements/:id)
 *    Headers:
 *      - Authorization: Bearer <token>
 *    Body:
 *      {
 *        "title": String,
 *        "content": String,
 *        "dateOfDelete": Date (ISO string)
 *      }
 *
 * 5. Delete Announcement (DELETE /announcements/:id)
 *    Headers:
 *      - Authorization: Bearer <token>
 *    Body: none
 */