import{m}from"./marked.esm.da5dbf02.js";const h=`---
title: NEON THIRTEEN: PERSEPHONE RUN
date: 2077-08-13
summary: a terminal-native narrative prototype you can play inline
---

This page embeds the interactive story engine. Open the drawer below to begin.
`,c=`---
title: my little corner of the internet
date: 2077-08-13
summary: welcome to the blog!
---

hey.

you've stumbled upon this page, either by accident, or intentionally. either way, welcome! this is my little corner of the internet. i will attempt to continually either document my life here, in a capacity that i see fit. i mainly want to document my side projects in the form of blog posts where i describe what i struggled with and how things work. 

but first, a bit about me. 

my name's alex. i was born on 2002, so that makes me current_date - 2002, do the math yourself. i like everything technical, not too keen on theoreticals. that means i like coding stuff in my spare time, be it useless side projects which are just fun little pieces of automation, up to bigger things that i deem useful. i wrench on my own motorcycles (yay speed), cars and other items of the mechanical nature. modding them is what gives me the happy brain chemicals - when i have something non-conventional, modified up to my tastes. over the years, i feel i developed a unique taste for what looks good, but tastes are subjective. so every once in a while, i move onto a different project - though not before i feel the last one is near-perfect.

the first project that i see fit to document wholly is this website. fun fact! i don't know the first thing about frontend coding. and yet this page exists! :D the code for it is available at [github](https://github.com/xdsai/persephone). the code isn't the cleanest, but its not the worst either. take inspiration from it if you see fit, or reuse 1:1, i don't really care. i also dont think a terminal as a personal webpage is the most original of ideas, but it works quite well for who i am. and well, who am i? my name and age is known. i work as an infrastructure security administrator in ESET. started as a junior after completing bachelor's, moved up to secAdmin I after 6 months, and now aiming at the next promotion. i mostly do network security related tasks, be it on-premise or cloud. my expertise lies in AWS and Azure, though i like AWS a bit more as their privateDNS system is more intuitive :D 

and really, thats it. a person is so much deeper than a couple lines in a blog post, but this isn't the right place to put my life's story, as noone really cares. 

a weird blog hidden in the depths of the abyss. 
what blog?

alex`,r=Object.assign({"/src/lib/blog/content/neon-thirteen-persephone-run.md":h,"/src/lib/blog/content/welcome.md":c});function l(e){if(e.startsWith("---")){const t=e.indexOf(`
---`,3);if(t!==-1){const n=e.slice(3,t).trim(),i=e.slice(t+4).trim(),o={};for(const s of n.split(`
`)){const a=s.indexOf(":");a!==-1&&(o[s.slice(0,a).trim()]=s.slice(a+1).trim())}return{meta:o,body:i}}}return{meta:{},body:e}}function u(){return Object.entries(r).map(([e,t])=>{const{meta:n}=l(t),i=e.split("/").pop().replace(/\.md$/,"");return{slug:i,title:n.title||i,date:n.date||"",summary:n.summary||""}}).sort((e,t)=>e.date<t.date?1:-1)}function p(e){for(const[t,n]of Object.entries(r))if(t.endsWith(`${e}.md`)){const{meta:i,body:o}=l(n);return{slug:e,title:i.title||e,date:i.date||"",summary:i.summary||"",html:m.parse(o)}}return null}export{p as g,u as l};
