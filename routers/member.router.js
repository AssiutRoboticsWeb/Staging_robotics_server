const express = require("express");
const memberController = require("../controller/member.controller");
const JWT = require("../middleware/jwt");
const Router = express.Router();
const multer = require("multer");
const otp = require("../utils/otp");
const { config } = require("../config/environment");
const { uploadToCloud } = require("../utils/cloudinary");
const { 
    generalLimiter, 
    authLimiter, 
    uploadLimiter, 
    otpLimiter 
} = require("../middleware/rateLimiter");
const {
    validateMemberRegistration,
    validateMemberLogin,
    validatePasswordChange,
    validateOTPGeneration,
    validateOTPVerification,
    validateMemberId,
    validateCommittee
} = require("../middleware/validation");

// Multer configuration for file uploads
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1
    },
    fileFilter: (req, file, cb) => {
        // Check file type
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error("Only image files are allowed!"), false);
        }
        
        // Check file extension
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        const fileExtension = file.originalname.split('.').pop().toLowerCase();
        
        if (!allowedExtensions.includes(fileExtension)) {
            return cb(new Error("Only JPG, JPEG, PNG, and GIF files are allowed!"), false);
        }
        
        cb(null, true);
    }
});

// Profile image upload route with rate limiting
Router.route("/changeProfileImage").post(
    uploadLimiter,
    upload.single("image"),
    async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded.'
                });
            }
            
            // Upload image to Cloudinary
            const uploadResult = await uploadToCloud(req.file.buffer, {
                folder: 'profile-images',
                public_id: `profile_${Date.now()}`
            });
            
            req.imageUrl = uploadResult.url;
            req.publicId = uploadResult.publicId;
            next();
            
        } catch (error) {
            console.error('File upload error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error uploading image',
                error: error.message
            });
        }
    },
    JWT.verify,
    memberController.changeProfileImage
);

// Authentication routes with rate limiting and validation
Router.route("/register").post(
    authLimiter,
    validateMemberRegistration,
    memberController.register
);

Router.route("/login").post(
    authLimiter,
    validateMemberLogin,
    memberController.login
);

Router.route("/verify").get(
    generalLimiter,
    JWT.verify, 
    memberController.verify
);

// Email verification
Router.route("/verifyEmail/:token").get(
    generalLimiter,
    JWT.verify,
    memberController.verifyEmail
);

// Password management with rate limiting and validation
Router.route("/changePassword").post(
    authLimiter,
    validatePasswordChange,
    memberController.changePass
);

Router.route("/generateOTP").post(
    otpLimiter,
    validateOTPGeneration,
    memberController.generateOTP
);

Router.route("/verifyOTP").post(
    otpLimiter,
    validateOTPVerification,
    memberController.verifyOTP
);

// Member management with general rate limiting
Router.route("/getAllMembers").get(
    generalLimiter,
    memberController.getAllMembers
);

Router.route("/get/:com").get(
    generalLimiter,
    validateCommittee,
    memberController.getCommittee
);

Router.route("/confirm").post(
    generalLimiter,
    JWT.verify, 
    memberController.confirm
);

// Role management with admin rate limiting
Router.route("/changeHead").post(
    generalLimiter,
    JWT.verify, 
    memberController.changeHead
);

Router.route("/changeVice").post(
    generalLimiter,
    JWT.verify, 
    memberController.changeVice
);

// HR and rating with general rate limiting
Router.route("/hr").post(
    generalLimiter,
    JWT.verify, 
    memberController.controlHR
);

Router.route("/rate").post(
    generalLimiter,
    JWT.verify, 
    memberController.rate
);

module.exports = Router;
