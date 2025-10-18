import { c as create_ssr_component, e as escape } from "../../../../chunks/index.js";
const _page_svelte_svelte_type_style_lang = "";
const css = {
  code: "html, body{font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;height:auto;min-height:100%;overflow-y:auto;-webkit-overflow-scrolling:touch}.blog.svelte-11wxvud{max-width:860px;min-height:100dvh;margin:5vh auto;padding:0 16px}.back.svelte-11wxvud{display:inline-block;margin:0 0 12px;color:#9ad1ff;text-decoration:none}.back.svelte-11wxvud:hover{text-decoration:underline}h1.svelte-11wxvud{font-size:28px;margin:0 0 8px}.date.svelte-11wxvud{opacity:0.7;font-size:12px;margin:0 0 16px}.content.svelte-11wxvud img{max-width:100%;border-radius:8px}.content.svelte-11wxvud pre{background:rgba(255,255,255,0.06);padding:12px;border-radius:6px;overflow:auto}.content.svelte-11wxvud code{font-family:inherit}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  $$result.css.add(css);
  return `${!data.post ? `<main class="blog svelte-11wxvud"><p>Post not found.</p></main>` : `<main class="blog svelte-11wxvud"><a href="/blog" class="back svelte-11wxvud">← Back</a>
    <h1 class="svelte-11wxvud">${escape(data.post.title)}</h1>
    ${data.post.date ? `<p class="date svelte-11wxvud">${escape(data.post.date)}</p>` : ``}
    <article class="content svelte-11wxvud"><!-- HTML_TAG_START -->${data.post.html}<!-- HTML_TAG_END --></article></main>`}`;
});
export {
  Page as default
};
