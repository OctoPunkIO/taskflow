<script lang="ts">
  import type { Task } from '$lib/types';
  import { createEventDispatcher } from 'svelte';

  export let task: Task;
  export let selected = false;
  export let tabIndex = 0;

  const dispatch = createEventDispatcher<{
    update: { task: Task };
    delete: { task: Task };
    select: { task: Task };
    edit: { task: Task };
  }>();

  const priorityColors = {
    low: 'var(--priority-low)',
    medium: 'var(--priority-medium)',
    high: 'var(--priority-high)',
    critical: 'var(--priority-critical)'
  };

  const statusLabels = {
    todo: 'To Do',
    in_progress: 'In Progress', 
    in_review: 'In Review',
    done: 'Done'
  };

  function handleClick() {
    dispatch('select', { task });
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      dispatch('select', { task });
    }
  }

  function handleEdit(event: Event) {
    event.stopPropagation();
    dispatch('edit', { task });
  }

  function handleDelete(event: Event) {
    event.stopPropagation();
    dispatch('delete', { task });
  }
</script>

<div
  class="task-card"
  class:selected
  {tabIndex}
  role="button"
  aria-label="Task: {task.title}"
  on:click={handleClick}
  on:keydown={handleKeydown}
>
  <div class="task-header">
    <h3 class="task-title">{task.title}</h3>
    <div class="task-actions">
      <button
        class="action-btn edit"
        aria-label="Edit task"
        title="Edit (E)"
        on:click={handleEdit}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      </button>
      <button
        class="action-btn delete"
        aria-label="Delete task"
        title="Delete (D)"
        on:click={handleDelete}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
      </button>
    </div>
  </div>

  {#if task.description}
    <p class="task-description">{task.description}</p>
  {/if}

  <div class="task-meta">
    <span 
      class="priority-badge"
      style="--priority-color: {priorityColors[task.priority]}"
    >
      {task.priority}
    </span>
    <span class="status-badge">
      {statusLabels[task.status]}
    </span>
    {#if task.dueDate}
      <span class="due-date">
        Due: {new Date(task.dueDate).toLocaleDateString()}
      </span>
    {/if}
  </div>
</div>

<style>
  .task-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.15s ease;
    position: relative;
    outline: none;
  }

  .task-card:hover {
    border-color: var(--color-border-hover);
    box-shadow: 0 2px 8px var(--color-shadow);
  }

  .task-card:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px var(--color-primary-alpha);
  }

  .task-card.selected {
    border-color: var(--color-primary);
    background: var(--color-primary-bg);
    box-shadow: 0 0 0 2px var(--color-primary-alpha);
  }

  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .task-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text);
    margin: 0;
    line-height: 1.4;
    flex: 1;
  }

  .task-actions {
    display: flex;
    gap: 0.25rem;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  .task-card:hover .task-actions,
  .task-card:focus .task-actions,
  .task-card.selected .task-actions {
    opacity: 1;
  }

  .action-btn {
    padding: 0.25rem;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 4px;
    color: var(--color-text-secondary);
    transition: all 0.15s ease;
  }

  .action-btn:hover {
    background: var(--color-surface-hover);
    color: var(--color-text);
  }

  .action-btn.delete:hover {
    color: var(--color-danger);
  }

  .action-btn svg {
    width: 1rem;
    height: 1rem;
    stroke-width: 2;
  }

  .task-description {
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    line-height: 1.5;
    margin: 0 0 0.75rem 0;
  }

  .task-meta {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
    font-size: 0.75rem;
  }

  .priority-badge {
    background: var(--priority-color, var(--color-surface-hover));
    color: white;
    padding: 0.125rem 0.5rem;
    border-radius: 12px;
    text-transform: capitalize;
    font-weight: 500;
  }

  .status-badge {
    background: var(--color-surface-hover);
    color: var(--color-text-secondary);
    padding: 0.125rem 0.5rem;
    border-radius: 12px;
    font-weight: 500;
  }

  .due-date {
    color: var(--color-text-secondary);
  }

  /* CSS custom properties for priority colors */
  :global(:root) {
    --priority-low: #10b981;
    --priority-medium: #f59e0b;
    --priority-high: #ef4444;
    --priority-critical: #dc2626;
    
    --color-surface: white;
    --color-border: #e5e7eb;
    --color-border-hover: #d1d5db;
    --color-text: #111827;
    --color-text-secondary: #6b7280;
    --color-primary: #3b82f6;
    --color-primary-alpha: rgba(59, 130, 246, 0.1);
    --color-primary-bg: rgba(59, 130, 246, 0.05);
    --color-surface-hover: #f9fafb;
    --color-shadow: rgba(0, 0, 0, 0.1);
    --color-danger: #ef4444;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    :global(:root) {
      --color-surface: #1f2937;
      --color-border: #374151;
      --color-border-hover: #4b5563;
      --color-text: #f9fafb;
      --color-text-secondary: #d1d5db;
      --color-surface-hover: #374151;
      --color-shadow: rgba(0, 0, 0, 0.3);
    }
  }
</style>