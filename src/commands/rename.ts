import { ItemType, Config } from '../interfaces';
import { cloneDeep } from 'lodash';
import * as fileUtils from '../file-utils';

export async function rename(from: string, type: ItemType, oldName: string, newName: string, dryRun = false): Promise<boolean> {
  try {
    const data = fileUtils.loadConfig(from);
    const copy = cloneDeep(data);

    if (!dryRun) {
      fileUtils.backup(from);
    }

    let changes: ChangeItem[];
    switch (type) {
      case 'cluster':
        changes = await renameCluster(copy, oldName, newName);
        break;
      case 'context':
        changes = await renameContext(copy, oldName, newName);
        break;
      case 'user':
        changes = await renameUser(copy, oldName, newName);
        break;
    }

    const { success, state: newObj } = await processConfigChanges(copy, changes);


    if (success && !dryRun) {
      fileUtils.saveConfig(from, newObj);
    }

    return success;
  } catch (err) {
    console.error(err.message);
    return false;
  }
}

import { processConfigChanges } from '../change-items/config-change-processor';
import { Actions, ChangeItem, ChangeValueItem } from '../change-items/interfaces';

async function renameCluster(config: Config, oldName: string, newName: string): Promise<ChangeItem[]> {
  if (oldName === newName) {
    return [];
  }

  const contexts = config.contexts
    .filter(c => c.context.cluster === oldName)
    .map(c => ({
      action: Actions.Change,
      itemType: 'context',
      change: {
        path: 'contexts',
        field: 'context.cluster'
      },
      oldValue: c.context.cluster,
      newValue: newName
    }) as ChangeValueItem);

  return [
    {
      action: Actions.Change,
      itemType: 'cluster',
      change: {
        path: 'clusters',
        field: 'name'
      },
      oldValue: oldName,
      newValue: newName
    },
    ...contexts
  ];
  // const oldItem = config.clusters.find(c => c.name === oldName);
  // if (!oldItem) {
  //   return Result.fail(`No cluster found with name '${oldName}'`);
  // }

  // const changes: ChangeItem[] = [];
  // const pleaseDo = please(changes);

  // const renamed = await pleaseDo({
  //   doIf: () => !config.clusters.find(c => c.name === newName),
  //   changeItem: { type: 'cluster', field: 'name', from: oldName, to: newName },
  //   action: () => {
  //     const idx = config.clusters.findIndex(c => c.name === newName);
  //     if (idx > -1) {
  //       config.clusters.splice(idx, 1);
  //     }

  //     oldItem.name = newName;
  //   }
  // });

  // if (renamed) {
  //   for (const context of config.contexts) {
  //     if (context.context.cluster === oldName) {
  //       context.context.cluster = newName;
  //       changes.push({ type: 'context', field: 'cluster', name: context.name, from: oldName, to: newName });
  //     }
  //   }
  // }
  // return Result.success(changes);
}

async function renameContext(config: Config, oldName: string, newName: string): Promise<ChangeItem[]> {
  if (oldName === newName) {
    return [];
  }

  return [
    {
      action: Actions.Change,
      oldValue: oldName,
      newValue: newName,
      itemType: 'context',
      change: {
        path: 'contexts',
        field: 'name'
      }
    },
    {
      action: Actions.Change,
      oldValue: oldName,
      newValue: newName,
      itemType: 'current-context',
      change: {
        path: 'current-context'
      },
    }
  ];
}

async function renameUser(config: Config, oldName: string, newName: string): Promise<ChangeItem[]> {
  if (oldName === newName) {
    return [];
  }

  const contextChanges: ChangeItem[] = config.contexts
    .filter(c => c.context.user === oldName)
    .map(c => ({
      action: Actions.Change,
      field: 'user',
      itemType: 'context',
      oldValue: c.context.user,
      newValue: newName,
      change: {
        path: 'contexts',
        field: 'context.user'
      },
    }));

  return [
    {
      action: Actions.Change,
      itemType: 'user',
      change: {
        path: 'users',
        field: 'name'
      },
      oldValue: oldName,
      newValue: newName
    },
    ...contextChanges
  ];
}