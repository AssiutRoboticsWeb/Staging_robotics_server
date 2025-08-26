/**
 * Simple in-memory caching middleware
 * For production, consider using Redis or Memcached
 */

class Cache {
    constructor() {
        this.store = new Map();
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0
        };
    }

    /**
     * Set a value in cache
     * @param {string} key - Cache key
     * @param {*} value - Value to cache
     * @param {number} ttl - Time to live in milliseconds
     */
    set(key, value, ttl = 300000) { // Default 5 minutes
        const expiry = Date.now() + ttl;
        this.store.set(key, {
            value,
            expiry,
            createdAt: Date.now()
        });
        this.stats.sets++;
        
        // Clean up expired entries
        this.cleanup();
    }

    /**
     * Get a value from cache
     * @param {string} key - Cache key
     * @returns {*} Cached value or null if not found/expired
     */
    get(key) {
        const item = this.store.get(key);
        
        if (!item) {
            this.stats.misses++;
            return null;
        }
        
        if (Date.now() > item.expiry) {
            this.store.delete(key);
            this.stats.misses++;
            return null;
        }
        
        this.stats.hits++;
        return item.value;
    }

    /**
     * Delete a value from cache
     * @param {string} key - Cache key
     */
    delete(key) {
        this.store.delete(key);
        this.stats.deletes++;
    }

    /**
     * Clear all cache entries
     */
    clear() {
        this.store.clear();
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0
        };
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getStats() {
        const totalRequests = this.stats.hits + this.stats.misses;
        const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests * 100).toFixed(2) : 0;
        
        return {
            ...this.stats,
            totalRequests,
            hitRate: `${hitRate}%`,
            size: this.store.size,
            memoryUsage: process.memoryUsage()
        };
    }

    /**
     * Clean up expired entries
     */
    cleanup() {
        const now = Date.now();
        for (const [key, item] of this.store.entries()) {
            if (now > item.expiry) {
                this.store.delete(key);
            }
        }
    }

    /**
     * Get cache keys (for debugging)
     * @returns {Array} Array of cache keys
     */
    keys() {
        return Array.from(this.store.keys());
    }
}

// Create global cache instance
const cache = new Cache();

/**
 * Cache middleware for Express routes
 * @param {number} ttl - Time to live in milliseconds
 * @param {Function} keyGenerator - Function to generate cache key
 * @returns {Function} Express middleware
 */
const cacheMiddleware = (ttl = 300000, keyGenerator = null) => {
    return (req, res, next) => {
        // Skip caching for non-GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Generate cache key
        const cacheKey = keyGenerator ? keyGenerator(req) : `cache:${req.originalUrl}`;
        
        // Try to get from cache
        const cachedResponse = cache.get(cacheKey);
        if (cachedResponse) {
            return res.json(cachedResponse);
        }

        // Store original res.json method
        const originalJson = res.json;
        
        // Override res.json to cache the response
        res.json = function(data) {
            // Cache the response
            cache.set(cacheKey, data, ttl);
            
            // Call original method
            return originalJson.call(this, data);
        };

        next();
    };
};

/**
 * Cache invalidation middleware
 * @param {Array} patterns - Array of URL patterns to invalidate
 * @returns {Function} Express middleware
 */
const invalidateCache = (patterns = []) => {
    return (req, res, next) => {
        // Invalidate cache after successful operation
        res.on('finish', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                patterns.forEach(pattern => {
                    const keys = cache.keys().filter(key => key.includes(pattern));
                    keys.forEach(key => cache.delete(key));
                });
            }
        });

        next();
    };
};

/**
 * Cache statistics endpoint middleware
 * @returns {Function} Express middleware
 */
const cacheStats = (req, res) => {
    res.json({
        success: true,
        data: cache.getStats(),
        timestamp: new Date().toISOString()
    });
};

/**
 * Clear cache endpoint middleware
 * @returns {Function} Express middleware
 */
const clearCache = (req, res) => {
    cache.clear();
    res.json({
        success: true,
        message: 'Cache cleared successfully',
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    cache,
    cacheMiddleware,
    invalidateCache,
    cacheStats,
    clearCache
};
