import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import type { BlogCategory, BlogFrontmatter, BlogPost } from "@/lib/blog/types";
import { BLOG_CATEGORIES, BLOG_CATEGORY_ALL } from "@/lib/blog/constants";

function blogRootDir(): string {
  return path.join(process.cwd(), "content", "blog");
}

function categoryDir(category: BlogCategory): string {
  return path.join(blogRootDir(), category);
}

function isBlogCategory(value: string): value is BlogCategory {
  return BLOG_CATEGORIES.some((c) => c.key === value);
}

export function assertBlogCategory(value: string): asserts value is BlogCategory {
  if (!isBlogCategory(value)) {
    throw new Error(`Invalid blog category: ${value}`);
  }
}

function coerceFrontmatter(data: unknown): BlogFrontmatter {
  const row = (data ?? {}) as Partial<BlogFrontmatter>;
  const title = typeof row.title === "string" ? row.title.trim() : "";
  const date = typeof row.date === "string" ? row.date.trim() : "";
  const summary = typeof row.summary === "string" ? row.summary.trim() : "";
  if (!title || !date || !summary) {
    throw new Error("Invalid blog frontmatter (title/date/summary required).");
  }
  return { title, date, summary };
}

export async function listBlogPosts(category: BlogCategory): Promise<BlogPost[]> {
  const dir = categoryDir(category);
  let files: string[] = [];
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }

  const posts: BlogPost[] = [];
  for (const filename of files) {
    if (!filename.endsWith(".md")) continue;
    const slug = filename.replace(/\.md$/, "");
    const fullPath = path.join(dir, filename);
    const raw = await fs.readFile(fullPath, "utf8");
    const parsed = matter(raw);
    const fm = coerceFrontmatter(parsed.data);
    posts.push({ ...fm, category, slug });
  }

  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return posts;
}

export async function getBlogPost(category: BlogCategory, slug: string): Promise<{
  post: BlogPost;
  html: string;
}> {
  const fullPath = path.join(categoryDir(category), `${slug}.md`);
  const raw = await fs.readFile(fullPath, "utf8");
  const parsed = matter(raw);
  const fm = coerceFrontmatter(parsed.data);

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(parsed.content);

  return {
    post: { ...fm, category, slug },
    html: String(file),
  };
}

export function makeBlogPostId(category: BlogCategory, slug: string): string {
  return `${category}--${slug}`;
}

export function parseBlogPostId(postId: string): {
  category: BlogCategory;
  slug: string;
} {
  const [category, ...rest] = postId.split("--");
  if (!category || rest.length === 0) {
    throw new Error("Invalid postId");
  }
  assertBlogCategory(category);
  const slug = rest.join("--").trim();
  if (!slug) throw new Error("Invalid postId");
  return { category, slug };
}

export async function listAllBlogPosts(): Promise<BlogPost[]> {
  const out: BlogPost[] = [];
  for (const c of BLOG_CATEGORIES) {
    out.push(...(await listBlogPosts(c.key)));
  }
  out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return out;
}

