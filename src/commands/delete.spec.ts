import { deleteItem } from './delete';
import * as fileUtils from '../file-utils';
jest.mock('../file-utils');

describe('delete command', () => {
  describe('dry-run true', () => {
    it('should not back up existing file', async () => {
      // Act
      await deleteItem('./test/test.yaml', 'context', 'test-ctx', true);

      // Assert
      expect(fileUtils.backup).not.toHaveBeenCalled();
    });

    it('should not save results to disk', async () => {
      // Act
      await deleteItem('./test/test.yaml', 'context', 'test-ctx', true);

      // Assert
      expect(fileUtils.saveConfig).not.toHaveBeenCalled();
    });
  });

  describe('dry-run false', () => {
    it('should back up existing file when not in dry-run', async () => {
      // Act
      await deleteItem('./test/test.yaml', 'context', 'test-ctx');

      // Assert
      expect(fileUtils.backup).toHaveBeenCalledTimes(1);
    });

    it('should save results to disk', async () => {
      // Act
      await deleteItem('./test/test.yaml', 'context', 'test-ctx');

      // Assert
      expect(fileUtils.saveConfig).toHaveBeenCalledTimes(1);
    });
  });

  it('should return false when an IO error occurs', async () => {
    // Arrange
    jest.spyOn(fileUtils, 'loadConfig')
      .mockImplementationOnce(() => { throw new Error('failed to read somesuch'); });

    // Act
    const result = await deleteItem('./test/test.yaml', 'context', 'test-ctx');

    // Assert
    expect(result).toEqual(false);
  });


  describe('context', () => {
    it('should return false when context is not found', async () => {
      // Act
      const result = await deleteItem('./test/test.yaml', 'context', 'FOO');

      // Assert
      expect(result).toEqual(false);
    });

    it('should log an error when context is not found', async () => {
      // Act
      await deleteItem('./test/test.yaml', 'context', 'FOO');

      // Assert
      expect(console.error).toHaveBeenCalledWith('Errors occurred:');
      expect(console.error).toHaveBeenCalledWith(' Configuration does not contain a context with name \'FOO\'');
    });

    it('return true when cluster is found', async () => {
      // Act
      const result = await deleteItem('./test/test.yaml', 'context', 'test-ctx');

      // Assert
      expect(result).toEqual(true);
      expect(console.error).not.toHaveBeenCalled();
    });

    it('remove found cluster', async () => {
      // Act
      const result = await deleteItem('./test/test.yaml', 'context', 'test-ctx');

      // Assert
      expect(result).toEqual(true);
      expect(fileUtils.saveConfig)
        .toHaveBeenCalledWith('./test/test.yaml', expect.objectContaining({ contexts: [] }))
    });
  });

  describe('cluster', () => {
    it('should return false when cluster is not found', async () => {
      // Act
      const result = await deleteItem('./test/test.yaml', 'cluster', 'FOO');

      // Assert
      expect(result).toEqual(false);
    });

    it('should log an error when cluster is not found', async () => {
      // Act
      await deleteItem('./test/test.yaml', 'cluster', 'FOO');

      // Assert
      expect(console.error).toHaveBeenCalledWith(" Configuration does not contain a cluster with name 'FOO'");
    });

    it('return true when cluster is found', async () => {
      // Act
      const result = await deleteItem('./test/test.yaml', 'cluster', 'test-cluster');

      // Assert
      expect(result).toEqual(true);
      expect(console.error).not.toHaveBeenCalled();
    });

    it('remove found cluster', async () => {
      // Act
      await deleteItem('./test/test.yaml', 'cluster', 'test-cluster');

      // Assert
      expect(fileUtils.saveConfig)
        .toHaveBeenCalledWith('./test/test.yaml', expect.objectContaining({ clusters: [] }))
    });
  });

  describe('user', () => {
    it('should return false when user is not found', async () => {
      // Act
      const result = await deleteItem('./test/test.yaml', 'user', 'FOO');

      // Assert
      expect(result).toEqual(false);
    });

    it('should log an error when user is not found', async () => {
      // Act
      await deleteItem('./test/test.yaml', 'user', 'FOO');

      // Assert
      expect(console.error).toHaveBeenCalledWith(' Configuration does not contain a user with name \'FOO\'');
    });

    it('return true when user is found', async () => {
      // Act
      const result = await deleteItem('./test/test.yaml', 'user', 'test-user');

      // Assert
      expect(result).toEqual(true);
      expect(console.error).not.toHaveBeenCalled();
    });

    it('remove found user', async () => {
      // Act
      await deleteItem('./test/test.yaml', 'user', 'test-user');

      // Assert
      expect(fileUtils.saveConfig)
        .toHaveBeenCalledWith('./test/test.yaml', expect.objectContaining({ users: [] }))
    });
  });
});