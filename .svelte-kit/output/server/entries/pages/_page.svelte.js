import { c as create_ssr_component, o as onDestroy, d as add_attribute, e as escape, f as each, v as validate_component } from "../../chunks/index.js";
import "marked";
/* empty css                                                        */function now() {
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
const SAVE_KEY = "persephone-run-v1:save";
const Terminal_svelte_svelte_type_style_lang = "";
const css = {
  code: "html, body{margin:0;--cp-bg:#0b0205;--cp-bg2:#12070a;--cp-accent:#ff1744;--cp-accent-2:#ff445e;--cp-soft:rgba(255, 23, 68, 0.14);--cp-blue:#66e2ff;--cp-blue-soft:rgba(102,226,255,0.12);--cp-border:rgba(255, 23, 68, 0.28);--cp-text:#ffe8ec;background:radial-gradient(1200px 800px at 18% 18%, rgba(255,0,32,0.10) 0, rgba(2,3,10,0) 60%),\n      radial-gradient(1000px 700px at 82% 65%, rgba(255,46,84,0.12) 0, rgba(1,2,8,0) 60%),\n      linear-gradient(120deg, var(--cp-bg), var(--cp-bg2) 58%, #060104);color:var(--cp-text);font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;min-height:100%;-webkit-text-size-adjust:100%;overflow-x:hidden}.terminal-wrap.svelte-s1qwb5.svelte-s1qwb5{position:fixed;top:0;left:0;right:0;bottom:0;margin:auto;width:clamp(720px, 80vw, 1100px);height:clamp(420px, 58vh, 680px);display:grid;grid-template-rows:auto 1fr;border-radius:14px;box-shadow:0 28px 80px rgba(0,0,0,0.55), 0 0 0 1px var(--cp-soft) inset, 0 0 36px rgba(102,226,255,0.12);overflow:hidden;background:linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01)),\n      var(--cp-bg2)}@media(max-width: 720px){.terminal-wrap.svelte-s1qwb5.svelte-s1qwb5{width:100vw;height:100dvh;border-radius:0;margin:0}.terminal.svelte-s1qwb5.svelte-s1qwb5{font-size:12px;padding:10px;overscroll-behavior:contain}.titlebar.svelte-s1qwb5.svelte-s1qwb5{padding:8px 10px;font-size:11px}.readline.svelte-s1qwb5.svelte-s1qwb5{font-size:16px}}.titlebar.svelte-s1qwb5.svelte-s1qwb5{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px;padding:10px 14px;background:linear-gradient(180deg, rgba(102,226,255,0.18), rgba(255,255,255,0));border-bottom:1px solid rgba(102,226,255,0.25);color:rgba(220,248,255,0.85);font-size:12px;letter-spacing:0.05em}.controls.svelte-s1qwb5.svelte-s1qwb5{display:flex;align-items:center;gap:8px}.dot.svelte-s1qwb5.svelte-s1qwb5{width:10px;height:10px;border-radius:50%;display:inline-block;box-shadow:0 0 0 1px rgba(0,0,0,0.35) inset}.dot.r.svelte-s1qwb5.svelte-s1qwb5{background:#ff5f57}.dot.y.svelte-s1qwb5.svelte-s1qwb5{background:#ffbd2e}.dot.g.svelte-s1qwb5.svelte-s1qwb5{background:#28c840}.title.svelte-s1qwb5.svelte-s1qwb5{opacity:0.95;text-shadow:0 0 10px rgba(102,226,255,0.35), 0 0 8px rgba(120,200,255,0.25)}.uptime.svelte-s1qwb5.svelte-s1qwb5{opacity:0.6}.term-pane.svelte-s1qwb5.svelte-s1qwb5{position:relative;overflow:hidden;display:grid;grid-template-rows:1fr}.terminal.svelte-s1qwb5.svelte-s1qwb5{overflow:auto;padding:16px;line-height:1.5;font-size:14px;position:relative;height:100%;min-height:0;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;scrollbar-gutter:stable both-edges;background-image:repeating-linear-gradient(to bottom, rgba(102,226,255,0.10) 0px, rgba(102,226,255,0.10) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 14px),\n      /* story-style radial glows */\n      radial-gradient(800px 300px at 10% -10%, rgba(102,226,255,0.08), rgba(0,0,0,0) 40%),\n      radial-gradient(600px 240px at 110% 110%, rgba(255,23,68,0.08), rgba(0,0,0,0) 50%),\n      /* story-style vertical wash */\n      linear-gradient(180deg, rgba(255,23,68,0.06), rgba(102,226,255,0.08) 50%, rgba(0,0,0,0)),\n      var(--cp-bg2);background-blend-mode:screen, normal, normal, normal, normal}.fx.svelte-s1qwb5.svelte-s1qwb5{position:absolute;inset:0;pointer-events:none;border-radius:inherit}.fx-scan.svelte-s1qwb5.svelte-s1qwb5{background:linear-gradient(0deg, rgba(255,255,255,0) 46%, rgba(126,231,135,0.16) 50%, rgba(255,255,255,0) 54%);opacity:0.28;will-change:transform, opacity;animation:svelte-s1qwb5-fx-scan 8s linear infinite}@keyframes svelte-s1qwb5-fx-scan{0%{transform:translateY(-100%)}100%{transform:translateY(100%)}}.fx-noise.svelte-s1qwb5.svelte-s1qwb5{background:repeating-linear-gradient(to bottom, rgba(102,226,255,0.10) 0px, rgba(102,226,255,0.10) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 16px);mix-blend-mode:screen;opacity:0.26;animation:svelte-s1qwb5-fx-noise 7s ease-in-out infinite alternate}@keyframes svelte-s1qwb5-fx-noise{0%{opacity:0.10}100%{opacity:0.18}}@keyframes svelte-s1qwb5-sweep{0%{opacity:0.25}50%{opacity:0.35}100%{opacity:0.25}}.row.svelte-s1qwb5.svelte-s1qwb5{white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;color:#d6f2ff;text-shadow:0 0 6px rgba(102,226,255,0.25), 0 0 8px rgba(255,23,68,0.18)}.row.svelte-s1qwb5+.row.svelte-s1qwb5{margin-top:6px}.row.svelte-s1qwb5 .cmdline{color:#c7f0ff;text-shadow:0 0 10px rgba(102,226,255,0.55)}.row.svelte-s1qwb5 .cmdline .cmdtext{color:#e9fbff;opacity:0.95;text-shadow:0 0 10px rgba(102,226,255,0.55)}.row.input.svelte-s1qwb5.svelte-s1qwb5{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:8px}.readline.svelte-s1qwb5.svelte-s1qwb5{width:100%;background:transparent;color:#e7e4ff;border:none;outline:none;font:inherit;caret-color:#8fe9ff;text-shadow:0 0 6px rgba(102,226,255,0.35)}.readline.svelte-s1qwb5.svelte-s1qwb5::selection{background:rgba(102,226,255,0.25)}.end.svelte-s1qwb5.svelte-s1qwb5{height:1px}.prompt.svelte-s1qwb5.svelte-s1qwb5{color:#a8f2ff;text-shadow:0 0 10px rgba(102,226,255,0.6), 0 0 6px rgba(255,23,68,0.25)}.g.svelte-s1qwb5.svelte-s1qwb5{color:#89f7a1}.y.svelte-s1qwb5.svelte-s1qwb5{color:#ffd27e}.cmdline{color:#b9f0ff;text-shadow:0 0 12px rgba(102,226,255,0.65)}.cmdline .cmdtext{color:#e9fbff;opacity:0.95;text-shadow:0 0 12px rgba(102,226,255,0.65)}.nav.svelte-s1qwb5.svelte-s1qwb5{color:#bdf3ff;text-decoration:none;text-shadow:0 0 12px rgba(102,226,255,0.7), 0 0 6px rgba(255,23,68,0.2)}.nav.svelte-s1qwb5.svelte-s1qwb5:hover{text-decoration:underline}@keyframes svelte-s1qwb5-glitch{0%,100%{transform:translate(0);filter:drop-shadow(0 0 0 rgba(255,23,68,0))}20%{transform:translate(0.3px, 0);filter:drop-shadow(0 0 4px rgba(255,23,68,0.35))}40%{transform:translate(-0.3px, 0)}60%{transform:translate(0.2px, 0.1px)}80%{transform:translate(-0.2px, -0.1px)}}.overlay.svelte-s1qwb5.svelte-s1qwb5{position:fixed;inset:0;background:rgba(0,0,0,0.65);display:grid;place-items:center;z-index:20;overflow:auto;padding:clamp(12px, 3vh, 28px) 0}.box.svelte-s1qwb5.svelte-s1qwb5{position:relative;width:min(920px, 92vw);max-height:92vh;background:#0b0f1e;border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:10px;box-shadow:0 10px 40px rgba(0,0,0,0.45);display:flex;flex-direction:column;overflow:hidden;margin:0 auto}.box.svelte-s1qwb5 .content.svelte-s1qwb5{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:8px 10px}.box.svelte-s1qwb5 .close.svelte-s1qwb5{position:absolute;top:6px;right:8px;background:transparent;color:#e7e4ff;border:none;font-size:20px;cursor:pointer}.obartitle.svelte-s1qwb5.svelte-s1qwb5{font-size:12px;letter-spacing:0.06em;opacity:0.7;margin:2px 0 8px}.box.arg.svelte-s1qwb5.svelte-s1qwb5{padding:14px}.argsec.svelte-s1qwb5.svelte-s1qwb5{margin:8px 0 12px}.arghead.svelte-s1qwb5.svelte-s1qwb5{font-weight:600;margin-bottom:6px}.payload.svelte-s1qwb5.svelte-s1qwb5{background:rgba(255,255,255,0.06);border-radius:6px;padding:8px}.ltitle.svelte-s1qwb5.svelte-s1qwb5{color:#cfe8ff}.lsum.svelte-s1qwb5.svelte-s1qwb5{opacity:0.8}",
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
  let endEl;
  let argSave = null;
  const barGlitchDur = 4 + Math.random() * 4;
  const barGlitchDelay = Math.random() * 3;
  function loadArgSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      argSave = raw ? JSON.parse(raw) : null;
    } catch {
      argSave = null;
    }
  }
  onDestroy(() => {
    if (typeof window !== "undefined")
      window.removeEventListener("persephone:save", loadArgSave);
  });
  $$result.css.add(css);
  promptText = `${username}@${hostname}:${formatPath(state.cwd)}$`;
  return `<div class="terminal-wrap svelte-s1qwb5" tabindex="-1" role="group" aria-label="web terminal"><div class="titlebar svelte-s1qwb5"><div class="controls svelte-s1qwb5"><span class="dot r svelte-s1qwb5"></span><span class="dot y svelte-s1qwb5"></span><span class="dot g svelte-s1qwb5"></span></div>
    <span class="title svelte-s1qwb5"${add_attribute("style", `animation: glitch ${barGlitchDur.toFixed(2)}s infinite steps(2); animation-delay:${barGlitchDelay.toFixed(2)}s`, 0)}>${escape(username)}@${escape(hostname)} — ${escape(formatPath(state.cwd))}</span>
    <span class="uptime svelte-s1qwb5">up ${escape(uptimeMinutes)} min</span></div>
  <div class="term-pane svelte-s1qwb5"><div class="terminal svelte-s1qwb5"${add_attribute("this", term, 0)}>${each(rows, (r) => {
    return `<div class="row svelte-s1qwb5"><!-- HTML_TAG_START -->${r.html}<!-- HTML_TAG_END --></div>`;
  })}
    <div class="row input svelte-s1qwb5"><span class="prompt svelte-s1qwb5" aria-hidden="true">${escape(promptText)}</span>
      <input class="readline svelte-s1qwb5" type="text" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off"${add_attribute("this", inputEl, 0)}${add_attribute("value", line, 0)}></div>
    <div class="end svelte-s1qwb5" aria-hidden="true"${add_attribute("this", endEl, 0)}></div></div>
    <div class="fx fx-scan svelte-s1qwb5" aria-hidden="true"></div>
    <div class="fx fx-noise svelte-s1qwb5" aria-hidden="true"></div></div>

${``}

${``}
  
</div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Terminal, "Terminal").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
