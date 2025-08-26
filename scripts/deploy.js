#!/usr/bin/env node

/**
 * Production Deployment Script
 * This script validates the environment and performs health checks before deployment
 */

require('dotenv').config();
const { validateEnvironment } = require('../config/environment');
const { connectDB, disconnectDB } = require('../config/database');

console.log('🚀 Starting production deployment validation...\n');

async function validateDeployment() {
    try {
        // Step 1: Validate environment variables
        console.log('📋 Step 1: Validating environment variables...');
        validateEnvironment();
        console.log('✅ Environment variables validated successfully\n');

        // Step 2: Test database connection
        console.log('🗄️  Step 2: Testing database connection...');
        const dbConnection = await connectDB();
        console.log('✅ Database connection successful\n');

        // Step 3: Perform database health check
        console.log('🔍 Step 3: Performing database health check...');
        try {
            await dbConnection.db.admin().ping();
            console.log('✅ Database health check passed\n');
        } catch (error) {
            throw new Error(`Database health check failed: ${error.message}`);
        }

        // Step 4: Validate configuration
        console.log('⚙️  Step 4: Validating configuration...');
        const config = require('../config/environment').config;
        
        if (!config.jwtSecret || config.jwtSecret.length < 32) {
            throw new Error('JWT secret must be at least 32 characters long');
        }
        
        if (!config.smtp.user || !config.smtp.pass) {
            throw new Error('SMTP credentials must be configured');
        }
        
        if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
            throw new Error('Cloudinary configuration must be complete');
        }
        
        console.log('✅ Configuration validated successfully\n');

        // Step 5: Environment-specific checks
        console.log('🌍 Step 5: Environment-specific validation...');
        if (process.env.NODE_ENV === 'production') {
            if (process.env.PORT === '3000') {
                console.warn('⚠️  Warning: Using default port 3000 in production');
            }
            
            if (!process.env.BASE_URL || process.env.BASE_URL.includes('localhost')) {
                throw new Error('Production BASE_URL must be configured and not localhost');
            }
        }
        console.log('✅ Environment validation completed\n');

        // Step 6: Performance checks
        console.log('⚡ Step 6: Performance validation...');
        const startTime = Date.now();
        
        // Test database query performance
        const testStart = Date.now();
        await dbConnection.db.admin().ping();
        const queryTime = Date.now() - testStart;
        
        if (queryTime > 1000) {
            console.warn(`⚠️  Warning: Database query took ${queryTime}ms (should be < 1000ms)`);
        } else {
            console.log(`✅ Database query performance: ${queryTime}ms`);
        }
        
        const totalTime = Date.now() - startTime;
        console.log(`✅ Performance validation completed in ${totalTime}ms\n`);

        // Step 7: Security checks
        console.log('🔒 Step 7: Security validation...');
        
        // Check for common security issues
        if (process.env.NODE_ENV === 'production' && process.env.SECRET === 'your-super-secret-jwt-key-here') {
            throw new Error('Default JWT secret detected in production');
        }
        
        if (process.env.NODE_ENV === 'production' && (!process.env.SMTP_USER || process.env.SMTP_USER === 'your-email@gmail.com')) {
            throw new Error('Default SMTP credentials detected in production');
        }
        
        console.log('✅ Security validation completed\n');

        // Step 8: Final deployment readiness
        console.log('🎯 Step 8: Final deployment readiness...');
        console.log('✅ All validation checks passed');
        console.log('✅ Server is ready for production deployment');
        console.log('✅ Environment: ' + (process.env.NODE_ENV || 'development'));
        console.log('✅ Port: ' + (process.env.PORT || 3000));
        console.log('✅ Database: Connected');
        console.log('✅ JWT: Configured');
        console.log('✅ SMTP: Configured');
        console.log('✅ Cloudinary: Configured');
        
        console.log('\n🚀 Deployment validation completed successfully!');
        console.log('📝 Next steps:');
        console.log('   1. Start the server: npm start');
        console.log('   2. Monitor health endpoint: /health');
        console.log('   3. Check logs for any issues');
        console.log('   4. Monitor performance metrics');

        // Disconnect from database
        await disconnectDB();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Deployment validation failed:');
        console.error(`   ${error.message}`);
        console.error('\n📝 Please fix the issues above before deploying to production.');
        console.error('   Refer to README.md for configuration instructions.');
        
        // Try to disconnect from database if connected
        try {
            await disconnectDB();
        } catch (disconnectError) {
            // Ignore disconnect errors
        }
        
        process.exit(1);
    }
}

// Handle process termination
process.on('SIGINT', async () => {
    console.log('\n⚠️  Deployment validation interrupted');
    try {
        await disconnectDB();
    } catch (error) {
        // Ignore disconnect errors
    }
    process.exit(1);
});

process.on('SIGTERM', async () => {
    console.log('\n⚠️  Deployment validation terminated');
    try {
        await disconnectDB();
    } catch (error) {
        // Ignore disconnect errors
    }
    process.exit(1);
});

// Run validation
validateDeployment();
