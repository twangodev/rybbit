import { MDXRemote } from "next-mdx-remote/rsc";
import { getPostBySlug, getAllPosts } from "../../../lib/blog";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";
import "../blog.css";
import "../code-highlight.css";
import {
  mdxComponents,
  resetMDXComponents,
} from "../../../components/MDXComponents";
import CodeHighlighter from "../../../components/CodeHighlighter";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug).catch(() => null);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.frontMatter.title,
    description: post.frontMatter.description,
  };
}

export default async function BlogPostPage({ params }) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug).catch(() => null);

  if (!post) {
    notFound();
  }

  // Reset the MDX component state for each page render
  resetMDXComponents();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          Back to all posts
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.frontMatter.title}</h1>
        <div className="text-neutral-400 mb-5 flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          {new Date(post.frontMatter.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          {post.frontMatter.author && (
            <>
              <span className="mx-2">•</span>
              <span className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                {post.frontMatter.author}
              </span>
            </>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {post.frontMatter.tags?.map((tag) => (
            <Link
              key={tag}
              href={`/blog/tag/${tag}`}
              className="bg-emerald-900/40 text-emerald-400 text-xs px-2.5 py-1 rounded-full hover:bg-emerald-900/60 transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>

      <article className="blog-content">
        <MDXRemote source={post.content} components={mdxComponents} />
        <CodeHighlighter />
      </article>

      <div className="mt-10 pt-6 border-t border-neutral-700/50 flex justify-between items-center">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          Back to all posts
        </Link>
      </div>
    </div>
  );
}
