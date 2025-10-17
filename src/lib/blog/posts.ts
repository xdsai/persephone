import { marked } from 'marked';

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  summary?: string;
}

export interface Post extends PostMeta {
  html: string;
}

const files = import.meta.glob('/src/lib/blog/content/*.md', { as: 'raw', eager: true });

function parseFrontmatter(raw: string) {
  if (raw.startsWith('---')) {
    const end = raw.indexOf('\n---', 3);
    if (end !== -1) {
      const fm = raw.slice(3, end).trim();
      const body = raw.slice(end + 4).trim();
      const meta: Record<string, string> = {};
      for (const line of fm.split('\n')) {
        const i = line.indexOf(':');
        if (i !== -1) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
      }
      return { meta, body };
    }
  }
  return { meta: {}, body: raw };
}

export function listPosts(): PostMeta[] {
  return Object.entries(files)
    .map(([path, raw]) => {
      const { meta } = parseFrontmatter(raw as string);
      const slug = path.split('/').pop()!.replace(/\.md$/, '');
      return {
        slug,
        title: (meta.title as string) || slug,
        date: (meta.date as string) || '',
        summary: (meta.summary as string) || ''
      } satisfies PostMeta;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): Post | null {
  for (const [path, raw] of Object.entries(files)) {
    if (path.endsWith(`${slug}.md`)) {
      const { meta, body } = parseFrontmatter(raw as string);
      return {
        slug,
        title: (meta.title as string) || slug,
        date: (meta.date as string) || '',
        summary: (meta.summary as string) || '',
        html: marked.parse(body)
      };
    }
  }
  return null;
}

