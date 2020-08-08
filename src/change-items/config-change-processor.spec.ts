import { ConfigChangeProcessor, processConfigChanges } from './config-change-processor';
import { Config } from '../interfaces';
import { AddItem, Actions, AddNamedItem } from './interfaces';
import { ProcessorResultState } from './change-visitor';
import 'inquirer';

let mockInquirerResponse = { confirm: 'abort' };
jest.mock('inquirer', () => {
  return {
    prompt: jest.fn().mockImplementation(() => Promise.resolve(mockInquirerResponse))
  };
});

describe('config-change-processor', () => {

  describe('ConfigChangeProcessor', () => {
    let processor: ConfigChangeProcessor = null;
    let config: Config;

    beforeEach(() => {
      processor = new ConfigChangeProcessor();
      config = {
        clusters: [],
        contexts: [],
        users: [],
        'current-context': '',
        apiVersion: 'v1',
        kind: 'Config'
      };
    });

    describe('processAddItem', () => {
      it('should error on adding an unnamed item', async () => {
        // Arrange
        const addItem: AddItem = {
          action: Actions.Add,
          change: {
            path: 'clusters',
          },
          itemType: 'cluster',
          newValue: { test: true }
        };

        // Act
        const result = await processor.processAddItem(config, addItem);

        // Assert
        expect(result).toEqual({
          state: ProcessorResultState.Error,
          error: 'Adding of unnamed items is not supported',
          extraItems: []
        });
      });

      it('should add an item', async () => {
        // Arrange
        const addItem: AddNamedItem = {
          action: Actions.Add,
          change: {
            path: 'clusters',
            field: 'name'
          },
          name: 'foo',
          itemType: 'cluster',
          newValue: { test: true }
        };

        // Act
        const result = await processor.processAddItem(config, addItem);

        // Assert
        expect(result).toEqual({
          state: ProcessorResultState.Success,
          error: null,
          extraItems: []
        });

        expect(config.clusters).toHaveLength(1);
        expect(config.clusters[0]).toEqual({ test: true });
      });

    });

    describe('processDeleteUnnamedItem', () => {
      it('should return a rejected promise', async () => {
        const result = await processor.processDeleteUnnamedItem(config,
          {
            action: Actions.Delete,
            change: {
              path: 'contexts'
            },
            itemType: 'context'
          });

        expect(result.state).toEqual(ProcessorResultState.Error);
        expect(result.error).toEqual('Deleting of Unnamed items is not supported');
      });
    });

    describe('conflicts', () => {
      it('should handle skip', async () => {
        // Arrange
        mockInquirerResponse = { confirm: 'skip' };
        config.users.push({
          name: 'foo1',
          user: {}
        });
        config.users.push({
          name: 'foo2',
          user: {}
        });
        // Act
        const result = await processor.processChangeValueNamedItem(config,
          {
            action: Actions.Change,
            change: {
              path: 'users',
              field: 'name'
            },
            itemType: 'user',
            newValue: 'foo2',
            oldValue: 'foo'
          });
        // Assert
        expect(result.state).toEqual(ProcessorResultState.Skip);
        expect(result.error).toEqual("user with name 'foo2' already exists");
      });
    });
  });
});