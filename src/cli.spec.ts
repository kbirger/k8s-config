import * as cmds from './commands';
import * as cli from './cli';
jest.mock('./commands');

describe('cli', () => {
  describe('delete command', () => {
    it('should call delete', () => {

      const args = cli.startCli(['delete', '/path/to/file', 'context', 'test-context']);

      expect(args).not.toBeNull();
      expect(cmds.deleteItem).toHaveBeenCalledWith('/path/to/file', 'context', 'test-context', false);
    });

    it('should parse dry-run delete', () => {

      const args = cli.startCli(['delete', '/path/to/file', 'context', 'test-context', '-d']);

      expect(args).not.toBeNull();
      expect(cmds.deleteItem).toHaveBeenCalledWith('/path/to/file', 'context', 'test-context', true);
    });
  });
});