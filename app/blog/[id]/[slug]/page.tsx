import { notFound, redirect } from "next/navigation";
import { assertBlogCategory, makeBlogPostId } from "@/lib/blog/fs";

export const dynamic = "force-dynamic";

export default async function BlogLegacyPostPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await params;
  try {
    assertBlogCategory(id);
  } catch {
    notFound();
  }

  redirect(`/blog/${makeBlogPostId(id, slug)}`);
}

