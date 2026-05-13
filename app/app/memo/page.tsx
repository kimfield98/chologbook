import AppMemoIndexClient from "./AppMemoIndexClient";

export default async function AppMemoIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  return <AppMemoIndexClient initialTag={t} />;
}
