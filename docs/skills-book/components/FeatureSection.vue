<script setup lang="ts">
import { computed } from 'vue'
import { slugify } from '@mdit-vue/shared'
import FeatureCard from './FeatureCard.vue'
import type { FeatureCard as FeatureCardType } from './type'

const props = defineProps<{
  title: string
  items: FeatureCardType[]
}>()

const formatTitle = computed(() => slugify(props.title))
</script>

<template>
  <section class="feature-section">
    <h2 v-if="title" :id="formatTitle" tabindex="-1">{{ title }}</h2>
    <div class="feature-grid">
      <FeatureCard
        v-for="(item, i) in items"
        :key="item.title"
        :icon="item.iconSvg"
        :title="item.title"
        :desc="item.desc"
        :command="item.command"
        :delay="i"
      />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.feature-section {
  margin-bottom: 40px;

  h2 {
    margin: 32px 0 16px;
    font-size: 18px;
    font-weight: 600;
    color: var(--vp-c-text-1);
    letter-spacing: -0.01em;
  }
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

@media (min-width: 960px) {
  .feature-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 640px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
