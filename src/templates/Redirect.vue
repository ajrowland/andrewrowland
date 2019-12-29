<template></template>

<script>
export default {
  metaInfo() {
    return {
        title: `Redirecting to ${this.$context.newpath}`,
        meta: [
            {
                'http-equiv': 'refresh',
                content: `0; URL=${this.$context.newpath}`
            }
        ],
        link: [
            {
                rel: 'canonical',
                href: `http://www.andrewrowland.com${this.$context.newpath}`
            }
        ]
    }
  }
}
</script>