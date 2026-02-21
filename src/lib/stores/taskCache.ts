import type { Task } from '$lib/types';
import type { TaskCacheEntry } from './types.js';

// Use WeakMap to allow automatic garbage collection of unused project references
const projectReferences = new WeakMap<object, string>();
const taskCache = new Map<string, TaskCacheEntry>();
const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 50; // Maximum number of cached projects

// Development mode memory logging
const DEV = process.env.NODE_ENV === 'development';

if (DEV) {
  // Log memory stats every 30 seconds in dev mode
  setInterval(() => {
    logMemoryStats();
  }, 30000);
}

/**
 * Create a project reference for WeakMap usage
 * This allows automatic cleanup when projects are no longer referenced
 */
export function createProjectReference(projectId: string): object {
  const ref = {};
  projectReferences.set(ref, projectId);
  return ref;
}

/**
 * Get tasks from cache or return null if not cached/expired
 */
export function getCachedTasks(projectId: string): Task[] | null {
  const entry = taskCache.get(projectId);
  
  if (!entry) {
    return null;
  }
  
  // Check if cache entry is expired
  if (Date.now() - entry.timestamp > CACHE_TIMEOUT) {
    taskCache.delete(projectId);
    return null;
  }
  
  return entry.tasks;
}

/**
 * Cache tasks for a project
 */
export function cacheTasks(projectId: string, tasks: Task[]): void {
  // Ensure we don't exceed maximum cache size
  if (taskCache.size >= MAX_CACHE_SIZE) {
    // Remove oldest entries first
    const entries = Array.from(taskCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 25% of entries
    const toRemove = Math.floor(MAX_CACHE_SIZE * 0.25);
    for (let i = 0; i < toRemove && entries.length > 0; i++) {
      const [oldProjectId, oldEntry] = entries[i];
      // Notify subscribers about cleanup
      oldEntry.subscribers.forEach(cleanup => cleanup());
      taskCache.delete(oldProjectId);
    }
  }
  
  const entry: TaskCacheEntry = {
    tasks: [...tasks], // Create a copy to prevent external mutations
    timestamp: Date.now(),
    subscribers: new Set()
  };
  
  taskCache.set(projectId, entry);
  
  if (DEV) {
    console.log(`📦 Cached ${tasks.length} tasks for project ${projectId}`);
  }
}

/**
 * Subscribe to task cache cleanup for a project
 * Returns unsubscribe function
 */
export function subscribeToTaskCache(
  projectId: string, 
  cleanup: () => void
): () => void {
  const entry = taskCache.get(projectId);
  if (entry) {
    entry.subscribers.add(cleanup);
  }
  
  return () => {
    const currentEntry = taskCache.get(projectId);
    if (currentEntry) {
      currentEntry.subscribers.delete(cleanup);
    }
  };
}

/**
 * Clear cache for a specific project
 */
export function clearProjectCache(projectId: string): void {
  const entry = taskCache.get(projectId);
  if (entry) {
    // Notify all subscribers about cleanup
    entry.subscribers.forEach(cleanup => cleanup());
    taskCache.delete(projectId);
    
    if (DEV) {
      console.log(`🗑️ Cleared cache for project ${projectId}`);
    }
  }
}

/**
 * Clear all task cache
 */
export function clearTaskCache(): void {
  // Notify all subscribers about global cleanup
  taskCache.forEach(entry => {
    entry.subscribers.forEach(cleanup => cleanup());
  });
  
  taskCache.clear();
  
  if (DEV) {
    console.log('🗑️ Cleared entire task cache');
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const totalSubscribers = Array.from(taskCache.values())
    .reduce((sum, entry) => sum + entry.subscribers.size, 0);
    
  return {
    projectsInCache: taskCache.size,
    totalSubscribers,
    oldestEntry: Math.min(...Array.from(taskCache.values()).map(e => e.timestamp)),
    newestEntry: Math.max(...Array.from(taskCache.values()).map(e => e.timestamp))
  };
}

/**
 * Development mode memory logging
 */
function logMemoryStats(): void {
  if (!DEV) return;
  
  const stats = getCacheStats();
  const memoryUsage = typeof performance !== 'undefined' && performance.memory 
    ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) 
    : 'N/A';
    
  console.group('🧠 TaskFlow Memory Stats');
  console.log(`Projects in cache: ${stats.projectsInCache}`);
  console.log(`Total subscribers: ${stats.totalSubscribers}`);
  console.log(`Memory usage: ${memoryUsage}MB`);
  console.groupEnd();
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    clearTaskCache();
  });
}

export { taskCache };
