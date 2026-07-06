import { useCallback } from 'react';
import { store, type SavedSecret } from '@/lib/storage';
import { useStorageItem } from './useStorageList';

export function useSecrets() {
  const { value: secrets, loaded, setValue } = useStorageItem(store.secrets);

  const createSecret = useCallback(
    async (name: string, value: string): Promise<SavedSecret> => {
      const now = Date.now();
      const secret: SavedSecret = { id: crypto.randomUUID(), name, value, createdAt: now, updatedAt: now };
      const current = await store.secrets.getValue();
      await setValue([...current, secret]);
      return secret;
    },
    [setValue],
  );

  const updateSecret = useCallback(
    async (id: string, patch: Partial<Pick<SavedSecret, 'name' | 'value'>>): Promise<void> => {
      const current = await store.secrets.getValue();
      await setValue(
        current.map((s) => (s.id === id ? { ...s, ...patch, updatedAt: Date.now() } : s)),
      );
    },
    [setValue],
  );

  const deleteSecret = useCallback(
    async (id: string): Promise<void> => {
      const current = await store.secrets.getValue();
      await setValue(current.filter((s) => s.id !== id));
    },
    [setValue],
  );

  return { secrets, loaded, createSecret, updateSecret, deleteSecret };
}
