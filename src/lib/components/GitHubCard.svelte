<script lang="ts">
  import type { GitHubIssue, GitHubPullRequest } from '$lib/types';

  export let githubData: GitHubIssue | GitHubPullRequest;
  export let type: 'issue' | 'pull_request';
  export let showActions = false;
  export let onRemove: (() => void) | null = null;

  $: isPullRequest = type === 'pull_request';
  $: isMerged = isPullRequest && 'merged' in githubData && githubData.merged;
  $: statusColor = githubData.state === 'open' ? 'bg-green-100 text-green-800' : 
                   isMerged ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800';
  $: statusIcon = githubData.state === 'open' ? '●' : 
                  isMerged ? '⚫' : '○';
  $: typeIcon = isPullRequest ? '↗' : '!';

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  }

  function openInGitHub() {
    window.open(githubData.html_url, '_blank');
  }
</script>

<div class="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
  <div class="flex items-start justify-between">
    <div class="flex items-start space-x-3 flex-1 min-w-0">
      <!-- GitHub Avatar -->
      <img 
        src={githubData.user.avatar_url} 
        alt={githubData.user.login}
        class="w-8 h-8 rounded-full flex-shrink-0"
      />
      
      <div class="flex-1 min-w-0">
        <!-- Title and Number -->
        <div class="flex items-center space-x-2 mb-1">
          <span class="text-lg font-medium text-gray-900 truncate">
            {githubData.title}
          </span>
          <span class="text-sm text-gray-500 flex-shrink-0">
            {typeIcon}#{githubData.number}
          </span>
        </div>
        
        <!-- Repository and Status -->
        <div class="flex items-center space-x-3 mb-2">
          <span class="text-sm text-gray-600">
            {githubData.repository.full_name}
          </span>
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {statusColor}">
            <span class="mr-1">{statusIcon}</span>
            {githubData.state}
            {#if isMerged}
              (merged)
            {/if}
          </span>
        </div>
        
        <!-- Body preview -->
        {#if githubData.body}
          <p class="text-sm text-gray-600 line-clamp-2 mb-2">
            {githubData.body.slice(0, 150)}{githubData.body.length > 150 ? '...' : ''}
          </p>
        {/if}
        
        <!-- Metadata -->
        <div class="flex items-center space-x-4 text-xs text-gray-500">
          <span>@{githubData.user.login}</span>
          <span>Created {formatDate(githubData.created_at)}</span>
          {#if githubData.updated_at !== githubData.created_at}
            <span>Updated {formatDate(githubData.updated_at)}</span>
          {/if}
        </div>
      </div>
    </div>
    
    <!-- Actions -->
    {#if showActions}
      <div class="flex items-center space-x-2 ml-4">
        <button
          on:click={openInGitHub}
          class="text-blue-600 hover:text-blue-800 text-sm font-medium"
          title="Open in GitHub"
        >
          View
        </button>
        {#if onRemove}
          <button
            on:click={onRemove}
            class="text-red-600 hover:text-red-800 text-sm font-medium"
            title="Remove link"
          >
            Remove
          </button>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
