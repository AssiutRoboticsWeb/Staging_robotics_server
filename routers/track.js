// routers/track.router.js
const express = require('express');
const router = express.Router();
const trackController = require('../controller/track_controller');
const jwt = require('../middleware/jwt');
router.use(jwt.verify);



// Create a new track
router.post('/',trackController.createTrack);

// Get all tracks
router.get('/',trackController.getAllTracks);
// Get, Update, Delete track by ID
router.route("/:id")
  .get(trackController.getTrackById)    
  .put(trackController.updateTrack)     
  .delete(trackController.deleteTrack); 

// ====== Track Member Management ======

// Add member to track
router.put('/:trackId/members/:memberId',trackController.addMemberToTrack);

// Remove member from track
router.delete('/:trackId/members/:memberId',trackController.removeMemberFromTrack);

// ====== Track Applicant Management ======
//----------------- No need for that it has been handled in applicantController--------------
// // Add applicant to track
// router.put('/:trackId/applicants/:memberId',trackController.addApplicantToTrack);

// // Remove applicant from track
// router.delete('/:trackId/applicants/:memberId',trackController.removeApplicantFromTrack);


module.exports = router;
