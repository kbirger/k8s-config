import * as fs from 'fs';

export function validateFileExists(filepath: string): true | string {
  console.log('x', filepath)
  if (!fs.existsSync(filepath)) {
    return 'Path does not exist';
  }

  if (!fs.statSync(filepath).isFile()) {
    return 'Path does not point to a file';
  }

  return true;
}