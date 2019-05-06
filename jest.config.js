const { defaults } = require('jest-config')

const { TEST_MODE } = process.env

module.exports = {
  moduleFileExtensions: [
    'js',
    'jsx',
    'json',
    'vue'
  ],
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '^.+\\.jsx?$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(bootstrap-vue)/)'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    'tests/(.*)$': '<rootDir>/tests/$1'
  },
  snapshotSerializers: [
    'jest-serializer-vue'
  ],
  testMatch: [
    '**/tests/unit/**/*.spec.js',
    '**/tests/integration/**/*.spec.js'
  ],
  coverageDirectory: 'tests/unit/coverage',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.(js|vue)'
  ],
  testURL: process.env.VUE_APP_DS_HOST,
  setupFiles: [
    'jest-canvas-mock'
  ],
  preset: TEST_MODE === 'integration' ? 'jest-puppeteer' : defaults.preset,
  globalSetup: TEST_MODE === 'integration' ? './tests/integration/config/setup.js' : defaults.globalSetup,
  globalTeardown: TEST_MODE === 'integration' ? './tests/integration/config/teardown.js' : defaults.globalTeardown,
  testEnvironment: TEST_MODE === 'integration' ? './tests/integration/config/puppeteer_environment.js' : defaults.testEnvironment
}
