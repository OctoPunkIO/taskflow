import type { Project, Task } from '$lib/types';

export interface ProjectSubscription {
  id: string;
  unsubscribe: () => void;
  cleanup: () => void;
}

export interface TaskCacheEntry {
  tasks: Task[];
  timestamp: number;
  subscribers: Set<() => void>;
}

export interface ProjectStoreState {
  current: Project | null;
  projects: Project[];
  loading: boolean;
  error: string | null;
}

export interface MemoryStats {
  projectSubscriptions: number;
  taskCacheEntries: number;
  totalSubscribers: number;
  memoryUsage: number;
}
