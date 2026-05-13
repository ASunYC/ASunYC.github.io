<script setup>
import { computed, onMounted, ref } from 'vue'

const props = defineProps({
  slug: {
    type: String,
    required: true
  }
})

const payload = ref(null)
const loading = ref(true)
const error = ref('')

const story = computed(() => (payload.value?.items || []).find((item) => item.slug === props.slug))

const related = computed(() => {
  if (!story.value || !payload.value?.items) return []
  return payload.value.items
    .filter((item) => item.slug !== story.value.slug && item.category === story.value.category)
    .slice(0, 4)
})

onMounted(async () => {
  try {
    const response = await fetch('/data/map-news/news.json')
    if (!response.ok) throw new Error(`MapNews data not found (${response.status})`)
    payload.value = await response.json()
    if (!story.value) throw new Error('News story not found.')
  } catch (loadError) {
    error.value = loadError.message || 'Unable to load this MapNews story.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <article class="news-detail">
    <div v-if="loading" class="state">Loading news...</div>
    <div v-else-if="error" class="state">{{ error }}</div>
    <template v-else-if="story">
      <a class="back-link" href="/map-news/">Back to MapNews</a>

      <header class="story-hero">
        <div>
          <p class="story-kicker">{{ story.category }} / {{ story.impact }} impact / {{ story.locationName }}</p>
          <h1>{{ story.title }}</h1>
          <p>{{ story.dek }}</p>
        </div>
        <dl>
          <div>
            <dt>Published</dt>
            <dd>{{ story.publishedAt }}</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>
              <a :href="story.sourceUrl" target="_blank" rel="noreferrer">{{ story.sourceName }}</a>
            </dd>
          </div>
          <div>
            <dt>Coordinates</dt>
            <dd>{{ story.lat }}, {{ story.lon }}</dd>
          </div>
        </dl>
      </header>

      <section class="story-body">
        <p v-for="paragraph in story.content" :key="paragraph">{{ paragraph }}</p>
      </section>

      <section v-if="related.length" class="related-news">
        <h2>Related {{ story.category }} stories</h2>
        <div>
          <a v-for="item in related" :key="item.slug" :href="`/map-news/${item.slug}/`">
            <strong>{{ item.title }}</strong>
            <span>{{ item.locationName }} / {{ item.publishedAt }}</span>
          </a>
        </div>
      </section>
    </template>
  </article>
</template>

<style scoped>
.news-detail {
  max-width: 1120px;
  margin: 0 auto;
  padding: 30px 20px 68px;
}

.back-link {
  display: inline-flex;
  margin-bottom: 22px;
  color: #0ea5e9;
  font-weight: 900;
  text-decoration: none;
}

.story-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 30px;
  align-items: end;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 28px;
}

.story-kicker {
  margin: 0 0 10px;
  color: #0ea5e9;
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;
}

.story-hero h1 {
  max-width: 820px;
  margin: 0;
  overflow-wrap: anywhere;
  font-size: clamp(2rem, 4.5vw, 4rem);
  line-height: 1.02;
  letter-spacing: 0;
}

.story-hero p {
  max-width: 760px;
  margin: 16px 0 0;
  color: var(--vp-c-text-2);
  font-size: 1.05rem;
  line-height: 1.65;
}

.story-hero dl {
  display: grid;
  gap: 14px;
  margin: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 18px;
  background: var(--vp-c-bg-soft);
}

.story-hero dt {
  color: var(--vp-c-text-2);
  font-size: 0.78rem;
  font-weight: 900;
  text-transform: uppercase;
}

.story-hero dd {
  margin: 4px 0 0;
  overflow-wrap: anywhere;
  font-weight: 800;
}

.story-body {
  display: grid;
  gap: 18px;
  max-width: 800px;
  margin-top: 34px;
}

.story-body p {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 1.05rem;
  line-height: 1.8;
}

.related-news {
  margin-top: 42px;
}

.related-news h2 {
  margin: 0 0 14px;
  font-size: 1.35rem;
}

.related-news > div {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.related-news a {
  display: grid;
  gap: 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 16px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.related-news strong {
  overflow-wrap: anywhere;
}

.related-news span {
  color: var(--vp-c-text-2);
}

.state {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 34px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
}

@media (max-width: 780px) {
  .story-hero {
    grid-template-columns: 1fr;
  }

  .related-news > div {
    grid-template-columns: 1fr;
  }
}
</style>
