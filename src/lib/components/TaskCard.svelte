<script lang="ts">
  import type { Task } from '$lib/types';
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';

  export let task: Task;
  export let isSelected = false;

  const dispatch = createEventDispatcher<{
    update: { task: Task; field: keyof Task; value: any };
    delete: { taskId: string };
    select: { taskId: string };
    open: { taskId: string };
  }>();

  $: statusConfig = {
    todo: { label: 'To Do', color: 'var(--color-status-todo, #6b7280)' },
    in_progress: { label: 'In Progress', color: 'var(--color-status-progress, #3b82f6)' },
    in_review: { label: 'In Review', color: 'var(--color-status-review, #f59e0b)' },
    done: { label: 'Done', color: 'var(--color-status-done, #10b981)' }
  };

  $: priorityConfig = {
    low: { label: 'Low', color: 'var(--color-priority-low, #6b7280)' },
    medium: { label: 'Medium', color: 'var(--color-priority-medium, #f59e0b)' },
    high: { label: 'High', color: 'var(--color-priority-high, #ef4444)' },
    critical: { label: 'Critical', color: 'var(--color-priority-critical, #dc2626)' }
  };

  function handleClick() {
    dispatch('select', { taskId: task.id });
  }

  function handleDoubleClick() {
    dispatch('open', { taskId: task.id });
  }

  function handleStatusChange(newStatus: Task['status']) {
    dispatch('update', { task, field: 'status', value: newStatus });
  }

  function handleDelete() {
    dispatch('delete', { taskId: task.id });
  }

  function formatDate(date: Date | null): string {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  }

  $: isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
</script>

<div 
  class="task-card" 
  class:selected={isSelected}
  class:overdue={isOverdue}
  on:click={handleClick}
  on:dblclick={handleDoubleClick}
  role="button"
  tabindex="0"
  on:keydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
  in:fade={{ duration: 200 }}
>
  <div class="card-header">
    <div class="title-section">
      <h3 class="task-title">{task.title}</h3>
      {#if task.description}
        <p class="task-description">{task.description}</p>
      {/if}
    </div>
    
    <div class="actions">
      <button 
        class="action-btn delete"
        on:click|stopPropagation={handleDelete}
        title="Delete task (D)"
        aria-label="Delete task"
      >
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2v1a2 2 0 002 2h4a2 2 0 002-2V3a2 2 0 012 2v6.5l1.5 1.5A2 2 0 0117 13v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 01.5-1.3L5 10.5V5z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>

  <div class="card-body">
    <div class="metadata">
      <div class="status-section">
        <label for="status-{task.id}" class="visually-hidden">Task Status</label>
        <select 
          id="status-{task.id}"
          class="status-select"
          style="border-color: {statusConfig[task.status].color}"
          value={task.status}
          on:change={(e) => handleStatusChange(e.currentTarget.value as Task['status'])}
          on:click|stopPropagation
        >
          {#each Object.entries(statusConfig) as [value, config]}
            <option {value}>{config.label}</option>
          {/each}
        </select>
      </div>

      <div class="priority-badge" style="background-color: {priorityConfig[task.priority].color}15; color: {priorityConfig[task.priority].color}">
        {priorityConfig[task.priority].label}
      </div>

      {#if task.dueDate}
        <div class="due-date" class:overdue={isOverdue}>
          📅 {formatDate(task.dueDate)}
        </div>
      {/if}
    </div>

    <div class="card-footer">
      <div class="timestamps">
        <span class="created-at">Created {formatDate(task.createdAt)}</span>
        {#if task.updatedAt !== task.createdAt}
          <span class="updated-at">• Updated {formatDate(task.updatedAt)}</span>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .task-card {
    background: var(--color-surface, #ffffff);
    border: 2px solid var(--color-border, #e5e7eb);
    border-radius: 8px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }

  .task-card:hover {
    border-color: var(--color-primary, #3b82f6);
    box-shadow: 0 2px 8px var(--color-shadow, rgba(0, 0, 0, 0.1));
  }

  .task-card.selected {
    border-color: var(--color-primary, #3b82f6);
    box-shadow: 0 0 0 3px var(--color-primary-light, rgba(59, 130, 246, 0.1));
  }

  .task-card.overdue {
    border-left: 4px solid var(--color-danger, #ef4444);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
  }

  .title-section {
    flex: 1;
    min-width: 0;
  }

  .task-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-text-primary, #111827);
    margin: 0 0 0.25rem 0;
    word-wrap: break-word;
  }

  .task-description {
    color: var(--color-text-secondary, #6b7280);
    font-size: 0.9rem;
    margin: 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    margin-left: 1rem;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .task-card:hover .actions {
    opacity: 1;
  }

  .action-btn {
    width: 2rem;
    height: 2rem;
    border: none;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease;
  }

  .action-btn:hover {
    background-color: var(--color-surface-hover, #f3f4f6);
  }

  .action-btn.delete:hover {
    background-color: var(--color-danger-light, #fee2e2);
    color: var(--color-danger, #ef4444);
  }

  .action-btn svg {
    width: 1rem;
    height: 1rem;
  }

  .card-body {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .metadata {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
  }

  .status-select {
    padding: 0.25rem 0.5rem;
    border: 1px solid currentColor;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 500;
    background: var(--color-surface, #ffffff);
    cursor: pointer;
  }

  .priority-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  .due-date {
    font-size: 0.8rem;
    color: var(--color-text-secondary, #6b7280);
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .due-date.overdue {
    color: var(--color-danger, #ef4444);
    font-weight: 600;
  }

  .card-footer {
    padding-top: 0.5rem;
    border-top: 1px solid var(--color-border-light, #f3f4f6);
  }

  .timestamps {
    font-size: 0.75rem;
    color: var(--color-text-tertiary, #9ca3af);
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>