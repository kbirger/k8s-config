import { ChangeItem } from './interfaces';

function fieldNotation2jsonpath(fields: string) {
  let builder = '$';
  const fieldArr = fields.split('.');

  let field: string | undefined;
  while ((field = fieldArr.shift()) !== undefined) {
    if (field.includes('-')) {
      builder += `["${field}"]`;
    } else {
      builder += `.${field}`;
    }
  }

  return builder;
}

export function getJsonpath(changeItem: ChangeItem, value?: string): string {
  const jsonPath = fieldNotation2jsonpath(changeItem.change.path);
  if (changeItem.change.field && value !== undefined) {
    return `${jsonPath}[?(@.${changeItem.change.field}=="${value}")].${changeItem.change.field}`;
  } else {
    return `${jsonPath}`;
  }
}