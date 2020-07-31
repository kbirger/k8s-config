import { ChangeItem, AddItem, ChangeValueItem, DeleteItem, DeleteNamedItem, AddNamedItem } from './interfaces';
import { isAddItem, isChangeValueItem, isDeleteItem, isAddNamedItem, isDeleteNamedItem } from './guards';

export interface ChangeProcessor<TState> {
  processAddNamedItem(state: TState, item: AddNamedItem): Promise<ProcessorResult>;
  processAddItemUnnamed(state: TState, item: AddItem): Promise<ProcessorResult>
  processChangeValueNamedItem(state: TState, item: ChangeValueItem): Promise<ProcessorResult>;
  processDeleteUnnamedItem(state: TState, item: DeleteItem): Promise<ProcessorResult>;
  processDeleteNamedItem(state: TState, item: DeleteNamedItem): Promise<ProcessorResult>

}

export enum ProcessorResultState {
  Success,
  Continue,
  Error,
  Skip
}

interface Result {
  success: boolean;
  performed: ChangeItem[];
  messages: string[];
}
export class ProcessorResult {
  constructor(public readonly state: ProcessorResultState, public readonly error: string | null, public readonly extraItems: ChangeItem[] | null) {

  }

  static success(): ProcessorResult {
    return new ProcessorResult(ProcessorResultState.Success, null, null);
  }

  static continue(items: ChangeItem[], message: string): ProcessorResult {
    return new ProcessorResult(ProcessorResultState.Continue, message, items);
  }

  static error(errorMessage: string): ProcessorResult {
    return new ProcessorResult(ProcessorResultState.Error, errorMessage, null);
  }

  static skip(message: string): ProcessorResult {
    return new ProcessorResult(ProcessorResultState.Skip, message, null);
  }
}

function processAddItem<TState>(config: TState, item: AddItem, processor: ChangeProcessor<TState>): Promise<ProcessorResult> {
  if (isAddNamedItem(item)) {
    return processor.processAddNamedItem(config, item);
  }

  return processor.processAddItemUnnamed(config, item);
}

function processChangeValueItem<TState>(config: TState, item: ChangeValueItem, processor: ChangeProcessor<TState>): Promise<ProcessorResult> {
  // /*if (isChangeValueNamedItem(item)) {
  return processor.processChangeValueNamedItem(config, item);
  // }*/

  // return processor.processChangeValueUnnamedItem(config, item);
}

function pushToHead(list: ChangeItem[], changeItems: ChangeItem[] | null) {
  for (const newItem of changeItems?.reverse() ?? []) {
    list.unshift(newItem);
  }
}

function processDeleteItem<TState>(config: TState, item: DeleteItem, processor: ChangeProcessor<TState>): Promise<ProcessorResult> {
  if (isDeleteNamedItem(item)) {
    return processor.processDeleteNamedItem(config, item);
  }

  return processor.processDeleteUnnamedItem(config, item);
}
export async function processChanges<TState>(state: TState, items: ChangeItem[], processor: ChangeProcessor<TState>): Promise<Result> {
  const itemList = [...items];
  const performedChanges: ChangeItem[] = [];
  const messages: string[] = [];
  let success = true;

  let changeItem: ChangeItem | undefined;
  outer:
  while ((changeItem = itemList.shift()) !== undefined) {

    const result = await processChange(state, changeItem, processor);


    switch (result.state) {
      case ProcessorResultState.Success:
        performedChanges.push(changeItem);
        break;
      case ProcessorResultState.Continue:
        pushToHead(itemList, result.extraItems);
        messages.push(result.error!);
        break;
      case ProcessorResultState.Error:
        messages.push(result.error!);
        success = false;
        break outer;
      case ProcessorResultState.Skip:
        break;
    }
  }

  return {
    success,
    performed: performedChanges,
    messages
  };
}


function processChange<TState>(state: TState, item: ChangeItem, processor: ChangeProcessor<TState>) {
  if (isAddItem(item)) {
    return processAddItem(state, item, processor);
  } else if (isChangeValueItem(item)) {
    return processChangeValueItem(state, item, processor);
  } else if (isDeleteItem(item)) {
    return processDeleteItem(state, item, processor);
  }

  return Promise.reject('Invalid item type');
}

