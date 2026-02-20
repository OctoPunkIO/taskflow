<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Task } from '$lib/types';
  import TaskCard from './TaskCard.svelte';

  export let tasks: Task[] = [];
  export let status: string;
  export let selectedIndex = -1;

  const dispatch = createEventDispatcher();

  function handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'j':
      case 'ArrowDown':
        event.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, tasks.length - 1);
        break;
      case 'k':
      case 'ArrowUp':
        event.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          dispatch('open', tasks[selectedIndex]);
        }
        break;
      case '1': case '2': case '3': case '4':
        if (selectedIndex >= 0) {
          const statuses = ['todo', 'in_progress', 'in_review', 'done'];
          dispatch('statusChange', {
            task: tasks[selectedIndex],
            status: statuses[parseInt(event.key) - 1]
          });
        }
        break;
      case 'n':
        dispatch('newTask', { status });
        break;
    }
  }
</script>

<div
  class="column"
  role="listbox"
  tabindex="0"
  on:keydown={handleKeyDown}
  aria-label="{status} tasks"
>
  <h2 class="column-header">{status}</h2>
  {#each tasks as task, index (task.id)}
    <TaskCard
      {task}
      selected={index === selectedIndex}
      on:click={() => dispatch('open', task)}
    />
  {/each}
</div>