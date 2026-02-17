import { writable, derived } from 'svelte/store';
import type { Project, Task } from '$lib/types';

// Use WeakMap to allow garbage collection
const taskCache = new WeakMap<Project, Task[]>();

function createProjectStore() {
  const { subscribe, set, update } = writable<Project | null>(null);

  let unsubscribe: (() => void) | null = null;

  return {
    subscribe,
    select: async (project: Project) => {
      // Clean up previous subscription
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }

      set(project);

      // Set up new subscription with cleanup
      const cleanup = subscribeToProjectUpdates(project.id, (updated) => {
        update(p => p?.id === updated.id ? updated : p);
      });

      unsubscribe = cleanup;
    },
    clear: () => {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      set(null);
    }
  };
}

export const currentProject = createProjectStore();