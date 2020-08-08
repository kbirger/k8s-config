type CommandModuleType = typeof import('..');
type MockedCommandModule = { [P in keyof CommandModuleType]: jest.Mock };
const actual = jest.requireActual('..') as CommandModuleType;
const mocked = jest.genMockFromModule('..') as MockedCommandModule;


mocked.compose = jest.fn(function () {
  // eslint-disable-next-line prefer-rest-params
  return actual.compose.apply(null, arguments);
});
mocked.header.mockReturnValue(true);

mocked.deleteItem.mockReturnValue(true);
module.exports = mocked;
