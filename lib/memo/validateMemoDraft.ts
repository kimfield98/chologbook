type MemoDraftLike = {
  title: string;
  contentMd: string;
};

export function isMemoDraftSavable(draft: MemoDraftLike): boolean {
  return Boolean(draft.title.trim() && draft.contentMd.trim());
}
