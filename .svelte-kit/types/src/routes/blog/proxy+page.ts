// @ts-nocheck
import type { PageLoad } from './$types';
import { listPosts } from '$lib/blog/posts';

export const load = async () => {
  return { posts: listPosts() };
};

;null as any as PageLoad;