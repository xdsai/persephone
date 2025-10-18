import { c as create_ssr_component, o as onDestroy, e as escape, d as add_attribute, f as each, v as validate_component } from "../../chunks/index.js";
function now() {
  return Date.now();
}
function createDir(name, children = []) {
  const t = now();
  return { name, type: "dir", children, createdAt: t, updatedAt: t };
}
function createFile(name, content = "") {
  const t = now();
  return { name, type: "file", content, createdAt: t, updatedAt: t };
}
function defaultFs() {
  const root = createDir("/", [
    // core UNIX-like layout
    createDir("bin", [
      createFile("ls", ""),
      createFile("cat", ""),
      createFile("echo", ""),
      createFile("pwd", ""),
      createFile("cd", ""),
      createFile("ip", "")
    ]),
    createDir("usr", [
      createDir("bin", [createFile("node", ""), createFile("bash", "")]),
      createDir("share", [createFile("dict.txt", "why are you looking here >:(")])
    ]),
    createDir("var", [
      createDir("log", [createFile("auth.log", "accepted connection"), createFile("kern.log", "boot ok")]),
      createDir("tmp")
    ]),
    createDir("proc", [createFile("cpuinfo", "cpu: webasm"), createFile("meminfo", "mem: virtual")]),
    createDir("etc", [
      createFile("hostname", "jndl\n"),
      createFile("hosts", "127.0.0.1 localhost\n::1 localhost\n"),
      createFile("os-release", "NAME=Web\nID=web")
    ]),
    createDir("home", [
      createDir("alex", [
        createFile("README.md", `# Alexander Jandl

Welcome to my terminal. Try \`help\` to see commands.

Useful places:
- ~/about.txt
- ~/skills.md
- ~/projects
`),
        createFile("about.txt", `Infrastructure & security focused engineer based in Bratislava. I like reliable automation, scalable systems, and cats.`),
        createFile("skills.md", `- Linux, networking, network security
- AWS & Azure platform security
- Scripting: Bash, Python, Powershell, C
- Zero-trust, identity, and least privilege`),
        { ...createFile("blog", "Open the personal blog"), link: "/blog" },
        createDir("projects", [
          { ...createFile("persephone", "personal webpage, vibecoded from scratch.\ni don't know any frontend :D"), link: "https://github.com/xdsai/persephone" }
        ]),
        createDir("socials", [
          { ...createFile("github", "my github profile"), link: "https://github.com/xdsai" },
          { ...createFile("linkedin", "my linkedin profile"), link: "https://www.linkedin.com/in/jndl/" },
          { ...createFile("email", "email me something nice! no nigerian princes please"), link: "mailto:alex@jndl.dev" }
        ])
      ])
    ]),
    createDir("tmp")
  ]);
  return { root, cwd: "/home/alex" };
}
const Terminal_svelte_svelte_type_style_lang = "";
const css = {
  code: "html, body{margin:0;background:radial-gradient(1200px 800px at 20% 20%, #0a0f25 0, rgba(2,3,10,0) 60%),\n                radial-gradient(900px 600px at 80% 60%, rgba(64,22,72,0.25) 0, rgba(1,2,8,0) 60%),\n                linear-gradient(120deg, #02030a, #090e22 58%, #010208);background-color:#0a0f25;color:#e7e4ff;font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;min-height:100%;-webkit-text-size-adjust:100%;overflow-x:hidden}.terminal-wrap.svelte-1o8s9me.svelte-1o8s9me{position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);width:clamp(720px, 80vw, 1100px);height:clamp(420px, 58vh, 680px);display:grid;grid-template-rows:auto 1fr;border-radius:14px;box-shadow:0 28px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06) inset;overflow:hidden;background:#0b0f1e}@media(max-width: 720px){.terminal-wrap.svelte-1o8s9me.svelte-1o8s9me{width:100vw;height:100dvh;border-radius:0;margin:0}.terminal.svelte-1o8s9me.svelte-1o8s9me{font-size:12px;padding:10px;overscroll-behavior:contain}.titlebar.svelte-1o8s9me.svelte-1o8s9me{padding:8px 10px;font-size:11px}.readline.svelte-1o8s9me.svelte-1o8s9me{font-size:16px}}.titlebar.svelte-1o8s9me.svelte-1o8s9me{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px;padding:10px 14px;background:linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0));border-bottom:1px solid rgba(255,255,255,0.08);color:rgba(230,228,255,0.72);font-size:12px;letter-spacing:0.05em}.controls.svelte-1o8s9me.svelte-1o8s9me{display:flex;align-items:center;gap:8px}.dot.svelte-1o8s9me.svelte-1o8s9me{width:10px;height:10px;border-radius:50%;display:inline-block;box-shadow:0 0 0 1px rgba(0,0,0,0.35) inset}.dot.r.svelte-1o8s9me.svelte-1o8s9me{background:#ff5f57}.dot.y.svelte-1o8s9me.svelte-1o8s9me{background:#ffbd2e}.dot.g.svelte-1o8s9me.svelte-1o8s9me{background:#28c840}.title.svelte-1o8s9me.svelte-1o8s9me{opacity:0.85}.uptime.svelte-1o8s9me.svelte-1o8s9me{opacity:0.6}.terminal.svelte-1o8s9me.svelte-1o8s9me{overflow:auto;padding:16px;line-height:1.5;font-size:14px;background:radial-gradient(80% 80% at 60% 10%, rgba(255,255,255,0.06), rgba(0,0,0,0) 40%), #0b0f1e}.row.svelte-1o8s9me.svelte-1o8s9me{white-space:pre-wrap;word-wrap:break-word}.row.svelte-1o8s9me+.row.svelte-1o8s9me{margin-top:6px}.row.input.svelte-1o8s9me.svelte-1o8s9me{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:8px}.readline.svelte-1o8s9me.svelte-1o8s9me{width:100%;background:transparent;color:#e7e4ff;border:none;outline:none;font:inherit}.prompt.svelte-1o8s9me.svelte-1o8s9me{color:#9cb6ff}.g.svelte-1o8s9me.svelte-1o8s9me{color:#7ee787}.y.svelte-1o8s9me.svelte-1o8s9me{color:#ffd27e}",
  map: null
};
let hostname = "jndl";
let username = "alex";
function formatPath(p) {
  const home = "/home/" + username;
  if (p === home)
    return "~";
  if (p.startsWith(home + "/"))
    return "~" + p.slice(home.length);
  return p;
}
const Terminal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let promptText;
  let state = defaultFs();
  let term;
  let inputEl;
  let line = "";
  let uptimeMinutes = 0;
  let rows = [];
  onDestroy(() => {
  });
  $$result.css.add(css);
  promptText = `${username}@${hostname}:${formatPath(state.cwd)}$`;
  return `<div class="terminal-wrap svelte-1o8s9me" tabindex="0" role="group" aria-label="web terminal"><div class="titlebar svelte-1o8s9me"><div class="controls svelte-1o8s9me"><span class="dot r svelte-1o8s9me"></span><span class="dot y svelte-1o8s9me"></span><span class="dot g svelte-1o8s9me"></span></div>
    <span class="title svelte-1o8s9me">${escape(username)}@${escape(hostname)} — ${escape(formatPath(state.cwd))}</span>
    <span class="uptime svelte-1o8s9me">up ${escape(uptimeMinutes)} min</span></div>
  <div class="terminal svelte-1o8s9me"${add_attribute("this", term, 0)}>${each(rows, (r) => {
    return `<div class="row svelte-1o8s9me"><!-- HTML_TAG_START -->${r.html}<!-- HTML_TAG_END --></div>`;
  })}
    <div class="row input svelte-1o8s9me"><span class="prompt svelte-1o8s9me" aria-hidden="true">${escape(promptText)}</span>
      <input class="readline svelte-1o8s9me" type="text" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off"${add_attribute("this", inputEl, 0)}${add_attribute("value", line, 0)}></div></div>

  
</div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Terminal, "Terminal").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
