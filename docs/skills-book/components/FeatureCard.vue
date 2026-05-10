<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  desc: string
  command?: string
  delay?: number
}>()
</script>

<template>
  <div class="spotlight-card" :class="'reveal reveal-delay-' + Math.min((delay || 0) + 1, 6)">
    <div class="feature-icon-ring" v-html="icon"></div>
    <h4 class="card-title">{{ title }}</h4>
    <p class="card-desc">{{ desc }}</p>
    <code v-if="command" class="command-block">{{ command }}</code>
  </div>
</template>

<style lang="scss" scoped>
.feature-icon-ring {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--vp-c-bg-mute);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-bottom: 14px;
}

.feature-icon-ring :deep(svg) {
  width: 20px;
  height: 20px;
}

.card-title {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  letter-spacing: -0.01em;
}

.card-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  flex-grow: 1;
}
</style>
