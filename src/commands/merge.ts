import * as fileUtils from '../file-utils';
import { ChangeItem, Actions, AddNamedItem } from '../change-items/interfaces';
import { processConfigChanges } from '../change-items/config-change-processor';


export async function merge(from: string, to: string, dryRun = false): Promise<boolean> {
  // backup current
  if (!dryRun) {
    fileUtils.backup(to);
  }

  // parse source
  const fromObj = fileUtils.loadConfig(from);

  // parse target
  const toObj = fileUtils.loadConfig(to);

  // todo: it's redundant to include name on AddNamedItem because name is in the value. how do I fix it?
  const changes: ChangeItem[] = [
    ...fromObj.clusters.map(cluster =>
      ({ action: Actions.Add, itemType: 'cluster', change: { path: 'clusters', field: 'name' }, name: cluster.name, newValue: cluster } as AddNamedItem)),
    ...fromObj.users.map(user =>
      ({ action: Actions.Add, itemType: 'user', change: { path: 'users', field: 'name' }, name: user.name, newValue: user } as AddNamedItem)),
    ...fromObj.contexts.map(context =>
      ({ action: Actions.Add, itemType: 'context', change: { path: 'contexts', field: 'name' }, name: context.name, newValue: context }) as AddNamedItem)
  ];

  const { success, state: newObj } = await processConfigChanges(toObj, changes);
  if (success && !dryRun) {
    fileUtils.saveConfig(to, newObj);
  }
  return true;
}
