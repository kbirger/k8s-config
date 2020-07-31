import { Command } from '../interfaces';

export * from './list';
export * from './rename';
export * from './merge';
export * from './delete';

export function header(dryRun: boolean): boolean {
  if (dryRun) {
    console.log('DRY-RUN ENABLED! No changes will be committed to disk');
  }

  return true;
}
export async function compose(...commands: Command[]): Promise<boolean> {
  for (const command of commands) {
    let result = command();
    if (typeof (result as Promise<unknown>).then === 'function') {
      result = await result;
    }

    if (result === false) {
      console.error('Exit code 1');
      process.exit(1);
      return false;
    }
  }

  return true;
}