/* istanbul ignore file */
export type Command = () => boolean | Promise<boolean>;

export interface Config {
  apiVersion: string;
  clusters: ClusterItem[];
  contexts: ContextItem[];
  'current-context': string;
  kind: string;
  // preferences: any;
  users: UserItem[];
}

export interface NamedItem {
  name: string;
}
export interface ClusterItem extends NamedItem {
  name: string;
  cluster: Cluster;
}


export interface Cluster {
  'certificate-authority-data'?: string;
  server: string
}

export interface ContextItem extends NamedItem {
  name: string;
  context: Context;
}
export interface Context {
  cluster: string;
  namespace?: string;
  user: string;
}
export interface UserItem extends NamedItem {
  name: string;
  user: User;
}
export interface User {
  'client-certificate-data'?: string;
  'client-key-data'?: string;
}

export type ItemType = 'context' | 'user' | 'cluster';

const ITEM_TYPES: ItemType[] = ['context', 'user', 'cluster'];

export { ITEM_TYPES };