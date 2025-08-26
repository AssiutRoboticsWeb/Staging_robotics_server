const rateLimit = require('express-rate-limit');

/**
 * Rate limiting configuration for different endpoints
 */

// General API rate limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many requests from this IP, please try again later.',
            retryAfter: '15 minutes',
            timestamp: new Date().toISOString()
        });
    }
});

// Authentication endpoints rate limiting (more strict)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many authentication attempts, please try again later.',
            retryAfter: '15 minutes',
            timestamp: new Date().toISOString()
        });
    },
    skipSuccessfulRequests: true // Don't count successful requests
});

// File upload rate limiting
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 uploads per hour
    message: {
        success: false,
        message: 'Too many file uploads, please try again later.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many file uploads, please try again later.',
            retryAfter: '1 hour',
            timestamp: new Date().toISOString()
        });
    }
});

// OTP generation rate limiting (very strict)
const otpLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 OTP requests per hour
    message: {
        success: false,
        message: 'Too many OTP requests, please try again later.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many OTP requests, please try again later.',
            retryAfter: '1 hour',
            timestamp: new Date().toISOString()
        });
    },
    skipSuccessfulRequests: true
});

// Admin endpoints rate limiting
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 requests per windowMs
    message: {
        success: false,
        message: 'Too many admin requests, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many admin requests, please try again later.',
            retryAfter: '15 minutes',
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = {
    generalLimiter,
    authLimiter,
    uploadLimiter,
    otpLimiter,
    adminLimiter
};
