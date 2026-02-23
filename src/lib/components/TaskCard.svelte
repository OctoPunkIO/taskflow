<script lang="ts">
  import type { Task } from '$lib/types';
  
  export let task: Task;
  export let isSelected = false;
  export let onSelect: (() => void) | undefined = undefined;
  export let onEdit: (() => void) | undefined = undefined;
  export let onDelete: (() => void) | undefined = undefined;
  export let onStatusChange: ((status: Task['status']) => void) | undefined = undefined;

  function handleClick() {
    if (onSelect) {
      onSelect();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    // Handle task-specific shortcuts when this card is selected
    if (!isSelected) return;
    
    switch (event.key) {
      case 'e':
      case 'E':
        if (onEdit) {
          event.preventDefault();
          onEdit();
        }
        break;
      case 'd':
      case 'D':
        if (onDelete) {
          event.preventDefault();
          onDelete();
        }
        break;
      case '1':
        if (onStatusChange) {
          event.preventDefault();
          onStatusChange('todo');
        }
        break;
      case '2':
        if (onStatusChange) {
          event.preventDefault();
          onStatusChange('in_progress');
        }
        break;
      case '3':
        if (onStatusChange) {
          event.preventDefault();
          onStatusChange('in_review');
        }
        break;
      case '4':
        if (onStatusChange) {
          event.preventDefault();
          onStatusChange('done');
        }
        break;
      case 'Enter':
        // Open task details - for now just trigger edit
        if (onEdit) {
          event.preventDefault();
          onEdit();
        }
        break;
    }
  }

  function getStatusColor(status: Task['status']): string {
    switch (status) {
      case 'todo': return '#gray';
      case 'in_progress': return '#blue';
      case 'in_review': return '#yellow';
      case 'done': return '#green';
      default: return '#gray';
    }
  }

  function getPriorityColor(priority: Task['priority']): string {
    switch (priority) {
      case 'low': return '#green';
      case 'medium': return '#yellow';
      case 'high': return '#orange';
      case 'critical': return '#red';
      default: return '#gray';
    }
  }

  function formatStatus(status: Task['status']): string {
    switch (status) {
      case 'todo': return 'To Do';
      case 'in_progress': return 'In Progress';
      case 'in_review': return 'In Review';
      case 'done': return 'Done';
      default: return status;
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div 
  class="task-card" 
  class:selected={isSelected}
  on:click={handleClick}
  on:keydown={handleKeydown}
  role="button"
  tabindex="0"
>
  <div class="task-header">
    <h3 class="task-title">{task.title}</h3>
    <div class="task-badges">
      <span class="priority-badge" style="background-color: {getPriorityColor(task.priority)}">
        {task.priority}
      </span>
      <span class="status-badge" style="background-color: {getStatusColor(task.status)}">
        {formatStatus(task.status)}
      </span>
    </div>
  </div>
  
  {#if task.description}
    <p class="task-description">{task.description}</p>
  {/if}
  
  <div class="task-meta">
    {#if task.assignee}
      <span class="assignee">@{task.assignee}</span>
    {/if}
    {#if task.due_date}
      <span class="due-date">Due: {new Date(task.due_date).toLocaleDateString()}</span>
    {/if}
  </div>
</div>

<style>
  .task-card {
    border: 1px solid #e1e5e9;
    border-radius: 8px;
    padding: 16px;
    margin: 8px 0;
    background: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .task-card:hover {
    border-color: #0969da;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  .task-card.selected {
    border-color: #0969da;
    background: #f6f8fa;
    box-shadow: 0 0 0 2px rgba(9, 105, 218, 0.2);
  }
  
  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  
  .task-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #24292f;
  }
  
  .task-badges {
    display: flex;
    gap: 8px;
  }
  
  .priority-badge,
  .status-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    color: white;
    text-transform: capitalize;
  }
  
  .task-description {
    margin: 8px 0;
    color: #656d76;
    font-size: 14px;
    line-height: 1.4;
  }
  
  .task-meta {
    display: flex;
    gap: 16px;
    margin-top: 12px;
    font-size: 12px;
    color: #656d76;
  }
  
  .assignee {
    font-weight: 500;
  }
  
  .due-date {
    font-style: italic;
  }
</style>