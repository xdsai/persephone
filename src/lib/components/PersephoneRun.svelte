<script lang="ts">
  import { onMount } from 'svelte';
  import type { GameJson, GameEngine, Choice, Node, RegularNode, EndingNode, LoreItem } from '$lib/game/engine';
  import { GameEngine as Engine, SAVE_KEY } from '$lib/game/engine';
  import { marked } from 'marked';

  export let json: GameJson | null = null;
  export let src: string = '/story.json';

  let engine: GameEngine | null = null;
  let error: string | null = null;
  let turnCount = 0;
  let showLore = false;
  // reactive view model synced from engine
  let curId = '';
  let curText = '';
  let curTitle = '';
  let isEndNode = false;
  type RenderChoice = { choice: Choice; enabled: boolean; reason?: string };
  let renderList: RenderChoice[] = [];
  let enabledList: RenderChoice[] = [];
  let enabledToRender: number[] = [];
  let renderToEnabled: number[] = [];
  let viewKey = 0;
  let showStatsHUD = true;
  let canRoam = true;
  let flowHub: string | null = null;
  let canGoBack = false;
  // randomized glitch variables for subtle variation
  const gDur = 3 + Math.random() * 3; // 3–6s
  const gDelay = Math.random() * 2.5; // 0–2.5s

  function syncView() {
    if (!engine) return;
    const n = engine.current() as any;
    curId = n?.id || '';
    curTitle = n?.title || '';
    curText = n?.text || '';
    isEndNode = !!(n && n.type === 'ending');
    renderList = engine.renderableChoices();
    enabledList = [];
    enabledToRender = [];
    renderToEnabled = new Array(renderList.length).fill(-1);
    renderList.forEach((r, ri) => {
      if (r.enabled) {
        const ei = enabledList.length;
        enabledList.push(r);
        enabledToRender.push(ri);
        renderToEnabled[ri] = ei;
      }
    });
    const meta = engine.getMeta() as any;
    showStatsHUD = !(meta && meta.ux && meta.ux.showStats === false);
    canRoam = !!engine.getState().canRoam;
    flowHub = (meta && meta.flow && meta.flow.hubNodeId) ? String(meta.flow.hubNodeId) : null;
    canGoBack = engine.canBack ? engine.canBack() : false;
    viewKey += 1;
  }

  function save() {
    try {
      if (engine) localStorage.setItem(SAVE_KEY, engine.serialize());
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('persephone:save'));
      }
    } catch {}
  }
  function tryLoad() {
    try {
      const s = localStorage.getItem(SAVE_KEY);
      if (s && engine) engine.deserialize(s);
    } catch {}
  }

  async function init() {
    try {
      const story: GameJson = json || await (await fetch(src, { cache: 'no-store' })).json();
      engine = new Engine(story);
      tryLoad();
      turnCount = 0;
      syncView();
    } catch (e) {
      error = 'Failed to initialize the story. Please try again later.';
      console.warn(e);
    }
  }

  onMount(() => { init(); });

  // Minimal markdown rendering for story text
  marked.setOptions({ breaks: true, gfm: true, mangle: false, headerIds: false });
  function md(s: string) {
    try {
      const replaced = (s || '').replace(/\bGotara\b/gi, 'Johnny');
      return marked.parse(replaced) as string;
    } catch {
      return s;
    }
  }

  function visibleChoices(): Choice[] { return enabledList.map((r) => r.choice); }
  function current(): Node | null { return engine ? engine.current() : null; }
  function isEnding(): boolean { return isEndNode; }
  function currentText(): string { return curText; }
  function currentTitle(): string { return curTitle; }
  function currentId(): string { return curId; }

  function chooseVisible(index: number) {
    if (!engine) return;
    engine.choose(index);
    turnCount += 1;
    selIndex = 0;
    syncView();
    save();
  }

  function resetRun() {
    if (!engine) return;
    engine.reset();
    turnCount = 0;
    syncView();
    save();
  }

  function restartWithMode(shortMode: boolean) {
    if (!engine) return;
    engine.reset();
    // auto-pick the matching length selection on m0
    const node = engine.current() as RegularNode;
    const idx = (node.choices || []).findIndex((c) => typeof c.effects?.shortMode === 'boolean' && c.effects!.shortMode === shortMode);
    if (idx >= 0) {
      engine.choose(idx);
      turnCount = 1;
      syncView();
      save();
    }
  }

  function loreItems(): LoreItem[] { return engine ? engine.getLore() : []; }
  function backToCity() {
    if (!engine || !canRoam || !flowHub) return;
    if ((engine as any).goTo) { (engine as any).goTo(flowHub, true); }
    syncView();
    save();
  }
  function goBack() {
    if (!engine || !canRoam) return;
    const ok = (engine as any).back ? (engine as any).back() : false;
    if (ok) { syncView(); save(); }
  }

  // Keyboard controls: up/down / j/k / enter, numeric 1..9 for enabled
  let selIndex = 0; // index within enabledList
  function clampSel() {
    if (!engine) return;
    const n = enabledList.length;
    if (n === 0) selIndex = 0; else selIndex = Math.max(0, Math.min(selIndex, n - 1));
  }
  function onKeydown(e: KeyboardEvent) {
    if (!engine) return;
    if (isEnding()) return; // nothing to select
    const n = enabledList.length;
    if (e.key === 'ArrowUp' || e.key === 'k') { if (n>0) { selIndex = (selIndex - 1 + n) % n; e.preventDefault(); } }
    if (e.key === 'ArrowDown' || e.key === 'j') { if (n>0) { selIndex = (selIndex + 1) % n; e.preventDefault(); } }
    if (e.key === 'Enter') { if (n>0) { chooseVisible(selIndex); e.preventDefault(); selIndex = 0; } }
    if (/^[1-9]$/.test(e.key)) {
      const idx = parseInt(e.key, 10) - 1;
      if (idx >= 0 && idx < n) { chooseVisible(idx); e.preventDefault(); selIndex = 0; }
    }
  }
</script>

{#if error}
  <div class="err">{error}</div>
{:else if !engine}
  <div class="loading">loading story…</div>
{:else}
  <div class="wrap" role="group" aria-label="persephone run" on:keydown={onKeydown} tabindex="0" style={`--gdur:${gDur.toFixed(2)}s; --gdelay:${gDelay.toFixed(2)}s`}>
    <div class="hud">
      <div class="title">NEON THIRTEEN: PERSEPHONE RUN</div>
      {#if showStatsHUD}
      <div class="stats">
        <span title="heat">♨ {engine.getState().heat}</span>
        <span title="cyber">⌁ {engine.getState().cyber}</span>
        <span title="empathy">❤ {engine.getState().empathy}</span>
        <span title="credits">¤ {engine.getState().credits}</span>
        <span title="corpRep">⚑ {engine.getState().corpRep}</span>
        <span class="turns" title="turns">⏱ {turnCount}</span>
      </div>
      {/if}
      {#if canRoam}
      <div class="roam">
        <button class="btn" on:click={goBack} aria-disabled={!canGoBack} class:disabled={!canGoBack} title={canGoBack ? 'Back' : 'Nothing to go back to'}>Back</button>
        {#if flowHub}
        <button class="btn" on:click={backToCity} title="Return to City Hub">Back to City</button>
        {/if}
      </div>
      {/if}
      <div class="actions">
        <button class="btn" on:click={() => showLore = !showLore}>{showLore ? 'Hide Lore' : 'Lore'}</button>
        <button class="btn" on:click={resetRun}>Reset</button>
      </div>
    </div>

    {#if engine.getState().flags.blogPosted && !engine.getState().flags.blogClean}
      <div class="banner">Signal live — try <code>persephone --bloom</code> in the terminal on the homepage.</div>
    {/if}

    <div class="pane">
      {#key viewKey}
        {#if isEnding()}
        <h2 class="ending">{currentTitle()}</h2>
        <div class="text">{@html md(currentText())}</div>
          <div class="choices ending">
            <button class="btn" on:click={() => restartWithMode(true)}>Restart (Short Run)</button>
            <button class="btn" on:click={() => restartWithMode(false)}>Restart (Long Run)</button>
          </div>
        {:else}
          <div class="text">{@html md(currentText())}</div>
          <div class="choices">
          {#each renderList as rc, ri}
            {#if renderToEnabled[ri] !== -1}
              <button class="choice {renderToEnabled[ri]===selIndex ? 'sel' : ''}" type="button" on:click|stopPropagation={() => { selIndex = renderToEnabled[ri]; chooseVisible(renderToEnabled[ri]); }}>
                <span class="num">{renderToEnabled[ri] + 1}.</span>
                <span class="label">{rc.choice.text}</span>
              </button>
            {:else}
              <button class="choice disabled" type="button" aria-disabled="true" tabindex="0" title={rc.reason || 'Requirements not met.'} aria-label={(rc.choice.text + ' — ' + (rc.reason || 'Requirements not met.'))} on:click|stopPropagation on:keydown={(e)=>{ if(e.key==='Enter' || e.key===' ') e.preventDefault(); }}>
                <span class="num">·</span>
                <span class="label">{rc.choice.text} — {rc.reason || 'Requirements not met.'}</span>
              </button>
            {/if}
          {/each}
          </div>
        {/if}
      {/key}
    </div>

    {#if showLore}
      <div class="lore">
        <h3>Lore</h3>
        {#if loreItems().length === 0}
          <p class="dim">No lore discovered yet.</p>
        {:else}
          {#each loreItems() as l}
            <div class="litem">
              <div class="ltitle">{l.title}</div>
              {#if l.summary}<div class="lsum">{l.summary}</div>{/if}
            </div>
          {/each}
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .wrap { --cp-accent: #ff1744; --cp-soft: rgba(255,23,68,0.12); --cp-border: rgba(255,23,68,0.28); --cp-text:#ffe8ec; --cp-blue:#66e2ff; --cp-blue-glow: rgba(102,226,255,0.38); color: var(--cp-text); display: grid; grid-template-rows: auto auto 1fr; gap: 10px; padding: 10px; background: linear-gradient(180deg, rgba(255,23,68,0.06), rgba(102,226,255,0.08) 50%, rgba(0,0,0,0)); border: 1px solid var(--cp-border); border-radius: 8px; box-shadow: 0 0 0 1px rgba(255,23,68,0.10) inset, 0 10px 30px rgba(0,0,0,0.3), 0 0 26px rgba(102,226,255,0.10); position: relative; height: 100%; }
  .wrap::before { content: ''; position: absolute; inset: 0; pointer-events: none; background: repeating-linear-gradient(to bottom, rgba(102,226,255,0.06) 0px, rgba(102,226,255,0.06) 2px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 6px); mix-blend-mode: screen; }
  .wrap::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: radial-gradient(800px 300px at -10% 0%, rgba(102,226,255,0.08), rgba(0,0,0,0) 40%), radial-gradient(600px 240px at 110% 110%, rgba(255,23,68,0.08), rgba(0,0,0,0) 50%); animation: sweep2 10s linear infinite; }
  @keyframes sweep2 { 0% { opacity: 0.25; } 50% { opacity: 0.35; } 100% { opacity: 0.25; } }
  .hud { display: grid; grid-template-columns: 1fr auto auto; gap: 10px; align-items: center; position: sticky; top: 0; z-index: 1; padding: 4px 4px 2px 4px; background: linear-gradient(180deg, rgba(0,0,0,0.42), rgba(0,0,0,0)); border-top-left-radius: 8px; border-top-right-radius: 8px; }
  .title { font-weight: 700; letter-spacing: 0.03em; opacity: 0.95; text-shadow: 0 0 12px var(--cp-blue-glow), 0 0 10px rgba(255,23,68,0.28); will-change: filter, transform; }
  .stats { display: flex; gap: 10px; opacity: 0.9; }
  .stats > span { display: inline-flex; gap: 6px; align-items: center; }
  .actions { display: flex; gap: 8px; }
  .roam { display: flex; gap: 8px; }
  .btn.disabled { opacity: 0.5; cursor: not-allowed; }
  .btn { background: var(--cp-soft); color: var(--cp-text); border: 1px solid var(--cp-border); padding: 8px 12px; border-radius: 6px; cursor: pointer; line-height: 1; min-height: 36px; display: inline-flex; align-items: center; justify-content: center; }
  .btn:hover { background: rgba(255,23,68,0.18); }
  .banner { background: rgba(126,231,135,0.08); border: 1px solid rgba(126,231,135,0.25); border-radius: 6px; padding: 6px 10px; font-size: 13px; }
  .pane { display: grid; gap: 12px; min-height: 0; overflow-y: auto; overscroll-behavior: contain; }
  .text { white-space: pre-wrap; text-shadow: 0 0 6px rgba(102,226,255,0.25), 0 0 10px rgba(255,23,68,0.15); }
  .text :global(strong) { color: #e5f4ff; text-shadow: 0 0 6px rgba(102,226,255,0.55), 0 0 10px rgba(255,23,68,0.35); }
  .text :global(em) { color: #ffd0d8; }
  .text :global(code) { background: rgba(255,255,255,0.08); padding: 1px 5px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.12); }
  .choices { display: grid; gap: 8px; }
  .choices.ending { grid-auto-flow: column; justify-content: start; }
  .choice { text-align: left; padding: 8px; border-radius: 6px; cursor: pointer; border: 1px solid var(--cp-border); background: rgba(255,23,68,0.07); display: grid; grid-template-columns: auto 1fr; gap: 8px; color: var(--cp-text); position: relative; }
  .choice::after { content:''; position: absolute; inset: 0; pointer-events: none; border-radius: 6px; box-shadow: inset 0 0 12px rgba(102,226,255,0.12); opacity: 0.7; }
  .choice.sel { outline: 2px solid rgba(255,23,68,0.35); box-shadow: 0 0 8px rgba(255,23,68,0.25), 0 0 10px var(--cp-blue-glow); }
  .choice:hover { background: rgba(255,23,68,0.12); box-shadow: 0 0 10px var(--cp-blue-glow); }
  .choice.disabled { opacity: 0.6; cursor: not-allowed; border-style: dashed; filter: saturate(0.75); }
  .choice.disabled:hover { background: rgba(255,23,68,0.08); box-shadow: none; }
  .title { animation: glitch var(--gdur, 3.5s) infinite steps(2); animation-delay: var(--gdelay, 0s); }
  @keyframes glitch {
    0%, 100% { transform: translate(0); text-shadow: 0 0 0 rgba(255,23,68,0); }
    20% { transform: translate(0.3px, 0); text-shadow: 0 0 8px rgba(255,23,68,0.35); }
    40% { transform: translate(-0.3px, 0); }
    60% { transform: translate(0.2px, 0.1px); }
    80% { transform: translate(-0.2px, -0.1px); }
  }
  /* pulse on selected choice */
  @keyframes pulseGlow {
    0% { box-shadow: 0 0 6px rgba(255,23,68,0.15), 0 0 8px var(--cp-blue-glow); }
    50% { box-shadow: 0 0 12px rgba(255,23,68,0.35), 0 0 14px var(--cp-blue-glow); }
    100% { box-shadow: 0 0 6px rgba(255,23,68,0.15), 0 0 8px var(--cp-blue-glow); }
  }
  .choice.sel { animation: pulseGlow 2.6s ease-in-out infinite; }
  .choice .num { opacity: 0.9; width: 20px; display: inline-block; text-align: right; color: var(--cp-blue); text-shadow: 0 0 8px var(--cp-blue-glow); }
  .lore { margin-top: 6px; padding-top: 6px; border-top: 1px dashed rgba(255,255,255,0.15); }
  .lore { max-height: min(40vh, 360px); overflow: auto; }
  .litem + .litem { margin-top: 8px; }
  .ltitle { font-weight: 600; }
  .lsum { opacity: 0.85; font-size: 13px; }
  .loading, .err { padding: 10px; }

  /* Mobile tweaks */
  @media (max-width: 720px) {
    .wrap { width: 100%; max-width: 100%; box-sizing: border-box; overflow-x: hidden; padding: 8px; }
    .hud { grid-template-columns: repeat(4, 1fr); gap: 6px; align-items: stretch; }
    .hud .title { grid-column: 1 / -1; }
    /* flatten groups so buttons share the same 4-column grid */
    .hud .roam, .hud .actions { display: contents; }
    .btn { min-height: 34px; font-size: 12px; padding: 8px 8px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; width: 100%; }
    .pane { overflow-x: hidden; }
  }
</style>
