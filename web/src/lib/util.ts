export const getPath = (slug: string) =>
  `/${slug.toLowerCase().replace(/^\d{4}-\d{2}-\d{2}-/, "")}/`;
