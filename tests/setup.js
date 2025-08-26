/**
 * Test setup file
 * This file runs after the test environment is set up
 */

// Test setup - runs after test environment is set up
const mongoose = require('mongoose');
const { config } = require('../config/environment');

// Global test utilities
global.testUtils = {
    // Generate a test member object
    generateTestMember: (overrides = {}) => ({
        name: 'Test Member',
        email: `test${Date.now()}@example.com`,
        password: 'TestPassword123!',
        committee: 'Software',
        gender: 'Male',
        phoneNumber: '+201234567890',
        role: 'member',
        ...overrides
    }),

    // Generate a test JWT token
    generateTestToken: (payload = {}) => {
        const jwt = require('jsonwebtoken');
        return jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
    },

    // Mock request object
    mockRequest: (overrides = {}) => ({
        body: {},
        params: {},
        query: {},
        headers: {},
        user: null,
        ...overrides
    }),

    // Mock response object
    mockResponse: () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        res.send = jest.fn().mockReturnValue(res);
        return res;
    },

    // Mock next function
    mockNext: jest.fn(),

    // Cleanup function
    cleanup: () => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    }
};

// Custom Jest matchers
expect.extend({
    toBeValidObjectId: (received) => {
        const pass = mongoose.Types.ObjectId.isValid(received);
        if (pass) {
            return {
                message: () => `expected ${received} not to be a valid ObjectId`,
                pass: true,
            };
        } else {
            return {
                message: () => `expected ${received} to be a valid ObjectId`,
                pass: false,
            };
        }
    },

    toBeValidEmail: (received) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const pass = emailRegex.test(received);
        if (pass) {
            return {
                message: () => `expected ${received} not to be a valid email`,
                pass: true,
            };
        } else {
            return {
                message: () => `expected ${received} to be a valid email`,
                pass: false,
            };
        }
    }
});

// Global cleanup after each test
afterEach(() => {
    testUtils.cleanup();
});

// Set test timeout
jest.setTimeout(10000);

// Handle test database connection - make it truly optional
let dbConnected = false;

beforeAll(async () => {
    // Skip database connection in test environment if MongoDB is not available
    if (process.env.NODE_ENV === 'test') {
        try {
            // Quick connection test with very short timeout
            const connectionPromise = mongoose.connect(config.mongoUrl, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 1000, // 1 second timeout
                socketTimeoutMS: 1000,
            });
            
            // Race against a timeout
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Connection timeout')), 1000)
            );
            
            await Promise.race([connectionPromise, timeoutPromise]);
            dbConnected = true;
            console.log('✅ Connected to test database');
        } catch (error) {
            console.log('⚠️  Database connection failed (tests will run without database):', error.message);
            dbConnected = false;
        }
    }
});

afterAll(async () => {
    if (dbConnected && mongoose.connection.readyState === 1) {
        try {
            await mongoose.connection.close();
            console.log('✅ Disconnected from test database');
        } catch (error) {
            console.error('❌ Error closing test database connection:', error.message);
        }
    }
});
