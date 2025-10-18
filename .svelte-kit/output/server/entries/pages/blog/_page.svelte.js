import { c as create_ssr_component, f as each, d as add_attribute, e as escape } from "../../../chunks/index.js";
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: "body{font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace}.blog.svelte-uf5064{max-width:860px;margin:5vh auto;padding:0 16px}.back.svelte-uf5064{display:inline-block;margin:0 0 12px;color:#9ad1ff;text-decoration:none}.back.svelte-uf5064:hover{text-decoration:underline}h1.svelte-uf5064{font-size:28px;margin:0 0 16px}.posts.svelte-uf5064{list-style:none;margin:0;padding:0;display:grid;gap:14px}.post.svelte-uf5064{display:grid;gap:6px;padding:12px;border-radius:8px;text-decoration:none;color:inherit;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)}.post.svelte-uf5064:hover{background:rgba(255,255,255,0.05)}.title.svelte-uf5064{font-weight:700}.date.svelte-uf5064{opacity:0.7;font-size:12px}.summary.svelte-uf5064{opacity:0.85}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$result.css.add(css);
  return `<main class="blog svelte-uf5064"><a href="/" class="back svelte-uf5064">← Back</a>
  <h1 class="svelte-uf5064">alex&#39;s blog</h1>
  <ul class="posts svelte-uf5064">${each(data.posts, (p) => {
    return `<li><a class="post svelte-uf5064"${add_attribute("href", `/blog/${p.slug}`, 0)}><span class="title svelte-uf5064">${escape(p.title)}</span>
          ${p.date ? `<span class="date svelte-uf5064">${escape(p.date)}</span>` : ``}
          ${p.summary ? `<span class="summary svelte-uf5064">${escape(p.summary)}</span>` : ``}</a>
      </li>`;
  })}</ul>
</main>`;
});
export {
  Page as default
};
