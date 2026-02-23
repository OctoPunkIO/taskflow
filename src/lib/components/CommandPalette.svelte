<script lang="ts">
  import type { Task, TaskStatus } from '$lib/types';
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';

  export let visible = false;
  export let tasks: Task[] = [];

  const dispatch = createEventDispatcher<{
    'task:create': void;
    'task:open': { task: Task };
    'task:edit': { task: Task };
    'task:delete': { task: Task };
    'task:update': { task: Task; updates: Partial<Task> };
    'search': { query: string };
    close: void;
  }>();

  let input: HTMLInputElement;
  let query = '';
  let selectedIndex = 0;

  interface Command {
    id: string;
    label: string;
    description?: string;
    action: () => void;
    keywords: string[];
  }

  $: commands = [
    {
      id: 'new-task',
      label: 'New Task',
      description: 'Create a new task',
      keywords: ['new', 'create', 'add', 'task'],
      action: () => {
        dispatch('task:create');
        close();
      }
    },
    ...tasks.map(task => ({
      id: `open-${task.id}`,
      label: `Open: ${task.title}`,
      description: `Status: ${task.status.replace('_', ' ')} • Priority: ${task.priority}`,
      keywords: ['open', 'view', task.title.toLowerCase(), task.status, task.priority],
      action: () => {
        dispatch('task:open', { task });
        close();
      }
    })),
    ...tasks.map(task => ({
      id: `edit-${task.id}`,
      label: `Edit: ${task.title}`,
      description: 'Edit task details',
      keywords: ['edit', 'modify', 'update', task.title.toLowerCase()],
      action: () => {
        dispatch('task:edit', { task });
        close();
      }
    })),
    ...tasks.map(task => ({
      id: `delete-${task.id}`,
      label: `Delete: ${task.title}`,
      description: 'Delete this task',
      keywords: ['delete', 'remove', task.title.toLowerCase()],
      action: () => {
        dispatch('task:delete', { task });
        close();
      }
    })),
    {
      id: 'mark-todo',
      label: 'Mark Selected as Todo',
      description: 'Change status to Todo',
      keywords: ['todo', 'status', 'mark'],
      action: () => {
        // This would need the currently selected task
        close();
      }
    },
    {
      id: 'mark-progress',
      label: 'Mark Selected as In Progress',
      description: 'Change status to In Progress',
      keywords: ['progress', 'working', 'status', 'mark'],
      action: () => {
        close();
      }
    },
    {
      id: 'mark-review',
      label: 'Mark Selected as In Review',
      description: 'Change status to In Review',
      keywords: ['review', 'status', 'mark'],
      action: () => {
        close();
      }
    },
    {
      id: 'mark-done',
      label: 'Mark Selected as Done',
      description: 'Change status to Done',
      keywords: ['done', 'complete', 'finished', 'status', 'mark'],
      action: () => {
        close();
      }
    }
  ] as Command[];

  $: filteredCommands = commands.filter(command => {
    if (!query) return true;
    const searchTerm = query.toLowerCase();
    return command.label.toLowerCase().includes(searchTerm) ||
           command.description?.toLowerCase().includes(searchTerm) ||
           command.keywords.some(keyword => keyword.includes(searchTerm));
  }).slice(0, 8); // Limit results

  $: if (selectedIndex >= filteredCommands.length) {
    selectedIndex = Math.max(0, filteredCommands.length - 1);
  }

  function handleKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Escape':
        close();
        break;
      case 'ArrowDown':
        event.preventDefault();
        selectedIndex = (selectedIndex + 1) % filteredCommands.length;
        break;
      case 'ArrowUp':
        event.preventDefault();
        selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : filteredCommands.length - 1;
        break;
      case 'Enter':
        event.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
        break;
    }
  }

  function close() {
    visible = false;
    query = '';
    selectedIndex = 0;
    dispatch('close');
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      close();
    }
  }

  $: if (visible && input) {
    input.focus();
  }

  onMount(() => {
    return () => {
      query = '';
      selectedIndex = 0;
    };
  });
</script>

{#if visible}
  <div 
    class="command-palette-backdrop" 
    on:click={handleBackdropClick}
    transition:fade={{ duration: 150 }}
  >
    <div 
      class="command-palette" 
      transition:fly={{ y: -20, duration: 200 }}
    >
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          bind:this={input}
          bind:value={query}
          on:keydown={handleKeydown}
          placeholder="Type a command or search tasks..."
          class="search-input"
        />
        <kbd class="escape-hint">Esc</kbd>
      </div>
      
      {#if filteredCommands.length > 0}
        <div class="results">
          {#each filteredCommands as command, index}
            <button
              class="command-item"
              class:selected={index === selectedIndex}
              on:click={command.action}
            >
              <div class="command-content">
                <div class="command-label">{command.label}</div>
                {#if command.description}
                  <div class="command-description">{command.description}</div>
                {/if}
              </div>
            </button>
          {/each}
        </div>
      {:else if query}
        <div class="no-results">
          <div class="no-results-icon">🔍</div>
          <div class="no-results-text">No commands found for "{query}"</div>
        </div>
      {:else}
        <div class="help-text">
          <div class="help-section">
            <strong>Quick Actions:</strong>
            Type "new" to create a task, or search for existing tasks by name
          </div>
          <div class="help-section">
            <strong>Navigation:</strong>
            Use ↑↓ to navigate, Enter to select, Esc to close
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .command-palette-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    z-index: 1000;
    padding-top: 10vh;
  }

  .command-palette {
    background: var(--color-surface);
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 600px;
    max-height: 70vh;
    margin: 0 1rem;
    overflow: hidden;
    border: 1px solid var(--color-border);
  }

  .search-box {
    display: flex;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--color-border);
    gap: 0.75rem;
  }

  .search-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: var(--color-text-secondary);
    flex-shrink: 0;
  }

  .search-input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 1.1rem;
    color: var(--color-text);
    outline: none;
  }

  .search-input::placeholder {
    color: var(--color-text-secondary);
  }

  .escape-hint {
    background: var(--color-gray-100);
    color: var(--color-text-secondary);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-family: 'SF Mono', Monaco, monospace;
  }

  .results {
    max-height: 400px;
    overflow-y: auto;
  }

  .command-item {
    width: 100%;
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: background-color 0.15s ease;
    text-align: left;
  }

  .command-item:hover,
  .command-item.selected {
    background: var(--color-gray-50);
  }

  .command-content {
    flex: 1;
  }

  .command-label {
    font-size: 0.95rem;
    color: var(--color-text);
    font-weight: 500;
  }

  .command-description {
    font-size: 0.8rem;
    color: var(--color-text-secondary);
    margin-top: 0.25rem;
  }

  .no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 3rem 1rem;
    color: var(--color-text-secondary);
  }

  .no-results-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .help-text {
    padding: 1.5rem;
    color: var(--color-text-secondary);
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .help-section {
    margin-bottom: 1rem;
  }

  .help-section:last-child {
    margin-bottom: 0;
  }

  /* CSS custom properties for theming */
  :root {
    --color-surface: #ffffff;
    --color-border: #e5e7eb;
    --color-text: #111827;
    --color-text-secondary: #6b7280;
    --color-gray-50: #f9fafb;
    --color-gray-100: #f3f4f6;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --color-surface: #1f2937;
      --color-border: #374151;
      --color-text: #f9fafb;
      --color-text-secondary: #d1d5db;
      --color-gray-50: #374151;
      --color-gray-100: #4b5563;
    }
  }
</style>