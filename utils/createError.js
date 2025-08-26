/**
 * Creates a custom error object with status code, status text, and message
 * @param {number} statusCode - HTTP status code
 * @param {string} statusText - Status text (SUCCESS, FAIL, ERROR)
 * @param {string} message - Error message
 * @returns {Error} Custom error object
 */
const createError = (statusCode, statusText, message) => {
    if (!statusCode || typeof statusCode !== 'number') {
        throw new Error('Status code must be a valid number');
    }
    
    if (!statusText || typeof statusText !== 'string') {
        throw new Error('Status text must be a valid string');
    }
    
    if (!message || typeof message !== 'string') {
        throw new Error('Message must be a valid string');
    }
    
    const error = new Error(message);
    error.statusCode = statusCode;
    error.statusText = statusText;
    error.isOperational = true; // Mark as operational error for error handling
    
    return error;
};

module.exports = createError;