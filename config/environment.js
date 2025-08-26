// Environment configuration and validation
// Note: dotenv.config() should be called in the main application entry point, not here

const requiredEnvVars = [
    'MONGOURL',
    'SECRET',
    'SMTP_USER',
    'SMTP_PASS',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'BASE_URL'
];

const validateEnvironment = () => {
    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    // Validate specific environment variables
    if (process.env.SECRET && process.env.SECRET.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters long');
    }
    
    if (process.env.NODE_ENV === 'production') {
        if (!process.env.BASE_URL || !process.env.BASE_URL.startsWith('https://')) {
            throw new Error('BASE_URL must be HTTPS in production');
        }
    }
};

const config = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUrl: process.env.MONGOURL,
    jwtSecret: process.env.SECRET,
    smtp: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true'
    },
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET
    },
    app: {
        baseUrl: process.env.BASE_URL || 'http://localhost:3000',
        registrationDeadline: process.env.REGISTRATION_DEADLINE || '2024-12-31'
    }
};

module.exports = { config, validateEnvironment };
