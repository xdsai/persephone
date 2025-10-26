import { marked } from "marked";
const __vite_glob_0_0 = "---\ntitle: Corrections & Clarifications\ndate: 2077-08-13\nsummary: Parallax Canonics — a terminal‑native story you can play inline\n---\n\nThis page embeds the interactive story engine. Open the drawer below to begin.\n\n";
const __vite_glob_0_1 = "---\ntitle: my little corner of the internet\ndate: 2077-08-13\nsummary: welcome to my space for projects, notes, and tinkering.\n---\n\nhey.\n\nyou found this place—by accident or on purpose. either way, welcome! this is my little corner of the internet. i’ll use it to document side projects and how i build them: what broke, what worked, and why.\n\n## about me\n\ni’m alex. born in 2002 (you can do the math on how old i am). i like hands-on, practical things more than theory. in my free time i write code—everything from small automations to bigger tools i think are useful.\n\ni also wrench on my own motorcycles, cars, and other mechanical toys. modding them is my happy place: making something non-conventional and tailored to my taste. my sense of what “looks right” has evolved over the years—subjective, sure—but i tend to see projects through until they’re *almost* perfect before moving on.\n\n## this site\n\nthe first project i’m documenting is… this website. fun fact: i barely know frontend. and yet, here we are :D\n\nthe source is on [github](https://github.com/xdsai/persephone). the code isn’t pristine, but it’s not a disaster either. borrow ideas or copy it 1:1—i don’t mind. a terminal-style homepage isn’t the most original concept, but it fits me.\n\n## work\n\ni work as an infrastructure security administrator at **ESET**. i started as a junior right after my bachelor’s, moved to secAdmin I six months later, and i’m aiming for the next step. most of my day is network security—on-prem and cloud. i work with **AWS** and **Azure** (leaning AWS; their private DNS just feels more intuitive :D).\n\n## closing\n\nnobody’s whole story fits in a single post—and that’s fine. this isn’t a memoir; it’s a place to build in public.\n\na weird blog hidden in the depths of the abyss.  \nwhat blog?\n\n— alex";
const files = /* @__PURE__ */ Object.assign({ "/src/lib/blog/content/corrections-and-clarifications.md": __vite_glob_0_0, "/src/lib/blog/content/welcome.md": __vite_glob_0_1 });
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
