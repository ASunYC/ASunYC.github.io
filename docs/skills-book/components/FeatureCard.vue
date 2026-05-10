<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  desc: string
  command?: string
}>()
</script>

<template>
  <div class="feature-card">
    <div class="card-icon">{{ icon }}</div>
    <h4 class="card-title">{{ title }}</h4>
    <p class="card-desc">{{ desc }}</p>
    <code v-if="command" class="card-command">{{ command }}</code>
  </div>
</template>

<style lang="scss" scoped>
.feature-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.25s ease;
  height: 100%;

  &:hover {
    border-color: var(--vp-c-brand);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
}

.card-icon {
  font-size: 32px;
  line-height: 1;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.card-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  flex-grow: 1;
}

.card-command {
  display: block;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-brand);
  margin-top: auto;
}
</style>
