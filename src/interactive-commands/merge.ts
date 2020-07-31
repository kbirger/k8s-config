import inquirer from 'inquirer';
import { validateFileExists } from './utils';


export async function getMergeOptions(): Promise<{ from: string, to: string }> {
  return await inquirer.prompt([
    {
      name: 'from',
      message: 'What is the path to the source config?',
      validate(input) {
        return validateFileExists(input);
      }
    },
    {
      name: 'to',
      message: 'What is the path to the target config?',
      default: process.env.KUBECONFIG,
      validate(input) {
        return validateFileExists(input);
      }
    },
  ]);
}