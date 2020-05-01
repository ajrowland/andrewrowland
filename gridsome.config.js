// This is where project configuration and plugin options are located.
// Learn more: https://gridsome.org/docs/config

// Changes here requires a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

module.exports = {
  siteName: 'Andrew Rowland',
  siteDescription: 'I only want to help you...',
  siteUrl: 'https://www.andrewrowland.com',

  templates: {
    Post: [
      {
        path: '/:title'
      },
      {
        name: 'redirects',
        path: '/article/display/:title',
        component: './src/templates/Redirect.vue'
      }
    ],
    Tag: '/tag/:id'
  },

  plugins: [
    {
      // Create posts from markdown files
      use: '@gridsome/source-filesystem',
      options: {
        typeName: 'Post',
        path: 'content/posts/*.md',
        refs: {
          // Creates a GraphQL collection from 'tags' in front-matter and adds a reference.
          tags: {
            typeName: 'Tag',
            create: true
          }
        }
      }
    },
    {
      use: 'gridsome-plugin-gtm',
      options: {
        id: 'GTM-5KQZ3N',
        enabled: true,
        debug: false
      }
    },
    {
      use: '@gridsome/plugin-sitemap',
      options: {
        exclude: [
          '/article/display/*',
          '/tag/*',
          '/\\d+'
        ]
      }
    },
    {
      use: 'gridsome-plugin-pwa',
      options: {
        title: 'Andrew Rowland',
        startUrl: '/',
        display: 'standalone',
        statusBarStyle: 'default',
        manifestPath: 'manifest.json',
        disableServiceWorker: false,
        serviceWorkerPath: 'service-worker.js',
        cachedFileTypes: 'js,json,css,html,png,jpg,jpeg,svg',
        shortName: 'Andrew Rowland',
        themeColor: '#ffffff',
        backgroundColor: '#0D2538',
        icon: 'src/favicon.png', // must be provided like 'src/favicon.png'
        msTileImage: 'src/favicon.png',
        msTileColor: '#ffffff'
      }
    }
  ],

  transformers: {
    // Add markdown support to all file-system sources
    remark: {
      externalLinksTarget: '_blank',
      externalLinksRel: ['nofollow', 'noopener', 'noreferrer'],
      anchorClassName: 'icon icon-link',
      plugins: [
        '@gridsome/remark-prismjs'
      ]
    }
  }
}
