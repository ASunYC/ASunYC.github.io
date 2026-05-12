import type { HeadConfig } from 'vitepress'

export const head: HeadConfig[] = [
  ['meta', { name: 'theme-color', content: '#3eaf7c' }],
  ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
  ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
  ['link', { rel: 'icon', href: '/logo.jpg' }],
  ['link', { rel: 'apple-touch-icon', href: '/logo.jpg' }],
  ['link', { rel: 'mask-icon', href: '/logo.jpg', color: '#3eaf7c' }]
]
