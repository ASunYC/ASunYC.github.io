<script setup lang="ts">
import TerminalIcon from './TerminalIcon.vue'
import type { QuickUseStep } from '../data'

defineProps<{
  steps: QuickUseStep[]
}>()
</script>

<template>
  <section class="quickly-use" aria-labelledby="quickly-use-title">
    <div class="quickly-use-header">
      <p class="tip-title">
        <TerminalIcon />
        Quickly Use
      </p>
      <h2 id="quickly-use-title">Start with Claude Code.</h2>
      <p>
        Install Skills Book once, then ask Claude Code to search, compare, and install community skills for your current task.
      </p>
    </div>

    <div class="quick-step-list">
      <article v-for="(step, index) in steps" :key="step.title" class="quick-step">
        <span class="step-index">{{ String(index + 1).padStart(2, '0') }}</span>
        <div>
          <h3>{{ step.title }}</h3>
          <p>{{ step.desc }}</p>
          <pre v-if="step.code" class="quick-start-code"><code>{{ step.code }}</code></pre>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.quickly-use {
  border: 1px solid var(--vp-c-divider);
  border-radius: var(--sb-card-radius);
  background: var(--vp-c-bg-soft);
  padding: 28px;
  margin: 0 0 44px;
  min-width: 0;
  overflow: hidden;
}

.quickly-use-header {
  width: 100%;
  max-width: 760px;
  min-width: 0;
}

.tip-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 10px;
  color: var(--vp-c-brand);
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
}

.quickly-use-header h2 {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 24px;
  line-height: 1.25;
  letter-spacing: 0;
}

.quickly-use-header p {
  margin: 10px 0 0;
  color: var(--vp-c-text-2);
  font-size: 15px;
  line-height: 1.7;
}

.quick-step-list {
  display: grid;
  gap: 16px;
  margin-top: 22px;
}

.quick-step {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 16px;
  border-top: 1px solid var(--vp-c-divider);
  padding-top: 18px;
}

.quick-step:first-child {
  border-top: 0;
  padding-top: 0;
}

.step-index {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 8px;
  background: rgba(var(--sb-accent-rgb), 0.1);
  color: var(--vp-c-brand);
  font-size: 12px;
  font-weight: 750;
}

.quick-step h3 {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 17px;
  line-height: 1.35;
  letter-spacing: 0;
}

.quick-step p {
  margin: 6px 0 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.65;
}

.quick-start-code {
  max-width: 100%;
  margin: 12px 0 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  padding: 14px;
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 13px;
  line-height: 1.75;
  overflow-x: auto;
}

@media (max-width: 640px) {
  .quickly-use {
    padding: 22px 18px;
  }

  .quick-step {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}
</style>
