import { MemoReader } from "@/components/memo/MemoReader";

export default async function AppMemoDetailPage({
  params,
}: {
  params: Promise<{ memoId: string }>;
}) {
  const { memoId } = await params;
  return <MemoReader memoId={memoId} />;
}
