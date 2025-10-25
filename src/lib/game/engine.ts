// Persephone Run — Headless game engine
// Types and engine logic to consume the story JSON in static/story.json

export type Operator = '=' | '!=' | '<' | '<=' | '>' | '>=';

export interface Condition {
  var: string;
  op: Operator;
  value: any;
}

export interface Effects {
  [k: string]: any;
  addLore?: string | string[];
}

export interface Choice {
  text: string;
  to: string;
  effects?: Effects;
  conditions?: Condition[];
  // UX unlock hints (optional)
  showIfLocked?: boolean;
  lockedText?: string;
  // Variant collapse (optional)
  slug?: string;
  variant?: 'done' | 'available' | 'locked';
}

export type RegularNode = { id: string; text: string; choices?: Choice[]; type?: undefined };
export type EndingNode = { id: string; type: 'ending'; endingId: string; title: string; text: string };
export type Node = RegularNode | EndingNode;

export interface LoreItem {
  slug: string;
  title: string;
  summary?: string;
  whereItAppears?: string[];
  status?: string;
}

export interface Meta {
  title: string;
  protagonist?: string;
  date?: string;
  fridayThe13th?: boolean;
  theme?: string;
  modes?: any;
  endings?: Record<string, string>;
  webTieIn?: {
    siteDomain: string;
    projectCodename: string;
    blogTitle: string;
    blogDate: string;
    blogAuthor: string;
    summary?: string;
  };
  hiddenCommands?: Array<{
    cmd: string;
    aliases?: string[];
    discoverHint?: string;
    effect?: string;
    requires?: string | Condition[];
  }>;
  modularity?: { howToExtend?: string };
  state: State;
  rules?: any;
  loreRegistry?: LoreItem[];
  ux?: {
    showStats?: boolean;
    showLockedChoices?: boolean;
  };
  flow?: {
    hubNodeId?: string;
    lockAtNodeIds?: string[];
  };
}

export interface GameJson {
  schemaVersion: number;
  meta: Meta;
  start: string;
  nodes: Node[];
}

export interface State {
  heat: number;
  cyber: number;
  empathy: number;
  credits: number;
  corpRep: number;
  shortMode: boolean;
  flags: Record<string, boolean>;
  loreDiscoveries: string[];
  canRoam?: boolean;
}

const NUMERIC_KEYS: (keyof State)[] = ['heat', 'cyber', 'empathy', 'credits', 'corpRep'];
const KNOWN_FLAGS = new Set([
  'ally_gotara',
  'ghostKey',
  'evidenceShard',
  'corpContract',
  'freedCitizens',
  'blogPrepared',
  'blogPosted',
  'blogClean',
  'foundCommandHint'
]);

export function deepClone<T>(x: T): T {
  return structuredClone ? structuredClone(x) : JSON.parse(JSON.stringify(x));
}

export function getVar(state: State, name: string): any {
  const aliases: Record<string, string> = { ally_johnny: 'ally_gotara', ally_gotara: 'ally_johnny' };
  if ((state as any)[name] !== undefined) return (state as any)[name];
  if (state.flags && state.flags[name] !== undefined) return state.flags[name];
  const a = aliases[name];
  if (a && state.flags && state.flags[a] !== undefined) return state.flags[a];
  return undefined;
}

export function evaluateCondition(cond: Condition, state: State): boolean {
  const left = getVar(state, cond.var);
  const right = cond.value;
  switch (cond.op) {
    case '=': return left === right;
    case '!=': return left !== right;
    case '<': return Number(left) < Number(right);
    case '<=': return Number(left) <= Number(right);
    case '>': return Number(left) > Number(right);
    case '>=': return Number(left) >= Number(right);
  }
  console.warn('Unknown operator', cond.op);
  return false;
}

export function applyEffects(effects: Effects | undefined, state: State, meta: Meta): void {
  if (!effects) return;
  // numeric deltas
  for (const key of NUMERIC_KEYS) {
    if (typeof (effects as any)[key] === 'number') {
      (state as any)[key] += (effects as any)[key];
    }
  }
  // top-level boolean: shortMode
  if (typeof (effects as any)['shortMode'] === 'boolean') {
    state.shortMode = !!(effects as any)['shortMode'];
  }
  // boolean flags
  for (const [k, v] of Object.entries(effects)) {
    if (k === 'addLore') continue;
    if (typeof v === 'boolean') {
      if (k === 'ally_johnny') state.flags['ally_gotara'] = v as boolean;
      if (k === 'ally_gotara') state.flags['ally_johnny'] = v as boolean;
      state.flags[k] = v as boolean;
    }
  }
  // addLore
  if (effects.addLore) {
    const items = Array.isArray(effects.addLore) ? effects.addLore : [effects.addLore];
    for (const slug of items) {
      if (!slug) continue;
      const exists = meta.loreRegistry?.some((i) => i.slug === slug);
      if (exists && !state.loreDiscoveries.includes(slug)) state.loreDiscoveries.push(slug);
    }
  }
}

export interface Serialized {
  currentId: string;
  state: State;
  history?: string[];
}

export class GameEngine<TState extends State = State> {
  private json: GameJson;
  private nodesById: Map<string, Node>;
  private currentId: string;
  private state: TState;
  private history: string[] = [];

  constructor(json: GameJson) {
    this.json = json;
    this.nodesById = new Map(json.nodes.map(n => [n.id, n]));
    this.state = deepClone(json.meta.state) as TState;
    if ((this.state as any).canRoam === undefined) (this.state as any).canRoam = true as any;
    this.currentId = json.start;
    if (!this.nodesById.has(this.currentId)) {
      console.warn('Start node missing:', this.currentId);
      // Try fall back to first node
      const first = json.nodes[0];
      this.currentId = first?.id || '';
    }
  }

  getState(): TState { return this.state; }
  getMeta(): Meta { return this.json.meta; }
  getLore(): LoreItem[] {
    const reg = this.json.meta.loreRegistry || [];
    return (this.state.loreDiscoveries || []).map(slug => reg.find(r => r.slug === slug)).filter(Boolean) as LoreItem[];
  }

  reset(): void {
    this.state = deepClone(this.json.meta.state) as TState;
    if ((this.state as any).canRoam === undefined) (this.state as any).canRoam = true as any;
    this.currentId = this.json.start;
    this.history = [];
  }

  current(): Node {
    const n = this.nodesById.get(this.currentId);
    if (!n) {
      return { id: this.currentId, text: 'Unknown node. The story data is missing this passage.', choices: [] } as RegularNode;
    }
    return n;
  }

  isEnding(): boolean {
    const n = this.current();
    return (n as EndingNode).type === 'ending';
  }

  visibleChoices(): Choice[] {
    const node = this.current();
    if ((node as EndingNode).type === 'ending') return [];
    const choices = (node as RegularNode).choices || [];
    const out: Choice[] = [];
    for (const c of choices) {
      // Validate destination node
      if (!this.nodesById.has(c.to)) {
        console.warn('Invalid choice target', c.to, 'from', node.id);
        continue;
      }
      // Validate operator and conditions
      let ok = true;
      if (c.conditions && c.conditions.length) {
        for (const cond of c.conditions) {
          if (!['=', '!=', '<', '<=', '>', '>='].includes(cond.op)) {
            console.warn('Unknown operator in condition', cond.op, 'on', node.id);
            ok = false; break;
          }
          if (!evaluateCondition(cond, this.state)) { ok = false; break; }
        }
      }
      if (ok) out.push(c);
    }
    return out;
  }

  private passes(choice: Choice): boolean {
    const conds = choice.conditions || [];
    for (const cond of conds) {
      if (!['=', '!=', '<', '<=', '>', '>='].includes(cond.op)) {
        console.warn('Unknown operator in condition', cond.op);
        return false;
      }
      if (!evaluateCondition(cond, this.state)) return false;
    }
    return true;
  }

  renderableChoices(): { choice: Choice; enabled: boolean; reason?: string }[] {
    const node = this.current();
    if ((node as EndingNode).type === 'ending') return [];
    const choices = (node as RegularNode).choices || [];
    const showLocked = !!(this.json.meta.ux && this.json.meta.ux.showLockedChoices);

    type R = { choice: Choice; enabled: boolean; reason?: string; idx: number; }; 
    const ungrouped: R[] = [];
    const groups = new Map<string, R[]>();

    const toRenderable = (c: Choice, idx: number): R | null => {
      const ok = this.passes(c);
      if (ok) return { choice: c, enabled: true, idx };
      const wantsVisible = showLocked && !!c.showIfLocked;
      if (wantsVisible) {
        const reason = c.lockedText && String(c.lockedText).trim() ? String(c.lockedText) : 'Requirements not met.';
        return { choice: c, enabled: false, reason, idx };
      }
      return null;
    };

    choices.forEach((c, idx) => {
      if (c.slug) {
        const r = toRenderable(c, idx);
        if (r) {
          const arr = groups.get(c.slug) || [];
          arr.push(r);
          groups.set(c.slug, arr);
        }
      } else {
        const r = toRenderable(c, idx);
        if (r) ungrouped.push(r);
      }
    });

    const precedence: Record<string, number> = { done: 3, available: 2, locked: 1 };
    const winners: R[] = [];
    for (const [slug, arr] of groups.entries()) {
      if (!arr.length) continue;
      // pick by variant precedence among renderable ones
      let best: R | null = null;
      let bestScore = -1;
      for (const r of arr) {
        const v = r.choice.variant || 'available';
        const p = precedence[v] ?? 0;
        if (p > bestScore) { best = r; bestScore = p; }
        else if (p === bestScore && best) {
          // prefer enabled over disabled when same precedence
          if (r.enabled && !best.enabled) best = r;
          else if (r.enabled === best.enabled && r.idx < best.idx) best = r;
        }
      }
      if (best) winners.push(best);
    }

    const all = winners.concat(ungrouped);
    all.sort((a, b) => a.idx - b.idx);
    return all.map(({ idx, ...rest }) => rest);
  }

  getFlow() { return this.json.meta.flow || {}; }
  getHistoryLength(): number { return this.history.length; }
  canBack(): boolean { return !!(this.state.canRoam && this.history.length > 0); }

  back(): boolean {
    if (!this.state.canRoam) return false;
    const prev = this.history.pop();
    if (!prev) return false;
    if (!this.nodesById.has(prev)) return false;
    this.currentId = prev;
    return true;
  }

  goTo(id: string, pushHistory = true): boolean {
    if (!this.nodesById.has(id)) { console.warn('goTo: unknown node', id); return false; }
    if (this.state.canRoam && pushHistory) this.history.push(this.currentId);
    this.currentId = id;
    this.checkLockIn();
    return true;
  }

  private checkLockIn() {
    const flow = this.getFlow();
    const locks = flow.lockAtNodeIds || [];
    if (this.state.canRoam && locks.includes(this.currentId)) {
      this.state.canRoam = false as any;
      this.history = [];
    }
  }

  choose(index: number): void {
    const choices = this.visibleChoices();
    const choice = choices[index];
    if (!choice) {
      console.warn('Invalid choice index', index);
      return;
    }
    // apply effects → navigate → caller can save
    applyEffects(choice.effects, this.state, this.json.meta);
    if (this.state.canRoam) this.history.push(this.currentId);
    this.currentId = choice.to;
    this.checkLockIn();
  }

  serialize(): string {
    const s: Serialized = { currentId: this.currentId, state: this.state, history: this.history.slice() };
    return JSON.stringify(s);
  }

  deserialize(payload: string): void {
    try {
      const parsed = JSON.parse(payload) as Serialized;
      if (!parsed || typeof parsed.currentId !== 'string' || !parsed.state) throw new Error('bad save');
      // sanity check node id
      if (!this.nodesById.has(parsed.currentId)) {
        console.warn('Saved node missing, falling back to start:', parsed.currentId);
        this.currentId = this.json.start;
      } else {
        this.currentId = parsed.currentId;
      }
      this.state = parsed.state as TState;
      if ((this.state as any).canRoam === undefined) (this.state as any).canRoam = true as any;
      this.history = Array.isArray(parsed.history) ? parsed.history.filter((id) => this.nodesById.has(id)) : [];
    } catch (e) {
      console.warn('Failed to load save:', e);
    }
  }
}

// Small, safe logical expression evaluator for hiddenCommand.requires
// Supports identifiers (mapped via getVar), true/false, !, &&, ||, ==, ===, !=, !==, parentheses
export function evalRequires(expr: string | Condition[] | undefined, state: State): boolean {
  if (expr === undefined) return true;
  if (Array.isArray(expr)) {
    return expr.every((c) => evaluateCondition(c, state));
  }
  const s = String(expr).trim();
  if (!s) return true;
  // Tokenize
  type Tok = { t: string; v?: any };
  const toks: Tok[] = [];
  const re = /\s+|\(|\)|&&|\|\||!==|===|==|!=|!|true|false|[A-Za-z_][A-Za-z0-9_]*|===$/y;
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (ch === '(' || ch === ')') { toks.push({ t: ch }); i++; continue; }
    if (s.startsWith('&&', i)) { toks.push({ t: '&&' }); i += 2; continue; }
    if (s.startsWith('||', i)) { toks.push({ t: '||' }); i += 2; continue; }
    if (s.startsWith('===', i)) { toks.push({ t: '===' }); i += 3; continue; }
    if (s.startsWith('!==', i)) { toks.push({ t: '!==' }); i += 3; continue; }
    if (s.startsWith('==', i)) { toks.push({ t: '==' }); i += 2; continue; }
    if (s.startsWith('!=', i)) { toks.push({ t: '!=' }); i += 2; continue; }
    if (ch === '!') { toks.push({ t: '!' }); i++; continue; }
    if (s.startsWith('true', i) && !/[A-Za-z0-9_]/.test(s[i+4]||'')) { toks.push({ t: 'lit', v: true }); i += 4; continue; }
    if (s.startsWith('false', i) && !/[A-Za-z0-9_]/.test(s[i+5]||'')) { toks.push({ t: 'lit', v: false }); i += 5; continue; }
    const m = /[A-Za-z_][A-Za-z0-9_]*/.exec(s.slice(i));
    if (m && m.index === 0) {
      toks.push({ t: 'id', v: m[0] });
      i += m[0].length;
      continue;
    }
    console.warn('requires: bad token near', s.slice(i));
    return false;
  }
  let p = 0;
  function parsePrimary(): any {
    const tok = toks[p];
    if (!tok) throw new Error('requires: unexpected end');
    if (tok.t === '(') { p++; const val = parseOr(); if (toks[p]?.t !== ')') throw new Error('requires: expected )'); p++; return val; }
    if (tok.t === '!') { p++; return !Boolean(parsePrimary()); }
    if (tok.t === 'lit') { p++; return tok.v; }
    if (tok.t === 'id') { p++; return getVar(state, tok.v as string); }
    throw new Error('requires: unexpected token ' + tok.t);
  }
  function parseEq(): any {
    let left = parsePrimary();
    while (p < toks.length && (toks[p].t === '==' || toks[p].t === '!=' || toks[p].t === '===' || toks[p].t === '!==')) {
      const op = toks[p++].t;
      const right = parsePrimary();
      switch (op) {
        case '==': left = left == right; break; // eslint-disable-line eqeqeq
        case '!=': left = left != right; break; // eslint-disable-line eqeqeq
        case '===': left = left === right; break;
        case '!==': left = left !== right; break;
      }
    }
    return left;
  }
  function parseAnd(): any {
    let left = parseEq();
    while (p < toks.length && toks[p].t === '&&') { p++; left = Boolean(left) && Boolean(parseEq()); }
    return left;
  }
  function parseOr(): any {
    let left = parseAnd();
    while (p < toks.length && toks[p].t === '||') { p++; left = Boolean(left) || Boolean(parseAnd()); }
    return left;
  }
  try {
    const result = Boolean(parseOr());
    return result;
  } catch (e) {
    console.warn('requires: parse error', e);
    return false;
  }
}

export const SAVE_KEY = 'persephone-run-v1:save';
