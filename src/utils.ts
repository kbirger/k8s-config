import { ItemType, Config } from './interfaces';

/* istanbul ignore next this is trivial to test */
export function itemType2Key(itemType: ItemType | keyof Config): keyof Config {
  switch (itemType) {
    case 'cluster':
      return 'clusters';
    case 'context':
      return 'contexts';
    case 'user':
      return 'users';
    default:
      return itemType;
    // throw new Error('invalid item type');
  }
}