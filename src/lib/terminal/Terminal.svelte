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
  let endEl: HTMLDivElement;
  
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
    resetfs: 'resetfs — reset filesystem to defaults (clears local storage)',
    play: 'play — open the Persephone story',
    save: 'save — save current Persephone run',
    load: 'load — load saved Persephone run',
    reset: 'reset — reset Persephone run'
  };

  // Story integration
  import PersephoneRun from '$lib/components/PersephoneRun.svelte';
  import { SAVE_KEY } from '$lib/game/engine';
  let showGame = false;
  let showARG = false;
  let storyMeta: any = null;
  let loreRegistry: Array<{ slug: string; title: string; summary?: string }>|null = null;
  let argSave: any = null;

  // small randomized glitch timings for subtle bar jitter
  const barGlitchDur = 4 + Math.random() * 4; // 4–8s
  const barGlitchDelay = Math.random() * 3;   // 0–3s
  // keep glitch subtle; remove heavy scan animations for performance

  function loadArgSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      argSave = raw ? JSON.parse(raw) : null;
    } catch { argSave = null; }
  }

  async function ensureStoryMeta() {
    if (storyMeta) return;
    try {
      const r = await fetch('/story.json');
      if (r.ok) {
        const j = await r.json();
        storyMeta = j.meta || null;
        loreRegistry = j.meta?.loreRegistry || null;
        return;
      }
    } catch {}
    try {
      const r2 = await fetch('/assets/persephone-run.json');
      const j2 = await r2.json();
      storyMeta = j2.meta || null;
      loreRegistry = j2.meta?.loreRegistry || null;
    } catch {}
  }

  async function sha256Hex(s: string): Promise<string> {
    // browser crypto
    // @ts-ignore
    if (typeof crypto?.subtle?.digest !== 'function') return 'sha256:unavailable';
    const data = new TextEncoder().encode(s);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const arr = Array.from(new Uint8Array(hash));
    return arr.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Static ARG payload preview for the overlay
  const argPayload = {
    status: 'decrypted',
    shards: 6,
    hint: 'six seeds bloom a signal',
    routes: ['/blog/welcome', '/']
  };

  function resolveLoreList(save: any) {
    try {
      const slugs: string[] = save?.state?.loreDiscoveries || [];
      if (!Array.isArray(slugs) || !loreRegistry) return [];
      return slugs.map((slug) => loreRegistry!.find((r) => r.slug === slug)).filter(Boolean);
    } catch { return []; }
  }

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
      // Persist the default file system exactly as defined
      save(state);
    }
    println(`<span class="g">Welcome</span> — type <span class="y">help</span> to get started.`);
    println(`<div class="onboard">Quick start:
      <a href="#" class="cmd" data-cmd="ls">list files</a>
      · <a href="#" class="cmd" data-cmd="play">play the story</a>
      · <a href="/blog" class="nav">blog</a>
      <div class="hint">Tip: use <b>ls</b> to list, <b>cat &lt;file&gt;</b> to read, <b>cd &lt;dir&gt;</b> to open</div>
    </div>`);
  }

  function focusInput() {
    inputEl?.focus();
  }

  let scrollRAF: number | null = null;
  function ensureAtBottom(tries = 3) {
    if (!term) return;
    const near = (term.scrollHeight - term.scrollTop - term.clientHeight) < 2;
    if (near) return;
    term.scrollTop = term.scrollHeight;
    if (tries > 0) requestAnimationFrame(() => ensureAtBottom(tries - 1));
  }
  function scrollToBottom() {
    if (endEl?.scrollIntoView) endEl.scrollIntoView({ block: 'end' });
    if (scrollRAF) cancelAnimationFrame(scrollRAF);
    scrollRAF = requestAnimationFrame(() => ensureAtBottom(2));
  }

  function println(html: string) { rows = [...rows, { html }]; tick().then(() => { scrollToBottom(); }); }

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
      const cmdLower = (cmd || '').toLowerCase();
      const argsLower = args.map((a) => (a || '').toLowerCase());
      switch (cmdLower) {
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
          await tick();
          scrollToBottom();
          focusInput();
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
        case 'play': {
          await ensureStoryMeta();
          showGame = true;
          writeOut('opening game…');
          break;
        }
        case 'save': {
          writeOut('persephone: auto-saved (if a run is in progress).');
          break;
        }
        case 'load': {
          const has = !!localStorage.getItem(SAVE_KEY);
          if (!has) { writeOut('persephone: no save found'); break; }
          showGame = true;
          writeOut('persephone: loaded (open window).');
          break;
        }
        case 'reset': {
          localStorage.removeItem(SAVE_KEY);
          writeOut('persephone: save cleared');
          break;
        }
        case 'whois': {
          await ensureStoryMeta();
          const target = (argsLower[0] || '').toLowerCase();
          if (target === 'nine' || target === 'alex') {
            try {
              const raw = localStorage.getItem(SAVE_KEY);
              const save = raw ? JSON.parse(raw) : null;
              const gotKey = !!(save?.state?.flags?.ghostKey);
              const opDate = storyMeta?.date || '2077-08-13';
              const opName = 'vault night';
              const status = gotKey ? 'confirmed: Ghost Key acquired' : 'linked: Ghost Key operation in progress';
              const blurb = gotKey
                ? "the one who slipped into Acheron’s vault and pocketed the ghost key during Vault Night."
                : "the one who's preparing a breach on Acheron’s vault to lift the ghost key.";
              writeOut(`name: alex\nnickname: went by nine\nop: ${opName} ${opDate}\nstatus: ${status}\nnotes: ${blurb}`);
            } catch {
              writeOut('name: nine\nnickname: went by alex\nnotes: linked to the Ghost Key breach on Vault Night.');
            }
          } else if (target === 'johnny') {
            try {
              const raw = localStorage.getItem('persephone-run-v1:save');
              const save = raw ? JSON.parse(raw) : null;
              const hasLore = !!(save?.state?.loreDiscoveries || []).includes('johnny-silverhand');
              if (hasLore) {
                writeOut('record shows JOHNNY S— (silver tape wrapped on right hand).');
              } else {
                writeOut('record incomplete.');
              }
            } catch { writeOut('record incomplete.'); }
          } else {
            writeOut('whois: whois who?');
          }
          break;
        }
        case 'persephone': {
          if (argsLower[0] === '--bloom') {
            await ensureStoryMeta();
            try {
              const raw = localStorage.getItem(SAVE_KEY);
              if (!raw) { writeOut('no bloom: signal dormant'); break; }
              const s = JSON.parse(raw);
              const ok = !!(s?.state?.flags?.blogPosted) && s?.state?.flags?.blogClean === false;
              if (ok) { showARG = true; writeOut('bloom: signal decrypted (open panel)'); loadArgSave(); }
              else { writeOut('no bloom: signal dormant'); }
            } catch { writeOut('no bloom: signal dormant'); }
          } else {
            writeOut('persephone: unknown flag');
          }
          break;
        }
        case 'pomegranate':
        case 'kore13': {
          await ensureStoryMeta();
          try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) { writeOut('no bloom: signal dormant'); break; }
            const s = JSON.parse(raw);
            const ok = !!(s?.state?.flags?.blogPosted) && s?.state?.flags?.blogClean === false;
            if (ok) { showARG = true; writeOut('bloom: signal decrypted (open panel)'); loadArgSave(); }
            else { writeOut('no bloom: signal dormant'); }
          } catch { writeOut('no bloom: signal dormant'); }
          break;
        }
        default:
          if ((cmdLower + ' ' + (argsLower[0] || '')) === 'whois nine') {
            await ensureStoryMeta();
            try {
              const raw = localStorage.getItem(SAVE_KEY);
              const save = raw ? JSON.parse(raw) : null;
              const gotKey = !!(save?.state?.flags?.ghostKey);
              const opDate = storyMeta?.date || '2077-08-13';
              const opName = 'Vault Night';
              const status = gotKey ? 'confirmed: Ghost Key acquired' : 'linked: Ghost Key operation in progress';
              const blurb = gotKey
                ? 'the one who slipped into Acheron’s vault and pocketed the ghost key during Vault Night.'
                : 'the one preparing a breach on Acheron’s vault to lift the Ghost Key.';
              writeOut(`name: alex\nnickname: went by nine\nop: ${opName} ${opDate}\nstatus: ${status}\nnotes: ${blurb}`);
            } catch {
              writeOut('name: nine\nnickname: went by alex\nnotes: linked to the Ghost Key breach on Vault Night.');
            }
          } else {
            writeOut(`${cmd}: command not found`);
          }
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
      return;
    }
    // clicking empty space should focus the input
    focusInput();
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
    if (typeof window !== 'undefined') window.addEventListener('persephone:save', loadArgSave);
  });

  onDestroy(() => { if (uptimeTimer) clearInterval(uptimeTimer); if (typeof window !== 'undefined') window.removeEventListener('persephone:save', loadArgSave); });
</script>

<div class="terminal-wrap" on:click={focusInput} on:keydown={(e)=>{ if(e.key.length===1 || e.key==='/'|| e.key===' ') focusInput(); }} tabindex="-1" role="group" aria-label="web terminal">
  <div class="titlebar">
    <div class="controls"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span></div>
    <span class="title" style={`animation: glitch ${barGlitchDur.toFixed(2)}s infinite steps(2); animation-delay:${barGlitchDelay.toFixed(2)}s`}>{username}@{hostname} — {formatPath(state.cwd)}</span>
    <span class="uptime">up {uptimeMinutes} min</span>
  </div>
  <div class="term-pane">
    <div class="terminal" bind:this={term} on:click={handleTerminalClick} on:keydown={handleTerminalKey}>
    {#each rows as r}
      <div class="row">{@html r.html}</div>
    {/each}
    <div class="row input">
      <span class="prompt" aria-hidden="true">{promptText}</span>
      <input bind:this={inputEl} class="readline" type="text" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" bind:value={line} on:keydown={onKeyDown} />
    </div>
    <div class="end" aria-hidden="true" bind:this={endEl}></div>
    </div>
    <div class="fx fx-scan" aria-hidden="true"></div>
    <div class="fx fx-noise" aria-hidden="true"></div>
  </div>

{#if showGame}
  <div class="overlay" role="dialog" aria-label="persephone game" on:click|stopPropagation on:keydown|stopPropagation>
    <div class="box" on:click|stopPropagation on:keydown|stopPropagation>
      <div class="obartitle">NEON THIRTEEN — PERSEPHONE RUN</div>
      <button class="close" on:click={() => showGame = false} aria-label="close">×</button>
        <div class="content">
          <PersephoneRun src="/story.json" />
        </div>
    </div>
  </div>
{/if}

{#if showARG}
  <div class="overlay" role="dialog" aria-label="ARG panel" on:click|stopPropagation on:keydown|stopPropagation>
    <div class="box arg" on:click|stopPropagation on:keydown|stopPropagation>
      <div class="obartitle">Signal Bloom — ARG Panel</div>
      <button class="close" on:click={() => showARG = false} aria-label="close">×</button>
        <div class="argsec">
          <div class="arghead">Steganographic shards</div>
          <pre class="payload">{JSON.stringify(argPayload, null, 2)}</pre>
        </div>
        <div class="argsec">
          <div class="arghead">Discovered lore</div>
          {#if loreRegistry}
            {#if argSave?.state?.loreDiscoveries?.length}
              <ul>
                {#each resolveLoreList(argSave) as item}
                  <li><span class="ltitle">{item?.title}</span>{#if item?.summary}<span class="lsum"> — {item?.summary}</span>{/if}</li>
                {/each}
              </ul>
            {:else}
              <div class="dim">no lore discovered</div>
            {/if}
          {:else}
            <div class="dim">no registry</div>
          {/if}
        </div>
        <div class="argsec links">
          <a class="nav" href="/blog/neon-thirteen-persephone-run#persephone">Resume Story</a>
          <a class="nav" href="/blog/neon-thirteen-persephone-run">Open blog entry</a>
        </div>
      </div>
    </div>
  {/if}
  
</div>

<style>
  :global(html, body) {
    margin: 0;
    /* Red base with cyan accents */
    --cp-bg: #0b0205;
    --cp-bg2: #12070a;
    --cp-accent: #ff1744;
    --cp-accent-2: #ff445e;
    --cp-soft: rgba(255, 23, 68, 0.14);
    --cp-blue: #66e2ff;
    --cp-blue-soft: rgba(102,226,255,0.12);
    --cp-border: rgba(255, 23, 68, 0.28);
    --cp-text: #ffe8ec;
    background:
      radial-gradient(1200px 800px at 18% 18%, rgba(255,0,32,0.10) 0, rgba(2,3,10,0) 60%),
      radial-gradient(1000px 700px at 82% 65%, rgba(255,46,84,0.12) 0, rgba(1,2,8,0) 60%),
      linear-gradient(120deg, var(--cp-bg), var(--cp-bg2) 58%, #060104);
    color: var(--cp-text);
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
    min-height: 100%;
    -webkit-text-size-adjust: 100%;
    overflow-x: hidden;
  }

  .terminal-wrap {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    margin: auto;
    width: clamp(720px, 80vw, 1100px);
    height: clamp(420px, 58vh, 680px);
    display: grid;
    grid-template-rows: auto 1fr;
    border-radius: 14px;
    box-shadow: 0 28px 80px rgba(0,0,0,0.55), 0 0 0 1px var(--cp-soft) inset, 0 0 36px rgba(102,226,255,0.12);
    overflow: hidden;
    background: 
      linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01)),
      var(--cp-bg2);
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
    background: linear-gradient(180deg, rgba(102,226,255,0.18), rgba(255,255,255,0));
    border-bottom: 1px solid rgba(102,226,255,0.25);
    color: rgba(220,248,255,0.85);
    font-size: 12px;
    letter-spacing: 0.05em;
  }
  .controls { display: flex; align-items: center; gap: 8px; }
  .dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; box-shadow: 0 0 0 1px rgba(0,0,0,0.35) inset; }
  .dot.r { background: #ff5f57; }
  .dot.y { background: #ffbd2e; }
  .dot.g { background: #28c840; }
  .title { opacity: 0.95; text-shadow: 0 0 10px rgba(102,226,255,0.35), 0 0 8px rgba(120,200,255,0.25); }
  .uptime { opacity: 0.6; }

  .term-pane { position: relative; overflow: hidden; display: grid; grid-template-rows: 1fr; }
  .terminal {
    overflow: auto;
    padding: 16px;
    line-height: 1.5;
    font-size: 14px;
    position: relative;
    height: 100%;
    min-height: 0; /* allow the grid child to shrink and scroll */
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    scrollbar-gutter: stable both-edges;
    background-image:
      repeating-linear-gradient(to bottom, rgba(102,226,255,0.05) 0px, rgba(102,226,255,0.05) 2px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 6px),
      radial-gradient(800px 300px at 10% -10%, rgba(102,226,255,0.08), rgba(0,0,0,0) 40%),
      radial-gradient(600px 240px at 110% 110%, rgba(255,23,68,0.08), rgba(0,0,0,0) 50%),
      linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0)),
      var(--cp-bg2);
    background-blend-mode: screen, normal, normal, normal, normal;
  }
  /* Neon FX overlays — outside the scroll container to avoid affecting layout */
  .fx { position: absolute; inset: 0; pointer-events: none; border-radius: inherit; }
  .fx-scan { background: linear-gradient(0deg, rgba(255,255,255,0) 46%, rgba(126,231,135,0.16) 50%, rgba(255,255,255,0) 54%); opacity: 0.28; will-change: transform, opacity; animation: fx-scan 8s linear infinite; }
  @keyframes fx-scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
  .fx-noise { background: repeating-linear-gradient(to bottom, rgba(102,226,255,0.08) 0px, rgba(102,226,255,0.08) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 4px); mix-blend-mode: screen; opacity: 0.22; animation: fx-noise 7s ease-in-out infinite alternate; }
  @keyframes fx-noise { 0% { opacity: 0.10; } 100% { opacity: 0.18; } }
  @keyframes sweep { 0% { opacity: 0.25; } 50% { opacity: 0.35; } 100% { opacity: 0.25; } }
  .row { white-space: pre-wrap; overflow-wrap: anywhere; word-break: break-word; color: #d6f2ff; text-shadow: 0 0 6px rgba(102,226,255,0.25), 0 0 8px rgba(255,23,68,0.18); }
  .row + .row { margin-top: 6px; }
  /* Ensure dynamic HTML inside rows is styled (use :global for injected markup) */
  .row :global(.cmdline) { color: #c7f0ff; text-shadow: 0 0 10px rgba(102,226,255,0.55); }
  .row :global(.cmdline .cmdtext) { color: #e9fbff; opacity: 0.95; text-shadow: 0 0 10px rgba(102,226,255,0.55); }
  .row.input { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 8px; }
  .readline { width: 100%; background: transparent; color: #e7e4ff; border: none; outline: none; font: inherit; caret-color: #8fe9ff; text-shadow: 0 0 6px rgba(102,226,255,0.35); }
  .readline::selection { background: rgba(102,226,255,0.25); }
  .end { height: 1px; }

  .prompt { color: #a8f2ff; text-shadow: 0 0 10px rgba(102,226,255,0.6), 0 0 6px rgba(255,23,68,0.25); }
  .g { color: #89f7a1; }
  .y { color: #ffd27e; }
  :global(.cmdline) { color: #b9f0ff; text-shadow: 0 0 12px rgba(102,226,255,0.65); }
  :global(.cmdline .cmdtext) { color: #e9fbff; opacity: 0.95; text-shadow: 0 0 12px rgba(102,226,255,0.65); }
  .nav { color: #bdf3ff; text-decoration: none; text-shadow: 0 0 12px rgba(102,226,255,0.7), 0 0 6px rgba(255,23,68,0.2); }
  .nav:hover { text-decoration: underline; }
  .onboard { margin: 6px 0 10px; opacity: 0.9; }
  .onboard .hint { font-size: 12px; opacity: 0.7; margin-top: 4px; }
  .onboard a.cmd { display: inline-block; padding: 2px 8px; border-radius: 999px; background: linear-gradient(90deg, var(--cp-soft), var(--cp-blue-soft)); color: var(--cp-accent-2); text-decoration: none; margin: 0 4px; box-shadow: 0 0 6px rgba(255,23,68,0.28), 0 0 10px rgba(102,226,255,0.28); }
  .onboard a.cmd:hover { background: linear-gradient(90deg, rgba(255,23,68,0.22), rgba(102,226,255,0.22)); box-shadow: 0 0 10px rgba(255,23,68,0.35), 0 0 14px rgba(102,226,255,0.35); }
  /* subtle glitch animation on title */
  @keyframes glitch {
    0%, 100% { transform: translate(0); filter: drop-shadow(0 0 0 rgba(255,23,68,0)); }
    20% { transform: translate(0.3px, 0); filter: drop-shadow(0 0 4px rgba(255,23,68,0.35)); }
    40% { transform: translate(-0.3px, 0); }
    60% { transform: translate(0.2px, 0.1px); }
    80% { transform: translate(-0.2px, -0.1px); }
  }
  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); display: grid; place-items: center; z-index: 20; overflow: auto; padding: clamp(12px, 3vh, 28px) 0; }
  .box { position: relative; width: min(920px, 92vw); max-height: 92vh; background: #0b0f1e; border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; padding: 10px; box-shadow: 0 10px 40px rgba(0,0,0,0.45); display: flex; flex-direction: column; overflow: hidden; margin: 0 auto; }
  .box .content { flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 8px 10px; }
  .box .close { position: absolute; top: 6px; right: 8px; background: transparent; color: #e7e4ff; border: none; font-size: 20px; cursor: pointer; }
  .obartitle { font-size: 12px; letter-spacing: 0.06em; opacity: 0.7; margin: 2px 0 8px; }
  .box.arg { padding: 14px; }
  .argsec { margin: 8px 0 12px; }
  .arghead { font-weight: 600; margin-bottom: 6px; }
  .payload { background: rgba(255,255,255,0.06); border-radius: 6px; padding: 8px; }
  .ltitle { color: #cfe8ff; }
  .lsum { opacity: 0.8; }
</style>
