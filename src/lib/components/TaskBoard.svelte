<script lang="ts">
  import type { Task, TaskStatus } from '$lib/types';
  import TaskList from './TaskList.svelte';
  import { createEventDispatcher } from 'svelte';

  export let tasks: Task[] = [];
  export let loading = false;

  const dispatch = createEventDispatcher<{
    'task:update': { task: Task; updates: Partial<Task> };
    'task:delete': { task: Task };
    'task:create': { status?: TaskStatus };
    'task:open': { task: Task };
    'search:open': void;
  }>();

  const columns: { status: TaskStatus; title: string; shortcut: string }[] = [
    { status: 'todo', title: 'To Do', shortcut: '1' },
    { status: 'in_progress', title: 'In Progress', shortcut: '2' },
    { status: 'in_review', title: 'In Review', shortcut: '3' },
    { status: 'done', title: 'Done', shortcut: '4' }
  ];

  let selectedColumn = 0;
  let boardElement: HTMLElement;

  function getTasksForStatus(status: TaskStatus): Task[] {
    return tasks.filter(task => task.status === status);
  }

  function handleGlobalKeydown(event: KeyboardEvent) {
    // Only handle if focused within the board
    if (!boardElement?.contains(document.activeElement)) return;
    
    // Prevent handling if user is typing in an input
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    switch (event.key) {
      case 'ArrowLeft':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          selectedColumn = Math.max(0, selectedColumn - 1);
          focusColumn(selectedColumn);
        }
        break;
      case 'ArrowRight':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          selectedColumn = Math.min(columns.length - 1, selectedColumn + 1);
          focusColumn(selectedColumn);
        }
        break;
      case '1':
      case '2':
      case '3':
      case '4':
        // Only handle as column navigation if no task is selected
        if (!event.target || !(event.target as HTMLElement).closest('.task-card')) {
          event.preventDefault();
          const columnIndex = parseInt(event.key) - 1;
          if (columnIndex >= 0 && columnIndex < columns.length) {
            selectedColumn = columnIndex;
            focusColumn(columnIndex);
          }
        }
        break;
    }
  }

  function focusColumn(index: number) {
    const columnElement = boardElement?.querySelector(`[data-column="${index}"]`);
    if (columnElement) {
      (columnElement as HTMLElement).focus();
    }
  }

  function handleTaskUpdate(event: CustomEvent<{ task: Task; updates: Partial<Task> }>) {
    dispatch('task:update', event.detail);
  }

  function handleTaskDelete(event: CustomEvent<{ task: Task }>) {
    dispatch('task:delete', event.detail);
  }

  function handleTaskCreate(event: CustomEvent<void>, status?: TaskStatus) {
    dispatch('task:create', { status });
  }

  function handleTaskOpen(event: CustomEvent<{ task: Task }>) {
    dispatch('task:open', event.detail);
  }

  function handleSearchOpen(event: CustomEvent<void>) {
    dispatch('search:open');
  }
</script>

<svelte:window on:keydown={handleGlobalKeydown} />

<div class="task-board" bind:this={boardElement}>
  <div class="board-header">
    <h2>Task Board</h2>
    <div class="board-shortcuts">
      <small>
        <kbd>1-4</kbd> Switch columns • 
        <kbd>Ctrl</kbd>+<kbd>←→</kbd> Navigate columns • 
        <kbd>N</kbd> New task • 
        <kbd>?</kbd> Help
      </small>
    </div>
  </div>
  
  <div class="board-columns">
    {#each columns as column, index}
      <div 
        class="board-column" 
        class:selected={index === selectedColumn}
        data-column={index}
        tabindex="-1"
      >
        <div class="column-header">
          <h3 class="column-title">
            {column.title}
            <span class="column-shortcut">({column.shortcut})</span>
          </h3>
          <div class="column-count">
            {getTasksForStatus(column.status).length}
          </div>
        </div>
        
        <div class="column-content">
          <TaskList 
            tasks={getTasksForStatus(column.status)} 
            {loading}
            emptyMessage="No {column.title.toLowerCase()} tasks"
            on:task:update={handleTaskUpdate}
            on:task:delete={handleTaskDelete}
            on:task:create={(e) => handleTaskCreate(e, column.status)}
            on:task:open={handleTaskOpen}
            on:search:open={handleSearchOpen}
          />
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .task-board {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }

  .board-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--color-border);
  }

  .board-header h2 {
    margin: 0;
    color: var(--color-text);
  }

  .board-shortcuts {
    color: var(--color-text-secondary);
  }

  .board-columns {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
    flex: 1;
    min-height: 0;
  }

  .board-column {
    display: flex;
    flex-direction: column;
    background: var(--color-surface);
    border: 2px solid var(--color-border);
    border-radius: 12px;
    min-height: 400px;
    transition: all 0.2s ease;
  }

  .board-column:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  }

  .board-column.selected {
    border-color: var(--color-primary);
    background: var(--color-primary-50);
  }

  .column-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-gray-50);
    border-radius: 12px 12px 0 0;
  }

  .column-title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-text);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .column-shortcut {
    font-size: 0.8rem;
    font-weight: 400;
    color: var(--color-text-secondary);
  }

  .column-count {
    background: var(--color-primary);
    color: white;
    font-size: 0.8rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    min-width: 1.5rem;
    text-align: center;
  }

  .column-content {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
  }

  kbd {
    background: var(--color-border);
    color: var(--color-text);
    padding: 0.125rem 0.25rem;
    border-radius: 3px;
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 0.75rem;
    font-weight: 500;
  }

  /* CSS custom properties for theming */
  :root {
    --color-surface: #ffffff;
    --color-border: #e5e7eb;
    --color-primary: #3b82f6;
    --color-primary-50: #eff6ff;
    --color-text: #111827;
    --color-text-secondary: #6b7280;
    --color-gray-50: #f9fafb;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --color-surface: #1f2937;
      --color-border: #374151;
      --color-primary-50: #1e3a8a;
      --color-text: #f9fafb;
      --color-text-secondary: #d1d5db;
      --color-gray-50: #374151;
    }
  }

  @media (max-width: 1024px) {
    .board-columns {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 640px) {
    .board-columns {
      grid-template-columns: 1fr;
    }
    
    .task-board {
      padding: 0.5rem;
    }
  }
</style>