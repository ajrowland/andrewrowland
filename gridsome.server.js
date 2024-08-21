// Server API makes it possible to hook into various parts of Gridsome
// on server-side and add custom data to the GraphQL data layer.
// Learn more: https://gridsome.org/docs/server-api/

// Changes here requires a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

module.exports = function(api) {
  api.loadSource(async ({ actions, graphql }) => {
    /*const collection = actions.addCollection('Redirect')

    const { data } = await graphql(`{
      allPost {
        edges {
          node {
            published
            path
          }
        }
      }
    }`)

    data.allPost.edges.forEach(({ node }) => {
      if (node.published) {
        collection.addNode({
          newpath: node.path
        })
      }
    })*/
  });

  api.createPages(async ({ createPage, graphql }) => {
    /*const { data } = await graphql(`{
      allPost {
        edges {
          node {
            published
            path
          }
        }
      }
    }`)

    data.allPost.edges.forEach(({ node }) => {
      if (node.published) {
        createPage({
          path: `/article/display${node.path}`,
          component: './src/templates/Redirect.vue',
          context: {
            newpath: node.path
          }
        })
      }
    })*/
  });
};
