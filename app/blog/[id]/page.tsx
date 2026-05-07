import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  BLOG_CATEGORIES,
  assertBlogCategory,
  getBlogPost,
  parseBlogPostId,
} from "@/lib/blog/fs";

export const dynamic = "force-dynamic";

export default async function BlogEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 1) legacy category path: /blog/:category  → /blog?c=:category
  try {
    assertBlogCategory(id);
    redirect(`/blog?c=${id}`);
  } catch {
    // continue
  }

  // 2) post path: /blog/:postId  (postId = `${category}--${slug}`)
  let parsed: ReturnType<typeof parseBlogPostId>;
  try {
    parsed = parseBlogPostId(id);
  } catch {
    notFound();
  }

  let row: Awaited<ReturnType<typeof getBlogPost>>;
  try {
    row = await getBlogPost(parsed.category, parsed.slug);
  } catch {
    notFound();
  }

  const catLabel =
    BLOG_CATEGORIES.find((c) => c.key === parsed.category)?.label ??
    parsed.category;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 text-zinc-900">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/blog"
          className="rounded-lg px-2 py-1 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
        >
          ← Blog
        </Link>
      </div>

      <header className="mt-8">
        <p className="text-center text-xs font-medium uppercase tracking-widest text-emerald-600/90">
          CHOLOGBOOK · Blog
        </p>
        <h1 className="mt-2 text-center text-2xl font-semibold tracking-tight">
          {row.post.title}
        </h1>
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-zinc-500">
          <span className="rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-600">
            {catLabel}
          </span>
          <span className="font-mono">{row.post.date}</span>
        </div>
        <p className="mt-4 text-center text-sm leading-relaxed text-zinc-700">
          {row.post.summary}
        </p>
      </header>

      <article
        className="prose prose-zinc mx-auto mt-10 max-w-none prose-p:leading-relaxed prose-a:text-emerald-700 prose-a:no-underline hover:prose-a:underline"
        dangerouslySetInnerHTML={{ __html: row.html }}
      />
    </main>
  );
}

