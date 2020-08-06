type CommandModuleType = typeof import('..');
type MockedCommandModule = { [P in keyof CommandModuleType]: jest.Mock };
const actual = jest.requireActual('..') as CommandModuleType;
const mocked = jest.genMockFromModule('..') as MockedCommandModule;


mocked.compose = jest.fn(function () {
  console.log('composing');
  // eslint-disable-next-line prefer-rest-params
  actual.compose.apply(null, arguments);
});
mocked.header.mockImplementation(() => true);
module.exports = mocked;
