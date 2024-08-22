import { z, defineCollection } from "astro:content";

const postCollection = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      tags: z.array(z.string()),
      cover_image: image().optional(),
      date: z.date().optional(),
      published: z.boolean(),
      canonical_url: z.boolean(),
      comments: z.boolean().optional(),
    }),
});

export const collections = {
  posts: postCollection,
};
