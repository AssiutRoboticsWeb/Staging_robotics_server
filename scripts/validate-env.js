#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * Run this script to validate all required environment variables before starting the server
 */

require('dotenv').config();
const { validateEnvironment } = require('../config/environment');

console.log('🔍 Validating environment variables...\n');

try {
    validateEnvironment();
    console.log('✅ All required environment variables are set correctly!');
    console.log('🚀 Server is ready to start.');
    
    // Display current configuration (without sensitive data)
    console.log('\n📋 Current Configuration:');
    console.log(`   Port: ${process.env.PORT || 3000}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Database: ${process.env.MONGOURL ? 'Configured' : 'Missing'}`);
    console.log(`   JWT Secret: ${process.env.SECRET ? 'Configured' : 'Missing'}`);
    console.log(`   SMTP: ${process.env.SMTP_USER && process.env.SMTP_PASS ? 'Configured' : 'Missing'}`);
    console.log(`   Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME ? 'Configured' : 'Missing'}`);
    console.log(`   Base URL: ${process.env.BASE_URL || 'Using default'}`);
    console.log(`   Registration Deadline: ${process.env.REGISTRATION_DEADLINE || 'Using default'}`);
    
    process.exit(0);
} catch (error) {
    console.error('❌ Environment validation failed:');
    console.error(`   ${error.message}`);
    console.error('\n📝 Please check your .env file and ensure all required variables are set.');
    console.error('   Refer to README.md for the complete list of required variables.');
    process.exit(1);
}
