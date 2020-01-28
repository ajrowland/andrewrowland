// Import focus-visible polyfill
import 'focus-visible/dist/focus-visible.min.js'

// Import main css
import '~/assets/style/index.scss'

// Import Prismjs styles for code
import 'prismjs/themes/prism-tomorrow.css'

// Import default layout so we don't need to import it to every page
import DefaultLayout from '~/layouts/Default.vue'

import VueDisqus from 'vue-disqus'

// import VueGtm from 'vue-gtm'

// The Client API can be used here. Learn more: gridsome.org/docs/client-api
export default function (Vue, { router, head, isClient }) {
  // Set default layout as a global component
  Vue.component('Layout', DefaultLayout)

  Vue.use(VueDisqus)

  // If we want to initiate analytics manually instead of through configuration.
  /* if (isClient) {
    Vue.use(VueGtm, {
      id: 'GTM-5KQZ3N', // Your GTM single container ID or array of container ids ['GTM-xxxxxxx', 'GTM-yyyyyyy']
      enabled: true, // defaults to true. Plugin can be disabled by setting this to false for Ex: enabled: !!GDPR_Cookie (optional)
      debug: false, // Whether or not display console logs debugs (optional)
      loadScript: true, // Whether or not to load the GTM Script (Helpful if you are including GTM manually, but need the dataLayer functionality in your components) (optional)
      vueRouter: router, // Pass the router instance to automatically sync with router (optional)
      //ignoredViews: ['homepage'] // If router, you can exclude some routes name (case insensitive) (optional)
    })
  } */
}
