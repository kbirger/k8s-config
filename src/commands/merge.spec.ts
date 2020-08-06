import * as fileUtils from '../file-utils';
import { merge } from './merge';
import 'inquirer';
import { Config } from '../interfaces';

jest.mock('../file-utils');
let mockInquirerResponse = { confirm: 'abort' };
jest.mock('inquirer', () => {
  return {
    prompt: jest.fn().mockImplementation(() => Promise.resolve(mockInquirerResponse))
  };
});

function mockSecondConfig() {
  jest.spyOn(fileUtils, 'loadConfig').mockImplementationOnce(() => ({
    apiVersion: 'v1',
    clusters: [{
      cluster: {
        server: 'https://localhost'
      },
      name: 'test-cluster2'
    }],
    contexts: [{
      context: {
        cluster: 'test-cluster2',
        namespace: 'default',
        user: 'test-user2'
      },
      name: 'test-ctx2'
    }],
    'current-context': 'test-ctx2',
    kind: 'Config',
    preferences: {},
    users: [{
      name: 'test-user2',
      user: {
        'client-certificate-data': 'test-cert-data',
        'client-key-data': 'test-key-data'
      }
    }]
  }));
}

function mockSecondConfigWithConflicts() {
  jest.spyOn(fileUtils, 'loadConfig').mockImplementationOnce(() => ({
    apiVersion: 'v1',
    clusters: [{
      cluster: {
        server: 'https://localhost/second'
      },
      name: 'test-cluster'
    }],
    contexts: [{
      context: {
        cluster: 'test-cluster2',
        namespace: 'default',
        user: 'test-user'
      },
      name: 'test-ctx2'
    }],
    'current-context': 'test-ctx2',
    kind: 'Config',
    preferences: {},
    users: [{
      name: 'test-user',
      user: {
        'client-certificate-data': 'test-cert-data',
        'client-key-data': 'test-key-data'
      }
    }]
  }));
}

describe('merge command', () => {
  it('should backup when not in dry-run', async () => {
    // Act
    await merge('a', 'b', false);

    // Assert
    expect(fileUtils.backup).toHaveBeenCalledWith('b');
  });

  it('should not backup when in dry-run', async () => {
    // Act
    await merge('a', 'b', true);

    // Assert
    expect(fileUtils.backup).not.toHaveBeenCalled();
  });

  it('should load both from and to configs', async () => {
    // Act
    await merge('a', 'b', true);

    // Assert
    expect(fileUtils.loadConfig).toHaveBeenCalledWith('a');
    expect(fileUtils.loadConfig).toHaveBeenCalledWith('b');
  });

  it('should merge without errors', async () => {
    // Arrange
    mockSecondConfig();

    // Act
    await merge('a', 'b', true);

    // Assert
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should merge', async () => {
    // Arrange
    mockSecondConfig();

    // Act
    await merge('a', 'b', false);

    // Assert
    expect(fileUtils.saveConfig).toHaveBeenCalledWith('b', expect.anything());
    const spy = (fileUtils.saveConfig as unknown as jest.SpyInstance);
    const toObj = spy.mock.calls[0][1] as Config;

    expect(toObj.clusters).toHaveLength(2);
    expect(toObj.users).toHaveLength(2);
    expect(toObj.contexts).toHaveLength(2);
    expect(toObj.clusters.map(c => c.name)).toEqual(['test-cluster', 'test-cluster2']);
    expect(toObj.contexts.map(c => c.name)).toEqual(['test-ctx', 'test-ctx2']);
    expect(toObj.users.map(c => c.name)).toEqual(['test-user', 'test-user2']);
  });

  it('should merge with conflict when confirmed', async () => {
    // Arrange
    mockSecondConfigWithConflicts();
    mockInquirerResponse = { confirm: 'overwrite' };

    // Act
    await merge('a', 'b');

    // Assert
    expect(fileUtils.saveConfig).toHaveBeenCalledWith('b', expect.anything());
    const spy = (fileUtils.saveConfig as unknown as jest.SpyInstance);
    const toObj = spy.mock.calls[0][1] as Config;

    expect(toObj.clusters).toHaveLength(1);
    expect(toObj.users).toHaveLength(1);
    expect(toObj.contexts).toHaveLength(2);
    expect(toObj.clusters[0].cluster.server).toEqual('https://localhost/second');
    expect(toObj.clusters.map(c => c.name)).toEqual(['test-cluster']);
    expect(toObj.contexts.map(c => c.name)).toEqual(['test-ctx', 'test-ctx2']);
    expect(toObj.users.map(c => c.name)).toEqual(['test-user']);
  });

  it('should not merge with conflict when not confirmed', async () => {
    // Arrange
    mockSecondConfigWithConflicts();
    mockInquirerResponse = { confirm: 'abort' };

    // Act
    await merge('a', 'b', false);

    // Assert
    expect(fileUtils.saveConfig).not.toHaveBeenCalledWith('b', expect.anything());
    expect(console.error).toHaveBeenCalledTimes(2);
    expect(console.error).toHaveBeenCalledWith('Errors occurred:');
    expect(console.error).toHaveBeenCalledWith(' cluster with name \'test-cluster\' already exists');
    // todo: make display all errors
    // expect(console.error).toHaveBeenCalledWith(" Target 'users' already contains object with name=test-user.");
  });
});