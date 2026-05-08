"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AppBlogNewPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/tour/blog/new");
  }, [router]);
  return null;
}

