import * as cmds from './commands';
import * as cli from './cli';
import * as interactive from './interactive-commands';

jest.mock('./commands');
jest.mock('./interactive-commands');

describe('cli', () => {
  describe('delete command', () => {
    it('should call delete', () => {

      const args = cli.startCli(['delete', '/path/to/file', 'context', 'test-context']);

      expect(args).not.toBeNull();
      expect(args.from).toEqual('/path/to/file');
      expect(args.type).toEqual('context');
      expect(args.name).toEqual('test-context');
      expect(cmds.deleteItem).toHaveBeenCalledWith('/path/to/file', 'context', 'test-context', false);
    });

    it('should parse dry-run delete', () => {

      const args = cli.startCli(['delete', '/path/to/file', 'context', 'test-context', '-d']);

      expect(args).not.toBeNull();
      expect(cmds.deleteItem).toHaveBeenCalledWith('/path/to/file', 'context', 'test-context', true);
    });
  });

  describe('rename command', () => {
    it('should call rename', () => {
      const args = cli.startCli(['rename', '/path/to/file', 'context', 'old-context', 'new-context']);

      expect(args).not.toBeNull();
      expect(args.from).toEqual('/path/to/file');
      expect(args.type).toEqual('context');
      expect(args.old).toEqual('old-context');
      expect(args.new).toEqual('new-context');
      expect(args.dryRun).toEqual(false);
      expect(cmds.rename).toHaveBeenCalledWith('/path/to/file', 'context', 'old-context', 'new-context', false);
    });

    it('should parse dry-run', () => {
      const args = cli.startCli(['rename', '/path/to/file', 'context', 'old-context', 'new-context', '-d']);

      expect(args).not.toBeNull();
      expect(args.from).toEqual('/path/to/file');
      expect(args.type).toEqual('context');
      expect(args.old).toEqual('old-context');
      expect(args.new).toEqual('new-context');
      expect(args.dryRun).toEqual(true);

      expect(cmds.rename).toHaveBeenCalledWith('/path/to/file', 'context', 'old-context', 'new-context', true);
    });
  });

  describe('list command', () => {
    it('should call list', () => {
      const args = cli.startCli(['list', '/path/to/file', 'context']);

      expect(args).not.toBeNull();
      expect(args.from).toEqual('/path/to/file');
      expect(args.type).toEqual('context');
      expect(args.dryRun).toEqual(false);

      expect(cmds.list).toHaveBeenCalledWith('/path/to/file', 'context');

    });

    it('should parse dry-run', () => {
      const args = cli.startCli(['list', '/path/to/file', 'context', '-d']);

      expect(args).not.toBeNull();
      expect(args.dryRun).toEqual(true);
      expect(cmds.list).toHaveBeenCalledWith('/path/to/file', 'context');

    });
  });

  describe('merge command', () => {
    it('should call merge', () => {
      const args = cli.startCli(['merge', '/path/to/source', '/path/to/target']);

      expect(args).not.toBeNull();
      expect(args.dryRun).toEqual(false);
      expect(args.from).toEqual('/path/to/source');
      expect(args.to).toEqual('/path/to/target');

      expect(cmds.merge).toHaveBeenCalledWith('/path/to/source', '/path/to/target', false);
    });

    it('should parse dry-run', () => {
      const args = cli.startCli(['merge', '/path/to/source', '/path/to/target', '-d']);

      expect(args).not.toBeNull();
      expect(args.dryRun).toEqual(true);
    });
  });

  describe('interactive command', () => {
    it('should call interactive by default', () => {
      const args = cli.startCli([]);

      expect(args).not.toBeNull();
      expect(interactive.interactiveCommand).toHaveBeenCalledWith(false, undefined);
    });

    it('should call interactive by name', () => {
      const args = cli.startCli(['interactive']);

      expect(args).not.toBeNull();
      expect(interactive.interactiveCommand).toHaveBeenCalledWith(false, undefined);
    });
  });

  it('should call interactive by alias', () => {
    const args = cli.startCli(['i']);

    expect(args).not.toBeNull();
    expect(interactive.interactiveCommand).toHaveBeenCalledWith(false, undefined);
  });

  it('should parse dry-run', () => {
    const args = cli.startCli(['-d']);

    expect(args).not.toBeNull();
    expect(args.dryRun).toEqual(true);
    expect(interactive.interactiveCommand).toHaveBeenCalledWith(true, undefined);

  });

  it('should pass command name', () => {
    const args = cli.startCli(['i', 'merge']);

    expect(args).not.toBeNull();
    expect(interactive.interactiveCommand).toHaveBeenCalledWith(false, 'merge');
  });
});