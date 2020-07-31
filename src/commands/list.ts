import { ItemType } from '../interfaces';
import * as fileUtils from '../file-utils';

export function list(from: string, type: ItemType): boolean {
  const fromObj = fileUtils.loadConfig(from);

  switch (type) {
    case 'cluster':
      console.log(fromObj.clusters.map(c => c.name));
      break;
    case 'context':
      console.log(fromObj.contexts.map(c => c.name));
      break;
    case 'user':
      console.log(fromObj.users.map(c => c.name));
      break;
  }

  return true;
}