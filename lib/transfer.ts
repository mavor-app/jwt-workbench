import {
  EMPTY_SECRET,
  store,
  type JwtProject,
  type SavedSecret,
  type SecretRef,
} from './storage';

/** Shape of an exported backup file. */
export interface TransferFile {
  app: 'jwt-workbench';
  version: 1;
  exportedAt: string;
  projects: JwtProject[];
  secrets: SavedSecret[];
}

export class TransferError extends Error {}

export async function exportStore(): Promise<string> {
  const [projects, secrets] = await Promise.all([
    store.projects.getValue(),
    store.secrets.getValue(),
  ]);
  const file: TransferFile = {
    app: 'jwt-workbench',
    version: 1,
    exportedAt: new Date().toISOString(),
    projects,
    secrets,
  };
  return JSON.stringify(file, null, 2);
}

export interface ImportData {
  projects: JwtProject[];
  secrets: SavedSecret[];
}

function sanitizeSecretRef(value: unknown): SecretRef {
  if (typeof value === 'object' && value !== null) {
    const ref = value as Record<string, unknown>;
    if (ref.type === 'saved' && typeof ref.id === 'string') return { type: 'saved', id: ref.id };
    if (ref.type === 'raw' && typeof ref.value === 'string') return { type: 'raw', value: ref.value };
  }
  return EMPTY_SECRET;
}

/** Parse and validate an import file; entries missing required fields are dropped. */
export function parseImport(text: string): ImportData {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new TransferError('Not a valid JSON file');
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new TransferError('Unrecognized file format');
  }
  const obj = raw as Record<string, unknown>;
  const now = Date.now();

  const projects: JwtProject[] = [];
  if (Array.isArray(obj.projects)) {
    for (const item of obj.projects) {
      if (typeof item !== 'object' || item === null) continue;
      const p = item as Record<string, unknown>;
      if (
        typeof p.name !== 'string' ||
        p.name === '' ||
        typeof p.header !== 'string' ||
        typeof p.payload !== 'string'
      ) {
        continue;
      }
      projects.push({
        id: typeof p.id === 'string' && p.id ? p.id : crypto.randomUUID(),
        name: p.name,
        header: p.header,
        payload: p.payload,
        secret: sanitizeSecretRef(p.secret),
        createdAt: typeof p.createdAt === 'number' ? p.createdAt : now,
        updatedAt: typeof p.updatedAt === 'number' ? p.updatedAt : now,
      });
    }
  }

  const secrets: SavedSecret[] = [];
  if (Array.isArray(obj.secrets)) {
    for (const item of obj.secrets) {
      if (typeof item !== 'object' || item === null) continue;
      const s = item as Record<string, unknown>;
      if (typeof s.name !== 'string' || s.name === '' || typeof s.value !== 'string') continue;
      secrets.push({
        id: typeof s.id === 'string' && s.id ? s.id : crypto.randomUUID(),
        name: s.name,
        value: s.value,
        createdAt: typeof s.createdAt === 'number' ? s.createdAt : now,
        updatedAt: typeof s.updatedAt === 'number' ? s.updatedAt : now,
      });
    }
  }

  if (projects.length === 0 && secrets.length === 0) {
    throw new TransferError('No projects or secrets found in this file');
  }
  return { projects, secrets };
}

/** Count imported entries whose names collide with what's already stored. */
export function findConflicts(
  data: ImportData,
  existing: { projects: JwtProject[]; secrets: SavedSecret[] },
): { projects: number; secrets: number } {
  const projectNames = new Set(existing.projects.map((p) => p.name));
  const secretNames = new Set(existing.secrets.map((s) => s.name));
  return {
    projects: data.projects.filter((p) => projectNames.has(p.name)).length,
    secrets: data.secrets.filter((s) => secretNames.has(s.name)).length,
  };
}

export type ConflictMode = 'overwrite' | 'skip';

export interface ImportSummary {
  addedProjects: number;
  addedSecrets: number;
  overwritten: number;
  skipped: number;
}

/**
 * Merge imported data into storage. Name collisions are resolved per `mode`;
 * overwriting keeps the existing item's id so references stay intact, and
 * imported projects' secret refs are remapped accordingly.
 */
export async function applyImport(data: ImportData, mode: ConflictMode): Promise<ImportSummary> {
  const [existingProjects, existingSecrets] = await Promise.all([
    store.projects.getValue(),
    store.secrets.getValue(),
  ]);
  const summary: ImportSummary = { addedProjects: 0, addedSecrets: 0, overwritten: 0, skipped: 0 };
  const now = Date.now();

  const secrets = existingSecrets.map((s) => ({ ...s }));
  const usedSecretIds = new Set(secrets.map((s) => s.id));
  const secretIdMap = new Map<string, string>();
  for (const imported of data.secrets) {
    const match = secrets.find((s) => s.name === imported.name);
    if (match) {
      // Point imported projects at the existing secret either way.
      secretIdMap.set(imported.id, match.id);
      if (mode === 'overwrite') {
        match.value = imported.value;
        match.updatedAt = now;
        summary.overwritten += 1;
      } else {
        summary.skipped += 1;
      }
    } else {
      const id = usedSecretIds.has(imported.id) ? crypto.randomUUID() : imported.id;
      usedSecretIds.add(id);
      secretIdMap.set(imported.id, id);
      secrets.push({ ...imported, id });
      summary.addedSecrets += 1;
    }
  }

  const projects = existingProjects.map((p) => ({ ...p }));
  const usedProjectIds = new Set(projects.map((p) => p.id));
  for (const imported of data.projects) {
    const secret: SecretRef =
      imported.secret.type === 'saved' && secretIdMap.has(imported.secret.id)
        ? { type: 'saved', id: secretIdMap.get(imported.secret.id)! }
        : imported.secret;
    const match = projects.find((p) => p.name === imported.name);
    if (match) {
      if (mode === 'overwrite') {
        match.header = imported.header;
        match.payload = imported.payload;
        match.secret = secret;
        match.updatedAt = now;
        summary.overwritten += 1;
      } else {
        summary.skipped += 1;
      }
    } else {
      const id = usedProjectIds.has(imported.id) ? crypto.randomUUID() : imported.id;
      usedProjectIds.add(id);
      projects.push({ ...imported, id, secret });
      summary.addedProjects += 1;
    }
  }

  await Promise.all([store.secrets.setValue(secrets), store.projects.setValue(projects)]);
  return summary;
}
