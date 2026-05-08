"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppBlogEditPage({
  params,
}: {
  params: { postId: string };
}) {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/tour/blog/${params.postId}/edit`);
  }, [router, params.postId]);
  return null;
}

