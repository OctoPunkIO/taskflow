<script lang="ts">
  import TaskListWithKeyboard from '$lib/components/TaskListWithKeyboard.svelte';
  import type { Task } from '$lib/types';
  import { onMount } from 'svelte';

  // Sample data for demonstration
  let tasks: Task[] = [
    {
      id: '1',
      title: 'Implement user authentication',
      description: 'Add login and registration functionality',
      status: 'in_progress',
      priority: 'high',
      projectId: 'proj1',
      assigneeId: 'user1',
      createdBy: 'user1',
      dueDate: new Date('2026-03-01'),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      title: 'Design task board UI',
      description: 'Create a modern kanban-style interface',
      status: 'done',
      priority: 'medium',
      projectId: 'proj1',
      assigneeId: 'user2',
      createdBy: 'user1',
      dueDate: null,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      title: 'Add keyboard shortcuts',
      description: 'Implement J/K navigation, status shortcuts, etc.',
      status: 'in_review',
      priority: 'critical',
      projectId: 'proj1',
      assigneeId: 'user1',
      createdBy: 'user1',
      dueDate: new Date('2026-02-28'),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '4',
      title: 'Write documentation',
      description: 'Document all features and keyboard shortcuts',
      status: 'todo',
      priority: 'low',
      projectId: 'proj1',
      assigneeId: null,
      createdBy: 'user1',
      dueDate: new Date('2026-03-15'),
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '5',
      title: 'Setup CI/CD pipeline',
      description: 'Configure automated testing and deployment',
      status: 'todo',
      priority: 'medium',
      projectId: 'proj1',
      assigneeId: null,
      createdBy: 'user1',
      dueDate: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  let showModal = false;
  let modalMessage = '';

  function handleNewTask() {
    showModal = true;
    modalMessage = 'New task creation would open here';
  }

  function handleEditTask(event: CustomEvent) {
    const task = event.detail.task;
    showModal = true;
    modalMessage = `Edit task: "${task.title}"`;
  }

  function handleDeleteTask(event: CustomEvent) {
    const task = event.detail.task;
    if (confirm(`Delete task "${task.title}"?`)) {
      tasks = tasks.filter(t => t.id !== task.id);
    }
  }

  function handleUpdateTask(event: CustomEvent) {
    const updatedTask = event.detail.task;
    tasks = tasks.map(t => t.id === updatedTask.id ? updatedTask : t);
  }

  function handleOpenSearch() {
    showModal = true;
    modalMessage = 'Quick search would open here (Cmd+K)';
  }

  function closeModal() {
    showModal = false;
  }
</script>

<svelte:head>
  <title>TaskFlow - Keyboard Shortcuts Demo</title>
</svelte:head>

<div class="app">
  <header class="header">
    <h1>TaskFlow</h1>
    <p class="subtitle">Keyboard shortcuts demo – Press the keys to try them out!</p>
  </header>

  <main class="main">
    <TaskListWithKeyboard
      {tasks}
      loading={false}
      emptyMessage="No tasks yet. Press 'N' to create one!"
      on:newTask={handleNewTask}
      on:editTask={handleEditTask}
      on:deleteTask={handleDeleteTask}
      on:updateTask={handleUpdateTask}
      on:openSearch={handleOpenSearch}
    />
  </main>
</div>

<!-- Simple modal for demo purposes -->
{#if showModal}
  <div class="modal-backdrop" on:click={closeModal}>
    <div class="modal" on:click|stopPropagation>
      <h3>Demo Action</h3>
      <p>{modalMessage}</p>
      <button on:click={closeModal}>Close</button>
    </div>
  </div>
{/if}

<style>
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--color-background, #ffffff);
    color: var(--color-text, #000000);
  }

  .app {
    min-height: 100vh;
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  .header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .subtitle {
    font-size: 1.1rem;
    color: var(--color-text-secondary, #6b7280);
    margin: 0;
  }

  .main {
    background: var(--color-surface, #ffffff);
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 1px 3px var(--color-shadow, rgba(0, 0, 0, 0.1));
  }

  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: var(--color-surface, white);
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    text-align: center;
  }

  .modal h3 {
    margin: 0 0 1rem 0;
    font-size: 1.25rem;
  }

  .modal p {
    margin: 0 0 1.5rem 0;
    color: var(--color-text-secondary, #6b7280);
  }

  .modal button {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .modal button:hover {
    background: #2563eb;
  }
</style>