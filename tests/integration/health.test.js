const request = require('supertest');
const app = require('../../index');

describe('Health Check Endpoints', () => {
    describe('GET /health', () => {
        it('should return comprehensive health status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('status');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('uptime');
            expect(response.body).toHaveProperty('environment');
            expect(response.body).toHaveProperty('version');
            expect(response.body).toHaveProperty('database');
            expect(response.body).toHaveProperty('memory');
            expect(response.body).toHaveProperty('checks');
        });

        it('should include database status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body.database).toHaveProperty('status');
            expect(response.body.database).toHaveProperty('responseTime');
        });

        it('should include memory usage', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body.memory).toHaveProperty('used');
            expect(response.body.memory).toHaveProperty('total');
            expect(response.body.memory).toHaveProperty('percentage');
        });
    });

    describe('GET /health/light', () => {
        it('should return lightweight health status', async () => {
            const response = await request(app)
                .get('/health/light')
                .expect(200);

            expect(response.body).toHaveProperty('status');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('uptime');
        });

        it('should be reasonably fast', async () => {
            const startTime = Date.now();
            await request(app).get('/health/light');
            const lightTime = Date.now() - startTime;

            // In test environment, should be reasonably fast (under 100ms)
            expect(lightTime).toBeLessThan(100);
        });
    });

    describe('Performance under load', () => {
        it('should handle concurrent requests efficiently', async () => {
            const concurrentRequests = 5;
            const promises = [];

            for (let i = 0; i < concurrentRequests; i++) {
                promises.push(request(app).get('/health/light'));
            }

            const responses = await Promise.all(promises);
            
            responses.forEach(response => {
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('status');
            });
        });
    });

    describe('Error handling', () => {
        it('should handle invalid routes gracefully', async () => {
            const response = await request(app)
                .get('/health/invalid')
                .expect(404);

            expect(response.body).toHaveProperty('success', false);
            expect(response.body).toHaveProperty('message');
        });
    });
});
