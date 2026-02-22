<script lang="ts">
  import type { Task, TaskStatus } from '$lib/types';
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';

  export let task: Task;
  export let selected = false;
  export let index = 0;

  const dispatch = createEventDispatcher<{
    update: { task: Task; field: keyof Task; value: any };
    delete: { taskId: string };
    select: { index: number; task: Task };
    openDetails: { task: Task };
  }>();

  const statusLabels: Record<TaskStatus, string> = {
    todo: 'To Do',
    in_progress: 'In Progress', 
    in_review: 'In Review',
    done: 'Done'
  };

  const priorityColors = {
    low: '#10b981',
    medium: '#f59e0b', 
    high: '#ef4444',
    critical: '#dc2626'
  };

  function handleStatusChange(newStatus: TaskStatus) {
    dispatch('update', { task, field: 'status', value: newStatus });
  }

  function handleDelete() {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      dispatch('delete', { taskId: task.id });
    }
  }

  function handleClick() {
    dispatch('select', { index, task });
  }

  function handleKeydown(event: KeyboardEvent) {
    // Handle Enter key to open details
    if (event.key === 'Enter' && selected) {
      event.preventDefault();
      dispatch('openDetails', { task });
    }
    // Handle 1-4 keys for status changes when selected
    else if (selected && ['1', '2', '3', '4'].includes(event.key)) {
      event.preventDefault();
      const statusMap: Record<string, TaskStatus> = {
        '1': 'todo',
        '2': 'in_progress', 
        '3': 'in_review',
        '4': 'done'
      };
      handleStatusChange(statusMap[event.key]);
    }
    // Handle Delete key
    else if (event.key === 'Delete' && selected) {
      event.preventDefault();
      handleDelete();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div 
  class="task-card" 
  class:selected
  on:click={handleClick}
  on:keydown={handleKeydown}
  role="button"
  tabindex={selected ? 0 : -1}
  aria-label="Task: {task.title}"
  transition:fade={{ duration: 150 }}
>
  <div class="task-header">
    <h3 class="task-title">{task.title}</h3>
    <div class="task-meta">
      <span 
        class="priority-badge" 
        style="--priority-color: {priorityColors[task.priority]}"
        title="Priority: {task.priority}"
      >
        {task.priority}
      </span>
    </div>
  </div>
  
  {#if task.description}
    <p class="task-description">{task.description}</p>
  {/if}
  
  <div class="task-footer">
    <select 
      class="status-select"
      value={task.status}
      on:change={(e) => handleStatusChange(e.currentTarget.value as TaskStatus)}
      on:click|stopPropagation
    >
      {#each Object.entries(statusLabels) as [status, label]}
        <option value={status}>{label}</option>
      {/each}
    </select>
    
    {#if task.dueDate}
      <time class="due-date" datetime={task.dueDate.toISOString()}>
        Due: {task.dueDate.toLocaleDateString()}
      </time>
    {/if}
  </div>
  
  {#if selected}
    <div class="keyboard-hints" transition:fade={{ duration: 200 }}>
      <span>Enter: Details</span>
      <span>1-4: Status</span>
      <span>Del: Delete</span>
    </div>
  {/if}
</div>

<style>
  .task-card {
    background: var(--color-surface);
    border: 2px solid transparent;
    border-radius: 8px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }

  .task-card:hover {
    background: var(--color-surface-hover, #f8fafc);
    border-color: var(--color-border-hover, #e2e8f0);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .task-card.selected {
    border-color: var(--color-primary, #3b82f6);
    background: var(--color-surface-selected, #eff6ff);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .task-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
    color: var(--color-text-primary, #1f2937);
    line-height: 1.4;
  }

  .task-meta {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .priority-badge {
    background: var(--priority-color);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: capitalize;
  }

  .task-description {
    color: var(--color-text-secondary, #6b7280);
    margin: 0 0 0.75rem 0;
    line-height: 1.5;
    font-size: 0.9rem;
  }

  .task-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }

  .status-select {
    background: var(--color-surface, white);
    border: 1px solid var(--color-border, #d1d5db);
    border-radius: 6px;
    padding: 0.375rem 0.5rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: border-color 0.2s ease;
  }

  .status-select:focus {
    outline: none;
    border-color: var(--color-primary, #3b82f6);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .due-date {
    font-size: 0.875rem;
    color: var(--color-text-secondary, #6b7280);
  }

  .keyboard-hints {
    position: absolute;
    top: -2.5rem;
    right: 0;
    background: var(--color-surface-elevated, #111827);
    color: var(--color-text-inverse, white);
    padding: 0.375rem 0.75rem;
    border-radius: 6px;
    font-size: 0.75rem;
    display: flex;
    gap: 0.75rem;
    white-space: nowrap;
    z-index: 10;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .keyboard-hints::after {
    content: '';
    position: absolute;
    top: 100%;
    right: 1rem;
    border: 5px solid transparent;
    border-top-color: var(--color-surface-elevated, #111827);
  }

  .keyboard-hints span {
    font-family: ui-monospace, 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .task-card {
      --color-surface: #1f2937;
      --color-surface-hover: #374151;
      --color-surface-selected: #1e3a8a;
      --color-surface-elevated: #111827;
      --color-text-primary: #f9fafb;
      --color-text-secondary: #d1d5db;
      --color-text-inverse: white;
      --color-border: #374151;
      --color-border-hover: #4b5563;
      --color-primary: #60a5fa;
    }
  }
</style>