import { ItemType } from '../interfaces';
import * as fileUtils from '../file-utils';
import { processConfigChanges } from '../change-items/config-change-processor';
import { ChangeItem, Actions } from '../change-items/interfaces';

export async function deleteItem(from: string, type: ItemType, name: string, dryRun = false): Promise<boolean> {
  try {
    const data = fileUtils.loadConfig(from);

    if (!dryRun) {
      fileUtils.backup(from);
    }

    let changes = [];
    switch (type) {
      case 'cluster':
        changes = await deleteCluster(name);
        break;
      case 'context':
        changes = await deleteContext(name);
        break;
      case 'user':
        changes = await deleteUser(name);
        break;
    }

    const { success, state: newObj } = await processConfigChanges(data, changes);

    if (success && !dryRun) {
      fileUtils.saveConfig(from, newObj);
    }

    return success;
  } catch (err) {
    console.error(err.message);
    return false;
  }
}

async function deleteCluster(name: string): Promise<ChangeItem[]> {

  return [{
    action: Actions.Delete,
    itemType: 'cluster',
    change: {
      path: 'clusters',
      field: 'name'
    },
    name: name
  },
  {
    action: Actions.Delete,
    itemType: 'context',
    name: name,
    change: {
      path: 'contexts',
      field: 'context.cluster'
    }
  }];
}

async function deleteContext(name: string): Promise<ChangeItem[]> {
  return [{
    action: Actions.Delete,
    itemType: 'context',
    change: {
      path: 'contexts',
      field: 'name'
    },
    name: name
  }];
}

async function deleteUser(name: string): Promise<ChangeItem[]> {
  return [{
    action: Actions.Delete,
    itemType: 'user',
    change: {
      path: 'users',
      field: 'name'
    },
    name: name
  }];
}

