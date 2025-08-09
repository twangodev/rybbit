import { blog } from "@/.source";
import { loader } from "fumadocs-core/source";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - blog is dynamically generated
export const blogSource = loader({
  baseUrl: "/blog",
  source: blog.toFumadocsSource?.() || blog,
});
