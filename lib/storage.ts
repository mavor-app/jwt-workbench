import { storage } from '#imports';

export interface SavedSecret {
  id: string;
  name: string;
  value: string;
  createdAt: number;
  updatedAt: number;
}

export type SecretRef =
  | { type: 'saved'; id: string }
  | { type: 'raw'; value: string };

export const EMPTY_SECRET: SecretRef = { type: 'raw', value: '' };

export interface JwtProject {
  id: string;
  name: string;
  header: string;
  payload: string;
  secret: SecretRef;
  createdAt: number;
  updatedAt: number;
}

export const DEFAULT_HEADER = JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2);
// exp defaults to 10 minutes from when the panel loads.
export const DEFAULT_PAYLOAD = JSON.stringify(
  { sub: '1234567890', name: 'John Doe', exp: Math.floor(Date.now() / 1000) + 10 * 60 },
  null,
  2,
);

interface StoredState {
  projects: JwtProject[];
  secrets: SavedSecret[];
  lastOpenedProjectId?: string;
}

const projectsItem = storage.defineItem<JwtProject[]>('local:projects', { fallback: [] });
const secretsItem = storage.defineItem<SavedSecret[]>('local:secrets', { fallback: [] });
const lastOpenedItem = storage.defineItem<string | null>('local:lastOpenedProjectId', {
  fallback: null,
});
const lastTabItem = storage.defineItem<string | null>('local:lastTab', { fallback: null });

export const store = {
  projects: projectsItem,
  secrets: secretsItem,
  lastOpenedProjectId: lastOpenedItem,
  lastTab: lastTabItem,
};

/** Resolve a SecretRef to its actual secret value ('' when unresolvable). */
export function resolveSecret(ref: SecretRef, secrets: SavedSecret[]): string {
  if (ref.type === 'raw') return ref.value;
  return secrets.find((s) => s.id === ref.id)?.value ?? '';
}

export type { StoredState };
