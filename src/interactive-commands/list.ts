import inquirer from 'inquirer';

import { ITEM_TYPES, ItemType } from '../interfaces';
import { validateFileExists } from './utils';

export async function getListOptions(): Promise<{ from: string, type: ItemType }> {
  return await inquirer.prompt([
    {
      name: 'from',
      message: 'What is the path to the config?',
      default: process.env.KUBECONFIG,
      validate(input) {
        return validateFileExists(input);
      }
    },
    {
      name: 'type',
      choices: ITEM_TYPES,
      type: 'list',
      message: 'What item type?'
    },
  ]);
}
