<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { RecommendedCombo } from '../data'

const props = defineProps<{
  fallback: RecommendedCombo[]
}>()

const remoteCombos = ref<RecommendedCombo[]>([])

const combos = computed(() => remoteCombos.value.length ? remoteCombos.value : props.fallback)

onMounted(async () => {
  try {
    const response = await fetch('/data/skills-shop-combos.json')
    if (!response.ok) return
    const payload = await response.json()
    if (Array.isArray(payload?.combos)) remoteCombos.value = payload.combos
  } catch {
    remoteCombos.value = []
  }
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

    <div class="combo-grid">
      <article v-for="combo in combos" :key="combo.id" class="combo-card">
        <div class="combo-card-head">
          <span class="combo-category">{{ combo.categoryName || combo.category }}</span>
          <h3>{{ combo.title }}</h3>
          <p>{{ combo.summary }}</p>
        </div>

        <div class="combo-stack" aria-label="Combo components">
          <span v-for="item in combo.components" :key="item.name" class="combo-chip">
            <strong>{{ item.name }}</strong>
            <small>{{ item.type }}</small>
          </span>
        </div>

        <ol class="combo-commands">
          <li v-for="item in combo.components" :key="`${combo.id}-${item.name}`">
            <span>{{ item.name }}</span>
            <code>{{ item.install }}</code>
          </li>
        </ol>

        <a class="combo-link" :href="`/skills-shop/combo-${combo.id}/`">Open combo shop page</a>
      </article>
    </div>
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
  margin-top: 22px;
}

.combo-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  padding: 22px;
  min-width: 0;
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
  line-height: 1.65;
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
  gap: 7px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  padding: 8px 10px;
  color: var(--vp-c-text-1);
  font-size: 13px;
}

.combo-chip small {
  color: var(--vp-c-text-3);
  font-size: 11px;
}

.combo-commands {
  display: grid;
  gap: 10px;
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
}

.combo-commands li {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.combo-commands span {
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 700;
}

.combo-commands code {
  display: block;
  max-width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  padding: 10px 11px;
  color: var(--vp-c-text-1);
  font-size: 12px;
  line-height: 1.55;
  overflow-x: auto;
  white-space: pre;
}

.combo-link {
  display: inline-flex;
  margin-top: 18px;
  color: var(--vp-c-brand);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
}

.combo-link:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .combo-grid {
    grid-template-columns: 1fr;
  }

  .combo-card {
    padding: 18px;
  }
}
</style>
