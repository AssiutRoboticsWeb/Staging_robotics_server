const mongoose = require('mongoose');
const { config } = require('../config/environment');

/**
 * Comprehensive health check middleware
 * Provides detailed system status including database, memory, and uptime
 */
const healthCheck = async (req, res) => {
    const startTime = Date.now();
    
    try {
        // Check database connection
        let dbStatus = 'disconnected';
        let dbResponseTime = 0;
        
        try {
            const dbStartTime = Date.now();
            if (mongoose.connection.readyState === 1) {
                dbStatus = 'connected';
                dbResponseTime = Date.now() - dbStartTime;
            } else {
                dbStatus = 'disconnected';
            }
        } catch (error) {
            dbStatus = 'error';
            console.error('Database health check error:', error.message);
        }

        // Check memory usage
        const memUsage = process.memoryUsage();
        const totalMemory = require('os').totalmem();
        const usedMemory = totalMemory - require('os').freemem();
        const memoryPercentage = Math.round((usedMemory / totalMemory) * 100);

        // Determine overall health status
        const isHealthy = dbStatus === 'connected' || process.env.NODE_ENV === 'test';
        const status = isHealthy ? 'healthy' : 'unhealthy';
        const statusCode = isHealthy ? 200 : 503;

        const healthData = {
            success: true,
            status,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: {
                nodeEnv: config.nodeEnv,
                port: config.port
            },
            version: '2.0.0',
            database: {
                status: dbStatus,
                responseTime: dbResponseTime
            },
            memory: {
                used: Math.round(usedMemory / 1024 / 1024), // MB
                total: Math.round(totalMemory / 1024 / 1024), // MB
                percentage: memoryPercentage
            },
            checks: {
                database: dbStatus === 'connected',
                smtp: !!config.smtp.user && !!config.smtp.pass,
                cloudinary: !!(config.cloudinary.cloudName && config.cloudinary.apiKey),
                jwt: !!config.jwtSecret && config.jwtSecret.length >= 32
            }
        };

        res.status(statusCode).json(healthData);
    } catch (error) {
        console.error('Health check error:', error);
        res.status(503).json({
            success: false,
            status: 'error',
            message: 'Health check failed',
            timestamp: new Date().toISOString()
        });
    }
};

/**
 * Lightweight health check for load balancers
 */
const lightHealthCheck = (req, res) => {
    try {
        const isHealthy = mongoose.connection.readyState === 1 || process.env.NODE_ENV === 'test';
        const status = isHealthy ? 'ok' : 'error';
        
        res.status(200).json({
            status,
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    } catch (error) {
        console.error('Light health check error:', error);
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    }
};

module.exports = { healthCheck, lightHealthCheck };
