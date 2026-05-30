<script setup>
import MarkdownIt from 'markdown-it'
import { computed, onMounted, ref } from 'vue'

const props = defineProps({
  rawUrl: {
    type: String,
    required: true,
  },
  repoUrl: {
    type: String,
    required: true,
  },
  branch: {
    type: String,
    default: 'main',
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  showHero: {
    type: Boolean,
    default: true,
  },
})

const markdown = ref('')
const loading = ref(true)
const error = ref('')

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

const rawBaseUrl = computed(() => {
  const url = new URL(props.rawUrl)
  url.pathname = url.pathname.replace(/\/[^/]*$/, '/')
  return url.toString()
})

const blobBaseUrl = computed(() => `${props.repoUrl.replace(/\/$/, '')}/blob/${props.branch}/`)

function isExternalLink(value) {
  return /^(https?:|mailto:|tel:|#|\/)/i.test(value)
}

function absolutizeUrl(value, base) {
  if (!value || isExternalLink(value)) return value
  return new URL(value.replace(/^\.\//, ''), base).toString()
}

function rewriteMarkdownLinks(source) {
  return source
    .replace(/(!\[[^\]]*]\()([^)]+)(\))/g, (_match, prefix, url, suffix) => {
      return `${prefix}${absolutizeUrl(url.trim(), rawBaseUrl.value)}${suffix}`
    })
    .replace(/(?<!!)(\[[^\]]+]\()([^)]+)(\))/g, (_match, prefix, url, suffix) => {
      return `${prefix}${absolutizeUrl(url.trim(), blobBaseUrl.value)}${suffix}`
    })
    .replace(/(<img\b[^>]*\bsrc=["'])([^"']+)(["'][^>]*>)/gi, (_match, prefix, url, suffix) => {
      return `${prefix}${absolutizeUrl(url.trim(), rawBaseUrl.value)}${suffix}`
    })
    .replace(/(<source\b[^>]*\bsrcset=["'])([^"']+)(["'][^>]*>)/gi, (_match, prefix, url, suffix) => {
      return `${prefix}${absolutizeUrl(url.trim(), rawBaseUrl.value)}${suffix}`
    })
    .replace(/(<a\b[^>]*\bhref=["'])([^"']+)(["'][^>]*>)/gi, (_match, prefix, url, suffix) => {
      return `${prefix}${absolutizeUrl(url.trim(), blobBaseUrl.value)}${suffix}`
    })
}

const rendered = computed(() => md.render(rewriteMarkdownLinks(markdown.value)))

async function loadReadme() {
  loading.value = true
  error.value = ''
  try {
    const response = await fetch(props.rawUrl)
    if (!response.ok) throw new Error(`README request failed with ${response.status}`)
    markdown.value = await response.text()
  } catch (readmeError) {
    error.value = readmeError?.message || 'Unable to load README.'
  } finally {
    loading.value = false
  }
}

onMounted(loadReadme)
</script>

<template>
  <section class="readme-shell" :class="{ compact: !showHero }">
    <header v-if="showHero" class="readme-hero">
      <p class="readme-kicker">Project README</p>
      <div>
        <h1>{{ title }}</h1>
        <a :href="repoUrl" target="_blank" rel="noreferrer">GitHub</a>
      </div>
      <p v-if="subtitle">{{ subtitle }}</p>
    </header>

    <div v-if="loading" class="readme-state">Loading README...</div>
    <div v-else-if="error" class="readme-state">{{ error }}</div>
    <article v-else class="readme-card">
      <div class="readme-content" v-html="rendered"></div>
    </article>
  </section>
</template>

<style scoped>
.readme-shell {
  width: min(1180px, calc(100vw - 48px));
  margin: 0 auto;
  padding: 34px 0 64px;
}

.readme-shell.compact {
  width: 100%;
  padding: 0 0 32px;
}

.readme-hero {
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 22px;
}

.readme-kicker {
  margin: 0 0 8px;
  color: var(--vp-c-brand-1);
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;
}

.readme-hero > div {
  display: flex;
  gap: 18px;
  align-items: center;
  justify-content: space-between;
}

.readme-hero h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 4.25rem);
  line-height: 1.05;
  letter-spacing: 0;
}

.readme-hero a {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 8px 14px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;
}

.readme-hero p:last-child {
  max-width: 760px;
  margin: 14px 0 0;
  color: var(--vp-c-text-2);
  line-height: 1.65;
}

.readme-card,
.readme-state {
  margin-top: 22px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
}

.readme-card {
  padding: 28px;
}

.readme-state {
  padding: 24px;
  color: var(--vp-c-text-2);
}

.readme-content {
  max-width: 100%;
  overflow: hidden;
}

.readme-content :deep(h1),
.readme-content :deep(h2),
.readme-content :deep(h3) {
  letter-spacing: 0;
}

.readme-content :deep(img) {
  max-width: 100%;
  height: auto;
}

.readme-content :deep(div[align='center'] img),
.readme-content :deep(p[align='center'] img),
.readme-content :deep(div[align='center'] a),
.readme-content :deep(p[align='center'] a) {
  display: inline-block;
  margin: 2px 3px;
  vertical-align: middle;
}

.readme-content :deep(div[align='center'] img),
.readme-content :deep(p[align='center'] img) {
  width: auto;
}

.readme-content :deep(div[align='center']),
.readme-content :deep(p[align='center']) {
  text-align: center;
}

.readme-content :deep(table) {
  display: block;
  width: 100%;
  overflow-x: auto;
}

.readme-content :deep(pre) {
  overflow-x: auto;
}

.readme-content :deep(a) {
  overflow-wrap: anywhere;
}

@media (max-width: 640px) {
  .readme-shell {
    width: calc(100vw - 32px);
    padding-top: 24px;
  }

  .readme-hero > div {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .readme-card {
    padding: 18px;
  }
}
</style>
