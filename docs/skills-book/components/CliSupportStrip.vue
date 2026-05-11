<script setup lang="ts">
import type { CliSupportItem } from '../data'

defineProps<{
  items: CliSupportItem[]
}>()
</script>

<template>
  <section class="cli-section" aria-labelledby="supported-cli-title">
    <div class="section-heading">
      <p class="section-label">Supported CLI</p>
      <h2 id="supported-cli-title">Use Skills Book across mainstream agent tools.</h2>
      <p>
        Skills Book is packaged as a standard <code>SKILL.md</code> plus a zero-dependency Node.js CLI.
        Claude Code is the default install target, while other agent CLIs can load the same skill package
        and run the marketplace commands from the repository.
      </p>
    </div>

    <div class="cli-rail" tabindex="0" aria-label="Supported CLI tools">
      <article v-for="item in items" :key="item.name" class="cli-card">
        <span>{{ item.status }}</span>
        <h3>{{ item.name }}</h3>
        <p>{{ item.desc }}</p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.cli-section {
  margin: 8px 0 40px;
  min-width: 0;
  overflow: hidden;
}

.section-heading {
  width: 100%;
  max-width: 760px;
  min-width: 0;
}

.section-label {
  margin: 0 0 8px;
  color: var(--vp-c-brand);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.section-heading h2 {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 24px;
  line-height: 1.25;
  font-weight: 680;
  letter-spacing: 0;
  overflow-wrap: anywhere;
}

.section-heading p:not(.section-label) {
  margin: 12px 0 0;
  color: var(--vp-c-text-2);
  font-size: 15px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.cli-rail {
  display: grid;
  grid-auto-columns: minmax(240px, 290px);
  grid-auto-flow: column;
  gap: 14px;
  margin-top: 22px;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  padding: 2px 2px 14px;
  scroll-snap-type: x proximity;
  scrollbar-color: var(--vp-c-brand) var(--vp-c-bg-soft);
  width: 100%;
  max-width: 100%;
}

.cli-rail::-webkit-scrollbar {
  height: 10px;
}

.cli-rail::-webkit-scrollbar-track {
  background: var(--vp-c-bg-soft);
  border-radius: 999px;
}

.cli-rail::-webkit-scrollbar-thumb {
  background: var(--vp-c-brand);
  border-radius: 999px;
}

.cli-card {
  min-height: 178px;
  scroll-snap-align: start;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  padding: 20px;
}

.cli-card span {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  border: 1px solid rgba(var(--sb-accent-rgb), 0.22);
  border-radius: 999px;
  padding: 0 9px;
  color: var(--vp-c-brand);
  background: rgba(var(--sb-accent-rgb), 0.08);
  font-size: 11px;
  font-weight: 650;
}

.cli-card h3 {
  margin: 14px 0 0;
  color: var(--vp-c-text-1);
  font-size: 20px;
  line-height: 1.25;
  letter-spacing: 0;
}

.cli-card p {
  margin: 10px 0 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.65;
}

@media (max-width: 640px) {
  .section-heading,
  .section-heading h2,
  .section-heading p:not(.section-label) {
    width: calc(100vw - 64px);
    max-width: calc(100vw - 64px);
  }

  .section-heading h2 {
    font-size: 22px;
  }

  .cli-rail {
    grid-auto-columns: minmax(240px, 72vw);
  }
}
</style>
