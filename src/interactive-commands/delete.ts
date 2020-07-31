import inquirer from 'inquirer';
import { ITEM_TYPES, ItemType, Config, NamedItem } from '../interfaces';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import { itemType2Key } from '../utils';
import { validateFileExists } from './utils';


export async function getDeleteOptions(): Promise<{ from: string, type: ItemType, name: string }> {
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
      name: 'name',
      type: 'list',
      choices(answers) {
        const key = itemType2Key(answers.type);
        const data = yaml.load(fs.readFileSync(answers.from, 'utf8'), { filename: answers.from }) as Config;

        return (data[key] as NamedItem[]).filter((x) => x.name);
      },
    }
  ]);
}