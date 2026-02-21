<script lang="ts">
  import type { Task } from '$lib/types';
  import { createEventDispatcher } from 'svelte';
  
  export let task: Task;
  
  const dispatch = createEventDispatcher<{
    update: Task;
    delete: string;
  }>();
  
  const priorityColors = {
    low: '#10b981',
    medium: '#f59e0b', 
    high: '#ef4444',
    critical: '#dc2626'
  };
  
  const statusLabels = {
    todo: 'To Do',
    in_progress: 'In Progress',
    in_review: 'In Review',
    done: 'Done'
  };

  function handleUpdate() {
    dispatch('update', task);
  }

  function handleDelete() {
    dispatch('delete', task.id);
  }
</script>

<article class="task-card" class:done={task.status === 'done'}>
  <div class="task-header">
    <h3 class="task-title">{task.title}</h3>
    <div class="task-priority" style="--priority-color: {priorityColors[task.priority]}">
      {task.priority}
    </div>
  </div>
  
  {#if task.description}
    <p class="task-description">{task.description}</p>
  {/if}
  
  <div class="task-footer">
    <span class="task-status">{statusLabels[task.status]}</span>
    {#if task.dueDate}
      <time class="task-due-date">
        {new Date(task.dueDate).toLocaleDateString()}
      </time>
    {/if}
  </div>
  
  <div class="task-actions">
    <button type="button" class="btn btn-sm" on:click={handleUpdate}>
      Edit
    </button>
    <button type="button" class="btn btn-sm btn-danger" on:click={handleDelete}>
      Delete
    </button>
  </div>
</article>

<style>
  .task-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 0.5rem;
    padding: 1rem;
    transition: all 0.2s ease;
  }
  
  .task-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-color: var(--color-primary);
  }
  
  .task-card.done {
    opacity: 0.7;
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
  
  .task-priority {
    background: var(--priority-color);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
  }
  
  .task-description {
    color: var(--color-text-secondary);
    margin: 0 0 1rem 0;
    line-height: 1.5;
  }
  
  .task-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }
  
  .task-status {
    font-weight: 500;
  }
  
  .task-due-date {
    color: var(--color-text-secondary);
  }
  
  .task-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
  }
  
  .btn {
    padding: 0.375rem 0.75rem;
    border: none;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    background: var(--color-surface-elevated);
    color: var(--color-text);
  }
  
  .btn:hover {
    background: var(--color-surface-elevated-hover);
  }
  
  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
  
  .btn-danger {
    background: #ef4444;
    color: white;
  }
  
  .btn-danger:hover {
    background: #dc2626;
  }
</style>