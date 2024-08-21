import { z, defineCollection } from "astro:content";

const postCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()),
    image: z.string().optional(),
    date: z.string().optional(),
  }),
});

export const collections = {
  posts: postCollection,
};
