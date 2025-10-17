<script lang="ts">
  export let data: { post: { title: string; date: string; html: string } | null };
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
  </main>
{/if}

<style>
  :global(body) { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace; }
  .blog { max-width: 860px; margin: 5vh auto; padding: 0 16px; }
  .back { display: inline-block; margin: 0 0 12px; color: #9ad1ff; text-decoration: none; }
  .back:hover { text-decoration: underline; }
  h1 { font-size: 28px; margin: 0 0 8px; }
  .date { opacity: 0.7; font-size: 12px; margin: 0 0 16px; }
  .content :global(img) { max-width: 100%; border-radius: 8px; }
  .content :global(pre) { background: rgba(255,255,255,0.06); padding: 12px; border-radius: 6px; overflow:auto; }
  .content :global(code) { font-family: inherit; }
</style>
