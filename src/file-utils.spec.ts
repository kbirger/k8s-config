import * as fileUtils from './file-utils';
import * as fs from 'fs';
import { Config } from './interfaces';
import 'moment';

jest.mock('fs');
jest.mock('moment', () => () => ({ format: () => '20200101-001122333' }));

describe('file-utils', () => {
  const testConfig: Readonly<Config> = {
    apiVersion: 'v1',
    clusters: [{
      cluster: {
        server: 'https://localhost'
      },
      name: 'test-cluster'
    }],
    contexts: [{
      context: {
        cluster: 'test-cluster',
        namespace: 'default',
        user: 'test-user'
      },
      name: 'test-ctx'
    }],
    'current-context': 'test-ctx',
    kind: 'Config',
    users: [{
      name: 'test-user',
      user: {
        'client-certificate-data': 'test-cert-data',
        'client-key-data': 'test-key-data'
      }
    }]
  };

  it('shall read config', () => {
    // Act
    const cfg = fileUtils.loadConfig('./test/test.yaml');

    // Assert
    expect(cfg).toMatchObject(testConfig);
  });

  it('shall save config', () => {
    // Act
    fileUtils.saveConfig('/tmp/foo.yaml', testConfig);

    // Assert
    expect(fs.writeFileSync).toHaveBeenCalledWith('/tmp/foo.yaml', expect.any(String), 'utf8');
  });

  it('shall create backup file', () => {
    // Act
    fileUtils.backup('/tmp/foo');

    // Assert
    expect(fs.copyFileSync).toHaveBeenCalledWith('/tmp/foo', '/tmp/foo-bak-20200101-001122333');
    expect(console.log).toHaveBeenCalledWith('Backing up to /tmp/foo-bak-20200101-001122333');
  });
});