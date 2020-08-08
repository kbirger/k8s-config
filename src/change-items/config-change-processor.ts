import { Config, NamedItem } from '../interfaces';
import { ChangeNamedItem, DeleteNamedItem, DeleteItem, ChangeValueItem, AddNamedItem, AddItem, Actions, ChangeItem } from './interfaces';
import { cloneDeep, get } from 'lodash';
import { isAddNamedItem, isNamed } from './guards';
import * as inquirer from 'inquirer';
import { readChanges } from './change-reader';
import { ChangeProcessor, processChanges, ProcessorResult } from './change-visitor';
import jp from 'jsonpath';
import { getJsonpath } from './path-builder';

type ConfigChangeResult = { success: boolean, state: Config };
export async function processConfigChanges(config: Config, changes: ChangeItem[]): Promise<ConfigChangeResult> {
  const state = cloneDeep(config);
  const { success, performed, messages } = await processChanges(state, changes, new ConfigChangeProcessor());
  if (success) {
    (await readChanges(performed)).forEach(c => console.log(c));
  } else {
    console.error('Errors occurred:');
    messages.forEach((e) => console.error(' ' + e));
  }
  return { success, state };
}

// type ProcessResult = ChangeItem[] | true | string;
export class ConfigChangeProcessor implements ChangeProcessor<Config> {

  processAddItem(config: Config, item: AddItem): Promise<ProcessorResult> {
    if (isAddNamedItem(item)) {
      return this.processAddNamedItem(config, item);
    }

    return this.processAddItemUnnamed(config, item);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  processAddItemUnnamed(config: Config, item: AddItem): Promise<ProcessorResult> {
    return Promise.resolve(ProcessorResult.error('Adding of unnamed items is not supported'));
  }

  async processAddNamedItem(config: Config, item: AddNamedItem): Promise<ProcessorResult> {
    if (this.targetExists(config, item)) {
      return await this.handleExists(item);
    }

    const items = jp.value(config, getJsonpath(item)) as NamedItem[];
    items.push(item.newValue as any);

    return ProcessorResult.success();
  }

  private async handleExists(item: ChangeValueItem | AddNamedItem): Promise<ProcessorResult> {
    const { confirm, message } = await this.confirm(item);
    switch (confirm) {
      case 'skip': {
        return ProcessorResult.skip(message);
      }
      case 'overwrite': {
        // todo: clean. should find a way to make this the same for all item types
        const name = isAddNamedItem(item) ? item.name : item.newValue as string;
        return ProcessorResult.continue([
          { action: Actions.Delete, change: item.change, name: name, itemType: item.itemType } as DeleteNamedItem,
          item
        ], message);
      }
      case 'abort':
      default: {
        return ProcessorResult.error(message);
      }
    }
  }

  processChangeValueNamedItem(config: Config, item: ChangeValueItem): Promise<ProcessorResult> {
    if (this.targetExists(config, item)) {
      return this.handleExists(item);
    }

    const namedItem: any = this.getSourceIfExists(config, item);
    if (namedItem == null) {
      return Promise.resolve(this.sourceNotExists(item));
    }

    jp.value(config, getJsonpath(item, item.oldValue), item.newValue);

    return Promise.resolve(ProcessorResult.success());
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  processDeleteUnnamedItem(config: Config, item: DeleteItem): Promise<ProcessorResult> {
    return Promise.resolve(ProcessorResult.error('Deleting of Unnamed items is not supported'));
  }

  processDeleteNamedItem(config: Config, item: DeleteNamedItem): Promise<ProcessorResult> {
    const items = jp.value(config, getJsonpath(item)) as NamedItem[];
    const idx = items.findIndex(i => get(i, item.change.field!) === item.name);

    if (idx === -1) {
      return Promise.resolve(ProcessorResult.error(`Configuration does not contain a ${item.itemType} with ${item.change.field} '${item.name}'`));
    }

    items.splice(idx, 1);

    return Promise.resolve(ProcessorResult.success());
  }

  private targetExists(config: Config, item: ChangeValueItem | AddNamedItem): boolean {
    if (isNamed(item) || item.change.field !== undefined) {
      const targetName = isAddNamedItem(item) ? item.name : item.newValue;
      return jp.query(config, getJsonpath(item, targetName)).length > 0;
    }

    return false;
  }

  private getSourceIfExists(config: Config, item: ChangeValueItem) {
    return jp.query(config, getJsonpath(item, item.oldValue))[0];
  }

  private sourceNotExists(item: ChangeValueItem): ProcessorResult {
    return ProcessorResult.error(`Operation impossible: No ${item.itemType} at path '${getJsonpath(item, item.oldValue)}' exists.`);
  }

  private async confirm(item: ChangeValueItem | ChangeNamedItem) {
    const message = isNamed(item) ?
      `${item.itemType} with name '${item.name}' already exists` :
      `${item.itemType} with ${item.change.field} '${item.newValue}' already exists`;
    const confirmation = await inquirer.prompt([
      {
        type: 'expand',
        choices: [
          {
            key: 'a',
            name: 'Abort',
            value: 'abort'
          },
          {
            key: 'o',
            name: 'Overwrite',
            value: 'overwrite'
          },
          {
            key: 's',
            name: 'Skip',
            value: 'skip'
          },
        ],
        default: 'a',
        message: `${message}. What would youl like to do?`,
        name: 'confirm'
      }
    ]);

    return { confirm: confirmation.confirm, message };
  }
}