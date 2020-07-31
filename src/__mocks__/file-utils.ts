import * as fs from 'fs';
import * as yaml from 'js-yaml';

(function () {
  type FileUtilsModule = typeof import('../file-utils');
  type MockedFileUtilsModule = { [P in keyof FileUtilsModule]: jest.Mock };

  type X = Partial<FileUtilsModule>
  const fu = jest.genMockFromModule('../file-utils') as MockedFileUtilsModule;

  function getTestFile() {
    return yaml.load(fs.readFileSync('./test/test.yaml', 'utf8'));
  }


  fu.loadConfig.mockImplementation(getTestFile);

  module.exports = fu;
})();

