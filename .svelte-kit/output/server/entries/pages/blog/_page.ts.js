import { l as listPosts } from "../../../chunks/posts.js";
const load = async () => {
  return { posts: listPosts() };
};
export {
  load
};
