export type NodeType = 'dir' | 'file';

export interface FsNodeBase {
  name: string;
  type: NodeType;
  createdAt: number;
  updatedAt: number;
}

export interface FsFile extends FsNodeBase {
  type: 'file';
  content: string;
  link?: string; // optional route to open when clicked in ls
}

export interface FsDir extends FsNodeBase {
  type: 'dir';
  children: FsNode[];
}

export type FsNode = FsFile | FsDir;

export interface FsState {
  root: FsDir;
  cwd: string; // absolute, like '/home/alex'
}

const STORAGE_KEY = 'persephone.fs.v1';
export function resetStorage() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

export function now() {
  return Date.now();
}

export function createDir(name: string, children: FsNode[] = []): FsDir {
  const t = now();
  return { name, type: 'dir', children, createdAt: t, updatedAt: t };
}

export function createFile(name: string, content = ''): FsFile {
  const t = now();
  return { name, type: 'file', content, createdAt: t, updatedAt: t };
}

export function serialize(state: FsState) {
  return JSON.stringify(state);
}

export function deserialize(str: string): FsState | null {
  try {
    const obj = JSON.parse(str);
    return obj as FsState;
  } catch {
    return null;
  }
}

export function save(state: FsState) {
  try {
    localStorage.setItem(STORAGE_KEY, serialize(state));
  } catch {}
}

export function load(): FsState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return deserialize(raw);
  } catch {
    return null;
  }
}

export function defaultFs(): FsState {
  const root = createDir('/', [
    // core UNIX-like layout
    createDir('bin', [
      createFile('ls', ''),
      createFile('cat', ''),
      createFile('echo', ''),
      createFile('pwd', ''),
      createFile('cd', ''),
      createFile('ip', '')
    ]),
    createDir('usr', [
      createDir('bin', [ createFile('node', ''), createFile('bash', '') ]),
      createDir('share', [ createFile('dict.txt', 'why are you looking here >:(') ])
    ]),
    createDir('var', [
      createDir('log', [ createFile('auth.log', 'accepted connection'), createFile('kern.log', 'boot ok') ]),
      createDir('tmp')
    ]),
    createDir('proc', [ createFile('cpuinfo', 'cpu: webasm'), createFile('meminfo', 'mem: virtual') ]),
    createDir('etc', [
      createFile('hostname', 'jndl\n'),
      createFile('hosts', '127.0.0.1 localhost\n::1 localhost\n'),
      createFile('os-release', 'NAME=Web\nID=web'),
    ]),
    createDir('home', [
      createDir('alex', [
        createFile('README.md', `# Alexander Jandl\n\nWelcome to my terminal. Try \`help\` to see commands.\n\nUseful places:\n- ~/about.txt\n- ~/skills.md\n- ~/projects\n`),
        createFile('about.txt', `Infrastructure & security focused engineer based in Bratislava. I like reliable automation, scalable systems, and cats.`),
        createFile('skills.md', `- Linux, networking, network security\n- AWS & Azure platform security\n- Scripting: Bash, Python, Powershell, C\n- Zero-trust, identity, and least privilege`),
        { ...createFile('blog', 'Open the personal blog'), link: '/blog' },
        createDir('projects', [
          //createFile('homelab.md', 'Docker playground for experiments.')
        ])
      ])
    ]),
    createDir('tmp')
  ]);

  return { root, cwd: '/home/alex' };
}

// Path utilities
export function join(...parts: string[]) {
  return normalize(parts.join('/'));
}

export function normalize(path: string): string {
  if (!path) return '/';
  let p = path.replace(/\\/g, '/');
  if (!p.startsWith('/')) p = '/' + p;
  const out: string[] = [];
  for (const seg of p.split('/')) {
    if (!seg || seg === '.') continue;
    if (seg === '..') out.pop();
    else out.push(seg);
  }
  return '/' + out.join('/');
}

export function resolve(cwd: string, path: string) {
  if (!path || path === '.') return normalize(cwd);
  if (path.startsWith('/')) return normalize(path);
  return normalize(cwd + '/' + path);
}

export function find(root: FsDir, absPath: string): { node: FsNode | null; parent: FsDir | null } {
  const segs = normalize(absPath).split('/').filter(Boolean);
  if (segs.length === 0) return { node: root, parent: null };
  let cur: FsDir | null = root;
  let parent: FsDir | null = null;
  let node: FsNode | null = root;
  for (const seg of segs) {
    if (!cur) return { node: null, parent: null };
    const child: FsNode | null = (cur.children.find((c: FsNode) => c.name === seg) as FsNode) || null;
    parent = cur;
    node = child;
    if (!child) return { node: null, parent };
    cur = child.type === 'dir' ? child : null;
  }
  return { node, parent };
}

export function ensureDir(root: FsDir, absPath: string, makeParents = false): { node: FsDir | null; created: boolean } {
  const target = normalize(absPath);
  if (target === '/') return { node: root, created: false };
  const segs = target.split('/').filter(Boolean);
  let cur = root;
  let created = false;
  for (const seg of segs) {
    let child = cur.children.find((c) => c.name === seg);
    if (!child) {
      if (!makeParents) return { node: null, created };
      child = createDir(seg);
      cur.children.push(child);
      created = true;
    }
    if (child.type !== 'dir') return { node: null, created };
    cur = child;
  }
  return { node: cur, created };
}

export function remove(root: FsDir, absPath: string, recursive = false): boolean {
  const { node, parent } = find(root, absPath);
  if (!node || !parent) return false;
  if (node.type === 'dir' && node.children.length && !recursive) return false;
  const idx = parent.children.findIndex((c) => c.name === node.name);
  if (idx >= 0) parent.children.splice(idx, 1);
  return true;
}
