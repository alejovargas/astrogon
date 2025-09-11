import { onRequestPost as __api_contact_js_onRequestPost } from "/Users/alejo/Documents/Code/GitHub-M1.tmp/tagragg/astro/functions/api/contact.js"

export const routes = [
    {
      routePath: "/api/contact",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_contact_js_onRequestPost],
    },
  ]