"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppBlogDetailPage({
  params,
}: {
  params: { postId: string };
}) {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/tour/blog/${params.postId}`);
  }, [router, params.postId]);
  return null;
}

