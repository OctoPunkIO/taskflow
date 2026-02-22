<script lang="ts">
  import type { Task } from '$lib/types';
  import TaskCard from './TaskCard.svelte';
  import { flip } from 'svelte/animate';
  import { fade, fly } from 'svelte/transition';
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';

  export let tasks: Task[] = [];
  export let loading = false;
  export let emptyMessage = 'No tasks found';

  const dispatch = createEventDispatcher<{
    newTask: void;
    editTask: { task: Task };
    deleteTask: { task: Task };
    updateTask: { task: Task };
    openSearch: void;
  }>();

  let selectedIndex = 0;
  let taskElements: HTMLElement[] = [];

  $: sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // Clamp selected index to valid range
  $: if (sortedTasks.length > 0) {
    selectedIndex = Math.max(0, Math.min(selectedIndex, sortedTasks.length - 1));
  }

  function handleKeydown(event: KeyboardEvent) {
    // Don't handle if user is typing in an input
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    const key = event.key;
    const isCmd = event.metaKey || event.ctrlKey;

    // Global shortcuts
    if (isCmd && key === 'k') {
      event.preventDefault();
      dispatch('openSearch');
      return;
    }

    if (key === 'n') {
      event.preventDefault();
      dispatch('newTask');
      return;
    }

    // Task-specific shortcuts (need selected task)
    if (sortedTasks.length === 0) return;

    const selectedTask = sortedTasks[selectedIndex];

    switch (key) {
      case 'j':
      case 'ArrowDown':
        event.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, sortedTasks.length - 1);
        scrollToSelected();
        break;

      case 'k':
      case 'ArrowUp':
        event.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        scrollToSelected();
        break;

      case 'Enter':
        event.preventDefault();
        dispatch('editTask', { task: selectedTask });
        break;

      case 'e':
        event.preventDefault();
        dispatch('editTask', { task: selectedTask });
        break;

      case 'd':
        event.preventDefault();
        dispatch('deleteTask', { task: selectedTask });
        break;

      case '1':
        event.preventDefault();
        updateTaskStatus(selectedTask, 'todo');
        break;

      case '2':
        event.preventDefault();
        updateTaskStatus(selectedTask, 'in_progress');
        break;

      case '3':
        event.preventDefault();
        updateTaskStatus(selectedTask, 'in_review');
        break;

      case '4':
        event.preventDefault();
        updateTaskStatus(selectedTask, 'done');
        break;
    }
  }

  function updateTaskStatus(task: Task, status: Task['status']) {
    const updatedTask = { ...task, status };
    dispatch('updateTask', { task: updatedTask });
  }

  function scrollToSelected() {
    const element = taskElements[selectedIndex];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  onMount(() => {
    document.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    document.removeEventListener('keydown', handleKeydown);
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
        Press <kbd>N</kbd> to create your first task
      </div>
    </div>
  {:else}
    <div class="keyboard-help">
      <span>💡 <kbd>J/K</kbd> navigate • <kbd>Enter/E</kbd> edit • <kbd>D</kbd> delete • <kbd>1-4</kbd> status • <kbd>N</kbd> new • <kbd>⌘K</kbd> search</span>
    </div>
    <ul class="tasks">
      {#each sortedTasks as task, i (task.id)}
        <li 
          bind:this={taskElements[i]}
          animate:flip={{ duration: 200 }} 
          in:fly={{ y: 20, duration: 200 }}
        >
          <TaskCard 
            {task} 
            selected={i === selectedIndex}
            tabIndex={i === selectedIndex ? 0 : -1}
            on:update
            on:delete
            on:select={() => selectedIndex = i}
            on:edit
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
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }

  .keyboard-help {
    background: var(--color-surface-secondary);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    margin-bottom: 1rem;
  }

  .tasks {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  kbd {
    background: var(--color-surface-hover);
    border: 1px solid var(--color-border);
    border-radius: 3px;
    padding: 0.125rem 0.25rem;
    font-size: 0.75rem;
    font-family: monospace;
    color: var(--color-text);
  }

  :global(:root) {
    --color-surface-secondary: #f8fafc;
  }

  @media (prefers-color-scheme: dark) {
    :global(:root) {
      --color-surface-secondary: #0f172a;
    }
  }
</style>