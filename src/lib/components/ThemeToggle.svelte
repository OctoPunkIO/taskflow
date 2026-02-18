<script lang="ts">
  import { onMount } from 'svelte';

  type Theme = 'light' | 'dark' | 'system';

  export let theme: Theme = 'system';

  let systemPrefersDark = false;

  onMount(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    systemPrefersDark = mediaQuery.matches;

    const handler = (e: MediaQueryListEvent) => {
      systemPrefersDark = e.matches;
      if (theme === 'system') applyTheme();
    };

    mediaQuery.addEventListener('change', handler);
    applyTheme();

    return () => mediaQuery.removeEventListener('change', handler);
  });

  function applyTheme() {
    const isDark = theme === 'dark' || (theme === 'system' && systemPrefersDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }

  function setTheme(newTheme: Theme) {
    theme = newTheme;
    localStorage.setItem('theme', theme);
    applyTheme();
  }
</script>

<div class="theme-toggle" role="radiogroup" aria-label="Theme selection">
  <button
    role="radio"
    aria-checked={theme === 'light'}
    on:click={() => setTheme('light')}
  >
    ☀️ Light
  </button>
  <button
    role="radio"
    aria-checked={theme === 'dark'}
    on:click={() => setTheme('dark')}
  >
    🌙 Dark
  </button>
  <button
    role="radio"
    aria-checked={theme === 'system'}
    on:click={() => setTheme('system')}
  >
    💻 System
  </button>
</div>