// Test setup file
require('@testing-library/jest-dom');

// Mock localStorage
global.localStorage = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock console methods to reduce noise in test output
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn((...args) => originalConsole.log(...args)),
  error: jest.fn((...args) => originalConsole.error(...args)),
  warn: jest.fn((...args) => originalConsole.warn(...args)),
};

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
