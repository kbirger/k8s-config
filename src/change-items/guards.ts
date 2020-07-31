import { ChangeNamedItem, AddItem, BaseChangeItem, Actions, AddNamedItem, ChangeValueItem, /*ChangeValueNamedItem,*/ DeleteItem, DeleteNamedItem } from './interfaces';

export function isNamed(item: BaseChangeItem): item is ChangeNamedItem {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (<any>item).name !== undefined;
}
export function isAddItem(item: BaseChangeItem): item is AddItem {
  return item.action === Actions.Add;
}

export function isAddNamedItem(item: BaseChangeItem): item is AddNamedItem {
  return isAddItem(item) && isNamed(item);
}

export function isChangeValueItem(item: BaseChangeItem): item is ChangeValueItem {
  return item.action === Actions.Change;
}

/*export function isChangeValueNamedItem(item: BaseChangeItem): item is ChangeValueNamedItem {
  return isChangeValueItem(item) && isNamed(item);
}*/

export function isDeleteItem(item: BaseChangeItem): item is DeleteItem {
  return item.action === Actions.Delete;
}

export function isDeleteNamedItem(item: BaseChangeItem): item is DeleteNamedItem {
  return isDeleteItem(item) && isNamed(item);
}
