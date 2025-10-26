<script lang="ts">
  import PersephoneRun from '$lib/components/PersephoneRun.svelte';
  import { onMount } from 'svelte';
  export let data: { post: { title: string; date: string; html: string; slug?: string } | null };

  const isPersephonePost = !!data.post && (
    data.post.slug === 'neon-thirteen-persephone-run' ||
    data.post.slug === 'corrections-and-clarifications' ||
    (data.post.title || '').toLowerCase().includes('neon thirteen') ||
    (data.post.title || '').toLowerCase().includes('corrections & clarifications')
  );
  let bannerActive = false;
  onMount(() => {
    try {
      const raw = localStorage.getItem('persephone-run-v1:save');
      if (raw) {
        const parsed = JSON.parse(raw);
        bannerActive = !!(parsed?.state?.flags?.blogPosted) && parsed?.state?.flags?.blogClean === false;
      }
    } catch {}
  });
</script>

{#if !data.post}
  <main class="blog"><p>Post not found.</p></main>
{:else}
  <main class="blog">
    <a href="/blog" class="back">← Back</a>
    <h1>{data.post.title}</h1>
    {#if data.post.date}<p class="date">{data.post.date}</p>{/if}
    <article class="content">
      {@html data.post.html}
    </article>
    {#if isPersephonePost}
      {#if bannerActive}
        <div class="banner">Signal live — try <code>persephone --bloom</code> in the terminal on the homepage.</div>
      {/if}
      <details class="game" id="persephone">
        <summary>Play the Story</summary>
        <PersephoneRun src="/story.json" />
      </details>
    {/if}
  </main>
{/if}

<style>
  :global(html, body) {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
    height: auto;
    min-height: 100%;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  .blog { max-width: 860px; min-height: 100dvh; margin: 5vh auto; padding: 0 16px; }
  .back { display: inline-block; margin: 0 0 12px; color: #9ad1ff; text-decoration: none; }
  .back:hover { text-decoration: underline; }
  h1 { font-size: 28px; margin: 0 0 8px; }
  .date { opacity: 0.7; font-size: 12px; margin: 0 0 16px; }
  .content :global(img) { max-width: 100%; border-radius: 8px; }
  .content :global(pre) { background: rgba(255,255,255,0.06); padding: 12px; border-radius: 6px; overflow:auto; }
  .content :global(code) { font-family: inherit; }
  .game { margin: 16px 0 24px; }
  .game > summary { cursor: pointer; margin: 10px 0; }
  .banner { margin: 10px 0; background: rgba(126,231,135,0.08); border: 1px solid rgba(126,231,135,0.25); border-radius: 6px; padding: 6px 10px; font-size: 13px; }
</style>
