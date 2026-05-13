<script setup>
import { computed, onMounted, ref } from 'vue'

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const skill = ref(null)
const loading = ref(true)
const error = ref('')

const githubUrl = computed(() => {
  if (!skill.value) return ''
  return skill.value.githubRepo ? `https://github.com/${skill.value.githubRepo}` : skill.value.url
})

function formatStars(stars) {
  return Number(stars || 0).toLocaleString()
}

onMounted(async () => {
  try {
    const response = await fetch(`/data/skills-shop/skills/${props.slug}.json`)
    if (!response.ok) throw new Error(`Skill data not found (${response.status})`)
    skill.value = await response.json()
  } catch (loadError) {
    error.value = loadError.message || 'Unable to load this skill shop.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <article class="skill-shop-detail">
    <div v-if="loading" class="state">Loading skill shop...</div>
    <div v-else-if="error" class="state">{{ error }}</div>
    <template v-else-if="skill">
      <a class="back-link" href="/skills-shop/" aria-label="Back to Skills Shop">
        <span aria-hidden="true">&larr;</span>
        Back to Skills Shop
      </a>

      <header class="storefront">
        <div class="store-sign">
          <span class="store-icon">🏬</span>
          <div>
            <p>Skill Storefront</p>
            <h1>{{ skill.displayName }}</h1>
          </div>
        </div>
        <div class="store-actions">
          <span>★{{ formatStars(skill.stars) }}</span>
          <a v-if="githubUrl" :href="githubUrl" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </header>

      <section class="store-summary">
        <div>
          <h2>About this skill</h2>
          <p>{{ skill.description || 'This skill is indexed by Skills Book and can be installed or explored from its source repository.' }}</p>
        </div>
        <dl>
          <div>
            <dt>Category</dt>
            <dd>{{ skill.category || 'Uncategorized' }}</dd>
          </div>
          <div>
            <dt>Author</dt>
            <dd>
              <a v-if="skill.author?.profileUrl" :href="skill.author.profileUrl" target="_blank" rel="noreferrer">
                {{ skill.author.name || skill.author.login }}
              </a>
              <span v-else>{{ skill.author?.name || skill.author?.login || 'Unknown' }}</span>
            </dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{{ skill.location?.label || skill.author?.location || 'Not mapped' }}</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>{{ skill.source || 'skills-book' }}</dd>
          </div>
        </dl>
      </section>

      <section class="readme-section">
        <h2>README</h2>
        <div class="readme-body" v-html="skill.readmeHtml"></div>
      </section>

      <section v-if="skill.related?.length" class="related-section">
        <h2>Related skills</h2>
        <div class="related-grid">
          <a
            v-for="item in skill.related"
            :key="item.slug"
            :href="`/skills-shop/${item.slug}/`"
            class="related-card"
          >
            <strong>{{ item.displayName }}</strong>
            <span>★{{ formatStars(item.stars) }} · {{ item.evidence || item.relation }}</span>
          </a>
        </div>
      </section>
    </template>
  </article>
</template>

<style scoped>
.skill-shop-detail {
  max-width: 1040px;
  margin: 0 auto;
  padding: 30px 20px 68px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 22px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 9px 13px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-weight: 900;
  text-decoration: none;
}

.back-link:hover {
  border-color: #d39f3f;
  color: #d39f3f;
}

.back-link span {
  font-size: 1.05rem;
  line-height: 1;
}

.storefront {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: center;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 26px;
}

.store-sign {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 18px;
  align-items: center;
}

.store-icon {
  display: grid;
  width: 64px;
  height: 64px;
  place-items: center;
  border-radius: 8px;
  background: #f4c95d;
  color: #171717;
  font-size: 2rem;
}

.store-sign p {
  margin: 0 0 6px;
  color: #d39f3f;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
}

.store-sign h1 {
  margin: 0;
  overflow-wrap: anywhere;
  font-size: clamp(2.2rem, 7vw, 4.6rem);
  line-height: 0.95;
  letter-spacing: 0;
}

.store-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.store-actions span,
.store-actions a {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 10px 14px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-weight: 800;
  text-decoration: none;
}

.store-actions a {
  background: #171717;
  color: #fff;
}

.store-summary {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
  gap: 28px;
  margin: 30px 0;
}

.store-summary h2,
.readme-section h2,
.related-section h2 {
  margin: 0 0 12px;
  font-size: 1.35rem;
}

.store-summary p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 1.05rem;
  line-height: 1.7;
}

.store-summary dl {
  display: grid;
  gap: 12px;
  margin: 0;
}

.store-summary dl div {
  display: grid;
  grid-template-columns: 94px minmax(0, 1fr);
  gap: 12px;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 10px;
}

.store-summary dt {
  color: var(--vp-c-text-2);
  font-size: 0.84rem;
}

.store-summary dd {
  margin: 0;
  overflow-wrap: anywhere;
  font-weight: 700;
}

.readme-section {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 24px;
  background: var(--vp-c-bg-soft);
}

.readme-body {
  color: var(--vp-c-text-1);
  line-height: 1.72;
}

.readme-body :deep(h1),
.readme-body :deep(h2),
.readme-body :deep(h3),
.readme-body :deep(h4) {
  margin: 24px 0 10px;
  line-height: 1.15;
}

.readme-body :deep(h1:first-child),
.readme-body :deep(h2:first-child) {
  margin-top: 0;
}

.readme-body :deep(p),
.readme-body :deep(li) {
  color: var(--vp-c-text-2);
}

.readme-body :deep(pre) {
  overflow-x: auto;
  border-radius: 8px;
  padding: 14px;
  background: var(--vp-code-block-bg);
}

.readme-body :deep(code) {
  border-radius: 5px;
  padding: 2px 5px;
  background: var(--vp-code-bg);
}

.related-section {
  margin-top: 30px;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.related-card {
  display: grid;
  gap: 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 14px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.related-card strong,
.related-card span {
  overflow-wrap: anywhere;
}

.related-card span {
  color: var(--vp-c-text-2);
  font-size: 0.86rem;
}

.state {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 32px;
  color: var(--vp-c-text-2);
}

@media (max-width: 780px) {
  .storefront,
  .store-summary {
    grid-template-columns: 1fr;
  }

  .storefront {
    align-items: flex-start;
    flex-direction: column;
  }

  .store-actions {
    justify-content: flex-start;
  }

  .related-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .skill-shop-detail {
    padding-inline: 14px;
  }

  .store-sign {
    grid-template-columns: 52px minmax(0, 1fr);
  }

  .store-icon {
    width: 52px;
    height: 52px;
    font-size: 1.55rem;
  }

  .readme-section {
    padding: 18px;
  }
}
</style>
