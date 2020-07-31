import * as fs from 'fs';
import { Config } from './interfaces';
import * as yaml from 'js-yaml';
import moment from 'moment';

export function backup(file: string): void {
  const stamp = moment().format('YYYYMMDD-HHmmssSSS');
  const backupName = `${file}-bak-${stamp}`;

  console.log(`Backing up to ${backupName}`);
  fs.copyFileSync(file, backupName);
}

export function loadConfig(file: string): Config {
  return yaml.load(fs.readFileSync(file, 'utf8'), { filename: file }) as Config;
}

export function saveConfig(file: string, config: Config): void {
  fs.writeFileSync(file, yaml.dump(config), 'utf8');
}