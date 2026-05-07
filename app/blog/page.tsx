import Link from "next/link";
import {
  BLOG_CATEGORIES,
  BLOG_CATEGORY_ALL,
  listAllBlogPosts,
  makeBlogPostId,
} from "@/lib/blog/fs";

export const dynamic = "force-dynamic";

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  const selected =
    c && BLOG_CATEGORIES.some((x) => x.key === c) ? c : BLOG_CATEGORY_ALL;

  const all = await listAllBlogPosts();
  const posts =
    selected === BLOG_CATEGORY_ALL
      ? all
      : all.filter((p) => p.category === selected);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 text-zinc-900">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="rounded-lg px-2 py-1 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
        >
          ← 초록북
        </Link>
      </div>

      <p className="mt-6 text-center text-xs font-medium uppercase tracking-widest text-emerald-600/90">
        CHOLOGBOOK
      </p>
      <h1 className="mt-2 text-center text-2xl font-semibold tracking-tight">
        Blog
      </h1>
      <p className="mt-2 text-center text-sm leading-relaxed text-zinc-600">
        흐름 속에서 다듬어진 생각을 공유합니다.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <Link
          href="/blog"
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            selected === BLOG_CATEGORY_ALL
              ? "bg-zinc-900 text-white"
              : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          전체
        </Link>
        {BLOG_CATEGORIES.map((cat) => (
          <Link
            key={cat.key}
            href={`/blog?c=${cat.key}`}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              selected === cat.key
                ? "bg-zinc-900 text-white"
                : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border border-zinc-200/80 bg-white shadow-sm ring-1 ring-zinc-100">
        <ul className="divide-y divide-zinc-100">
          {posts.length === 0 ? (
            <li className="px-5 py-8 text-center text-sm text-zinc-600">
              아직 작성된 글이 없어요.
            </li>
          ) : (
            posts.map((p) => {
              const catLabel =
                BLOG_CATEGORIES.find((c) => c.key === p.category)?.label ??
                p.category;
              return (
                <li key={`${p.category}/${p.slug}`}>
                  <Link
                    href={`/blog/${makeBlogPostId(p.category, p.slug)}`}
                    className="block px-5 py-4 transition hover:bg-emerald-50/20"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-900">
                        {p.title}
                      </p>
                      <p className="shrink-0 text-xs font-mono text-zinc-500">
                        {p.date}
                      </p>
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <p className="min-w-0 flex-1 truncate text-xs text-zinc-500">
                        {p.summary}
                      </p>
                      <span className="shrink-0 rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                        {catLabel}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })
          )}
        </ul>
      </section>
    </main>
  );
}

