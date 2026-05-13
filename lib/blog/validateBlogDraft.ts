type BlogDraftLike = {
  title: string;
  contentMd: string;
};

export function isBlogDraftPublishable(draft: BlogDraftLike): boolean {
  return Boolean(draft.title.trim() && draft.contentMd.trim());
}
