<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { RecommendedCombo } from '../data'

const props = defineProps<{
  fallback: RecommendedCombo[]
}>()

const remoteCombos = ref<RecommendedCombo[]>([])
const query = ref('')
const activePage = ref(0)
const copiedComboId = ref('')
let rotationTimer: number | undefined

const combos = computed(() => remoteCombos.value.length ? remoteCombos.value : props.fallback)
const filteredCombos = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return combos.value
  return combos.value.filter((combo) => [
    combo.id,
    combo.title,
    combo.category,
    combo.categoryName,
    combo.summary,
    combo.audience,
    combo.prompt,
    ...(combo.tags || []),
    ...(combo.useCases || []),
    ...(combo.workflow || []),
    ...(combo.components || []).map((item) => `${item.name} ${item.type} ${item.description} ${item.why || ''}`),
  ].some((value) => String(value || '').toLowerCase().includes(q)))
})
const pageCount = computed(() => Math.max(1, Math.ceil(filteredCombos.value.length / 3)))
const visibleCombos = computed(() => {
  const start = activePage.value * 3
  return filteredCombos.value.slice(start, start + 3)
})

function comboShopHref(combo: RecommendedCombo) {
  return `/skills-shop/${combo.slug || 'combo-' + combo.id}/`
}

function componentNames(combo: RecommendedCombo) {
  return (combo.components || []).map((item) => item.name).slice(0, 3)
}

function hiddenComponentCount(combo: RecommendedCombo) {
  return Math.max(0, (combo.components || []).length - 3)
}

function agentPrompt(combo: RecommendedCombo) {
  const installs = (combo.components || [])
    .map((item, index) => `${index + 1}. ${item.name}: ${item.install}`)
    .join('\n')
  const workflow = (combo.workflow || [])
    .map((step, index) => `${index + 1}. ${step}`)
    .join('\n')

  return [
    `Please install and use the "${combo.title}" Skills Book combo for my current task.`,
    '',
    `Goal: ${combo.summary}`,
    '',
    'Install or enable these components:',
    installs,
    '',
    workflow ? 'Use this workflow:' : '',
    workflow,
    '',
    combo.prompt ? `After setup, follow this operating prompt: ${combo.prompt}` : '',
  ].filter(Boolean).join('\n')
}

async function copyAgentPrompt(combo: RecommendedCombo) {
  const text = agentPrompt(combo)
  try {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable')
      await navigator.clipboard.writeText(text)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    copiedComboId.value = combo.id
    window.setTimeout(() => {
      if (copiedComboId.value === combo.id) copiedComboId.value = ''
    }, 1800)
  } catch {
    copiedComboId.value = ''
  }
}

function setPage(index: number) {
  activePage.value = Math.max(0, Math.min(index, pageCount.value - 1))
}

function startRotation() {
  window.clearInterval(rotationTimer)
  rotationTimer = undefined
  if (pageCount.value <= 1 || query.value.trim()) return
  rotationTimer = window.setInterval(() => {
    activePage.value = (activePage.value + 1) % pageCount.value
  }, 5000)
}

watch([filteredCombos, query], () => {
  activePage.value = 0
  startRotation()
})

onMounted(async () => {
  try {
    const response = await fetch('/data/skills-shop-combos.json')
    if (!response.ok) return
    const payload = await response.json()
    if (Array.isArray(payload?.combos)) remoteCombos.value = payload.combos
  } catch {
    remoteCombos.value = []
  }
  startRotation()
})

onBeforeUnmount(() => {
  window.clearInterval(rotationTimer)
})
</script>

<template>
  <section class="combo-section" aria-labelledby="combo-title">
    <div class="combo-heading">
      <p class="section-label">Recommended Combos</p>
      <h2 id="combo-title">Use proven tool stacks for common agent workflows.</h2>
      <p>
        Skills Book keeps built-in combo recommendations beside the public skill index. They are written into
        <code>skills.db</code> during wiki builds and exported for this page by <code>shop-export</code>.
      </p>
    </div>

    <label class="combo-search">
      <span>Search combos</span>
      <input v-model="query" type="search" placeholder="frontend, security, docs, product, postgres..." />
      <small>{{ filteredCombos.length }} of {{ combos.length }} combos</small>
    </label>

    <div class="combo-toolbar" v-if="pageCount > 1">
      <button
        v-for="(_, index) in pageCount"
        :key="index"
        type="button"
        :class="{ active: index === activePage }"
        :aria-label="`Show combo group ${index + 1}`"
        @click="setPage(index)"
      />
    </div>

    <div class="combo-grid">
      <article v-for="combo in visibleCombos" :key="combo.id" class="combo-card">
        <div class="combo-card-head">
          <span class="combo-category">{{ combo.categoryName || combo.category }}</span>
          <h3>{{ combo.title }}</h3>
          <p>{{ combo.summary }}</p>
        </div>

        <div class="combo-stack" aria-label="Combo components">
          <span v-for="name in componentNames(combo)" :key="name" class="combo-chip">
            {{ name }}
          </span>
          <span v-if="hiddenComponentCount(combo)" class="combo-chip combo-chip-muted">
            +{{ hiddenComponentCount(combo) }}
          </span>
        </div>

        <div class="agent-prompt">
          <span>Agent prompt</span>
          <p>Copies install steps, workflow, and the operating prompt for this combo.</p>
        </div>

        <div class="combo-actions">
          <button type="button" class="copy-button" @click="copyAgentPrompt(combo)">
            {{ copiedComboId === combo.id ? 'Copied' : 'Copy prompt' }}
          </button>
          <a class="combo-link" :href="comboShopHref(combo)">Open combo shop page</a>
        </div>
      </article>
    </div>

    <p v-if="!filteredCombos.length" class="combo-empty">No combo matches this query yet.</p>
  </section>
</template>

<style scoped>
.combo-section {
  margin: 0 0 44px;
  min-width: 0;
}

.combo-heading {
  max-width: 780px;
}

.section-label {
  margin: 0 0 8px;
  color: var(--vp-c-brand);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.combo-heading h2 {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 24px;
  line-height: 1.25;
  font-weight: 680;
  letter-spacing: 0;
}

.combo-heading p {
  margin: 12px 0 0;
  color: var(--vp-c-text-2);
  font-size: 15px;
  line-height: 1.7;
}

.combo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 18px;
  margin-top: 14px;
}

.combo-search {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px 12px;
  align-items: center;
  max-width: 720px;
  margin-top: 22px;
}

.combo-search span {
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 700;
}

.combo-search input {
  grid-column: 1 / -1;
  width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  padding: 11px 12px;
  color: var(--vp-c-text-1);
  font-size: 14px;
  line-height: 1.4;
}

.combo-search input:focus {
  border-color: var(--vp-c-brand);
  outline: none;
}

.combo-search small {
  justify-self: end;
  color: var(--vp-c-text-3);
  font-size: 12px;
}

.combo-toolbar {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  max-width: 100%;
  margin-top: 12px;
}

.combo-toolbar button {
  width: 22px;
  height: 6px;
  border: 0;
  border-radius: 999px;
  background: var(--vp-c-divider);
  cursor: pointer;
}

.combo-toolbar button.active {
  background: var(--vp-c-brand);
}

.combo-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  padding: 18px;
  min-width: 0;
  min-height: 320px;
}

.combo-card-head h3 {
  margin: 8px 0 0;
  color: var(--vp-c-text-1);
  font-size: 20px;
  line-height: 1.3;
  letter-spacing: 0;
}

.combo-card-head p {
  margin: 10px 0 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.55;
}

.combo-category {
  display: inline-flex;
  border: 1px solid rgba(var(--sb-accent-rgb), 0.35);
  border-radius: 999px;
  padding: 4px 9px;
  color: var(--vp-c-brand);
  font-size: 12px;
  font-weight: 700;
}

.combo-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.combo-chip {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  padding: 7px 9px;
  color: var(--vp-c-text-1);
  font-size: 12px;
  font-weight: 700;
}

.combo-chip-muted {
  color: var(--vp-c-text-3);
}

.agent-prompt {
  display: grid;
  gap: 5px;
  margin: 16px 0 0;
  min-width: 0;
}

.agent-prompt span {
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 700;
}

.agent-prompt p {
  margin: 0;
  color: var(--vp-c-text-3);
  font-size: 12px;
  line-height: 1.5;
}

.combo-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 18px;
}

.copy-button {
  border: 1px solid rgba(var(--sb-accent-rgb), 0.4);
  border-radius: 8px;
  background: rgba(var(--sb-accent-rgb), 0.12);
  padding: 9px 12px;
  color: var(--vp-c-brand);
  font-size: 13px;
  font-weight: 750;
  cursor: pointer;
}

.combo-link {
  display: inline-flex;
  color: var(--vp-c-brand);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
}

.combo-link:hover {
  text-decoration: underline;
}

.combo-empty {
  margin: 20px 0 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

@media (max-width: 640px) {
  .combo-grid {
    grid-template-columns: 1fr;
  }

  .combo-card {
    padding: 18px;
    min-height: 0;
  }

  .combo-actions {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
