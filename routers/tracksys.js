const express = require('express');
const router = express.Router();
const tracksysController = require('../controller/tracksys.controller');
const jwt = require('../middleware/jwt');
router.use(jwt.verify);

// GET /tracksys/all - Get all track system data
router.get('/all', tracksysController.getAllTrackSystemData);

// GET /tracksys/awa2l - Get top performers for all tracks
router.get('/awa2l', tracksysController.getAllAwa2l);

// GET /tracksys/awa2l/:trackId - Get top performers for specific track
router.get('/awa2l/:trackId', tracksysController.getTrackAwa2l);

module.exports = router;