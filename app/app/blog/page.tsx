import AppBlogIndexClient from "./AppBlogIndexClient";

export default async function AppBlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  return <AppBlogIndexClient initialCategory={c} />;
}
