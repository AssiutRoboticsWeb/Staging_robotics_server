const jwt = require('jsonwebtoken');
const createError = require("../utils/createError");
const httpStatusText = require("../utils/httpStatusText");
const { config } = require("../config/environment");
const fs = require("fs");
const path = require('path');

/**
 * Generates a JWT token
 * @param {Object} payload - The payload to encode in the token
 * @param {string} expiresIn - Token expiration time
 * @returns {string} JWT token
 */
const generateToken = async (payload, expiresIn = "10h") => {
    try {
        if (!payload || typeof payload !== 'object') {
            throw new Error('Invalid payload provided');
        }
        
        if (!config.jwtSecret) {
            throw new Error('JWT secret not configured');
        }
        
        return jwt.sign(payload, config.jwtSecret, { 
            expiresIn,
            issuer: 'assiut-robotics',
            audience: 'assiut-robotics-users'
        });
    } catch (error) {
        throw createError(500, httpStatusText.ERROR, `Token generation failed: ${error.message}`);
    }
};

/**
 * Verifies JWT token from request headers or params
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const verify = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        const tokenParam = req.params.token;
        
        if (!authHeader && !tokenParam) {
            throw createError(401, httpStatusText.FAIL, "Authentication token is required");
        }
        
        let token;
        if (tokenParam) {
            token = tokenParam;
        } else if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7).trim();
        } else {
            throw createError(401, httpStatusText.FAIL, "Invalid authorization header format. Use 'Bearer <token>'");
        }
        
        if (!token) {
            throw createError(401, httpStatusText.FAIL, "Token is required");
        }
        
        if (!config.jwtSecret) {
            throw new Error('JWT secret not configured');
        }
        
        const decoded = await jwt.verify(token, config.jwtSecret);
        
        if (!decoded) {
            throw createError(401, httpStatusText.FAIL, "Invalid token");
        }
        
        // Check if token is expired
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
            throw createError(401, httpStatusText.FAIL, "Token has expired");
        }
        
        req.decoded = decoded;
        next();
        
    } catch (error) {
        // Handle JWT specific errors
        if (error.name === 'JsonWebTokenError') {
            error = createError(401, httpStatusText.FAIL, "Invalid token");
        } else if (error.name === 'TokenExpiredError') {
            error = createError(401, httpStatusText.FAIL, "Token has expired");
        } else if (error.name === 'NotBeforeError') {
            error = createError(401, httpStatusText.FAIL, "Token not active yet");
        }
        
        // If this is a token verification from URL params, render HTML error page
        if (req.params.token) {
            try {
                const filePath = path.join(__dirname, '../public/error.html');
                const htmlContent = fs.readFileSync(filePath, "utf-8");
                res.status(error.statusCode || 401).end(
                    htmlContent.replace("{{error_message}}", error.message)
                );
            } catch (fileError) {
                res.status(error.statusCode || 401).json({
                    success: false,
                    statusText: error.statusText || httpStatusText.FAIL,
                    message: error.message
                });
            }
        } else {
            // API response
            res.status(error.statusCode || 401).json({
                success: false,
                statusText: error.statusText || httpStatusText.FAIL,
                message: error.message
            });
        }
    }
};

module.exports = {
    generateToken,
    verify
};