import{m as c}from"./marked.esm.da5dbf02.js";const l=`---
title: Corrections & Clarifications
date: 2077-08-13
summary: Parallax Canonics — a terminal‑native story you can play inline
---

This page embeds the interactive story engine. Open the drawer below to begin.

`,d=`---
title: my little corner of the internet
date: 2077-08-13
summary: welcome to my space for projects, notes, and tinkering.
---

hey.

you found this place—by accident or on purpose. either way, welcome! this is my little corner of the internet. i’ll use it to document side projects and how i build them: what broke, what worked, and why.

## about me

i’m alex. born in 2002 (you can do the math on how old i am). i like hands-on, practical things more than theory. in my free time i write code—everything from small automations to bigger tools i think are useful.

i also wrench on my own motorcycles, cars, and other mechanical toys. modding them is my happy place: making something non-conventional and tailored to my taste. my sense of what “looks right” has evolved over the years—subjective, sure—but i tend to see projects through until they’re *almost* perfect before moving on.

## this site

the first project i’m documenting is… this website. fun fact: i barely know frontend. and yet, here we are :D

the source is on [github](https://github.com/xdsai/persephone). the code isn’t pristine, but it’s not a disaster either. borrow ideas or copy it 1:1—i don’t mind. a terminal-style homepage isn’t the most original concept, but it fits me.

## work

i work as an infrastructure security administrator at **ESET**. i started as a junior right after my bachelor’s, moved to secAdmin I six months later, and i’m aiming for the next step. most of my day is network security—on-prem and cloud. i work with **AWS** and **Azure** (leaning AWS; their private DNS just feels more intuitive :D).

## closing

nobody’s whole story fits in a single post—and that’s fine. this isn’t a memoir; it’s a place to build in public.

a weird blog hidden in the depths of the abyss.  
what blog?

— alex`,a=Object.assign({"/src/lib/blog/content/corrections-and-clarifications.md":l,"/src/lib/blog/content/welcome.md":d});function m(t){if(t.startsWith("---")){const e=t.indexOf(`
---`,3);if(e!==-1){const i=t.slice(3,e).trim(),n=t.slice(e+4).trim(),o={};for(const s of i.split(`
`)){const r=s.indexOf(":");r!==-1&&(o[s.slice(0,r).trim()]=s.slice(r+1).trim())}return{meta:o,body:n}}}return{meta:{},body:t}}function u(){return Object.entries(a).map(([t,e])=>{const{meta:i}=m(e),n=t.split("/").pop().replace(/\.md$/,"");return{slug:n,title:i.title||n,date:i.date||"",summary:i.summary||""}}).sort((t,e)=>t.date<e.date?1:-1)}function y(t){for(const[e,i]of Object.entries(a))if(e.endsWith(`${t}.md`)){const{meta:n,body:o}=m(i);return{slug:t,title:n.title||t,date:n.date||"",summary:n.summary||"",html:c.parse(o)}}return null}export{y as g,u as l};
