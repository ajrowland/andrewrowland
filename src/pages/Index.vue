<template>
  <Layout :show-logo="false">
    <!-- Author intro -->
    <Author :show-title="true" />

    <!-- List posts -->
    <div class="posts">
      <PostCard v-for="edge in $page.posts.edges" :key="edge.node.id" :post="edge.node"/>

      <Pager class="pager" linkClass="pager__link" :info="$page.posts.pageInfo" />
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
}
</page-query>

<script>
import { Pager } from 'gridsome'
import Author from '~/components/Author.vue'
import PostCard from '~/components/PostCard.vue'

export default {
  components: {
    Pager,
    Author,
    PostCard
  },
  metaInfo: {
    title: 'Home'
  }
}
</script>

<style lang="scss">
.pager {
  text-align: center;

  &__link {
    padding: 10px;
  }
}
</style>
