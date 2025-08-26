const { body, param, query, validationResult } = require('express-validator');
const createError = require('../utils/createError');
const httpStatusText = require('../utils/httpStatusText');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => `${err.param}: ${err.msg}`).join(', ');
        const error = createError(400, httpStatusText.FAIL, `Validation failed: ${errorMessages}`);
        return next(error);
    }
    next();
};

/**
 * Validation rules for member registration
 */
const validateMemberRegistration = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),
    
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
    body('committee')
        .isIn(['Software', 'Hardware', 'Media', 'HR', 'Marketing', 'Logistics', 'web', 'OC'])
        .withMessage('Invalid committee selection'),
    
    body('gender')
        .isIn(['male', 'female'])
        .withMessage('Gender must be either male or female'),
    
    body('phoneNumber')
        .matches(/^(\+2)?01[0125][0-9]{8}$/)
        .withMessage('Please provide a valid Egyptian phone number'),
    
    handleValidationErrors
];

/**
 * Validation rules for member login
 */
const validateMemberLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    
    handleValidationErrors
];

/**
 * Validation rules for password change
 */
const validatePasswordChange = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
    handleValidationErrors
];

/**
 * Validation rules for OTP generation
 */
const validateOTPGeneration = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    
    handleValidationErrors
];

/**
 * Validation rules for OTP verification
 */
const validateOTPVerification = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    
    body('otp')
        .isLength({ min: 6, max: 6 })
        .matches(/^\d{6}$/)
        .withMessage('OTP must be a 6-digit number'),
    
    handleValidationErrors
];

/**
 * Validation rules for member ID parameter
 */
const validateMemberId = [
    param('memberId')
        .matches(/^[0-9a-fA-F]{24}$/)
        .withMessage('Invalid member ID format'),
    
    handleValidationErrors
];

/**
 * Validation rules for committee parameter
 */
const validateCommittee = [
    param('com')
        .isIn(['Software', 'Hardware', 'Media', 'HR', 'Marketing', 'Logistics', 'web', 'OC'])
        .withMessage('Invalid committee selection'),
    
    handleValidationErrors
];

/**
 * Validation rules for task creation
 */
const validateTaskCreation = [
    body('title')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Task title must be between 1 and 200 characters'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Task description cannot exceed 1000 characters'),
    
    body('deadline')
        .optional()
        .isISO8601()
        .withMessage('Deadline must be a valid ISO 8601 date'),
    
    body('points')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Points must be a non-negative number'),
    
    handleValidationErrors
];

/**
 * Validation rules for task rating
 */
const validateTaskRating = [
    body('rate')
        .isFloat({ min: 0, max: 100 })
        .custom((value) => {
            const num = parseFloat(value);
            return Number.isInteger(num);
        })
        .withMessage('Rate must be an integer between 0 and 100'),
    
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Notes cannot exceed 500 characters'),
    
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    validateMemberRegistration,
    validateMemberLogin,
    validatePasswordChange,
    validateOTPGeneration,
    validateOTPVerification,
    validateMemberId,
    validateCommittee,
    validateTaskCreation,
    validateTaskRating
};
