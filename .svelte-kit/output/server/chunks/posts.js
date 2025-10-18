import { marked } from "marked";
const __vite_glob_0_0 = "---\ntitle: my little corner of the internet\ndate: 2077-08-13\nsummary: welcome to the blog!\n---\n\nhey.\n\nyou've stumbled upon this page, either by accident, or intentionally. either way, welcome! this is my little corner of the internet. i will attempt to continually either document my life here, in a capacity that i see fit. i mainly want to document my side projects in the form of blog posts where i describe what i struggled with and how things work. \n\nbut first, a bit about me. \n\nmy name's alex. i was born on 2002, so that makes me current_date - 2002, do the math yourself. i like everything technical, not too keen on theoreticals. that means i like coding stuff in my spare time, be it useless side projects which are just fun little pieces of automation, up to bigger things that i deem useful. i wrench on my own motorcycles (yay speed), cars and other items of the mechanical nature. modding them is what gives me the happy brain chemicals - when i have something non-conventional, modified up to my tastes. over the years, i feel i developed a unique taste for what looks good, but tastes are subjective. so every once in a while, i move onto a different project - though not before i feel the last one is near-perfect.\n\nthe first project that i see fit to document wholly is this website. fun fact! i don't know the first thing about frontend coding. and yet this page exists! :D the code for it is available at [github](https://github.com/xdsai/persephone). the code isn't the cleanest, but its not the worst either. take inspiration from it if you see fit, or reuse 1:1, i don't really care. i also dont think a terminal as a personal webpage is the most original of ideas, but it works quite well for who i am. and well, who am i? my name and age is known. i work as an infrastructure security administrator in ESET. started as a junior after completing bachelor's, moved up to secAdmin I after 6 months, and now aiming at the next promotion. i mostly do network security related tasks, be it on-premise or cloud. my expertise lies in AWS and Azure, though i like AWS a bit more as their privateDNS system is more intuitive :D \n\nand really, thats it. a person is so much deeper than a couple lines in a blog post, but this isn't the right place to put my life's story, as noone really cares. \n\na weird blog hidden in the depths of the abyss. \nwhat blog?\n\nalex";
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
