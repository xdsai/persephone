import { c as create_ssr_component, f as each, d as add_attribute, e as escape } from "../../../chunks/index.js";
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: "html, body{font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;height:auto;min-height:100%;overflow-y:auto;-webkit-overflow-scrolling:touch}.blog.svelte-11snsyh{max-width:860px;min-height:100dvh;margin:5vh auto;padding:0 16px}.back.svelte-11snsyh{display:inline-block;margin:0 0 12px;color:#9ad1ff;text-decoration:none}.back.svelte-11snsyh:hover{text-decoration:underline}h1.svelte-11snsyh{font-size:28px;margin:0 0 16px}.posts.svelte-11snsyh{list-style:none;margin:0;padding:0;display:grid;gap:14px}.post.svelte-11snsyh{display:grid;gap:6px;padding:12px;border-radius:8px;text-decoration:none;color:inherit;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)}.post.svelte-11snsyh:hover{background:rgba(255,255,255,0.05)}.title.svelte-11snsyh{font-weight:700}.date.svelte-11snsyh{opacity:0.7;font-size:12px}.summary.svelte-11snsyh{opacity:0.85}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$result.css.add(css);
  return `<main class="blog svelte-11snsyh"><a href="/" class="back svelte-11snsyh">← Back</a>
  <h1 class="svelte-11snsyh">alex&#39;s blog</h1>
  <ul class="posts svelte-11snsyh">${each(data.posts, (p) => {
    return `<li><a class="post svelte-11snsyh"${add_attribute("href", `/blog/${p.slug}`, 0)}><span class="title svelte-11snsyh">${escape(p.title)}</span>
          ${p.date ? `<span class="date svelte-11snsyh">${escape(p.date)}</span>` : ``}
          ${p.summary ? `<span class="summary svelte-11snsyh">${escape(p.summary)}</span>` : ``}</a>
      </li>`;
  })}</ul>
</main>`;
});
export {
  Page as default
};
