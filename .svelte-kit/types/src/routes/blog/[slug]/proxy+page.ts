// @ts-nocheck
import type { PageLoad } from './$types';
import { getPost } from '$lib/blog/posts';

export const load = async ({ params }: Parameters<PageLoad>[0]) => {
  const post = getPost(params.slug);
  if (!post) {
    return { post: null };
  }
  return { post };
};

