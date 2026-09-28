import { log } from '../log';
import { createMemoryStore } from './memoryStore';
import type { DataStore } from './types';

export type { DataStore } from './types';
export { DuplicateEmailError } from './types';

const store: DataStore = createMemoryStore();

export function getStore(): DataStore {
  return store;
}

/** Always in-memory for this slice. */
export function getDbMode(): 'memory' {
  return 'memory';
}

export async function connectStore(): Promise<DataStore> {
  log.info('Using in-memory store (resets on API restart)');
  return store;
}
