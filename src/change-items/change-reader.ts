import { ChangeProcessor, processChanges, ProcessorResult } from './change-visitor';
import { AddItem, ChangeValueItem, DeleteItem, DeleteNamedItem, AddNamedItem, ChangeItem } from './interfaces';

export async function readChanges(changes: ChangeItem[]): Promise<string[]> {
  const state: string[] = [];
  await processChanges<string[]>(state, changes, new ChangeReader());

  return state;
}
function nindent(num: number, s: string) {
  const indent = ' '.repeat(num);
  return s.replace(/^|\r?\n/g, `\n${indent}`);
}
class ChangeReader implements ChangeProcessor<string[]> {
  processAddNamedItem(state: string[], item: AddNamedItem): Promise<ProcessorResult> {
    state.push(`Added ${item.change.field} '${item.name}' with value:${nindent(4, JSON.stringify(item.newValue, null, 2))}`);

    return Promise.resolve(ProcessorResult.success());
  }
  processAddItemUnnamed(state: string[], item: AddItem): Promise<ProcessorResult> {
    state.push(`Added ${item.change.path} with value:${nindent(4, JSON.stringify(item.newValue, null, 2))}`);

    return Promise.resolve(ProcessorResult.success());
  }
  processChangeValueNamedItem(state: string[], item: ChangeValueItem): Promise<ProcessorResult> {
    if (item.change.field) {
      state.push(`Changed ${item.change.path}[?].${item.itemType}: ${item.oldValue} => ${item.newValue}`);
    } else {
      state.push(`Changed ${item.change.path}: ${item.oldValue} => ${item.newValue}`);
    }

    return Promise.resolve(ProcessorResult.success());
  }

  processDeleteUnnamedItem(state: string[], item: DeleteItem): Promise<ProcessorResult> {
    state.push(`Deleted ${item.change.path}`);
    return Promise.resolve(ProcessorResult.success());
  }

  processDeleteNamedItem(state: string[], item: DeleteNamedItem): Promise<ProcessorResult> {
    state.push(`Deleted ${item.itemType} with ${item.change.field}='${item.name}'`);

    return Promise.resolve(ProcessorResult.success());
  }

}