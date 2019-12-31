<template></template>

<script>
export default {
  metaInfo() {
    return {
        title: `Redirecting to ${this.$page.post.path}`,
        meta: [
            {
                'http-equiv': 'refresh',
                content: `0; URL=${this.$page.post.path}`
            }
        ],
        link: [
            {
                rel: 'canonical',
                href: `http://www.andrewrowland.com${this.$page.post.path}`
            }
        ]
    }
  }
}
</script>

<page-query>
query Redirect ($id: ID!) {
  post: post (id: $id) {
    path
  }
}
</page-query>