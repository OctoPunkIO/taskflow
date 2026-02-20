<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let taskId: string;
  export let loading = false;
  
  const dispatch = createEventDispatcher<{
    success: { message: string };
    error: { message: string };
  }>();
  
  let githubUrl = '';
  let syncEnabled = false;
  let submitting = false;
  
  async function handleSubmit() {
    if (!githubUrl.trim()) return;
    
    submitting = true;
    
    try {
      const response = await fetch('/api/github/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          taskId,
          githubUrl: githubUrl.trim(),
          syncEnabled
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create GitHub link');
      }
      
      // Clear form
      githubUrl = '';
      syncEnabled = false;
      
      dispatch('success', {
        message: 'GitHub link created successfully!'
      });
    } catch (err) {
      dispatch('error', {
        message: err instanceof Error ? err.message : 'Failed to create GitHub link'
      });
    } finally {
      submitting = false;
    }
  }
  
  function isValidGitHubUrl(url: string): boolean {
    return /^https:\/\/github\.com\/[^/]+\/[^/]+\/(issues|pull)\/\d+/.test(url);
  }
  
  $: isValidUrl = githubUrl.trim() === '' || isValidGitHubUrl(githubUrl.trim());
</script>

<div class="bg-white border rounded-lg p-4">
  <h3 class="text-lg font-medium text-gray-900 mb-4">Link GitHub Issue or PR</h3>
  
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div>
      <label for="github-url" class="block text-sm font-medium text-gray-700 mb-1">
        GitHub URL
      </label>
      <input
        id="github-url"
        type="url"
        bind:value={githubUrl}
        placeholder="https://github.com/owner/repo/issues/123"
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        class:border-red-300={!isValidUrl}
        disabled={submitting || loading}
      />
      {#if !isValidUrl}
        <p class="mt-1 text-sm text-red-600">
          Please enter a valid GitHub issue or pull request URL
        </p>
      {/if}
      <p class="mt-1 text-sm text-gray-500">
        Paste a GitHub issue or pull request URL (e.g., https://github.com/owner/repo/issues/123)
      </p>
    </div>
    
    <div class="flex items-center">
      <input
        id="sync-enabled"
        type="checkbox"
        bind:checked={syncEnabled}
        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        disabled={submitting || loading}
      />
      <label for="sync-enabled" class="ml-2 text-sm text-gray-700">
        Enable bidirectional sync
        <span class="text-gray-500">(sync status changes between TaskFlow and GitHub)</span>
      </label>
    </div>
    
    <div class="flex justify-end space-x-3">
      <button
        type="button"
        on:click={() => { githubUrl = ''; syncEnabled = false; }}
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        disabled={submitting || loading}
      >
        Clear
      </button>
      <button
        type="submit"
        disabled={!githubUrl.trim() || !isValidUrl || submitting || loading}
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {#if submitting}
          <span class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Linking...
          </span>
        {:else}
          Link to GitHub
        {/if}
      </button>
    </div>
  </form>
</div>
