<template>
  <Layout :show-logo="false">
    <!-- Author intro -->
    <Author :show-title="true" />

    <!-- List posts -->
    <div class="posts">
      <PostCard
        v-for="edge in $page.posts.edges"
        :key="edge.node.id"
        :post="edge.node"
      />

      <Pager
        class="pager"
        linkClass="pager__link"
        :info="$page.posts.pageInfo"
      />
    </div>
  </Layout>
</template>

<page-query>
query ($page: Int) {
  posts: allPost(perPage: 5, page: $page, filter: { published: { eq: true }}) @paginate {
    pageInfo {
      totalPages
      currentPage
    }
    edges {
      node {
        id
        title
        date (format: "D. MMMM YYYY")
        timeToRead
        description
        cover_image (width: 770, height: 380, blur: 10)
        path
        tags {
          id
          title
          path
        }
      }
    }
  }
  metadata: metadata {
    siteName
    siteDescription
    siteUrl
  }
}
</page-query>

<script>
import { Pager } from "gridsome";
import Author from "~/components/Author.vue";
import PostCard from "~/components/PostCard.vue";

export default {
  components: {
    Pager,
    Author,
    PostCard,
  },
  metaInfo: function() {
    const { siteUrl } = this.$page.metadata;

    return {
      title: "Home",
      meta: [
        { name: "description", content: this.$page.metadata.siteDescription },
        { name: "twitter:card", content: "summary_large_image" },
        {
          name: "twitter:description",
          content: this.$page.metadata.siteDescription,
        },
        { name: "twitter:title", content: this.$page.metadata.siteName },
        { name: "twitter:site", content: "@andyjrowland" },
        { name: "twitter:creator", content: "@andyjrowland" },
        {
          name: "twitter:image",
          content:
            "https://media-exp1.licdn.com/dms/image/C5603AQGuEHBqeZ-MBg/profile-displayphoto-shrink_200_200/0?e=1583971200&v=beta&t=CMbyHBfa_K4rZt2fwkZzXfGLgleLTVPBtoKKyzqpxWA",
        },
        { property: "og:type", content: "article" },
        { property: "og:title", content: this.$page.metadata.siteName },
        {
          property: "og:description",
          content: this.$page.metadata.siteDescription,
        },
        { property: "og:url", content: `${siteUrl}` },
        {
          property: "og:image",
          content:
            "https://media-exp1.licdn.com/dms/image/C5603AQGuEHBqeZ-MBg/profile-displayphoto-shrink_200_200/0?e=1583971200&v=beta&t=CMbyHBfa_K4rZt2fwkZzXfGLgleLTVPBtoKKyzqpxWA",
        },
      ],
      script: [{ src: "https://platform.twitter.com/widgets.js", async: true }],
    };
  },
};
</script>

<style lang="scss">
.pager {
  text-align: center;

  &__link {
    padding: 20px;
    margin: 10px;
    display: inline-block;
  }
}
</style>
