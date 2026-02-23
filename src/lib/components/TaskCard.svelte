<script lang="ts">
  import type { Task } from '$lib/types';
  import { createEventDispatcher } from 'svelte';

  export let task: Task;
  export let selected = false;

  const dispatch = createEventDispatcher<{
    update: { task: Task };
    delete: { id: string };
    select: { id: string };
  }>();

  const statusLabels = {
    todo: 'To Do',
    in_progress: 'In Progress',
    in_review: 'In Review',
    done: 'Done'
  };

  const priorityColors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#f97316',
    critical: '#ef4444'
  };

  function handleClick() {
    dispatch('select', { id: task.id });
  }

  function handleEdit() {
    // For now, just dispatch update event - actual editing UI would be implemented later
    dispatch('update', { task });
  }

  function handleDelete() {
    dispatch('delete', { id: task.id });
  }

  function formatDate(date: Date | null): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div 
  class="task-card" 
  class:selected 
  class:done={task.status === 'done'}
  on:click={handleClick}
  tabindex="0"
  role="button"
  aria-label="Task: {task.title}"
>
  <div class="task-header">
    <div class="task-priority" style="background-color: {priorityColors[task.priority]}">
      {task.priority}
    </div>
    <div class="task-status">
      {statusLabels[task.status]}
    </div>
  </div>
  
  <div class="task-content">
    <h3 class="task-title">{task.title}</h3>
    {#if task.description}
      <p class="task-description">{task.description}</p>
    {/if}
  </div>
  
  <div class="task-footer">
    <div class="task-meta">
      {#if task.dueDate}
        <span class="due-date">
          📅 {formatDate(task.dueDate)}
        </span>
      {/if}
      <span class="created-date">
        Created {formatDate(task.createdAt)}
      </span>
    </div>
    
    <div class="task-actions">
      <button 
        class="action-btn edit-btn" 
        on:click|stopPropagation={handleEdit}
        aria-label="Edit task"
        title="Edit (E)"
      >
        ✏️
      </button>
      <button 
        class="action-btn delete-btn" 
        on:click|stopPropagation={handleDelete}
        aria-label="Delete task"
        title="Delete (D)"
      >
        🗑️
      </button>
    </div>
  </div>
</div>

<style>
  .task-card {
    background: var(--color-bg-secondary, #f8f9fa);
    border: 2px solid transparent;
    border-radius: 8px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }

  .task-card:hover {
    border-color: var(--color-primary, #3b82f6);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .task-card:focus {
    outline: none;
    border-color: var(--color-primary, #3b82f6);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .task-card.selected {
    border-color: var(--color-primary, #3b82f6);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    background: rgba(59, 130, 246, 0.05);
  }

  .task-card.done {
    opacity: 0.7;
  }

  .task-card.done .task-title {
    text-decoration: line-through;
  }

  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .task-priority {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    color: white;
  }

  .task-status {
    font-size: 0.875rem;
    color: var(--color-text-secondary, #6b7280);
    font-weight: 500;
  }

  .task-content {
    margin-bottom: 1rem;
  }

  .task-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--color-text, #1f2937);
    line-height: 1.4;
  }

  .task-description {
    margin: 0;
    font-size: 0.875rem;
    color: var(--color-text-secondary, #6b7280);
    line-height: 1.5;
  }

  .task-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .task-meta {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: var(--color-text-secondary, #9ca3af);
  }

  .due-date {
    font-weight: 500;
  }

  .task-actions {
    display: flex;
    gap: 0.5rem;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .task-card:hover .task-actions,
  .task-card:focus .task-actions,
  .task-card.selected .task-actions {
    opacity: 1;
  }

  .action-btn {
    background: none;
    border: 1px solid var(--color-border, #d1d5db);
    border-radius: 4px;
    padding: 0.375rem;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
  }

  .action-btn:hover {
    background: var(--color-bg-tertiary, #f3f4f6);
    transform: translateY(-1px);
  }

  .edit-btn:hover {
    border-color: var(--color-primary, #3b82f6);
  }

  .delete-btn:hover {
    border-color: #ef4444;
    background: #fef2f2;
  }
</style>