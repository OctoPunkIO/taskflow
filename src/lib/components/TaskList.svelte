<script lang="ts">
  import type { Task } from '$lib/types';
  import TaskCard from './TaskCard.svelte';
  import { flip } from 'svelte/animate';
  import { fade, fly } from 'svelte/transition';

  export let tasks: Task[] = [];
  export let loading = false;
  export let emptyMessage = 'No tasks found';

  $: sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
</script>

<div class="task-list" class:loading>
  {#if loading}
    <div class="loading-state" in:fade>
      <div class="spinner" />
      <span>Loading tasks...</span>
    </div>
  {:else if tasks.length === 0}
    <div class="empty-state" in:fade>
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
      </svg>
      <p>{emptyMessage}</p>
    </div>
  {:else}
    <ul class="tasks">
      {#each sortedTasks as task (task.id)}
        <li animate:flip={{ duration: 200 }} in:fly={{ y: 20, duration: 200 }}>
          <TaskCard {task} on:update on:delete />
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .task-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .task-list.loading {
    opacity: 0.6;
    pointer-events: none;
  }

  .loading-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    color: var(--color-text-secondary);
    gap: 1rem;
  }

  .spinner {
    width: 2rem;
    height: 2rem;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .icon {
    width: 3rem;
    height: 3rem;
    stroke-width: 1.5;
  }

  .tasks {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>