<script lang="ts">
  import type { Task } from '$lib/types';
  import TaskCard from './TaskCard.svelte';
  import { flip } from 'svelte/animate';
  import { fade, fly } from 'svelte/transition';
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';

  export let tasks: Task[] = [];
  export let loading = false;
  export let emptyMessage = 'No tasks found';
  export let selectedTaskId: string | null = null;

  const dispatch = createEventDispatcher<{
    newTask: void;
    quickSearch: void;
    selectTask: { taskId: string | null };
    updateTask: { task: Task };
    deleteTask: { taskId: string };
  }>();

  $: sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  $: selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : null;
  $: selectedIndex = selectedTaskId ? sortedTasks.findIndex(t => t.id === selectedTaskId) : -1;

  function handleKeydown(event: KeyboardEvent) {
    // Ignore if user is typing in an input
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    // Global shortcuts
    switch (event.key.toLowerCase()) {
      case 'n':
        event.preventDefault();
        dispatch('newTask');
        break;

      case 'k':
        if (event.metaKey || event.ctrlKey) {
          event.preventDefault();
          dispatch('quickSearch');
        }
        break;

      case 'j':
        event.preventDefault();
        navigateDown();
        break;

      case 'k':
        if (!event.metaKey && !event.ctrlKey) {
          event.preventDefault();
          navigateUp();
        }
        break;

      case 'escape':
        event.preventDefault();
        selectTask(null);
        break;
    }
  }

  function navigateDown() {
    if (sortedTasks.length === 0) return;
    
    if (selectedIndex < sortedTasks.length - 1) {
      selectTask(sortedTasks[selectedIndex + 1].id);
    } else {
      // Wrap to first task
      selectTask(sortedTasks[0].id);
    }
  }

  function navigateUp() {
    if (sortedTasks.length === 0) return;
    
    if (selectedIndex > 0) {
      selectTask(sortedTasks[selectedIndex - 1].id);
    } else {
      // Wrap to last task
      selectTask(sortedTasks[sortedTasks.length - 1].id);
    }
  }

  function selectTask(taskId: string | null) {
    selectedTaskId = taskId;
    dispatch('selectTask', { taskId });
  }

  function handleTaskSelect(event: CustomEvent<{ taskId: string }>) {
    selectTask(event.detail.taskId);
  }

  function handleTaskUpdate(event: CustomEvent<{ task: Task }>) {
    dispatch('updateTask', event.detail);
  }

  function handleTaskDelete(event: CustomEvent<{ taskId: string }>) {
    dispatch('deleteTask', event.detail);
    // Clear selection if deleted task was selected
    if (event.detail.taskId === selectedTaskId) {
      selectTask(null);
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown);
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
      <div class="keyboard-hint">
        <span>Press <kbd>N</kbd> to create your first task</span>
      </div>
    </div>
  {:else}
    <ul class="tasks">
      {#each sortedTasks as task (task.id)}
        <li animate:flip={{ duration: 200 }} in:fly={{ y: 20, duration: 200 }}>
          <TaskCard 
            {task} 
            selected={task.id === selectedTaskId}
            on:select={handleTaskSelect}
            on:update={handleTaskUpdate}
            on:delete={handleTaskDelete} 
          />
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

  .keyboard-hint {
    margin-top: 1rem;
    font-size: 0.875rem;
    color: var(--color-text-tertiary);
  }

  .keyboard-hint kbd {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    font-family: monospace;
    background: var(--color-surface-secondary);
    border: 1px solid var(--color-border);
    border-radius: 0.25rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
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