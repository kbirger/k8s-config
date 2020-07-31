let mockLog: jest.SpyInstance;
let mockError: jest.SpyInstance;

beforeEach(() => {
  mockLog = jest.spyOn(console, 'log').mockImplementation(() => { /* */ });
  mockError = jest.spyOn(console, 'error').mockImplementation(() => { /* */ });
});

afterEach(() => {
  mockLog.mockRestore();
  mockError.mockRestore();
});