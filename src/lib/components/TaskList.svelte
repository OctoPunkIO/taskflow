<script lang="ts">
  import type { Task } from '$lib/types';
  import TaskCard from './TaskCard.svelte';
  import { flip } from 'svelte/animate';
  import { fade, fly } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  export let tasks: Task[] = [];
  export let loading = false;
  export let emptyMessage = 'No tasks found';

  const dispatch = createEventDispatcher<{
    taskUpdate: { task: Task; field: keyof Task; value: any };
    taskDelete: { taskId: string };
    taskCreate: {};
    openSearch: {};
    taskDetails: { task: Task };
  }>();

  let selectedIndex = 0;
  let listElement: HTMLDivElement;

  $: sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // Ensure selected index is within bounds
  $: if (selectedIndex >= sortedTasks.length && sortedTasks.length > 0) {
    selectedIndex = sortedTasks.length - 1;
  } else if (selectedIndex < 0) {
    selectedIndex = 0;
  }

  function handleKeydown(event: KeyboardEvent) {
    // Only handle keys when we have tasks and the list is focused
    if (sortedTasks.length === 0) return;
    
    switch (event.key) {
      case 'j': // Move down
      case 'ArrowDown':
        event.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, sortedTasks.length - 1);
        scrollToSelected();
        break;
        
      case 'k': // Move up  
      case 'ArrowUp':
        event.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        scrollToSelected();
        break;
        
      case 'n': // New task
        event.preventDefault();
        dispatch('taskCreate', {});
        break;
        
      case 'Enter': // Open task details
        event.preventDefault();
        if (sortedTasks[selectedIndex]) {
          dispatch('taskDetails', { task: sortedTasks[selectedIndex] });
        }
        break;
        
      case '1':
      case '2': 
      case '3':
      case '4': // Set status
        event.preventDefault();
        if (sortedTasks[selectedIndex]) {
          const statusMap = {
            '1': 'todo',
            '2': 'in_progress',
            '3': 'in_review', 
            '4': 'done'
          };
          dispatch('taskUpdate', {
            task: sortedTasks[selectedIndex],
            field: 'status',
            value: statusMap[event.key as keyof typeof statusMap]
          });
        }
        break;
        
      case 'Delete': // Delete task
        event.preventDefault();
        if (sortedTasks[selectedIndex]) {
          dispatch('taskDelete', { taskId: sortedTasks[selectedIndex].id });
        }
        break;
    }
  }

  function handleGlobalKeydown(event: KeyboardEvent) {
    // Handle global shortcuts that work anywhere
    if (event.metaKey || event.ctrlKey) {
      switch (event.key) {
        case 'k': // Quick search
          event.preventDefault();
          dispatch('openSearch', {});
          break;
      }
    }
  }

  function scrollToSelected() {
    if (!listElement) return;
    const selectedCard = listElement.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement;
    if (selectedCard) {
      selectedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function handleTaskSelect(event: CustomEvent<{ index: number; task: Task }>) {
    selectedIndex = event.detail.index;
  }

  function handleTaskUpdate(event: CustomEvent<{ task: Task; field: keyof Task; value: any }>) {
    dispatch('taskUpdate', event.detail);
  }

  function handleTaskDelete(event: CustomEvent<{ taskId: string }>) {
    dispatch('taskDelete', event.detail);
  }

  function handleTaskDetails(event: CustomEvent<{ task: Task }>) {
    dispatch('taskDetails', event.detail);
  }

  // Focus the list when it's mounted so keyboard navigation works
  function handleMount() {
    if (listElement && sortedTasks.length > 0) {
      listElement.focus();
    }
  }
</script>

<svelte:window on:keydown={handleGlobalKeydown} />

<div 
  class="task-list" 
  class:loading
  bind:this={listElement}
  on:keydown={handleKeydown}
  tabindex="0"
  role="application"
  aria-label="Task list with keyboard navigation"
  use:handleMount
>
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
      <div class="keyboard-help">
        <span>Press <kbd>N</kbd> to create your first task</span>
      </div>
    </div>
  {:else}
    <ul class="tasks">
      {#each sortedTasks as task, index (task.id)}
        <li 
          animate:flip={{ duration: 200 }} 
          in:fly={{ y: 20, duration: 200 }}
          data-index={index}
        >
          <TaskCard 
            {task} 
            {index}
            selected={index === selectedIndex}
            on:update={handleTaskUpdate}
            on:delete={handleTaskDelete} 
            on:select={handleTaskSelect}
            on:openDetails={handleTaskDetails}
          />
        </li>
      {/each}
    </ul>
    
    {#if sortedTasks.length > 0}
      <div class="keyboard-shortcuts-help" transition:fade={{ delay: 500, duration: 300 }}>
        <h4>Keyboard Shortcuts</h4>
        <div class="shortcuts-grid">
          <div class="shortcut">
            <kbd>J</kbd><kbd>K</kbd>
            <span>Navigate tasks</span>
          </div>
          <div class="shortcut">
            <kbd>N</kbd>
            <span>New task</span>
          </div>
          <div class="shortcut">
            <kbd>Enter</kbd>
            <span>Open details</span>
          </div>
          <div class="shortcut">
            <kbd>1-4</kbd>
            <span>Set status</span>
          </div>
          <div class="shortcut">
            <kbd>Del</kbd>
            <span>Delete task</span>
          </div>
          <div class="shortcut">
            <kbd>⌘K</kbd>
            <span>Quick search</span>
          </div>
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .task-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    outline: none;
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
    color: var(--color-text-secondary, #6b7280);
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

  .keyboard-help {
    margin-top: 1rem;
    font-size: 0.875rem;
    color: var(--color-text-tertiary, #9ca3af);
  }

  .tasks {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .keyboard-shortcuts-help {
    margin-top: 2rem;
    padding: 1.5rem;
    background: var(--color-surface-secondary, #f8fafc);
    border: 1px solid var(--color-border, #e5e7eb);
    border-radius: 8px;
    font-size: 0.875rem;
  }

  .keyboard-shortcuts-help h4 {
    margin: 0 0 1rem 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-text-primary, #1f2937);
  }

  .shortcuts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.75rem;
  }

  .shortcut {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .shortcut span {
    color: var(--color-text-secondary, #6b7280);
    font-size: 0.8rem;
  }

  kbd {
    background: var(--color-surface, white);
    border: 1px solid var(--color-border, #d1d5db);
    border-bottom-width: 2px;
    border-radius: 4px;
    padding: 0.125rem 0.375rem;
    font-size: 0.75rem;
    font-family: ui-monospace, 'SF Mono', 'Monaco', 'Inconsolata', monospace;
    font-weight: 500;
    color: var(--color-text-primary, #1f2937);
    box-shadow: inset 0 -1px 0 var(--color-border, #d1d5db);
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .task-list {
      --color-surface: #1f2937;
      --color-surface-secondary: #374151;
      --color-text-primary: #f9fafb;
      --color-text-secondary: #d1d5db;
      --color-text-tertiary: #9ca3af;
      --color-border: #374151;
    }

    kbd {
      --color-surface: #374151;
      --color-border: #4b5563;
      --color-text-primary: #f3f4f6;
    }
  }
</style>