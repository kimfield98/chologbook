import AppTourBlogIndexClient from "@/app/tour/blog/AppTourBlogIndexClient";

export const dynamic = "force-dynamic";

export default async function TourBlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  return <AppTourBlogIndexClient initialCategory={c} />;
}

