---
title: Develop a Gridsome source plugin
date: 2020-01-01
published: true
comments: true
cover_image: ./images/gridsome-graphql-data-layer.png
tags: ['JavaScript', 'Gridsome']
canonical_url: false
description: "#TODO intro"
---
#TODO intro

First, lets create the project for our example source plugin:

```shell
mkdir source-bikewise
cd source-bikewise
npm init
```

Fill out the questions. When it comes to the package name call it `@gridsome/source-bikewise`. This appears to be the standard format if you decide to publish your plugin.

Create an **index.js** for the plugin code:

```javascript
const axios = require('axios')

class BikeWiseSource {
  static defaultOptions () {
    return {
      baseUri: 'https://bikewise.org/api/v2',
      page: 1,
      perPage: 10,
      incidentType: undefined
    }
  }

  constructor (api, options) {
    api.loadSource(async actions => {
      // Create and instance of Axios for the BikeWise API requests.
      const bikeWiseApi = axios.create({
        baseURL: options.baseUri,
        timeout: 1000
      })

      bikeWiseApi.interceptors.request.use(request => {
        // Add parameters for each request.
        request.params = {
          page: options.page,
          per_page: options.perPge,
          incident_type: options.incidentType,
          ...request.params
        }
        // Debug code to check the request.
        console.log('Request', request)
        return request
      })

      // Debug code to check the response.
      wiopApi.interceptors.response.use(response => {
        console.log('Response', response.data)
        return response
      })

      // Create a new collection for the Gridsome GraphQL API.
      const Collection = actions.addCollection({
        typeName: 'Incident'
      })

      // Make the request for incidents.
      const { data } = await bikeWiseApi.get(`/incidents`)

      // Loop through and add each incident to the collection.
      for (const incident of data.incidents) {
        collection.addNode({
          id: incident.id,
          title: incident.title,
          description: incident.description
        })
      }
    })
  }
}

module.exports = BikeWiseSource
```

This will be executed on build of any Gridsome site which has it configured.

I've used [Axios](https://github.com/axios/axios) to make the request, so you'll need that:

```shell
npm i axios --save
```

Now the basic source plugin project is set up, run the following within this directory:

```shell
npm link
```

This will allow us to link via NPM from our Gridsome site, without having to actually publish, and install our NPM package.  Create a Gridsome site (if you don't have one already) that will utilise this source plugin.

```shell
cd ..
gridsome create site-bikewise
```

We've generated a standard Gridsome starter. We now need to link to the source plugin before we can configure the site to make use of it:

```shell
cd site-bikewise
npm link @gridsome/source-bikewise
```

Edit the **gridsome.config.js** file and add the plugin into the plugins array:

```javascript
module.exports = {
  siteName: 'Gridsome',
  plugins: [
    {
      use: '@gridsome/source-bikewise',
      options: {
        incidentType: 'crash'
      }
    }
  ]
}
```

Note that we can override any of the default options we've added in the plugin constructor.