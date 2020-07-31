import inquirer from 'inquirer';
import { ITEM_TYPES, ItemType, NamedItem } from '../interfaces';
import * as fileUtils from '../file-utils';
import { itemType2Key } from '../utils';
import { validateFileExists } from './utils';


export async function getRenameOptions(): Promise<{ from: string, type: ItemType, oldName: string, newName: string }> {
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
    {
      name: 'oldName',
      type: 'list',
      choices(answers) {
        const key = itemType2Key(answers.type);
        const data = fileUtils.loadConfig(answers.from);

        return (data[key] as NamedItem[]).filter((x) => x.name);
      },
    },
    {
      name: 'newName',
      type: 'input',
      validate(input, answers?) {
        if (!answers) {
          return false;
        }

        const key = itemType2Key(answers.type);
        const data = fileUtils.loadConfig(answers.from);

        const invalidValues = (data[key] as NamedItem[]).filter((x) => x.name);

        return !invalidValues.includes(input);
      }
    }
  ]);
}