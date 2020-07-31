(function () {
  const fs = jest.requireActual('fs');

  type FsType = typeof import('fs');
  type MockedFsType = { [P in keyof FsType]: jest.Mock };

  const original = jest.genMockFromModule('fs') as MockedFsType;
  original.existsSync.mockImplementation(() => true);
  original.readFileSync.mockImplementation(() => fs.readFileSync('./test/test.yaml', 'utf8'));
  original.writeFileSync.mockImplementation(() => { /* */ });
  original.copyFileSync.mockImplementation(() => { /* */ });

  module.exports = original;
})();