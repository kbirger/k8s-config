import { ItemType, Config } from '../interfaces';

export enum Actions {
  Add = 'Add',
  Change = 'Change',
  Delete = 'Delete'
}

export type ChangeValueOptions = { path: string, field?: string };

export type ChangeItem = AddItem | AddNamedItem | ChangeValueItem | DeleteItem | DeleteNamedItem;
export type ChangeItemField = keyof Config | ItemType;

export type BaseChangeItem = { action: Actions, itemType: ChangeItemField, change: ChangeValueOptions };
export type ChangeNamedItem = BaseChangeItem & { name: string, field: ItemType };

// eslint-disable-next-line @typescript-eslint/ban-types
export type AddItem = BaseChangeItem & { action: Actions.Add, newValue: string | object };
export type AddNamedItem = AddItem & ChangeNamedItem;

export type ChangeValueItem = BaseChangeItem & { action: Actions.Change, oldValue: string, newValue: string };
// export type ChangeValueNamedItem = ChangeValueItem & ChangeNamedItem;

export type DeleteItem = BaseChangeItem & { action: Actions.Delete };
export type DeleteNamedItem = DeleteItem & ChangeNamedItem;
