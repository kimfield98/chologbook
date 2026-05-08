import type { BlogCategory } from "@/lib/blog/types";

export const BLOG_CATEGORIES: { key: BlogCategory; label: string }[] = [
  { key: "economy", label: "경제" },
  { key: "work", label: "일&커리어" },
  { key: "development", label: "개발" },
  { key: "life", label: "일상" },
];

export const BLOG_CATEGORY_ALL = "all" as const;

