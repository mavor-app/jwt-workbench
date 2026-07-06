import { useCallback } from 'react';
import { store, type JwtProject, type SecretRef } from '@/lib/storage';
import { useStorageItem } from './useStorageList';

export interface ProjectDraft {
  name: string;
  header: string;
  payload: string;
  secret: SecretRef;
}

export function useProjects() {
  const { value: projects, loaded, setValue } = useStorageItem(store.projects);

  const createProject = useCallback(
    async (draft: ProjectDraft): Promise<JwtProject> => {
      const now = Date.now();
      const project: JwtProject = { id: crypto.randomUUID(), createdAt: now, updatedAt: now, ...draft };
      const current = await store.projects.getValue();
      await setValue([...current, project]);
      return project;
    },
    [setValue],
  );

  const updateProject = useCallback(
    async (id: string, patch: Partial<ProjectDraft>): Promise<void> => {
      const current = await store.projects.getValue();
      await setValue(
        current.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p)),
      );
    },
    [setValue],
  );

  const deleteProject = useCallback(
    async (id: string): Promise<void> => {
      const current = await store.projects.getValue();
      await setValue(current.filter((p) => p.id !== id));
    },
    [setValue],
  );

  return { projects, loaded, createProject, updateProject, deleteProject };
}
