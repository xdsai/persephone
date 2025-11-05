import { c as create_ssr_component, o as onDestroy, d as add_attribute, e as escape, f as each, v as validate_component } from "../../chunks/index.js";
import "powerglitch";
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
  code: "html, body{margin:0;--cp-bg:#0b0205;--cp-bg2:#12070a;--cp-accent:#ff1744;--cp-accent-2:#ff445e;--cp-soft:rgba(255, 23, 68, 0.14);--cp-blue:#66e2ff;--cp-blue-soft:rgba(102,226,255,0.12);--cp-border:rgba(255, 23, 68, 0.28);--cp-text:#ffe8ec;background:radial-gradient(1200px 800px at 18% 18%, rgba(255,0,32,0.10) 0, rgba(2,3,10,0) 60%),\n      radial-gradient(1000px 700px at 82% 65%, rgba(255,46,84,0.12) 0, rgba(1,2,8,0) 60%),\n      linear-gradient(120deg, var(--cp-bg), var(--cp-bg2) 58%, #060104);color:var(--cp-text);font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;min-height:100%;-webkit-text-size-adjust:100%;overflow-x:hidden}.terminal-wrap.svelte-3z658x.svelte-3z658x{position:fixed;top:0;left:0;right:0;bottom:0;margin:auto;width:clamp(720px, 80vw, 1100px);height:clamp(420px, 58vh, 680px);display:grid;grid-template-rows:auto 1fr;border-radius:14px;box-shadow:0 28px 80px rgba(0,0,0,0.55),\n      0 0 0 1px var(--cp-soft) inset,\n      0 0 36px rgba(102,226,255,0.12),\n      0 0 80px rgba(102,226,255,0.08);overflow:hidden;background:linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01)),\n      var(--cp-bg2);animation:svelte-3z658x-crt-flicker 0.15s infinite alternate, svelte-3z658x-crt-glow 4s ease-in-out infinite}@keyframes svelte-3z658x-crt-flicker{0%{opacity:0.98}100%{opacity:1}}@keyframes svelte-3z658x-crt-glow{0%,100%{filter:brightness(1) contrast(1.05);box-shadow:0 28px 80px rgba(0,0,0,0.55),\n        0 0 0 1px var(--cp-soft) inset,\n        0 0 36px rgba(102,226,255,0.12),\n        0 0 80px rgba(102,226,255,0.08)}50%{filter:brightness(1.02) contrast(1.08);box-shadow:0 28px 80px rgba(0,0,0,0.55),\n        0 0 0 1px var(--cp-soft) inset,\n        0 0 42px rgba(102,226,255,0.18),\n        0 0 90px rgba(102,226,255,0.12)}}@media(max-width: 720px){.terminal-wrap.svelte-3z658x.svelte-3z658x{width:100vw;height:100dvh;border-radius:0;margin:0}.terminal.svelte-3z658x.svelte-3z658x{font-size:12px;padding:10px;overscroll-behavior:contain}.titlebar.svelte-3z658x.svelte-3z658x{padding:8px 10px;font-size:11px}.readline.svelte-3z658x.svelte-3z658x{font-size:16px}}.titlebar.svelte-3z658x.svelte-3z658x{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px;padding:10px 14px;background:linear-gradient(180deg, rgba(102,226,255,0.18), rgba(255,255,255,0));border-bottom:1px solid rgba(102,226,255,0.25);color:rgba(220,248,255,0.85);font-size:12px;letter-spacing:0.05em}.controls.svelte-3z658x.svelte-3z658x{display:flex;align-items:center;gap:8px}.dot.svelte-3z658x.svelte-3z658x{width:10px;height:10px;border-radius:50%;display:inline-block;box-shadow:0 0 0 1px rgba(0,0,0,0.35) inset}.dot.r.svelte-3z658x.svelte-3z658x{background:#ff5f57}.dot.y.svelte-3z658x.svelte-3z658x{background:#ffbd2e}.dot.g.svelte-3z658x.svelte-3z658x{background:#28c840}.title.svelte-3z658x.svelte-3z658x{opacity:0.95;text-shadow:0 0 10px rgba(102,226,255,0.35), 0 0 8px rgba(120,200,255,0.25)}.uptime.svelte-3z658x.svelte-3z658x{opacity:0.6}.term-pane.svelte-3z658x.svelte-3z658x{position:relative;overflow:hidden;display:grid;grid-template-rows:1fr}.term-pane.svelte-3z658x.svelte-3z658x::before{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 100%);border-radius:inherit;z-index:10}.term-pane.svelte-3z658x.svelte-3z658x::after{content:'';position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 120px rgba(0,0,0,0.5), inset 0 0 60px rgba(0,0,0,0.3);border-radius:inherit;z-index:10}.terminal.svelte-3z658x.svelte-3z658x{overflow:auto;padding:16px;line-height:1.5;font-size:14px;position:relative;height:100%;min-height:0;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;scrollbar-gutter:stable both-edges;background-image:repeating-linear-gradient(to bottom,\n        rgba(102,226,255,0.08) 0px,\n        rgba(102,226,255,0.08) 1px,\n        rgba(0,0,0,0.15) 1px,\n        rgba(0,0,0,0.15) 2px,\n        rgba(102,226,255,0.12) 2px,\n        rgba(102,226,255,0.12) 3px,\n        rgba(0,0,0,0) 3px,\n        rgba(0,0,0,0) 6px),\n      /* story-style radial glows */\n      radial-gradient(800px 300px at 10% -10%, rgba(102,226,255,0.08), rgba(0,0,0,0) 40%),\n      radial-gradient(600px 240px at 110% 110%, rgba(255,23,68,0.08), rgba(0,0,0,0) 50%),\n      /* story-style vertical wash */\n      linear-gradient(180deg, rgba(255,23,68,0.06), rgba(102,226,255,0.08) 50%, rgba(0,0,0,0)),\n      var(--cp-bg2);background-blend-mode:screen, normal, normal, normal, normal;text-shadow:0 0 8px rgba(102,226,255,0.4), 0 0 3px rgba(102,226,255,0.3)}.fx.svelte-3z658x.svelte-3z658x{position:absolute;inset:0;pointer-events:none;border-radius:inherit;z-index:5}.fx-scan.svelte-3z658x.svelte-3z658x{background:linear-gradient(0deg,\n      rgba(255,255,255,0) 40%,\n      rgba(126,231,135,0.22) 48%,\n      rgba(102,226,255,0.28) 50%,\n      rgba(126,231,135,0.22) 52%,\n      rgba(255,255,255,0) 60%);opacity:0.35;will-change:transform, opacity;animation:svelte-3z658x-fx-scan 6s linear infinite;mix-blend-mode:screen}@keyframes svelte-3z658x-fx-scan{0%{transform:translateY(-100%);opacity:0.2}50%{opacity:0.35}100%{transform:translateY(100%);opacity:0.2}}.fx-noise.svelte-3z658x.svelte-3z658x{background:repeating-linear-gradient(to bottom,\n      rgba(102,226,255,0.12) 0px,\n      rgba(102,226,255,0.12) 1px,\n      rgba(255,23,68,0.08) 1px,\n      rgba(255,23,68,0.08) 2px,\n      rgba(0,0,0,0) 2px,\n      rgba(0,0,0,0) 4px);mix-blend-mode:screen;opacity:0.3;animation:svelte-3z658x-fx-noise 0.2s steps(2) infinite, svelte-3z658x-fx-noise-drift 8s ease-in-out infinite alternate}@keyframes svelte-3z658x-fx-noise{0%{opacity:0.28}100%{opacity:0.32}}@keyframes svelte-3z658x-fx-noise-drift{0%{transform:translateY(0)}100%{transform:translateY(3px)}}@keyframes svelte-3z658x-sweep{0%{opacity:0.25}50%{opacity:0.35}100%{opacity:0.25}}.row.svelte-3z658x.svelte-3z658x{white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;color:#d6f2ff;text-shadow:0 0 8px rgba(102,226,255,0.5),\n      0 0 12px rgba(102,226,255,0.3),\n      0 0 16px rgba(102,226,255,0.2),\n      /* Chromatic aberration */\n      -0.5px 0 0 rgba(255,23,68,0.3),\n      0.5px 0 0 rgba(102,226,255,0.3);animation:svelte-3z658x-phosphor-flicker 0.08s infinite alternate}@keyframes svelte-3z658x-phosphor-flicker{0%{text-shadow:0 0 8px rgba(102,226,255,0.5),\n        0 0 12px rgba(102,226,255,0.3),\n        0 0 16px rgba(102,226,255,0.2),\n        -0.5px 0 0 rgba(255,23,68,0.3),\n        0.5px 0 0 rgba(102,226,255,0.3)}100%{text-shadow:0 0 10px rgba(102,226,255,0.6),\n        0 0 14px rgba(102,226,255,0.35),\n        0 0 18px rgba(102,226,255,0.25),\n        -0.5px 0 0 rgba(255,23,68,0.35),\n        0.5px 0 0 rgba(102,226,255,0.35)}}.row.svelte-3z658x+.row.svelte-3z658x{margin-top:6px}.row.svelte-3z658x .cmdline{color:#c7f0ff;text-shadow:0 0 12px rgba(102,226,255,0.65),\n      0 0 18px rgba(102,226,255,0.4),\n      -0.6px 0 0 rgba(255,23,68,0.35),\n      0.6px 0 0 rgba(102,226,255,0.4)}.row.svelte-3z658x .cmdline .cmdtext{color:#e9fbff;opacity:0.95;text-shadow:0 0 12px rgba(102,226,255,0.7),\n      0 0 20px rgba(102,226,255,0.4),\n      -0.7px 0 0 rgba(255,23,68,0.4),\n      0.7px 0 0 rgba(102,226,255,0.4)}.row.input.svelte-3z658x.svelte-3z658x{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:8px}.readline.svelte-3z658x.svelte-3z658x{width:100%;background:transparent;color:#e7e4ff;border:none;outline:none;font:inherit;caret-color:#8fe9ff;text-shadow:0 0 6px rgba(102,226,255,0.35)}.readline.svelte-3z658x.svelte-3z658x::selection{background:rgba(102,226,255,0.25)}.end.svelte-3z658x.svelte-3z658x{height:1px}.prompt.svelte-3z658x.svelte-3z658x{color:#a8f2ff;text-shadow:0 0 12px rgba(102,226,255,0.7),\n      0 0 20px rgba(102,226,255,0.4),\n      0 0 6px rgba(255,23,68,0.3),\n      -0.6px 0 0 rgba(255,23,68,0.35),\n      0.6px 0 0 rgba(102,226,255,0.4);animation:svelte-3z658x-prompt-pulse 2s ease-in-out infinite}@keyframes svelte-3z658x-prompt-pulse{0%,100%{text-shadow:0 0 12px rgba(102,226,255,0.7),\n        0 0 20px rgba(102,226,255,0.4),\n        0 0 6px rgba(255,23,68,0.3),\n        -0.6px 0 0 rgba(255,23,68,0.35),\n        0.6px 0 0 rgba(102,226,255,0.4)}50%{text-shadow:0 0 16px rgba(102,226,255,0.8),\n        0 0 24px rgba(102,226,255,0.5),\n        0 0 8px rgba(255,23,68,0.4),\n        -0.7px 0 0 rgba(255,23,68,0.4),\n        0.7px 0 0 rgba(102,226,255,0.5)}}.g.svelte-3z658x.svelte-3z658x{color:#89f7a1;text-shadow:0 0 10px rgba(126,231,135,0.6),\n      0 0 16px rgba(126,231,135,0.3)}.y.svelte-3z658x.svelte-3z658x{color:#ffd27e;text-shadow:0 0 10px rgba(255,210,126,0.6),\n      0 0 16px rgba(255,210,126,0.3)}.cmdline{color:#b9f0ff;text-shadow:0 0 12px rgba(102,226,255,0.65),\n      0 0 18px rgba(102,226,255,0.35)}.cmdline .cmdtext{color:#e9fbff;opacity:0.95;text-shadow:0 0 14px rgba(102,226,255,0.7),\n      0 0 22px rgba(102,226,255,0.4)}.nav.svelte-3z658x.svelte-3z658x{color:#bdf3ff;text-decoration:none;text-shadow:0 0 12px rgba(102,226,255,0.7),\n      0 0 6px rgba(255,23,68,0.2),\n      -0.5px 0 0 rgba(255,23,68,0.3),\n      0.5px 0 0 rgba(102,226,255,0.3);transition:all 0.2s ease}.nav.svelte-3z658x.svelte-3z658x:hover{text-decoration:underline;text-shadow:0 0 16px rgba(102,226,255,0.9),\n      0 0 24px rgba(102,226,255,0.5),\n      0 0 8px rgba(255,23,68,0.3),\n      -0.6px 0 0 rgba(255,23,68,0.4),\n      0.6px 0 0 rgba(102,226,255,0.4)}@keyframes svelte-3z658x-glitch{0%,100%{transform:translate(0);filter:drop-shadow(0 0 0 rgba(255,23,68,0))}20%{transform:translate(0.3px, 0);filter:drop-shadow(0 0 4px rgba(255,23,68,0.35))}40%{transform:translate(-0.3px, 0)}60%{transform:translate(0.2px, 0.1px)}80%{transform:translate(-0.2px, -0.1px)}}.overlay.svelte-3z658x.svelte-3z658x{position:fixed;inset:0;background:rgba(0,0,0,0.65);display:grid;place-items:center;z-index:20;overflow:auto;padding:clamp(12px, 3vh, 28px) 0}.box.svelte-3z658x.svelte-3z658x{position:relative;width:min(920px, 92vw);max-height:92vh;background:#0b0f1e;border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:10px;box-shadow:0 10px 40px rgba(0,0,0,0.45);display:flex;flex-direction:column;overflow:hidden;margin:0 auto}.box.svelte-3z658x .content.svelte-3z658x{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:8px 10px}.box.svelte-3z658x .close.svelte-3z658x{position:absolute;top:6px;right:8px;background:transparent;color:#e7e4ff;border:none;font-size:20px;cursor:pointer}.obartitle.svelte-3z658x.svelte-3z658x{font-size:12px;letter-spacing:0.06em;opacity:0.7;margin:2px 0 8px}.box.arg.svelte-3z658x.svelte-3z658x{padding:14px}.argsec.svelte-3z658x.svelte-3z658x{margin:8px 0 12px}.arghead.svelte-3z658x.svelte-3z658x{font-weight:600;margin-bottom:6px}.payload.svelte-3z658x.svelte-3z658x{background:rgba(255,255,255,0.06);border-radius:6px;padding:8px}.ltitle.svelte-3z658x.svelte-3z658x{color:#cfe8ff}.lsum.svelte-3z658x.svelte-3z658x{opacity:0.8}",
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
  return `<div class="terminal-wrap svelte-3z658x" tabindex="-1" role="group" aria-label="web terminal"><div class="titlebar svelte-3z658x"><div class="controls svelte-3z658x"><span class="dot r svelte-3z658x"></span><span class="dot y svelte-3z658x"></span><span class="dot g svelte-3z658x"></span></div>
    <span class="title svelte-3z658x"${add_attribute("style", `animation: glitch ${barGlitchDur.toFixed(2)}s infinite steps(2); animation-delay:${barGlitchDelay.toFixed(2)}s`, 0)}>${escape(username)}@${escape(hostname)} — ${escape(formatPath(state.cwd))}</span>
    <span class="uptime svelte-3z658x">up ${escape(uptimeMinutes)} min</span></div>
  <div class="term-pane svelte-3z658x"><div class="terminal svelte-3z658x"${add_attribute("this", term, 0)}>${each(rows, (r) => {
    return `<div class="row svelte-3z658x"><!-- HTML_TAG_START -->${r.html}<!-- HTML_TAG_END --></div>`;
  })}
    <div class="row input svelte-3z658x"><span class="prompt svelte-3z658x" aria-hidden="true">${escape(promptText)}</span>
      <input class="readline svelte-3z658x" type="text" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off"${add_attribute("this", inputEl, 0)}${add_attribute("value", line, 0)}></div>
    <div class="end svelte-3z658x" aria-hidden="true"${add_attribute("this", endEl, 0)}></div></div>
    <div class="fx fx-scan svelte-3z658x" aria-hidden="true"></div>
    <div class="fx fx-noise svelte-3z658x" aria-hidden="true"></div></div>

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
