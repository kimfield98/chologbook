export type BlogCategory = "economy" | "work" | "development" | "life";

export type BlogFrontmatter = {
  title: string;
  date: string;
  summary: string;
};

export type BlogPost = BlogFrontmatter & {
  category: BlogCategory;
  slug: string;
};
