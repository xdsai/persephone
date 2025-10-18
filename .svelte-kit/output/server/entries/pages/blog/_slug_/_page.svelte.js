import { c as create_ssr_component, e as escape } from "../../../../chunks/index.js";
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: "body{font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace}.blog.svelte-191gonc{max-width:860px;margin:5vh auto;padding:0 16px}.back.svelte-191gonc{display:inline-block;margin:0 0 12px;color:#9ad1ff;text-decoration:none}.back.svelte-191gonc:hover{text-decoration:underline}h1.svelte-191gonc{font-size:28px;margin:0 0 8px}.date.svelte-191gonc{opacity:0.7;font-size:12px;margin:0 0 16px}.content.svelte-191gonc img{max-width:100%;border-radius:8px}.content.svelte-191gonc pre{background:rgba(255,255,255,0.06);padding:12px;border-radius:6px;overflow:auto}.content.svelte-191gonc code{font-family:inherit}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$result.css.add(css);
  return `${!data.post ? `<main class="blog svelte-191gonc"><p>Post not found.</p></main>` : `<main class="blog svelte-191gonc"><a href="/blog" class="back svelte-191gonc">← Back</a>
    <h1 class="svelte-191gonc">${escape(data.post.title)}</h1>
    ${data.post.date ? `<p class="date svelte-191gonc">${escape(data.post.date)}</p>` : ``}
    <article class="content svelte-191gonc"><!-- HTML_TAG_START -->${data.post.html}<!-- HTML_TAG_END --></article></main>`}`;
});
export {
  Page as default
};
