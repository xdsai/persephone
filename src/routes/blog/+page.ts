import type { PageLoad } from './$types';
import { listPosts } from '$lib/blog/posts';

export const load: PageLoad = async () => {
  return { posts: listPosts() };
};

