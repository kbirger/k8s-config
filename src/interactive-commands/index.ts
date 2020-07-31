import inquirer from 'inquirer';

import { getDeleteOptions } from './delete';
import { deleteItem, list, merge, rename } from '../commands';
import { getRenameOptions } from './rename';
import { getListOptions } from './list';
import { getMergeOptions } from './merge';

async function getCommand(command: string | undefined) {
  if (command !== undefined) {
    return command;
  }

  const answers = await inquirer.prompt([
    {
      name: 'command',
      message: 'What command would you like to run?',
      type: 'list',
      choices: ['delete', 'list', 'merge', 'rename']
    }
  ]);

  return answers.command;
}
export async function interactiveCommand(dryRun: boolean, command?: 'delete' | 'list' | 'merge' | 'rename'): Promise<boolean> {
  const actualCommand = await getCommand(command);

  switch (actualCommand) {
    case 'delete': {
      const options = await getDeleteOptions();
      return deleteItem(options.from, options.type, options.name, dryRun);
    }
    case 'list': {
      const options = await getListOptions();
      return list(options.from, options.type);
    }
    case 'merge': {
      const options = await getMergeOptions();
      return merge(options.from, options.to, dryRun);
    }
    case 'rename': {
      const options = await getRenameOptions();
      return rename(options.from, options.type, options.oldName, options.newName, dryRun);
    }
    default:
      return false;
  }
}