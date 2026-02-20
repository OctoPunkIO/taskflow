<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let taskId: string;
  export let disabled = false;

  const dispatch = createEventDispatcher<{
    add: { url: string };
  }>();

  let url = '';
  let loading = false;
  let error: string | null = null;

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    error = null;
    loading = true;

    try {
      const response = await fetch('/api/github/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ taskId, githubUrl: url.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add GitHub link');
      }

      dispatch('add', { url: url.trim() });
      url = ''; // Clear the form
  9 catch (e) {
      error = e instanceof Error ? e.message : 'An unexpected error occurred';
    } finally {
      loading = false;
    }
  };
</script>

<div class="border rounded-lg p-4 bg-gray-50">
  <h3 class="font-medium text-gray-900 mb-3">Link GitHub Issue/PR</h3>
  
  <form on:submit={handleSubmit} class="space-y-3">
    <div>
      <label for="github-url" class="block text-sm font-medium text-gray-700 mb-1">
        GitHub URL
      </label>
      <input
        id="github-url"
        type="url"
        bind:value={url}
        placeholder="https://github.com/owner/repo/issues/123"
        required
        disabled={disabled || loading}
        class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>

    {#if error}
      <div class="text-sm text-red-600 bg-red-50 p-2 rounded-md">
        {error}
      </div>
    {/if}

    <button
      type="submit"
      disabled={disabled || loading || !url.trim()}
      class="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {if loading}
        <!-- Loading spinner -->
        <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0a8 8 0 0 0-8 8z"></path>
        </svg>
        Adding...
      {:else}
        Add Link
      {/if}
    </button>
  </form>
</div>
