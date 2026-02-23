<script lang="ts">
  import type { Task } from '$lib/types';
  import TaskCard from './TaskCard.svelte';
  import { flip } from 'svelte/animate';
  import { fade, fly } from 'svelte/transition';
  import { createEventDispatcher, onMount } from 'svelte';

  export let tasks: Task[] = [];
  export let loading = false;
  export let emptyMessage = 'No tasks found';

  let selectedIndex = 0;
  let taskListElement: HTMLElement;
  let taskElements: HTMLElement[] = [];
  let showKeyboardHelp = false;

  const dispatch = createEventDispatcher<{
    'task:update': { task: Task; updates: Partial<Task> };
    'task:delete': { task: Task };
    'task:create': void;
    'task:open': { task: Task };
    'search:open': void;
  }>();

  $: sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  $: selectedTask = sortedTasks[selectedIndex] || null;

  // Focus management
  function focusTask(index: number) {
    const taskElement = taskElements[index];
    if (taskElement) {
      taskElement.focus();
    }
  }

  function moveSelection(direction: 'up' | 'down') {
    if (sortedTasks.length === 0) return;
    
    if (direction === 'up') {
      selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : sortedTasks.length - 1;
    } else {
      selectedIndex = selectedIndex < sortedTasks.length - 1 ? selectedIndex + 1 : 0;
    }
    
    focusTask(selectedIndex);
  }

  function handleGlobalKeydown(event: KeyboardEvent) {
    // Only handle global shortcuts if we're focused within the task list
    if (!taskListElement?.contains(document.activeElement)) return;
    
    // Prevent handling if user is typing in an input
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    switch (event.key) {
      case 'j':
      case 'J':
      case 'ArrowDown':
        event.preventDefault();
        moveSelection('down');
        break;
      case 'k':
      case 'K':
      case 'ArrowUp':
        event.preventDefault();
        moveSelection('up');
        break;
      case 'n':
      case 'N':
        if (!event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          dispatch('task:create');
        }
        break;
      case 'Enter':
        if (selectedTask) {
          event.preventDefault();
          dispatch('task:open', { task: selectedTask });
        }
        break;
      case '/':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          dispatch('search:open');
        }
        break;
      case '?':
        event.preventDefault();
        showKeyboardHelp = !showKeyboardHelp;
        break;
      case 'Escape':
        showKeyboardHelp = false;
        break;
    }
  }

  function handleTaskUpdate(event: CustomEvent<{ task: Task; updates: Partial<Task> }>) {
    dispatch('task:update', event.detail);
  }

  function handleTaskDelete(event: CustomEvent<{ task: Task }>) {
    dispatch('task:delete', event.detail);
  }

  function handleTaskOpen(event: CustomEvent<{ task: Task }>) {
    dispatch('task:open', event.detail);
  }

  function handleTaskSelect(event: CustomEvent<{ task: Task }>) {
    const taskIndex = sortedTasks.findIndex(t => t.id === event.detail.task.id);
    if (taskIndex !== -1) {
      selectedIndex = taskIndex;
    }
  }

  onMount(() => {
    // Set initial focus to first task if available
    if (sortedTasks.length > 0) {
      setTimeout(() => focusTask(0), 100);
    }
  });
</script>

<svelte:window on:keydown={handleGlobalKeydown} />

<div class="task-list" class:loading bind:this={taskListElement} tabindex="-1">
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
        <small>Press <kbd>N</kbd> to create a new task or <kbd>?</kbd> for help</small>
      </div>
    </div>
  {:else}
    <ul class="tasks" role="listbox" aria-label="Task list">
      {#each sortedTasks as task, index (task.id)}
        <li animate:flip={{ duration: 200 }} in:fly={{ y: 20, duration: 200 }}>
          <TaskCard
            {task}
            selected={index === selectedIndex}
            tabindex={index === selectedIndex ? 0 : -1}
            bind:this={taskElements[index]}
            on:update={handleTaskUpdate}
            on:delete={handleTaskDelete}
            on:open={handleTaskOpen}
            on:select={handleTaskSelect}
          />
        </li>
      {/each}
    </ul>
  {/if}
  
  {#if showKeyboardHelp}
    <div class="keyboard-help" transition:fade>
      <div class="help-content">
        <h3>Keyboard Shortcuts</h3>
        <div class="shortcuts">
          <div class="shortcut-group">
            <h4>Navigation</h4>
            <div class="shortcut"><kbd>J</kbd> or <kbd>↓</kbd> <span>Next task</span></div>
            <div class="shortcut"><kbd>K</kbd> or <kbd>↑</kbd> <span>Previous task</span></div>
            <div class="shortcut"><kbd>Enter</kbd> <span>Open task details</span></div>
          </div>
          <div class="shortcut-group">
            <h4>Actions</h4>
            <div class="shortcut"><kbd>N</kbd> <span>New task</span></div>
            <div class="shortcut"><kbd>Ctrl</kbd>+<kbd>/</kbd> <span>Quick search</span></div>
            <div class="shortcut"><kbd>Ctrl</kbd>+<kbd>Del</kbd> <span>Delete task</span></div>
          </div>
          <div class="shortcut-group">
            <h4>Status</h4>
            <div class="shortcut"><kbd>1</kbd> <span>Todo</span></div>
            <div class="shortcut"><kbd>2</kbd> <span>In Progress</span></div>
            <div class="shortcut"><kbd>3</kbd> <span>In Review</span></div>
            <div class="shortcut"><kbd>4</kbd> <span>Done</span></div>
          </div>
          <div class="shortcut-group">
            <h4>Other</h4>
            <div class="shortcut"><kbd>?</kbd> <span>Toggle this help</span></div>
            <div class="shortcut"><kbd>Esc</kbd> <span>Close help</span></div>
          </div>
        </div>
        <div class="help-footer">
          <small>Tip: Focus on a task to see individual shortcuts</small>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .task-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    position: relative;
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

  .keyboard-hint {
    margin-top: 1rem;
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

  .tasks {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .keyboard-help {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .help-content {
    background: var(--color-surface);
    border-radius: 12px;
    padding: 2rem;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  .help-content h3 {
    margin: 0 0 1.5rem 0;
    color: var(--color-text);
    text-align: center;
  }

  .shortcuts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .shortcut-group h4 {
    margin: 0 0 0.75rem 0;
    color: var(--color-text);
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 0.25rem;
  }

  .shortcut {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .shortcut span {
    color: var(--color-text-secondary);
    font-size: 0.9rem;
  }

  .help-footer {
    margin-top: 1.5rem;
    text-align: center;
    color: var(--color-text-secondary);
    border-top: 1px solid var(--color-border);
    padding-top: 1rem;
  }

  kbd {
    background: var(--color-border);
    color: var(--color-text);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 0.8rem;
    font-weight: 500;
    border: 1px solid var(--color-border);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  /* CSS custom properties for theming */
  :root {
    --color-surface: #ffffff;
    --color-border: #e5e7eb;
    --color-text: #111827;
    --color-text-secondary: #6b7280;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --color-surface: #1f2937;
      --color-border: #374151;
      --color-text: #f9fafb;
      --color-text-secondary: #d1d5db;
    }
  }
</style>