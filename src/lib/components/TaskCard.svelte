<script lang="ts">
  import type { Task } from '$lib/types';
  import { createEventDispatcher } from 'svelte';

  export let task: Task;
  export let selected = false;
  export let tabindex = -1;

  const dispatch = createEventDispatcher<{
    update: { task: Task; updates: Partial<Task> };
    delete: { task: Task };
    select: { task: Task };
    open: { task: Task };
  }>();

  function handleKeydown(event: KeyboardEvent) {
    // Handle task-level keyboard events
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        dispatch('open', { task });
        break;
      case 'Delete':
      case 'Backspace':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          dispatch('delete', { task });
        }
        break;
      case '1':
      case '2':
      case '3':
      case '4':
        event.preventDefault();
        const statusMap = {
          '1': 'todo',
          '2': 'in_progress',
          '3': 'in_review',
          '4': 'done'
        } as const;
        const newStatus = statusMap[event.key];
        if (newStatus && newStatus !== task.status) {
          dispatch('update', { task, updates: { status: newStatus } });
        }
        break;
    }
  }

  function handleClick() {
    dispatch('select', { task });
  }

  function handleDoubleClick() {
    dispatch('open', { task });
  }

  $: statusColor = {
    todo: 'var(--color-gray-400)',
    in_progress: 'var(--color-blue-500)',
    in_review: 'var(--color-orange-500)',
    done: 'var(--color-green-500)'
  }[task.status];

  $: priorityColor = {
    low: 'var(--color-green-400)',
    medium: 'var(--color-yellow-500)',
    high: 'var(--color-orange-500)',
    critical: 'var(--color-red-500)'
  }[task.priority];
</script>

<div
  class="task-card"
  class:selected
  role="button"
  tabindex={tabindex}
  on:keydown={handleKeydown}
  on:click={handleClick}
  on:dblclick={handleDoubleClick}
  aria-label="Task: {task.title}. Status: {task.status}. Priority: {task.priority}. Press Enter to open, 1-4 to change status."
>
  <div class="task-header">
    <h3 class="task-title">{task.title}</h3>
    <div class="task-meta">
      <span class="status" style="color: {statusColor}">
        {task.status.replace('_', ' ')}
      </span>
      <span class="priority" style="color: {priorityColor}">
        {task.priority}
      </span>
    </div>
  </div>
  
  {#if task.description}
    <p class="task-description">{task.description}</p>
  {/if}
  
  {#if task.dueDate}
    <div class="due-date">
      Due: {new Date(task.dueDate).toLocaleDateString()}
    </div>
  {/if}
  
  <div class="keyboard-hints" class:visible={selected}>
    <small>
      Enter: Open • 1-4: Status • Ctrl+Del: Delete
    </small>
  </div>
</div>

<style>
  .task-card {
    background: var(--color-surface);
    border: 2px solid var(--color-border);
    border-radius: 8px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }

  .task-card:hover {
    border-color: var(--color-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .task-card:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  }

  .task-card.selected {
    border-color: var(--color-primary);
    background: var(--color-primary-50);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  }

  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
  }

  .task-title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-text);
  }

  .task-meta {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .status, .priority {
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: capitalize;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    background: currentColor;
    color: white;
    opacity: 0.9;
  }

  .task-description {
    margin: 0.5rem 0;
    color: var(--color-text-secondary);
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .due-date {
    font-size: 0.8rem;
    color: var(--color-text-secondary);
    margin-top: 0.5rem;
  }

  .keyboard-hints {
    position: absolute;
    bottom: -1.5rem;
    left: 0;
    right: 0;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
    color: var(--color-text-secondary);
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease;
    z-index: 10;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .keyboard-hints.visible {
    opacity: 1;
    visibility: visible;
  }

  /* CSS custom properties for theming */
  :root {
    --color-surface: #ffffff;
    --color-border: #e5e7eb;
    --color-primary: #3b82f6;
    --color-primary-50: #eff6ff;
    --color-text: #111827;
    --color-text-secondary: #6b7280;
    --color-gray-400: #9ca3af;
    --color-blue-500: #3b82f6;
    --color-orange-500: #f97316;
    --color-green-500: #10b981;
    --color-green-400: #4ade80;
    --color-yellow-500: #eab308;
    --color-red-500: #ef4444;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --color-surface: #1f2937;
      --color-border: #374151;
      --color-primary-50: #1e3a8a;
      --color-text: #f9fafb;
      --color-text-secondary: #d1d5db;
    }
  }
</style>