<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Task } from '$lib/types';

  export let tasks: Task[] = [];

  const dispatch = createEventDispatcher();

  type ExportFormat = 'csv' | 'json';

  function exportTasks(format: ExportFormat) {
    if (format === 'csv') {
      exportAsCSV();
    } else {
      exportAsJSON();
    }
    dispatch('exported', { format, count: tasks.length });
  }

  function exportAsCSV() {
    const headers = ['ID', 'Title', 'Status', 'Priority', 'Assignee', 'Created'];
    const rows = tasks.map(t => [
      t.id,
      escapeCsvField(t.title),
      t.status,
      t.priority,
      t.assignee?.name || '',
      t.createdAt
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadFile(csv, 'tasks.csv', 'text/csv');
  }

  function exportAsJSON() {
    const json = JSON.stringify(tasks, null, 2);
    downloadFile(json, 'tasks.json', 'application/json');
  }

  function escapeCsvField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return '"' + field.replace(/"/g, '""') + '"';
    }
    return field;
  }

  function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<div class="export-dropdown">
  <button class="export-btn" aria-haspopup="true">
    Export
  </button>
  <div class="export-menu" role="menu">
    <button role="menuitem" on:click={() => exportTasks('csv')}>
      Export as CSV
    </button>
    <button role="menuitem" on:click={() => exportTasks('json')}>
      Export as JSON
    </button>
  </div>
</div>
