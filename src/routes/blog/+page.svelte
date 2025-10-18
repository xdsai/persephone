<script lang="ts">
  export let data: { posts: { slug: string; title: string; date: string; summary?: string }[] };
</script>

<main class="blog">
  <a href="/" class="back">← Back</a>
  <h1>alex's blog</h1>
  <ul class="posts">
    {#each data.posts as p}
      <li>
        <a class="post" href={`/blog/${p.slug}`}>
          <span class="title">{p.title}</span>
          {#if p.date}<span class="date">{p.date}</span>{/if}
          {#if p.summary}<span class="summary">{p.summary}</span>{/if}
        </a>
      </li>
    {/each}
  </ul>
</main>

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
  h1 { font-size: 28px; margin: 0 0 16px; }
  .posts { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; }
  .post { display: grid; gap: 6px; padding: 12px; border-radius: 8px; text-decoration: none; color: inherit; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); }
  .post:hover { background: rgba(255,255,255,0.05); }
  .title { font-weight: 700; }
  .date { opacity: 0.7; font-size: 12px; }
  .summary { opacity: 0.85; }
</style>
