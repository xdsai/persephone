import { marked } from "marked";
const __vite_glob_0_0 = '---\ntitle: Welcome to the Blog\ndate: 2025-01-01\nsummary: First post from the terminal.\n---\n\nThis blog is rendered with the same terminal font.\n\nYou can add images too:\n\n![Portal](/blog/images/portal.jpg)\n\nAnd code:\n\n```\necho "hello world"\n```\n';
const files = /* @__PURE__ */ Object.assign({ "/src/lib/blog/content/2025-01-welcome.md": __vite_glob_0_0 });
function parseFrontmatter(raw) {
  if (raw.startsWith("---")) {
    const end = raw.indexOf("\n---", 3);
    if (end !== -1) {
      const fm = raw.slice(3, end).trim();
      const body = raw.slice(end + 4).trim();
      const meta = {};
      for (const line of fm.split("\n")) {
        const i = line.indexOf(":");
        if (i !== -1)
          meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
      }
      return { meta, body };
    }
  }
  return { meta: {}, body: raw };
}
function listPosts() {
  return Object.entries(files).map(([path, raw]) => {
    const { meta } = parseFrontmatter(raw);
    const slug = path.split("/").pop().replace(/\.md$/, "");
    return {
      slug,
      title: meta.title || slug,
      date: meta.date || "",
      summary: meta.summary || ""
    };
  }).sort((a, b) => a.date < b.date ? 1 : -1);
}
function getPost(slug) {
  for (const [path, raw] of Object.entries(files)) {
    if (path.endsWith(`${slug}.md`)) {
      const { meta, body } = parseFrontmatter(raw);
      return {
        slug,
        title: meta.title || slug,
        date: meta.date || "",
        summary: meta.summary || "",
        html: marked.parse(body)
      };
    }
  }
  return null;
}
export {
  getPost as g,
  listPosts as l
};
