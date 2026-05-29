<script setup>
import { computed, onMounted, ref } from 'vue'

const payload = ref(null)
const loading = ref(true)
const error = ref('')
const activeCategory = ref('All')
const mode = ref('hot')
const query = ref('')

function formatNumber(value) {
  const number = Number(value || 0)
  if (number >= 1000000) return `${(number / 1000000).toFixed(1)}m`
  if (number >= 1000) return `${(number / 1000).toFixed(1)}k`
  return number.toLocaleString()
}

function formatDate(value) {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10)
  return date.toISOString().slice(0, 10)
}

function normalizeSkill(skill, index = 0) {
  return {
    rank: skill.rank || index + 1,
    slug: skill.slug,
    displayName: skill.displayName || skill.name || 'Unnamed Skill',
    description: skill.description || '',
    category: skill.category || 'Uncategorized',
    source: skill.source || 'skills-book',
    stars: Number(skill.stars || 0),
    hotScore: Number(skill.hotScore || skill.stars || 0),
    githubRepo: skill.githubRepo || skill.github_repo || '',
    url: skill.url || (skill.githubRepo ? `https://github.com/${skill.githubRepo}` : ''),
    updatedAt: skill.updatedAt || skill.updated_at || '',
    href: skill.url || skill.href || (skill.slug ? `/skills-shop/${skill.slug}/` : '#'),
  }
}

async function fetchJson(path) {
  const response = await fetch(path)
  if (!response.ok) throw new Error(`${path} returned ${response.status}`)
  return response.json()
}

async function loadHotData() {
  loading.value = true
  error.value = ''
  try {
    try {
      const data = await fetchJson('/data/skills-hot.json')
      payload.value = {
        ...data,
        skills: (data.skills || []).map(normalizeSkill),
      }
      return
    } catch {}

    try {
      const data = await fetchJson('/data/skills-book/hot-top.json')
      payload.value = {
        generatedAt: data.generatedAt,
        source: data.source || 'skills-book hot-top',
        rankingModel: {
          primary: 'GitHub stars',
          tieBreakers: ['7-day star delta when available'],
          note: 'Fallback data generated from the current Skills Book cache.',
        },
        skills: (data.skills || []).map(normalizeSkill),
      }
      return
    } catch {}

    const mapData = await fetchJson('/data/skills-shop-map.json')
    const skills = []
    for (const location of mapData.locations || []) {
      for (const skill of location.skills || []) skills.push(skill)
    }
    payload.value = {
      generatedAt: mapData.generatedAt,
      source: 'skills-shop-map fallback',
      rankingModel: {
        primary: 'GitHub stars',
        tieBreakers: ['Skills Shop map order'],
        note: 'Fallback derived from Skills Shop map data.',
      },
      skills: skills.map(normalizeSkill).sort((a, b) => b.stars - a.stars),
    }
  } catch (loadError) {
    error.value = loadError.message || 'Unable to load Skills Hot data.'
  } finally {
    loading.value = false
  }
}

const skills = computed(() => payload.value?.skills || [])

const categories = computed(() => {
  const counts = new Map()
  for (const skill of skills.value) counts.set(skill.category, (counts.get(skill.category) || 0) + 1)
  return [
    { name: 'All', count: skills.value.length },
    ...[...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
  ]
})

const filteredSkills = computed(() => {
  const q = query.value.trim().toLowerCase()
  return skills.value
    .filter((skill) => activeCategory.value === 'All' || skill.category === activeCategory.value)
    .filter((skill) => {
      if (!q) return true
      return [skill.displayName, skill.description, skill.category, skill.githubRepo, skill.source]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
    .sort((a, b) => {
      if (mode.value === 'new') {
        return Date.parse(b.updatedAt || 0) - Date.parse(a.updatedAt || 0) || b.stars - a.stars
      }
      return b.hotScore - a.hotScore || b.stars - a.stars
    })
})

const featured = computed(() => filteredSkills.value.slice(0, 3))
const listSkills = computed(() => filteredSkills.value.slice(0, 100))
const totalStars = computed(() => skills.value.reduce((sum, skill) => sum + skill.stars, 0))

onMounted(loadHotData)
</script>

<template>
  <section class="skills-hot-page">
    <header class="hot-hero">
      <div>
        <p class="hot-kicker">Skills Hot</p>
        <h1>Track the most demanded agent skills.</h1>
        <p class="hot-lede">
          Powered by Skills Book rankings, GitHub stars, repository freshness, and the expanded EverythingSkill-compatible source index.
        </p>
      </div>
      <div class="hot-stats">
        <span><strong>{{ formatNumber(skills.length) }}</strong> ranked skills</span>
        <span><strong>{{ formatNumber(totalStars) }}</strong> total stars</span>
        <span><strong>{{ formatDate(payload?.generatedAt) }}</strong> synced</span>
      </div>
    </header>

    <div v-if="loading" class="hot-empty">Loading Skills Hot rankings...</div>
    <div v-else-if="error" class="hot-empty">{{ error }}</div>
    <template v-else>
      <section class="model-strip">
        <div>
          <span>Ranking model</span>
          <strong>{{ payload?.rankingModel?.primary || 'GitHub stars' }}</strong>
        </div>
        <p>{{ payload?.rankingModel?.note || 'Skills Book exports this ranking from skills.db.' }}</p>
      </section>

      <section class="feature-grid" v-if="featured.length">
        <a v-for="skill in featured" :key="skill.slug" class="feature-card" :href="skill.href">
          <span class="feature-rank">#{{ skill.rank }}</span>
          <h2>{{ skill.displayName }}</h2>
          <p>{{ skill.description }}</p>
          <div>
            <span>{{ skill.category }}</span>
            <strong>{{ formatNumber(skill.stars) }} stars</strong>
          </div>
        </a>
      </section>

      <section class="hot-toolbar">
        <div class="mode-toggle">
          <button :class="{ active: mode === 'hot' }" @click="mode = 'hot'">Hot</button>
          <button :class="{ active: mode === 'new' }" @click="mode = 'new'">Fresh</button>
        </div>
        <input v-model="query" type="search" placeholder="Search skills, repos, sources..." />
      </section>

      <section class="hot-content">
        <aside class="category-rail">
          <button
            v-for="category in categories"
            :key="category.name"
            :class="{ active: activeCategory === category.name }"
            @click="activeCategory = category.name"
          >
            <span>{{ category.name }}</span>
            <strong>{{ category.count }}</strong>
          </button>
        </aside>

        <div class="ranking-list">
          <a v-for="skill in listSkills" :key="`${skill.slug}-${skill.rank}`" class="rank-row" :href="skill.href">
            <span class="rank-number">{{ skill.rank }}</span>
            <div class="rank-main">
              <div class="rank-title">
                <strong>{{ skill.displayName }}</strong>
                <span>{{ skill.source }}</span>
              </div>
              <p>{{ skill.description || skill.githubRepo }}</p>
            </div>
            <span class="rank-category">{{ skill.category }}</span>
            <div class="rank-score">
              <strong>{{ formatNumber(skill.stars) }}</strong>
              <span>stars</span>
            </div>
            <div class="rank-score secondary">
              <strong>{{ formatNumber(skill.hotScore) }}</strong>
              <span>hot</span>
            </div>
          </a>
        </div>
      </section>
    </template>
  </section>
</template>

<style scoped>
.skills-hot-page {
  width: var(--platform-page-max-width);
  max-width: none;
  margin: 0 auto;
  padding: 26px 0 64px;
}

.hot-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(240px, 320px);
  gap: 28px;
  align-items: end;
  margin-bottom: 22px;
}

.hot-kicker {
  margin: 0 0 8px;
  color: #7c9f64;
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;
}

.hot-hero h1 {
  max-width: 820px;
  margin: 0;
  font-size: clamp(1.9rem, 3.2vw, 3.25rem);
  line-height: 1.04;
  letter-spacing: 0;
}

.hot-lede {
  max-width: 780px;
  margin: 12px 0 0;
  color: var(--vp-c-text-2);
  font-size: 0.98rem;
  line-height: 1.65;
}

.hot-stats {
  display: grid;
  gap: 10px;
  color: var(--vp-c-text-2);
}

.hot-stats span {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  border-bottom: 1px solid var(--vp-c-divider);
  padding-bottom: 8px;
}

.hot-stats strong {
  color: var(--vp-c-text-1);
}

.model-strip {
  display: grid;
  grid-template-columns: minmax(220px, 320px) minmax(0, 1fr);
  gap: 18px;
  margin-bottom: 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 16px 18px;
  background: var(--vp-c-bg-soft);
}

.model-strip span {
  display: block;
  margin-bottom: 4px;
  color: var(--vp-c-text-2);
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
}

.model-strip strong {
  color: var(--vp-c-text-1);
}

.model-strip p {
  margin: 0;
  color: var(--vp-c-text-2);
  line-height: 1.55;
}

.feature-grid {
  display: grid;
  grid-template-columns: 1.15fr 1fr 0.9fr;
  gap: 14px;
  margin-bottom: 18px;
}

.feature-card {
  display: flex;
  min-height: 190px;
  flex-direction: column;
  justify-content: space-between;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 18px;
  background: linear-gradient(135deg, rgba(124, 159, 100, 0.14), var(--vp-c-bg-soft));
  color: var(--vp-c-text-1);
}

.feature-rank {
  color: #7c9f64;
  font-weight: 900;
}

.feature-card h2 {
  margin: 14px 0 8px;
  overflow-wrap: anywhere;
  font-size: 1.35rem;
  line-height: 1.15;
}

.feature-card p {
  margin: 0;
  color: var(--vp-c-text-2);
  line-height: 1.55;
}

.feature-card div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
  color: var(--vp-c-text-2);
  font-size: 0.86rem;
}

.feature-card strong {
  color: var(--vp-c-text-1);
  white-space: nowrap;
}

.hot-toolbar {
  display: grid;
  grid-template-columns: auto minmax(220px, 420px);
  gap: 12px;
  align-items: center;
  margin-bottom: 14px;
}

.mode-toggle {
  display: inline-flex;
  width: fit-content;
  gap: 6px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 5px;
  background: var(--vp-c-bg-soft);
}

.mode-toggle button {
  border: 0;
  border-radius: 6px;
  padding: 9px 18px;
  background: transparent;
  color: var(--vp-c-text-2);
  font-weight: 900;
  cursor: pointer;
}

.mode-toggle button.active {
  background: #7c9f64;
  color: #fff;
}

.hot-toolbar input {
  width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 11px 13px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.hot-content {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.category-rail {
  position: sticky;
  top: 86px;
  display: grid;
  max-height: calc(100vh - 110px);
  overflow: auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.category-rail button {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border: 0;
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 12px 13px;
  background: transparent;
  color: var(--vp-c-text-2);
  font-weight: 800;
  text-align: left;
  cursor: pointer;
}

.category-rail button:last-child {
  border-bottom: 0;
}

.category-rail button.active {
  color: var(--vp-c-text-1);
  background: rgba(124, 159, 100, 0.16);
}

.ranking-list {
  display: grid;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.rank-row {
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr) minmax(150px, 230px) 88px 88px;
  gap: 14px;
  align-items: center;
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 14px 16px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  transition: background 0.2s ease;
}

.rank-row:last-child {
  border-bottom: 0;
}

.rank-row:hover {
  background: var(--vp-c-bg-soft);
}

.rank-number {
  color: #7c9f64;
  font-size: 1.15rem;
  font-weight: 900;
  text-align: center;
}

.rank-main {
  min-width: 0;
}

.rank-title {
  display: flex;
  min-width: 0;
  gap: 10px;
  align-items: center;
}

.rank-title strong {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-title span {
  flex: 0 0 auto;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  padding: 2px 8px;
  color: var(--vp-c-text-2);
  font-size: 0.72rem;
  font-weight: 800;
}

.rank-main p {
  margin: 4px 0 0;
  overflow: hidden;
  color: var(--vp-c-text-2);
  font-size: 0.88rem;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-category {
  overflow: hidden;
  color: var(--vp-c-text-2);
  font-size: 0.84rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-score {
  display: grid;
  justify-items: end;
  gap: 2px;
}

.rank-score strong {
  font-size: 1rem;
}

.rank-score span {
  color: var(--vp-c-text-2);
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.rank-score.secondary {
  color: #7c9f64;
}

.hot-empty {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 26px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
}

@media (max-width: 980px) {
  .hot-hero,
  .model-strip,
  .hot-content,
  .hot-toolbar {
    grid-template-columns: 1fr;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .category-rail {
    position: static;
    max-height: 260px;
  }

  .rank-row {
    grid-template-columns: 42px minmax(0, 1fr) 76px;
  }

  .rank-category,
  .rank-score.secondary {
    display: none;
  }
}

@media (max-width: 560px) {
  .skills-hot-page {
    padding-top: 18px;
  }

  .rank-row {
    gap: 10px;
    padding: 12px;
  }

  .rank-title {
    display: block;
  }

  .rank-title span {
    display: inline-block;
    margin-top: 5px;
  }
}
</style>
