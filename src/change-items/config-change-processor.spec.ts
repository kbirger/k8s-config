import { ConfigChangeProcessor, processConfigChanges } from './config-change-processor';
import { Config } from '../interfaces';
import { AddItem, Actions, AddNamedItem } from './interfaces';
import { ProcessorResultState } from './change-visitor';

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
          extraItems: null
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
          field: 'cluster',
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
          extraItems: null
        });

        expect(config.clusters).toHaveLength(1);
        expect(config.clusters[0]).toEqual({ test: true });
      });

    });
  });
});