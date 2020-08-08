// todo: rename user when multiple contexts have it. how does jsonpath match work on this?

import * as fileUtils from '../file-utils';
import { rename } from './rename';
import 'inquirer';

jest.mock('../file-utils');
let mockInquirerResponse = { confirm: 'abort' };
jest.mock('inquirer', () => {
  return {
    prompt: jest.fn().mockImplementation(() => Promise.resolve(mockInquirerResponse))
  };
});

describe('rename command', () => {
  it('should backup when not in dry-run', async () => {
    // Act
    await rename('a', 'context', 'b', 'c');

    // Assert
    expect(fileUtils.backup).toHaveBeenCalledWith('a');
  });

  it('should not backup when in dry-run', async () => {
    // Act
    await rename('a', 'context', 'b', 'c', true);


    // Assert
    expect(fileUtils.backup).not.toHaveBeenCalled();
  });

  it('should report error when io fails', async () => {
    // Arrange
    jest.spyOn(fileUtils, 'loadConfig')
      .mockImplementationOnce(() => { throw new Error('could not read'); });

    // Act
    const result = await rename('a', 'context', 'b', 'c');

    expect(result).toEqual(false);
    expect(console.error).toHaveBeenCalledWith('could not read');
  });

  describe('cluster', () => {
    it('should succeed renaming a cluster to the same name', async () => {
      // Arrange

      // Act
      await rename('a', 'cluster', 'test-cluster', 'test-cluster');

      // Assert
      expect(fileUtils.saveConfig).toHaveBeenCalledWith('a', expect.objectContaining(fileUtils.loadConfig('a')));
    });

    it('should succeed when target exists and user confirms', async () => {
      // Arrange
      const config = fileUtils.loadConfig('a');
      config.clusters.push({
        cluster: {
          server: 'https://localhost'
        },
        name: 'foo'
      });

      jest.spyOn(fileUtils, 'loadConfig').mockReturnValueOnce(config);
      mockInquirerResponse = { confirm: 'overwrite' };
      // Act
      const response = await rename('a', 'cluster', 'test-cluster', 'foo', false);

      // Assert
      expect(response).toEqual(true);
      expect(fileUtils.saveConfig)
        .toHaveBeenCalledWith('a', expect.objectContaining({
          'apiVersion': 'v1',
          'clusters': [
            {
              'cluster': {
                'server': 'https://localhost'
              },
              'name': 'foo'
            }
          ],
          'contexts': [
            {
              'context': {
                'cluster': 'foo',
                'namespace': 'default',
                'user': 'test-user'
              },
              'name': 'test-ctx'
            }
          ],
          'current-context': 'test-ctx',
          'kind': 'Config',
          'preferences': {},
          'users': [
            {
              'name': 'test-user',
              'user': {
                'client-certificate-data': 'test-cert-data',
                'client-key-data': 'test-key-data'
              }
            }
          ]
        }));
    });

    it('should fail and make no changes when target exists and is aborted', async () => {
      // Arrange
      const config = fileUtils.loadConfig('a');
      config.clusters.push({
        cluster: {
          server: 'https://localhost'
        },
        name: 'foo'
      });

      jest.spyOn(fileUtils, 'loadConfig').mockReturnValueOnce(config);
      mockInquirerResponse = { confirm: 'abort' };
      // Act
      const response = await rename('a', 'cluster', 'test-cluster', 'foo', false);

      // Assert
      expect(response).toEqual(false);
      expect(fileUtils.saveConfig)
        .not.toHaveBeenCalledWith('a', expect.objectContaining({
          'apiVersion': 'v1',
          'clusters': [
            {
              'cluster': {
                'server': 'https://localhost'
              },
              'name': 'foo'
            }
          ],
          'contexts': [
            {
              'context': {
                'cluster': 'foo',
                'namespace': 'default',
                'user': 'test-user'
              },
              'name': 'test-ctx'
            }
          ],
          'current-context': 'test-ctx',
          'kind': 'Config',
          'preferences': {},
          'users': [
            {
              'name': 'test-user',
              'user': {
                'client-certificate-data': 'test-cert-data',
                'client-key-data': 'test-key-data'
              }
            }
          ]
        }));
      expect(console.log).not.toHaveBeenCalled();

    });

    it('should log nothing when renaming a cluster to the same name', async () => {
      // Arrange

      // Act
      await rename('a', 'cluster', 'test-cluster', 'test-cluster');

      // Assert
      expect(console.log).not.toHaveBeenCalled();
    });

    it('should rename a cluster and context using it', async () => {
      // Arrange
      const expectedConfig = fileUtils.loadConfig('a');
      expectedConfig.clusters[0].name = 'test-cluster2';
      expectedConfig.contexts[0].context.cluster = 'test-cluster2';

      // Act
      const result = await rename('a', 'cluster', 'test-cluster', 'test-cluster2');

      // Assert
      expect(result).toEqual(true);
      expect(console.log).toHaveBeenCalledWith('Changed clusters[?].cluster: test-cluster => test-cluster2');
      expect(console.log).toHaveBeenCalledWith('Changed contexts[?].context: test-cluster => test-cluster2');
      expect(fileUtils.saveConfig).toHaveBeenCalledWith('a', expect.objectContaining(expectedConfig));
    });

    it('should rename a cluster', async () => {
      // Arrange
      const expectedConfig = fileUtils.loadConfig('a');
      expectedConfig.clusters[0].name = 'test-cluster2';
      expectedConfig.contexts[0].context.cluster = 'something-else';

      const originalConfig = fileUtils.loadConfig('a');
      originalConfig.contexts[0].context.cluster = 'something-else';
      jest.spyOn(fileUtils, 'loadConfig').mockImplementationOnce(() => originalConfig);


      // Act
      await rename('a', 'cluster', 'test-cluster', 'test-cluster2');

      // Assert
      expect(console.log).toHaveBeenCalledWith('Changed clusters[?].cluster: test-cluster => test-cluster2');
      expect(fileUtils.saveConfig).toHaveBeenCalledWith('a', expect.objectContaining(expectedConfig));
    });

    it('should rename a cluster when target exists', async () => {
      // Arrange
      const expectedConfig = fileUtils.loadConfig('a');
      const originalConfig = fileUtils.loadConfig('a');
      originalConfig.clusters.push({
        cluster: {
          server: 'foo'
        },
        name: 'test-cluster2'
      });
      expectedConfig.clusters[0].name = 'test-cluster2';
      expectedConfig.clusters[0].cluster.server = 'https://localhost';
      jest.spyOn(fileUtils, 'loadConfig').mockImplementationOnce(() => originalConfig);
      mockInquirerResponse = { confirm: 'overwrite' };
      expectedConfig.clusters[0].name = 'test-cluster2';
      expectedConfig.contexts[0].context.cluster = 'test-cluster2';
      // Act
      await rename('a', 'cluster', 'test-cluster', 'test-cluster2');

      // Assert
      expect(console.log).toHaveBeenCalledWith("Deleted cluster with name='test-cluster2'");
      expect(console.log).toHaveBeenCalledWith('Changed clusters[?].cluster: test-cluster => test-cluster2');
      expect(console.log).toHaveBeenCalledWith('Changed contexts[?].context: test-cluster => test-cluster2');
      expect(fileUtils.saveConfig).toHaveBeenCalledWith('a', expect.objectContaining(expectedConfig));
    });

    it('should fail when original cluster is not found', async () => {
      // Act
      await rename('a', 'cluster', 'foo', 'bar');

      // Assert
      expect(console.error).toHaveBeenCalledWith(' Operation impossible: No cluster at path \'$.clusters[?(@.name=="foo")].name\' exists.');
    });
  });

  describe('context', () => {
    it('should succeed renaming a context to the same name', async () => {
      // Arrange

      // Act
      await rename('a', 'context', 'test-ctx', 'test-ctx');

      // Assert
      expect(fileUtils.saveConfig).toHaveBeenCalledWith('a', expect.objectContaining(fileUtils.loadConfig('a')));
    });

    it('should log nothing when renaming a context to the same name', async () => {
      // Arrange

      // Act
      await rename('a', 'context', 'test-ctx', 'test-ctx');

      // Assert
      expect(console.log).not.toHaveBeenCalled();
    });

    it('should rename a context', async () => {
      // Arrange
      const expectedConfig = fileUtils.loadConfig('a');
      expectedConfig.contexts[0].name = 'test-ctx2';
      expectedConfig['current-context'] = 'test-ctx2';

      // Act
      const result = await rename('a', 'context', 'test-ctx', 'test-ctx2');

      // Assert
      expect(result).toEqual(true);
      expect(console.log).toHaveBeenCalledWith('Changed contexts[?].context: test-ctx => test-ctx2');
      expect(console.log).toHaveBeenCalledWith('Changed current-context: test-ctx => test-ctx2');
      expect(fileUtils.saveConfig).toHaveBeenCalledWith('a', expect.objectContaining(expectedConfig));
    });

    it('should rename a context when target exists', async () => {
      // Arrange
      const expectedConfig = fileUtils.loadConfig('a');
      const originalConfig = fileUtils.loadConfig('a');
      originalConfig.contexts.push({
        name: 'test-ctx2',
        context: {
          cluster: 'test-cluster',
          user: 'test-user'
        }
      });
      expectedConfig.contexts[0].name = 'test-ctx2';
      expectedConfig.contexts[0].context.cluster = 'test-cluster';
      expectedConfig['current-context'] = 'test-ctx2';
      jest.spyOn(fileUtils, 'loadConfig').mockImplementationOnce(() => originalConfig);
      mockInquirerResponse = { confirm: 'overwrite' };
      // Act
      await rename('a', 'context', 'test-ctx', 'test-ctx2');

      // Assert
      expect(console.log).toHaveBeenCalledWith("Deleted context with name='test-ctx2'");
      expect(console.log).toHaveBeenCalledWith('Changed contexts[?].context: test-ctx => test-ctx2');
      expect(console.log).toHaveBeenCalledWith('Changed current-context: test-ctx => test-ctx2');

      expect(fileUtils.saveConfig).toHaveBeenCalledWith('a', expect.objectContaining(expectedConfig));
    });

    it('should fail when original context is not found', async () => {
      // Act
      await rename('a', 'context', 'foo', 'bar');

      // Assert
      expect(console.error).toHaveBeenCalledWith(' Operation impossible: No context at path \'$.contexts[?(@.name=="foo")].name\' exists.');
    });
  });

  describe('user', () => {
    it('should succeed renaming a user to the same name', async () => {
      // Arrange

      // Act
      await rename('a', 'user', 'test-user', 'test-user');

      // Assert
      expect(fileUtils.saveConfig).toHaveBeenCalledWith('a', expect.objectContaining(fileUtils.loadConfig('a')));
    });

    it('should log nothing when renaming a user to the same name', async () => {
      // Arrange

      // Act
      await rename('a', 'user', 'test-user', 'test-user');

      // Assert
      expect(console.log).not.toHaveBeenCalled();
    });

    it('should rename a user', async () => {
      // Arrange
      const expectedConfig = fileUtils.loadConfig('a');
      expectedConfig.users[0].name = 'test-user2';
      expectedConfig.contexts[0].context.user = 'test-user2';

      // Act
      const result = await rename('a', 'user', 'test-user', 'test-user2');

      // Assert
      expect(result).toEqual(true);
      expect(console.log).toHaveBeenCalledWith('Changed users[?].user: test-user => test-user2');
      expect(fileUtils.saveConfig).toHaveBeenCalledWith('a', expect.objectContaining(expectedConfig));
    });

    it('should rename a user when target exists', async () => {
      // Arrange
      const expectedConfig = fileUtils.loadConfig('a');
      const originalConfig = fileUtils.loadConfig('a');
      originalConfig.users.push({
        name: 'test-user2',
        user: {
          'client-certificate-data': 'test-cert-data',
          'client-key-data': 'test-key-data'
        }
      });
      expectedConfig.users[0].name = 'test-user2';
      expectedConfig.users[0].user['client-certificate-data'] = 'test-cert-data';
      expectedConfig.users[0].user['client-key-data'] = 'test-key-data';
      expectedConfig.contexts[0].context.user = 'test-user2';
      jest.spyOn(fileUtils, 'loadConfig').mockImplementationOnce(() => originalConfig);
      mockInquirerResponse = { confirm: 'overwrite' };
      // Act
      await rename('a', 'user', 'test-user', 'test-user2');

      // Assert
      expect(console.log).toHaveBeenCalledWith("Deleted user with name='test-user2'");
      expect(console.log).toHaveBeenCalledWith('Changed users[?].user: test-user => test-user2');
      expect(console.log).toHaveBeenCalledWith('Changed contexts[?].context: test-user => test-user2');
      expect(fileUtils.saveConfig).toHaveBeenCalledWith('a', expect.objectContaining(expectedConfig));
    });

    it('should fail when original user is not found', async () => {
      // Act
      await rename('a', 'user', 'foo', 'bar');

      // Assert
      expect(console.error).toHaveBeenCalledWith(' Operation impossible: No user at path \'$.users[?(@.name=="foo")].name\' exists.');
    });
  });
});