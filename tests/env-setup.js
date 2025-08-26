/**
 * Test environment setup
 * This file runs before all tests to set up the testing environment
 */

// Test environment setup - runs before all tests
process.env.NODE_ENV = 'test';

// Mock all required environment variables for testing
process.env.MONGOURL = 'mongodb://localhost:27017/assiut_robotics_test';
process.env.SECRET = 'test-jwt-secret-key-for-testing-only-32-chars';
process.env.SMTP_USER = 'test@example.com';
process.env.SMTP_PASS = 'test-password';
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.CLOUDINARY_API_KEY = 'test-api-key';
process.env.CLOUDINARY_API_SECRET = 'test-api-secret';
process.env.BASE_URL = 'http://localhost:3000';
process.env.PORT = '3001';
process.env.REGISTRATION_DEADLINE = '2025-12-31';

// Suppress console logs during tests (except errors)
const originalConsoleLog = console.log;
const originalConsoleInfo = console.info;
const originalConsoleWarn = console.warn;

console.log = () => {};
console.info = () => {};
console.warn = () => {};

// Set test timeout
jest.setTimeout(15000);

// Prevent unhandled promise rejections from crashing tests
process.on('unhandledRejection', (reason, promise) => {
    // Only log in test environment, don't crash
    if (process.env.NODE_ENV === 'test') {
        console.error('Unhandled Rejection during tests:', reason);
    }
});

// Prevent uncaught exceptions from crashing tests
process.on('uncaughtException', (error) => {
    // Only log in test environment, don't crash
    if (process.env.NODE_ENV === 'test') {
        console.error('Uncaught Exception during tests:', error);
    }
});

// Handle process exit gracefully in tests
process.on('exit', (code) => {
    if (process.env.NODE_ENV === 'test' && code !== 0) {
        console.error(`Test process exiting with code: ${code}`);
    }
});
