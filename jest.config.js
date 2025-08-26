module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/tests/**',
    '!**/scripts/**',
    '!**/public/**',
    '!**/sendFeedBack/**',
    '!jest.config.js',
    '!index.js'
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 15000,
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
  setupFiles: ['<rootDir>/tests/env-setup.js'],
  // More lenient settings for test environment
  maxWorkers: 1,
  forceExit: true,
  detectOpenHandles: false
};
