<script lang="ts">
	import TaskList from '$lib/components/TaskList.svelte';
	import type { Task } from '$lib/types';

	// Sample task data for demonstration
	let tasks: Task[] = [
		{
			id: '1',
			title: 'Implement user authentication',
			description: 'Add login and registration functionality with JWT tokens',
			status: 'in_progress',
			priority: 'high',
			projectId: 'proj1',
			assigneeId: 'user1',
			createdBy: 'user1',
			dueDate: new Date('2024-12-31'),
			createdAt: new Date('2024-01-15'),
			updatedAt: new Date('2024-01-20')
		},
		{
			id: '2',
			title: 'Design dashboard layout',
			description: 'Create wireframes and mockups for the main dashboard',
			status: 'todo',
			priority: 'medium',
			projectId: 'proj1',
			assigneeId: 'user2',
			createdBy: 'user1',
			dueDate: new Date('2024-12-25'),
			createdAt: new Date('2024-01-10'),
			updatedAt: new Date('2024-01-10')
		},
		{
			id: '3',
			title: 'Set up CI/CD pipeline',
			description: 'Configure GitHub Actions for automated testing and deployment',
			status: 'in_review',
			priority: 'high',
			projectId: 'proj1',
			assigneeId: 'user3',
			createdBy: 'user1',
			dueDate: new Date('2024-12-20'),
			createdAt: new Date('2024-01-05'),
			updatedAt: new Date('2024-01-18')
		},
		{
			id: '4',
			title: 'Write API documentation',
			description: 'Document all API endpoints with examples and schemas',
			status: 'done',
			priority: 'medium',
			projectId: 'proj1',
			assigneeId: 'user2',
			createdBy: 'user1',
			dueDate: new Date('2024-12-15'),
			createdAt: new Date('2024-01-01'),
			updatedAt: new Date('2024-01-12')
		},
		{
			id: '5',
			title: 'Optimize database queries',
			description: 'Improve performance of slow queries and add proper indexing',
			status: 'todo',
			priority: 'critical',
			projectId: 'proj2',
			assigneeId: 'user3',
			createdBy: 'user1',
			dueDate: new Date('2024-12-30'),
			createdAt: new Date('2024-01-12'),
			updatedAt: new Date('2024-01-12')
		}
	];

	// Task management functions
	function handleTaskUpdate(event: CustomEvent<{ taskId: string; updates: Partial<Task> }>) {
		const { taskId, updates } = event.detail;
		tasks = tasks.map(task => 
			task.id === taskId 
				? { ...task, ...updates, updatedAt: new Date() }
				: task
		);
	}

	function handleTaskDelete(event: CustomEvent<{ taskId: string }>) {
		const { taskId } = event.detail;
		tasks = tasks.filter(task => task.id !== taskId);
	}

	function handleNewTask(event: CustomEvent) {
		// For demonstration, create a new task with default values
		const newTask: Task = {
			id: Date.now().toString(),
			title: 'New Task',
			description: 'Task description',
			status: 'todo',
			priority: 'medium',
			projectId: 'proj1',
			assigneeId: 'user1',
			createdBy: 'user1',
			dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
			createdAt: new Date(),
			updatedAt: new Date()
		};
		tasks = [newTask, ...tasks];
	}

	function handleQuickSearch(event: CustomEvent) {
		// For demonstration, just log the action
		console.log('Quick search triggered (Cmd+K)');
		// In a real app, this would open a search modal or focus a search input
		alert('Quick search feature would be implemented here (Cmd+K)');
	}
</script>

<svelte:head>
	<title>Taskflow - Task Management</title>
	<meta name="description" content="Efficient task management with keyboard shortcuts" />
</svelte:head>

<main class="container">
	<header class="header">
		<h1>Taskflow</h1>
		<p class="subtitle">Task management with keyboard shortcuts</p>
		<div class="help-text">
			<strong>Keyboard shortcuts:</strong>
			<kbd>N</kbd> New task • 
			<kbd>J</kbd>/<kbd>K</kbd> Navigate • 
			<kbd>Enter</kbd> Edit • 
			<kbd>E</kbd> Edit • 
			<kbd>D</kbd> Delete • 
			<kbd>1-4</kbd> Change status • 
			<kbd>Cmd+K</kbd> Quick search
		</div>
	</header>

	<TaskList 
		{tasks} 
		on:taskUpdate={handleTaskUpdate}
		on:taskDelete={handleTaskDelete}
		on:newTask={handleNewTask}
		on:quickSearch={handleQuickSearch}
	/>
</main>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}

	.header {
		text-align: center;
		margin-bottom: 3rem;
		color: white;
	}

	.header h1 {
		font-size: 3rem;
		margin: 0;
		font-weight: 700;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.subtitle {
		font-size: 1.2rem;
		margin: 0.5rem 0 2rem 0;
		opacity: 0.9;
	}

	.help-text {
		background: rgba(255, 255, 255, 0.1);
		padding: 1rem;
		border-radius: 8px;
		font-size: 0.9rem;
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	kbd {
		background: rgba(255, 255, 255, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 4px;
		padding: 0.2rem 0.4rem;
		font-family: monospace;
		font-size: 0.8rem;
		margin: 0 0.1rem;
	}

	:global(body) {
		margin: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		background: #f5f7fa;
	}
</style>