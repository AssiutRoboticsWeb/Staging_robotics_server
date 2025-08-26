const Member = require("../mongoose.models/member");
const createError = require("../utils/createError");
const httpStatusText = require("../utils/httpStatusText");

/**
 * Middleware to authorize users based on their roles
 * @param {string[]} allowedRoles - Array of roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
const authorizeRoles = (allowedRoles) => {
    if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
        throw new Error('Allowed roles must be a non-empty array');
    }
    
    return async (req, res, next) => {
        try {
            // Check if user is authenticated
            if (!req.decoded || !req.decoded.email) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required. Please log in."
                });
            }
            
            // Check if email is valid
            const email = req.decoded.email.trim();
            if (!email || email.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid authentication token."
                });
            }
            
            // Find user in database
            const user = await Member.findOne({ email }).select('role committee name email');
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found. Please contact support."
                });
            }
            
            // Check if user's role is in the allowed roles
            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Insufficient permissions.",
                    requiredRoles: allowedRoles,
                    userRole: user.role
                });
            }
            
            // Add user data to request object for use in subsequent middleware/routes
            req.user = {
                id: user._id,
                email: user.email,
                role: user.role,
                committee: user.committee,
                name: user.name
            };
            
            // Log successful authorization
            console.log('User authorized:', {
                email: user.email,
                role: user.role,
                committee: user.committee,
                route: req.originalUrl,
                method: req.method,
                timestamp: new Date().toISOString()
            });
            
            next();
            
        } catch (error) {
            console.error('Authorization error:', {
                error: error.message,
                email: req.decoded?.email,
                route: req.originalUrl,
                timestamp: new Date().toISOString()
            });
            
            res.status(500).json({
                success: false,
                message: "Server error during authorization. Please try again later."
            });
        }
    };
};

/**
 * Middleware to check if user is a committee member
 */
const isCommitteeMember = authorizeRoles(['member', 'head', 'Vice']);

/**
 * Middleware to check if user is a head or vice
 */
const isHeadOrVice = authorizeRoles(['head', 'Vice']);

/**
 * Middleware to check if user is a head only
 */
const isHead = authorizeRoles(['head']);

module.exports = {
    authorizeRoles,
    isCommitteeMember,
    isHeadOrVice,
    isHead
};
