<script lang="ts">
  import type { GitHubItem } from '$lib/types/github';

  export let item: GitHubItem;
  export let onRemove: () => void = () => {};

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
t/script>

<div class="border rounded-lg p-4 bg-white shadow-sm">
  <div class="flex items-start justify-between mb-2">
    <div class="flex items-center gap-2">
      <!-- GitHub icon -->
      <svg class="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0.3c-6.6 0-12 5.4-12 12 0 5.3 3.4 9.8 8.2 11.4 0.6 0.1 0.8-0.3 0.8-0.6 0-0.3 0-1 0-2 -3.3 0.7-4-1.6-4-1.6-0.5-1.4-1.3-1.7-1.3-1.7-1.1-0.7 0.1-0.7 0.1-0.7 1.2 0.1 1.9 1.2 1.9 1.2 1.1 1.9 2.9 1.3 3.6 1 0.1-0.8 0.4-1.3 0.8-1.6-2.7-0.3-5.5-1.3-5.5-6 0-1.3 0.5-2.5 1.2-3.3-0.1-0.3-0.5-1.5 0.1-3.1 0 0 1-0.3 3.3 1.2 1-0.3 2.1-0.4 3.2-0.4s 2.2 0.1 3.2 0.4c2.3-1.5 3.3-1.2 3.3-1.2 0.6 1.6 0.2 2.8 0.1 3.1 0.8 0.8 1.2 2 1.2 3.3 0 4.7-2.8 5.7-5.5 6 0.4 0.4 0.8 1.1 0.8 2.2 0 1.6 0 2.9 0 3.3 0 0.3 0.2 0.7 0.8 0.6C20.6 22.1 24 17.6 24 12.3c0-6.6-5.4-12-12-12z"></path>
      </svg>

      <div>
        <h3 class="font-semibold text-lg text-gray-900">
          {item.title}
        </h3>
        <p class="text-sm text-gray-600">
          #{item.number} • Opened {formatDate(item.created_at)} by {
          item.user.login
        </p>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <!-- State badge -->
      <span class="px-2 py-1 rounded-full text-xs font-medium {getStateColor(item.state)}">
        {item.state}
      </span>

      <!-- Remove button -->
      <button
        type="button"
        on:click={onRemove}
        class="text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Remove link"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 6l12 12m-12 0l12-12"></path>
        </svg>
      </button>
    </div>
  </div>

  <!-- Description -->
  {if item.body}
    <p class="text-sm text-gray-700 mt-2">
      {item.body.slice(0, 200)}{item.body.length > 200 ? '...' : ''}
    </p>
  {/if}

  <!-- Labels -->
  {if item.labels && item.labels.length > 0}
    <div class="flex flex-wrap gap-1 mt-2">
      {each item.labels as label}
        <span
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
          style="background: #{label.color}33; color: #{label.color};"
        >
          {label.name}
        </span>
      {/each}
    </div>
  >/if>

  <!-- Link to GitHub -->
  <a
    href={item.html_url}
    target="_blank"
    rel="noreferrer noopener"
    class="inline-flex items-center mt-3 text-blue-600 hover:text-blue-800 transition-colors">
    View on GitHub
    <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m4-3h7v7m-6 0l6-6"></path>
    </svg>
  </a>
</div>
