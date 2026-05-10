import { redirect } from "next/navigation";

export default async function AppBlogDetailRedirect({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  redirect(`/p/${postId}`);
}
