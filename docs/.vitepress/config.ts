import { defineConfig } from 'vitepress'
import path from 'node:path'
import { viteStaticCopy } from 'vite-plugin-static-copy'

import { head, nav } from './configs'

const root = process.cwd().replace(/\\/g, '/')

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

  vite: {
    resolve: {
      alias: [
        {
          find: 'Cesium',
          replacement: path.resolve(process.cwd(), 'node_modules/cesium/Source/Cesium.js')
        },
        {
          find: 'cesium',
          replacement: path.resolve(process.cwd(), 'node_modules/cesium/Source/Cesium.js')
        },
        {
          find: '@zip.js/zip.js/lib/zip-no-worker.js',
          replacement: path.resolve(process.cwd(), 'node_modules/@zip.js/zip.js/lib/zip-core.js')
        }
      ]
    },
    plugins: [
      viteStaticCopy({
        targets: [
          { src: `${root}/node_modules/cesium/Build/Cesium/**/*`, dest: 'cesium' },
          { src: `${root}/node_modules/@metagl/sdk-render/assets/**/*`, dest: 'assets' },
          { src: `${root}/node_modules/@metagl/sdk-render/resources/**/*`, dest: 'resources' }
        ]
      })
    ],
    define: {
      CESIUM_BASE_URL: JSON.stringify('/cesium')
    }
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
