<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface HotSkill {
  rank: number
  slug: string
  displayName: string
  category: string
  stars: number
  weeklyStars: number
  href: string
}

const skills = ref<HotSkill[]>([])
const generatedAt = ref('')

function formatStars(value: number) {
  return Number(value || 0).toLocaleString()
}

function formatDelta(value: number) {
  return `↑+${Number(value || 0).toLocaleString()}`
}

function compactName(value: string) {
  return value.includes('/') ? value.split('/').pop() || value : value
}

onMounted(async () => {
  try {
    const response = await fetch('/data/skills-book/hot-top.json')
    if (!response.ok) return
    const data = await response.json()
    skills.value = Array.isArray(data.skills) ? data.skills.slice(0, 10) : []
    generatedAt.value = data.generatedAt || ''
  } catch {
    skills.value = []
  }
})
</script>

<template>
  <section v-if="skills.length" class="skills-hot-top" aria-labelledby="skills-hot-top-title">
    <div class="hot-top-header">
      <p id="skills-hot-top-title">Hot Top 10</p>
      <span>7d stars</span>
    </div>

    <ol class="hot-top-list">
      <li v-for="skill in skills" :key="skill.slug" class="hot-top-row">
        <a :href="skill.href" class="hot-top-link">
          <span class="hot-rank">{{ skill.rank }}</span>
          <span class="hot-name" :title="skill.displayName">{{ compactName(skill.displayName) }}</span>
          <span class="hot-meta">★{{ formatStars(skill.stars) }}</span>
          <span class="hot-delta">{{ formatDelta(skill.weeklyStars) }}</span>
        </a>
      </li>
    </ol>

    <p v-if="generatedAt" class="hot-top-foot">From collected skill cache</p>
  </section>
</template>

<style scoped>
.skills-hot-top {
  margin-top: 24px;
  width: 100%;
  max-width: calc(100vw - 32px);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: color-mix(in srgb, var(--vp-c-bg-soft) 78%, transparent);
  padding: 14px;
}

.hot-top-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.hot-top-header p {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 13px;
  font-weight: 750;
  letter-spacing: 0;
}

.hot-top-header span {
  color: var(--vp-c-brand);
  font-size: 11px;
  font-weight: 700;
}

.hot-top-list {
  display: grid;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.hot-top-row {
  margin: 0;
}

.hot-top-link {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr) 66px 72px;
  align-items: center;
  gap: 9px;
  border-radius: 6px;
  padding: 6px;
  text-decoration: none;
}

.hot-top-link:hover {
  background: var(--vp-c-bg-mute);
}

.hot-rank {
  display: grid;
  width: 18px;
  height: 18px;
  place-items: center;
  border-radius: 5px;
  background: rgba(var(--sb-accent-rgb), 0.12);
  color: var(--vp-c-brand);
  font-size: 10px;
  font-weight: 750;
}

.hot-name,
.hot-meta {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hot-name {
  color: var(--vp-c-text-1);
  font-size: 12px;
  font-weight: 650;
  line-height: 1.3;
}

.hot-meta {
  color: var(--vp-c-text-3);
  font-size: 11px;
  line-height: 1.3;
  text-align: right;
}

.hot-delta {
  color: #35d07f;
  font-size: 11px;
  font-weight: 750;
  text-align: right;
  white-space: nowrap;
}

.hot-top-foot {
  margin: 10px 0 0;
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 9px;
  color: var(--vp-c-text-3);
  font-size: 11px;
  line-height: 1.4;
}
</style>
