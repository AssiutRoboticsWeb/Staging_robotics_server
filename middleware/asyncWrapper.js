/**
 * Wraps async route handlers to catch errors and pass them to Express error handling middleware
 * @param {Function} asyncFn - The async function to wrap
 * @returns {Function} Express middleware function
 */
const asyncWrapper = (asyncFn) => {
    return (req, res, next) => {
        Promise.resolve(asyncFn(req, res, next)).catch(next);
    };
};

module.exports = asyncWrapper;