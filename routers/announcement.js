const express = require("express");

const Router = express.Router();

const announcementController = require("../controller/announcement.controller");

const jwt = require("../middleware/jwt");

// Apply JWT middleware to all routes in this router
Router.use(jwt.verify);
// Add a new announcement
Router.route("/add").post( announcementController.addAnnouncement);

// Get all announcements
Router.route("/getAnnouncements")
        .get(announcementController.getAnnouncements);

// Get announcements for a specific track
Router.route("/track/:trackId")
        .get(announcementController.getTrackAnnouncements);

// Send an announcement as a message to track members
// Router.route("/track-message")
//         .post(jwt.verify, announcementController.sendTrackAnnouncementToMembers);

// Update or delete an announcement by ID
Router.route("/:id")
        .delete(announcementController.deleteAnnouncement)
        .put(announcementController.updateAnnouncement);

module.exports = Router;