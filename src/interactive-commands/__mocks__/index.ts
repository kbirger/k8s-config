
(function () {
  type InteractiveCommandModuleType = typeof import('..');
  type MockedInteractiveCommandModule = { [P in keyof InteractiveCommandModuleType]: jest.Mock };
  const mocked = jest.genMockFromModule('..') as MockedInteractiveCommandModule;


  mocked.interactiveCommand.mockReturnValue(true);
  module.exports = mocked;
})();