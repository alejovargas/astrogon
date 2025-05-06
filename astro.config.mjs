import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import AutoImport from "astro-auto-import";
import remarkCollapse from "remark-collapse";
import remarkToc from "remark-toc";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

// https://astro.build/config
export default defineConfig({
  site: "https://www.tagragg.com",
  base: "/",
  trailingSlash: "ignore",
  prefetch: {
    prefetchAll: true,
  },
  integrations: [
    react(),
    sitemap(),
    tailwind({
      config: {
        applyBaseStyles: false,
      },
    }),
    AutoImport({
      imports: [
        "@components/common/Button.astro",
        "@shortcodes/Accordion",
        "@shortcodes/Notice",
        "@shortcodes/Youtube",
        "@shortcodes/Tabs",
        "@shortcodes/Tab",
      ],
    }),
    mdx(),
  ],
  build: {
    // Control how 404 pages are handled
    trailingSlash: "never",
    // Only include routes for active navigation items
    excludePages: [
      "/docs/**",
      "/docs.html",
      "/blog/**",
      "/recipes/**",
      "/poetry/**",
      "/index-cards/**",
      "index-cards.html",
      "/authors/**",
      "/authors.html",
      "/portfolio/**",
    ],
    // Control static file copying
    assets: "assets",
    // Format of page URLs
    format: "file",
  },
  markdown: {
    remarkPlugins: [
      remarkToc,
      [
        remarkCollapse,
        {
          test: "Table of contents",
        },
      ],
      remarkMath,
    ],
    rehypePlugins: [[rehypeKatex, {}]],
    shikiConfig: {
      themes: {
        // https://shiki.style/themes
        light: "light-plus",
        dark: "dark-plus",
      },
    },
    extendDefaultPlugins: true,
  },
  output: "static",
  headers: {
    "/*": [
      {
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
      },
    ],
  },
});
