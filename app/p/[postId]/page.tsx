import { BlogPostReader } from "@/components/blog/BlogPostReader";

export default async function PublicBlogPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  return <BlogPostReader postId={postId} listHref="/app/blog" />;
}
