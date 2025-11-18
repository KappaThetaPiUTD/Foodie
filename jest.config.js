const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './apps/web/',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  projects: [
    // Web app testing
    {
      displayName: 'web',
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      testMatch: ['<rootDir>/apps/web/**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)'],
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/apps/web/src/$1',
      },
      collectCoverageFrom: [
        'apps/web/src/**/*.{js,jsx,ts,tsx}',
        '!apps/web/src/**/*.d.ts',
        '!apps/web/src/lib/firebase.js',
      ],
    },
    // Server testing
    {
      displayName: 'server',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/apps/server/**/__tests__/**/*.(test|spec).(js|ts)'],
      collectCoverageFrom: [
        'apps/server/src/**/*.{js,ts}',
        '!apps/server/src/**/*.d.ts',
      ],
    },
    // Mobile testing (basic setup)
    {
      displayName: 'mobile',
      testEnvironment: 'node',
      preset: 'jest-expo',
      testMatch: ['<rootDir>/apps/mobile/**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)'],
      collectCoverageFrom: [
        'apps/mobile/src/**/*.{js,jsx,ts,tsx}',
        '!apps/mobile/src/**/*.d.ts',
      ],
      transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
      ],
    },
  ],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'apps/**/src/**/*.{js,jsx,ts,tsx}',
    '!apps/**/src/**/*.d.ts',
    '!apps/**/src/lib/firebase.js',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);

