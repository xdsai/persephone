<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import type { FsState, FsDir } from '$lib/terminal/fs';
  import { defaultFs, load, save, resolve, find, ensureDir, createFile, createDir, remove, now, resetStorage } from '$lib/terminal/fs';

  let state: FsState = defaultFs();
  let term: HTMLDivElement;
  let inputEl: HTMLInputElement;
  let line = '';
  let history: string[] = [];
  let historyIndex = -1;
  let hostname = 'jndl';
  let username = 'alex';
  const startTime = new Date();
  let uptimeMinutes = 0;
  let uptimeTimer: number | null = null;

  type Row = { html: string };
  let rows: Row[] = [];
  
  const MAN: Record<string, string> = {
    help: 'help — list available commands',
    ls: 'ls [path] — list directory contents (click names to open)',
    tree: 'tree [path] — show directory tree',
    pwd: 'pwd — print working directory',
    cd: 'cd <path> — change directory',
    cat: 'cat <file> — print file to terminal',
    echo: 'echo "text" > file — write or append with >>',
    touch: 'touch <file> — create an empty file',
    mkdir: 'mkdir [-p] <dir> — create directory',
    rm: 'rm [-r] <path> — remove file or directory',
    clear: 'clear — clear the screen',
    whoami: 'whoami — print current user',
    date: 'date — print current date/time',
    uname: 'uname — print kernel info',
    ip: 'ip — print public IP address',
    man: 'man <cmd> — show a short description',
    resetfs: 'resetfs — reset filesystem to defaults (clears local storage)'
  };

  $: promptText = `${username}@${hostname}:${formatPath(state.cwd)}$`;

  function formatPath(p: string) {
    const home = '/home/' + username;
    if (p === home) return '~';
    if (p.startsWith(home + '/')) return '~' + p.slice(home.length);
    return p;
  }

  function boot() {
    const stored = load();
    if (stored) {
      state = stored;
    } else {
      // Seed a few files the first time
      const { node } = find(state.root, '/home/' + username);
      if (node && node.type === 'dir') {
        node.children.push(createDir('notes'));
        node.children.push(createFile('todo.txt', '- replace this with greatness\n'));
        save(state);
      }
    }
    println(`<span class="g">Welcome</span> — type <span class="y">help</span> to get started.`);
    println(`<div class="onboard">Quick start:
      <a href="#" class="cmd" data-cmd="ls">list files</a>
      · <a href="/blog" class="nav">blog</a>
      <div class="hint">Tip: use <b>ls</b> to list, <b>cat &lt;file&gt;</b> to read, <b>cd &lt;dir&gt;</b> to open</div>
    </div>`);
  }

  function focusInput() {
    inputEl?.focus();
  }

  function scrollToBottom() {
    term?.scrollTo({ top: term.scrollHeight });
  }

  function println(html: string) { rows = [...rows, { html }]; tick().then(scrollToBottom); }

  async function run(cmdline: string) {
    const trimmed = cmdline.trim();
    println(`<span class="cmdline"><span class="prompt">${escapeHtml(promptText)}</span> <span class="cmdtext">${escapeHtml(cmdline)}</span></span>`);
    if (!trimmed) return;
    history.push(cmdline);
    historyIndex = history.length;

    const [cmd, ...args] = tokenize(trimmed);
    const out: { text: string; raw?: boolean }[] = [];

    const writeOut = (s: string, raw = false) => out.push({ text: s, raw });
    try {
      switch (cmd) {
        case 'help':
          writeOut(Object.keys(MAN).join(', '));
          break;
        case 'pwd':
          writeOut(state.cwd);
          break;
        case 'whoami':
          writeOut(username);
          break;
        case 'date':
          writeOut(new Date().toString());
          break;
        case 'uname':
          writeOut('Linux persephone 6.1.0 x86_64 (web)');
          break;
        case 'ip': {
          try {
            const r = await fetch('https://api.ipify.org?format=json', { cache: 'no-store' });
            const j = await r.json();
            writeOut(`public: ${j.ip}`);
          } catch (e) {
            writeOut('ip: unable to fetch external IP');
          }
          break;
        }
        case 'clear':
          rows = [];
          break;
        case 'cd':
          cd(args, writeOut);
          break;
        case 'ls':
          ls(args, writeOut);
          break;
        case 'tree':
          tree(args, writeOut);
          break;
        case 'cat':
          cat(args, writeOut);
          break;
        case 'echo':
          echo(args, writeOut);
          break;
        case 'touch':
          touch(args, writeOut);
          break;
        case 'mkdir':
          mkdir(args, writeOut);
          break;
        case 'rm':
          rmCmd(args, writeOut);
          break;
        case 'resetfs': {
          resetStorage();
          state = defaultFs();
          save(state);
          writeOut('filesystem reset to defaults');
          break;
        }
        case 'man': {
          const target = args[0];
          if (!target) { writeOut('man: missing command'); break; }
          const entry = MAN[target];
          writeOut(entry ? entry : `No manual entry for ${target}`);
          break;
        }
        default:
          writeOut(`${cmd}: command not found`);
      }
    } catch (e) {
      writeOut(String(e));
    }

    if (out.length) {
      const html = out.map((b) => (b.raw ? b.text : escapeHtml(b.text))).join('\n');
      println(html);
    }
    save(state);
  }

  // editor removed

  function tokenize(s: string): string[] {
    const out: string[] = [];
    let cur = '';
    let quoted = false;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch === '"') { quoted = !quoted; continue; }
      if (!quoted && /\s/.test(ch)) { if (cur) { out.push(cur); cur = ''; } continue; }
      cur += ch;
    }
    if (cur) out.push(cur);
    return out;
  }

  function escapeHtml(x: string) {
    return x.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function expandTilde(p: string): string {
    if (p === '~' || p.startsWith('~/')) return '/home/' + username + (p.length > 1 ? p.slice(1) : '');
    return p;
  }

  function completePath(partial: string) {
    const expanded = expandTilde(partial);
    const abs = expanded.startsWith('/') ? expanded : resolve(state.cwd, expanded);
    const endsWithSlash = abs.endsWith('/');
    const dirPath = endsWithSlash ? abs : abs.substring(0, abs.lastIndexOf('/') >= 0 ? abs.lastIndexOf('/') : 0);
    const base = endsWithSlash ? '' : abs.split('/').pop() || '';
    const dirNode = find(state.root, dirPath || '/').node;
    if (!dirNode || dirNode.type !== 'dir') return { next: null as string | null, suggestions: [] as string[] };
    const names = dirNode.children.map((c) => (c.type === 'dir' ? c.name + '/' : c.name));
    const matches = names.filter((n) => n.startsWith(base));
    if (matches.length === 0) return { next: null, suggestions: [] };
    if (matches.length === 1) return { next: (endsWithSlash ? abs : dirPath + '/' + matches[0]), suggestions: matches };
    // common prefix extension
    const cp = commonPrefix(matches);
    if (cp.length > base.length) return { next: dirPath + '/' + cp, suggestions: matches };
    return { next: null, suggestions: matches };
  }

  function commonPrefix(list: string[]): string {
    if (!list.length) return '';
    let p = list[0];
    for (const s of list.slice(1)) {
      let i = 0;
      while (i < p.length && i < s.length && p[i] === s[i]) i++;
      p = p.slice(0, i);
      if (!p) break;
    }
    return p;
  }

  function completeCurrentLine() {
    // Find last unquoted token
    let inQuotes = false;
    let lastSpace = -1;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') inQuotes = !inQuotes;
      if (!inQuotes && /\s/.test(ch)) lastSpace = i;
    }
    const before = line.slice(0, lastSpace + 1);
    const token = line.slice(lastSpace + 1);
    if (!token) return;
    const { next, suggestions } = completePath(token);
    if (next) {
      const maybeRelNext = next.startsWith(state.cwd) ? next.replace(state.cwd, '').replace(/^\//, '') : next;
      line = before + maybeRelNext;
      return;
    }
    if (suggestions.length) {
      println(suggestions.join('  '));
    }
  }

  function cd(args: string[], out: (s: string) => void) {
    const target = resolve(state.cwd, args[0] ?? '/');
    const found = find(state.root, target);
    if (!found.node) return out(`cd: no such file or directory: ${args[0] ?? '/'}`);
    if (found.node.type !== 'dir') return out(`cd: not a directory: ${args[0]}`);
    state.cwd = target;
  }

  function ls(args: string[], out: (s: string, raw?: boolean) => void) {
    const target = resolve(state.cwd, args[0] ?? '.');
    const { node } = find(state.root, target);
    if (!node) return out(`ls: cannot access '${args[0] ?? '.'}': No such file or directory`);
    if (node.type === 'file') return out(node.name);
    const abs = resolve('/', target);
    const html = node.children
      .map((c) => {
        const label = c.type === 'dir' ? c.name + '/' : c.name;
        if (c.type === 'dir') {
          return escapeHtml(label);
        }
        const file = c as unknown as { link?: string };
        if (file.link) {
          return `<a href="${file.link}" class="nav">${escapeHtml(label)}</a>`;
        }
        return escapeHtml(label);
      })
      .join('  ');
    out(html, true);
  }

  function* walk(dir: FsDir, prefix: string): Generator<string> {
    for (const child of dir.children) {
      const isDir = child.type === 'dir';
      yield `${prefix}${child.name}${isDir ? '/' : ''}`;
      if (isDir) {
        yield* walk(child as FsDir, prefix + '  ');
      }
    }
  }

  function tree(args: string[], out: (s: string) => void) {
    const target = resolve(state.cwd, args[0] ?? '.');
    const { node } = find(state.root, target);
    if (!node) return out(`tree: ${args[0] ?? '.'}: No such file or directory`);
    if (node.type === 'file') return out(node.name);
    out(node.name || '/');
    out([...walk(node, '  ')].join('\n'));
  }

  function cat(args: string[], out: (s: string) => void) {
    if (!args[0]) return out('cat: missing file operand');
    const target = resolve(state.cwd, args[0]);
    const { node } = find(state.root, target);
    if (!node) return out(`cat: ${args[0]}: No such file or directory`);
    if (node.type !== 'file') return out(`cat: ${args[0]}: Is a directory`);
    out(node.content);
  }

  function echo(args: string[], out: (s: string) => void) {
    // rudimentary redirection: echo "text" > file  | >> append
    const idx = args.findIndex((a) => a === '>' || a === '>>');
    if (idx >= 0) {
      const content = args.slice(0, idx).join(' ');
      const append = args[idx] === '>>';
      const fileArg = args[idx + 1];
      if (!fileArg) return out('echo: redirection needs a file');
      const abs = resolve(state.cwd, fileArg);
      const found = find(state.root, abs);
      if (!found.node) {
        // create file
        const parent = ensureDir(state.root, abs.substring(0, abs.lastIndexOf('/')), true).node;
        if (!parent) return out(`echo: cannot create file '${fileArg}'`);
        parent.children.push(createFile(abs.split('/').pop() || 'file.txt', content + (append ? '' : '\n')));
        save(state);
        return;
      }
      if (found.node.type !== 'file') return out(`echo: ${fileArg}: Is a directory`);
      found.node.content = append ? found.node.content + content : content + '\n';
      found.node.updatedAt = now();
      return;
    }
    out(args.join(' '));
  }

  function touch(args: string[], out: (s: string) => void) {
    if (!args[0]) return out('touch: missing file operand');
    const abs = resolve(state.cwd, args[0]);
    const found = find(state.root, abs);
    if (!found.node) {
      const parentPath = abs.substring(0, abs.lastIndexOf('/')) || '/';
      const { node: dir } = ensureDir(state.root, parentPath, true);
      if (!dir) return out(`touch: cannot create '${args[0]}'`);
      dir.children.push(createFile(abs.split('/').pop() || 'file.txt', ''));
      return;
    }
    if (found.node.type !== 'file') return out(`touch: ${args[0]}: Is a directory`);
    found.node.updatedAt = now();
  }

  function mkdir(args: string[], out: (s: string) => void) {
    if (!args[0]) return out('mkdir: missing operand');
    const pFlag = args[0] === '-p';
    const name = pFlag ? args[1] : args[0];
    if (!name) return out('mkdir: missing operand');
    const abs = resolve(state.cwd, name);
    const res = ensureDir(state.root, abs, pFlag);
    if (!res.node) return out(`mkdir: cannot create directory '${name}'`);
  }

  function rmCmd(args: string[], out: (s: string) => void) {
    if (!args[0]) return out('rm: missing operand');
    const rFlag = args[0] === '-r';
    const name = rFlag ? args[1] : args[0];
    const abs = resolve(state.cwd, name);
    const ok = remove(state.root, abs, rFlag);
    if (!ok) out(`rm: cannot remove '${name}'`);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = line;
      line = '';
      run(cmd);
    } else if (e.key === 'ArrowUp') {
      if (historyIndex > 0) {
        historyIndex -= 1;
        line = history[historyIndex] ?? '';
      }
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (historyIndex < history.length) {
        historyIndex += 1;
        line = history[historyIndex] ?? '';
      }
      e.preventDefault();
    } else if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
      println('<span class="prompt">' + promptText + '</span> ' + escapeHtml(line));
      line = '';
      e.preventDefault();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      completeCurrentLine();
    }
  }

  function handleTerminalClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    const cmdEl = target.closest('a.cmd') as HTMLAnchorElement | null;
    if (cmdEl) {
      e.preventDefault();
      const c = cmdEl.getAttribute('data-cmd') || '';
      if (c) run(c);
      return;
    }
    const navEl = target.closest('a.nav') as HTMLAnchorElement | null;
    if (navEl) {
      e.preventDefault();
      const href = navEl.getAttribute('href') || '';
      if (href) window.location.href = href;
    }
  }

  function handleTerminalKey(e: KeyboardEvent) {
    const target = e.target as HTMLElement;
    const isActivator = e.key === 'Enter' || e.key === ' ';
    if (!isActivator) return;
    const cmdEl = target.closest('a.cmd') as HTMLAnchorElement | null;
    const navEl = target.closest('a.nav') as HTMLAnchorElement | null;
    if (cmdEl) {
      e.preventDefault();
      const c = cmdEl.getAttribute('data-cmd') || '';
      if (c) run(c);
      return;
    }
    if (navEl) {
      e.preventDefault();
      const href = navEl.getAttribute('href') || '';
      if (href) window.location.href = href;
    }
  }

  onMount(() => {
    boot();
    focusInput();
    const update = () => { uptimeMinutes = Math.floor((Date.now() - startTime.getTime()) / 60000); };
    update();
    uptimeTimer = (setInterval(update, 10000) as unknown as number);
  });

  onDestroy(() => { if (uptimeTimer) clearInterval(uptimeTimer); });
</script>

<div class="terminal-wrap" on:click={focusInput} on:keydown={(e)=>{ if(e.key.length===1 || e.key==='/'|| e.key===' ') focusInput(); }} tabindex="0" role="group" aria-label="web terminal">
  <div class="titlebar">
    <div class="controls"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span></div>
    <span class="title">{username}@{hostname} — {formatPath(state.cwd)}</span>
    <span class="uptime">up {uptimeMinutes} min</span>
  </div>
  <div class="terminal" bind:this={term} on:click={handleTerminalClick} on:keydown={handleTerminalKey}>
    {#each rows as r}
      <div class="row">{@html r.html}</div>
    {/each}
    <div class="row input">
      <span class="prompt" aria-hidden="true">{promptText}</span>
      <input bind:this={inputEl} class="readline" type="text" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" bind:value={line} on:keydown={onKeyDown} />
    </div>
  </div>

  
</div>

<style>
  :global(html, body) {
    margin: 0;
    background: radial-gradient(1200px 800px at 20% 20%, #0a0f25 0, rgba(2,3,10,0) 60%),
                radial-gradient(900px 600px at 80% 60%, rgba(64,22,72,0.25) 0, rgba(1,2,8,0) 60%),
                linear-gradient(120deg, #02030a, #090e22 58%, #010208);
    background-color: #0a0f25;
    color: #e7e4ff;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
    height: 100%;
    overflow: hidden;
    -webkit-text-size-adjust: 100%;
    overscroll-behavior: none;
  }

  .terminal-wrap {
    position: fixed;
    top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: clamp(720px, 80vw, 1100px);
    height: clamp(420px, 58vh, 680px);
    display: grid;
    grid-template-rows: auto 1fr;
    border-radius: 14px;
    box-shadow: 0 28px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06) inset;
    overflow: hidden;
    background: #0b0f1e;
  }
  @media (max-width: 720px) {
    .terminal-wrap {
      width: 100vw;
      height: 100dvh;
      border-radius: 0;
      margin: 0;
    }
    .terminal { font-size: 12px; padding: 10px; overscroll-behavior: contain; }
    .titlebar { padding: 8px 10px; font-size: 11px; }
    .readline { font-size: 16px; }
  }

  .titlebar {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0));
    border-bottom: 1px solid rgba(255,255,255,0.08);
    color: rgba(230,228,255,0.72);
    font-size: 12px;
    letter-spacing: 0.05em;
  }
  .controls { display: flex; align-items: center; gap: 8px; }
  .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; box-shadow: 0 0 0 1px rgba(0,0,0,0.35) inset; }
  .dot.r { background: #ff5f57; }
  .dot.y { background: #ffbd2e; }
  .dot.g { background: #28c840; }
  .title { opacity: 0.85; }
  .uptime { opacity: 0.6; }

  .terminal {
    overflow: auto;
    padding: 16px;
    line-height: 1.5;
    font-size: 14px;
    background: radial-gradient(80% 80% at 60% 10%, rgba(255,255,255,0.06), rgba(0,0,0,0) 40%), #0b0f1e;
  }
  .row { white-space: pre-wrap; word-wrap: break-word; }
  .row + .row { margin-top: 6px; }
  .row .cmdline { color: #9ad1ff; }
  .row .cmdline .cmdtext { color: #ffffff; opacity: 0.9; }
  .row.input { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 8px; }
  .readline { width: 100%; background: transparent; color: #e7e4ff; border: none; outline: none; font: inherit; }

  .prompt { color: #9cb6ff; }
  .g { color: #7ee787; }
  .y { color: #ffd27e; }
  .cmdline { color: #9ad1ff; }
  .cmdline .cmdtext { color: #ffffff; opacity: 0.9; }
  .nav { color: #9ad1ff; text-decoration: none; }
  .nav:hover { text-decoration: underline; }
  .onboard { margin: 6px 0 10px; opacity: 0.9; }
  .onboard .hint { font-size: 12px; opacity: 0.7; margin-top: 4px; }
  .onboard a.cmd { display: inline-block; padding: 2px 8px; border-radius: 999px; background: rgba(154,209,255,0.1); color: #9ad1ff; text-decoration: none; margin: 0 4px; }
  .onboard a.cmd:hover { background: rgba(154,209,255,0.18); }
</style>
