import { g as getPost } from "../../../../chunks/posts.js";
const load = async ({ params }) => {
  const post = getPost(params.slug);
  if (!post) {
    return { post: null };
  }
  return { post };
};
export {
  load
};
