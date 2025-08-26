const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Define console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let log = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
        }
        return log;
    })
);

// Create logger instance
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    defaultMeta: { service: 'assiut-robotics-server' },
    transports: [
        // Write all logs with level 'error' and below to error.log
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        
        // Write all logs with level 'info' and below to combined.log
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

// If we're not in production, log to console as well
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat
    }));
}

// Create a stream object for Morgan HTTP logging
logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};

// Helper methods for different log levels
const logInfo = (message, meta = {}) => {
    logger.info(message, meta);
};

const logError = (message, error = null, meta = {}) => {
    if (error) {
        meta.error = {
            message: error.message,
            stack: error.stack,
            name: error.name
        };
    }
    logger.error(message, meta);
};

const logWarn = (message, meta = {}) => {
    logger.warn(message, meta);
};

const logDebug = (message, meta = {}) => {
    logger.debug(message, meta);
};

// HTTP request logger
const logHttpRequest = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            userId: req.user?.id || 'anonymous'
        };
        
        if (res.statusCode >= 400) {
            logger.warn('HTTP Request', logData);
        } else {
            logger.info('HTTP Request', logData);
        }
    });
    
    next();
};

// Database operation logger
const logDbOperation = (operation, collection, documentId = null, meta = {}) => {
    logger.info('Database Operation', {
        operation,
        collection,
        documentId,
        ...meta
    });
};

// Authentication logger
const logAuth = (action, userId = null, email = null, success = true, meta = {}) => {
    const level = success ? 'info' : 'warn';
    logger[level]('Authentication', {
        action,
        userId,
        email,
        success,
        ...meta
    });
};

// File upload logger
const logFileUpload = (filename, size, type, success = true, meta = {}) => {
    const level = success ? 'info' : 'error';
    logger[level]('File Upload', {
        filename,
        size: `${(size / 1024 / 1024).toFixed(2)}MB`,
        type,
        success,
        ...meta
    });
};

module.exports = {
    logger,
    logInfo,
    logError,
    logWarn,
    logDebug,
    logHttpRequest,
    logDbOperation,
    logAuth,
    logFileUpload
};
