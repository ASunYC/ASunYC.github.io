import { defineConfig } from 'vitepress'

import { head, nav } from './configs'

export default defineConfig({
  base: '/',
  outDir: '../dist',

  lang: 'en-US',
  title: 'ASunYC',
  description: 'Project hub showcasing open-source projects and developer tools',

  head,

  lastUpdated: true,
  cleanUrls: true,

  markdown: {
    lineNumbers: true
  },

  themeConfig: {
    logo: '/logo.jpg',

    nav,

    socialLinks: [{ icon: 'github', link: 'https://github.com/ASunYC' }],

    outline: {
      level: 'deep',
      label: 'On this page'
    },

    footer: {
      message: 'Built with VitePress',
      copyright: 'Copyright © 2026 ASunYC'
    },

    darkModeSwitchLabel: 'Theme',
    returnToTopLabel: 'Back to top',
    lastUpdatedText: 'Last updated',

    docFooter: {
      prev: 'Previous page',
      next: 'Next page'
    }
  }
})
