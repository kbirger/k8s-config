#!/usr/bin/env node

import * as yargs from 'yargs';
import { ITEM_TYPES, ItemType } from './interfaces';
import { list, rename, compose, header, merge, deleteItem } from './commands';
import { interactiveCommand } from './interactive-commands';

type CommandOption = 'delete' | 'list' | 'merge' | 'rename';
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function startCli(args: string[]) {
  return yargs
    .option('dry-run', { alias: 'd', describe: 'do not write anything', type: 'boolean', default: false, required: true })
    .scriptName('k8s-config')
    .wrap(null)
    .command(
      ['$0'],
      'launches in interactive mode with prompts',
      (args) => args,
      (args) => compose(
        () => header(args['dry-run']),
        () => interactiveCommand(args['dry-run'], undefined))
    )

    .command(
      ['interactive [command]', 'i [command]'],
      'launches in interactive mode with prompts',
      (args) => args.positional('command', { describe: 'name of the command', choices: ['delete', 'list', 'merge', 'rename'] }),
      (args) => compose(
        () => header(args['dry-run']),
        () => interactiveCommand(args['dry-run'], args.command as CommandOption))
    )
    .command(
      ['merge <from> <to>'],
      'merges a source configuration into a target configuration',
      (args) => args
        .positional('from', { describe: 'source configuration', type: 'string', required: true })
        .positional('to', { describe: 'target configuration (will be modified)', type: 'string', required: true }),
      (args) => compose(
        () => header(args['dry-run']),
        () => merge(args.from as string, args.to as string, args['dry-run'])))
    .command(
      ['list <from> <type>'],
      'lists the names of all resources of the given type (cluster, user, or context)',
      (args) => args
        .positional('from', { describe: 'source configuration', type: 'string', required: true })
        .positional('type', { describe: 'item type to list', type: 'string', required: true, choices: ITEM_TYPES }),
      (args) => compose(
        () => header(args['dry-run']),
        () => list(args.from as string, args.type as ItemType)))
    .command(
      ['rename <from> <type> <old> <new>'],
      'renames an item',
      (args) => args
        .positional('from', { describe: 'source configuration', type: 'string', required: true })
        .positional('type', { describe: 'item type to rename', type: 'string', required: true, choices: ITEM_TYPES })
        .positional('old', { describe: 'current name of item', type: 'string', required: true })
        .positional('new', { describe: 'new name of item', type: 'string', required: true }),

      (args) => compose(
        () => header(args['dry-run']),
        () => rename(args.from as string, args.type as ItemType, args.old as string, args.new as string, args['dry-run'])))
    .command(
      ['delete <from> <type> <name>'],
      'deletes an item',
      (args) => args
        .positional('from', { describe: 'source configuration', type: 'string', required: true })
        .positional('type', { describe: 'item type to rename', type: 'string', required: true, choices: ITEM_TYPES })
        .positional('name', { describe: 'name of item', type: 'string', required: true }),
      (args) => compose(
        () => header(args['dry-run']),
        () => deleteItem(args.from as string, args.type as ItemType, args.name as string, args['dry-run']))
    )
    .strict()
    .parse(args);
}

if (require.main === module) {
  /* istanbul ignore next */
  startCli(process.argv.slice(2));
}