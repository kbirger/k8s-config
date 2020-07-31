import { processConfigChanges } from './config-change-processor';
import { Config } from '../interfaces';
import { Actions } from './interfaces';

const config = {
  "apiVersion": "v1",
  "clusters": [
    {
      "cluster": {
        "server": "https://localhost"
      },
      "name": "test-cluster"
    }
  ],
  "contexts": [
    {
      "context": {
        "cluster": "test-cluster",
        "namespace": "default",
        "user": "test-user"
      },
      "name": "test-ctx"
    }
  ],
  "current-context": "test-ctx",
  "kind": "Config",
  "preferences": {},
  "users": [
    {
      "name": "test-user",
      "user": {
        "client-certificate-data": "test-cert-data",
        "client-key-data": "test-key-data"
      }
    }
  ]
} as Config;

const configMerge = {
  "apiVersion": "v1",
  "clusters": [
    {
      "cluster": {
        "server": "https://localhost"
      },
      "name": "test-cluster-new"
    }
  ],
  "contexts": [
    {
      "context": {
        "cluster": "test-cluster-new",
        "namespace": "default",
        "user": "test-user-new"
      },
      "name": "test-ctx-new"
    }
  ],
  "current-context": "test-ctx-new",
  "kind": "Config",
  "preferences": {},
  "users": [
    {
      "name": "test-user-new",
      "user": {
        "client-certificate-data": "test-cert-data",
        "client-key-data": "test-key-data"
      }
    }
  ]
} as Config;


const configMergeWithConflicts = {
  "apiVersion": "v1",
  "clusters": [
    {
      "cluster": {
        "server": "https://localhost/new"
      },
      "name": "test-cluster"
    },
    {
      "cluster": {
        "server": "https://localhost"
      },
      "name": "test-cluster2"
    }
  ],
  "contexts": [
    {
      "context": {
        "cluster": "test-cluster",
        "namespace": "default",
        "user": "test-user2"
      },
      "name": "test-ctx"
    },
    {
      "context": {
        "cluster": "test-cluster2",
        "namespace": "default",
        "user": "test-user2"
      },
      "name": "test-ctx2"
    }
  ],
  "current-context": "test-ctx",
  "kind": "Config",
  "preferences": {},
  "users": [
    {
      "name": "test-user",
      "user": {
        "client-certificate-data": "test-cert-data",
        "client-key-data": "test-key-data"
      }
    },
    {
      "name": "test-user2",
      "user": {
        "client-certificate-data": "test-cert-data",
        "client-key-data": "test-key-data"
      }
    }
  ]
} as Config;



async function go() {
  // const testDeleteNamed = await processor.process(config,
  //   new LinkedList([{ action: Actions.Delete, field: 'context', name: 'test-ctx' }]));

  console.log('testAddNamed');
  const testAddNamed = await processConfigChanges(config,
    [{
      action: Actions.Add,
      itemType: 'context',
      name: 'test-ctx',
      change: {
        path: 'contexts',
        field: 'name'
      },
      newValue: {
        "context": {
          "cluster": "test-cluster",
          "namespace": "default",
          "user": "test-user2"
        },
        "name": "test-ctx"
      }
    }]);

  console.log('testChange');
  const testChange = await processConfigChanges(config,
    [{
      action: Actions.Change,
      itemType: 'cluster',
      change: {
        path: 'clusters',
        field: 'name'
      },
      oldValue: 'test-cluster',
      newValue: 'best-cluster'
    }]);
}

go();

